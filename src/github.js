import { normalizeData, publicSnapshot } from './model.js';

const API = 'https://api.github.com';
export const REPOSITORY = 'ikun80723/sky-city';
export const CONTENT_PATH = 'public/data/content.json';
export const GITHUB_SESSION_KEY = 'sky-city-github-session';
export const GITHUB_DEVICE_KEY = 'sky-city-github-device';

export function storeGithubToken(token, remember=false, session=globalThis.sessionStorage, local=globalThis.localStorage) {
  if(!token) return;
  try {
    if(remember) {
      local?.setItem(GITHUB_DEVICE_KEY,token);
      session?.removeItem(GITHUB_SESSION_KEY);
    } else {
      session?.setItem(GITHUB_SESSION_KEY,token);
      local?.removeItem(GITHUB_DEVICE_KEY);
    }
  } catch {
    throw new Error('浏览器无法保存连接。请检查是否启用了无痕模式或禁用了网站存储。');
  }
}

export function loadGithubToken(session=globalThis.sessionStorage, local=globalThis.localStorage) {
  try {
    const deviceToken=local?.getItem(GITHUB_DEVICE_KEY);
    if(deviceToken) return {token:deviceToken,remember:true};
    const sessionToken=session?.getItem(GITHUB_SESSION_KEY);
    return sessionToken?{token:sessionToken,remember:false}:null;
  } catch { return null; }
}

export function clearGithubToken(session=globalThis.sessionStorage, local=globalThis.localStorage) {
  try { session?.removeItem(GITHUB_SESSION_KEY); } catch {}
  try { local?.removeItem(GITHUB_DEVICE_KEY); } catch {}
}

function decodeBase64(value) { return new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g,'')),char=>char.charCodeAt(0))); }
function encodeBase64(value) { const bytes=new TextEncoder().encode(value); let binary=''; for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192)); return btoa(binary); }

async function request(path, token, options={}, fetcher=fetch) {
  const response = await fetcher(API+path,{...options,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(token?{Authorization:`Bearer ${token}`} : {}),...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
  if (!response.ok) {
    if(response.status===401) throw new Error('连接已失效，请重新连接 GitHub。');
    if(response.status===403) throw new Error('GitHub 拒绝写入。请确认令牌仅授权 sky-city 仓库，并具有 Contents 读写权限；也可能触发了请求频率限制。');
    if(response.status===409 || response.status===422) throw new Error('仓库内容已有更新。先导出本机备份，再拉取最新公开内容后重试。');
    throw new Error(`GitHub 请求失败（${response.status}），你的本机内容仍然保留。`);
  }
  return response.json();
}

export async function connectGithub(token, fetcher=fetch) {
  if(!token.trim()) throw new Error('请先填写仓库专用访问令牌。');
  const user = await request('/user',token,{},fetcher);
  if(user.login?.toLowerCase()!=='ikun80723') throw new Error('请使用站主 ikun80723 的 GitHub 账号连接。');
  const file = await request(`/repos/${REPOSITORY}/contents/${CONTENT_PATH}?ref=main`,token,{},fetcher);
  return {login:user.login,token,sha:file.sha,data:normalizeData(JSON.parse(decodeBase64(file.content)))};
}

export async function publishGithub(workspace, connection, fetcher=fetch) {
  if(!connection?.token || !connection.sha) throw new Error('请先连接 GitHub，再发布。');
  if(connection.data && workspace.revision!==connection.data.revision) throw new Error('本机工作区基于较旧的公开版本。请先拉取最新内容，差异会保留为本机草稿。');
  const snapshot = publicSnapshot(workspace);
  const path = `/repos/${REPOSITORY}/contents/${CONTENT_PATH}`;
  const remote = await request(path+'?ref=main',connection.token,{},fetcher);
  if(remote.sha!==connection.sha) throw new Error('仓库内容已被其他设备更新。本机草稿不会被覆盖；请先备份，再拉取最新内容。');
  const result = await request(path,connection.token,{method:'PUT',body:JSON.stringify({message:'Publish content from 天空之城写作台',content:encodeBase64(JSON.stringify(snapshot,null,2)+'\n'),sha:connection.sha,branch:'main'})},fetcher);
  return {snapshot,sha:result.content.sha,commit:result.commit.sha,url:result.commit.html_url};
}

export async function fetchPublicContent() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/content.json?t=${Date.now()}`,{cache:'no-store'});
  if(!response.ok) throw new Error('暂时没能加载文章，请刷新后再试。');
  return normalizeData(await response.json());
}

