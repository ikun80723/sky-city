export const CATEGORIES = ['考公笔记', '科研札记', '读书', '生活随笔', '学习心得', '工作思考', '音乐'];
export const TYPES = { article: '文章', book: '书籍', music: '音乐' };
export const WORKSPACE_KEY = 'sky-city-workspace-v2';
export const EDITOR_KEY = 'sky-city-editor-v2';

export function safeUrl(value) {
  if (!value) return '';
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}

export function validateEntry(entry, publishing = false) {
  const errors = {};
  if (!entry.title?.trim()) errors.title = '写一个标题，方便以后找到它。';
  if ((entry.title || '').length > 120) errors.title = '标题请控制在 120 字以内。';
  if (entry.type === 'article' && publishing && !entry.body?.trim()) errors.body = '发布文章前，请先写一些正文。';
  if ((entry.body || '').length > 100000) errors.body = '单条记录的正文请控制在 10 万字以内。';
  if (entry.link && !safeUrl(entry.link)) errors.link = '请输入完整的 http 或 https 链接。';
  if (entry.cover && !safeUrl(entry.cover)) errors.cover = '封面需要使用完整的 http 或 https 图片链接。';
  return errors;
}

export function normalizeData(input) {
  if (!input || input.schemaVersion !== 2 || !Array.isArray(input.entries)) throw new Error('这不是天空之城支持的备份文件。');
  if (input.entries.length > 1500) throw new Error('一次最多导入 1500 条内容。');
  const ids = new Set();
  const entries = input.entries.map(entry => {
    if (!entry || typeof entry.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(entry.id) || ids.has(entry.id)) throw new Error('内容编号无效或重复，未修改本机数据。');
    if (!TYPES[entry.type] || !['draft', 'published', 'trash'].includes(entry.status)) throw new Error('内容类型或状态无效。');
    if (typeof entry.body==='string' && entry.body.length>100000) throw new Error('有记录超过 10 万字，未导入，请先拆分长文。');
    ids.add(entry.id);
    const text = key => typeof entry[key] === 'string' ? entry[key].slice(0, key === 'body' ? 100000 : 2000) : '';
    return { id: entry.id, type: entry.type, status: entry.status, previousStatus: entry.previousStatus === 'published' ? 'published' : 'draft', title: text('title').slice(0,120), excerpt: text('excerpt'), body: text('body'), category: CATEGORIES.includes(entry.category) ? entry.category : '生活随笔', tags: Array.isArray(entry.tags) ? entry.tags.filter(x=>typeof x==='string').slice(0,12).map(x=>x.slice(0,30)) : [], author: text('author'), artist: text('artist'), cover: safeUrl(text('cover')), link: safeUrl(text('link')), bookState: ['reading','finished','want'].includes(entry.bookState) ? entry.bookState : 'want', rating: Math.max(0,Math.min(5,Number(entry.rating)||0)), featured: Boolean(entry.featured), demo: Boolean(entry.demo), createdAt: Number.isFinite(Date.parse(entry.createdAt)) ? entry.createdAt : new Date().toISOString(), updatedAt: Number.isFinite(Date.parse(entry.updatedAt)) ? entry.updatedAt : new Date().toISOString() };
  });
  return { schemaVersion: 2, revision: typeof input.revision==='string' ? input.revision : '', site: { name: String(input.site?.name || '天空之城').slice(0,40), subtitle: String(input.site?.subtitle || '学习、阅读，以及日常。').slice(0,120), bio: String(input.site?.bio || '').slice(0,3000) }, entries };
}

export function publicSnapshot(workspace, revision = new Date().toISOString()) {
  const data = normalizeData(workspace);
  data.entries = data.entries.filter(entry => entry.status === 'published').map(entry => { const { previousStatus, ...publicEntry } = entry; return publicEntry; });
  for (const entry of data.entries) { const errors = validateEntry(entry, true); if (Object.keys(errors).length) throw new Error(`「${entry.title || '无标题'}」还不能发布：${Object.values(errors)[0]}`); }
  return { ...data, revision };
}

export function fingerprint(data) {
  const snapshot = publicSnapshot(data, '');
  return JSON.stringify({ site:snapshot.site, entries:snapshot.entries.map(entry=>({...entry,previousStatus:undefined})).sort((a,b)=>a.id.localeCompare(b.id)) });
}

export function filterEntries(entries, {type='all', category='全部', query='', status='all', sort='newest'}={}) {
  const search = query.trim().toLocaleLowerCase();
  return entries.filter(entry => (type==='all'||entry.type===type) && (category==='全部'||entry.category===category) && (status==='all'||entry.status===status) && [entry.title,entry.excerpt,entry.body,entry.author,entry.artist,...entry.tags].join(' ').toLocaleLowerCase().includes(search)).sort((a,b)=>sort==='title' ? a.title.localeCompare(b.title,'zh-CN') : sort==='oldest' ? Date.parse(a.updatedAt)-Date.parse(b.updatedAt) : Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
}

export function newEntry(type='article') {
  const date = new Date().toISOString();
  return { id: crypto.randomUUID(), type, status:'draft', title:'', excerpt:'', body:'', category:type==='book'?'读书':type==='music'?'音乐':'生活随笔', tags:[], author:'', artist:'', cover:'', link:'', bookState:'want', rating:0, featured:false, demo:false, createdAt:date, updatedAt:date };
}

export function trashEntry(entry) { return {...entry,previousStatus:entry.status,status:'trash',updatedAt:new Date().toISOString()}; }
export function restoreEntry(entry) { return {...entry,status:entry.previousStatus||'draft',updatedAt:new Date().toISOString()}; }
export function rebaseWorkspace(local, remote) {
  const fresh=normalizeData(remote), current=normalizeData(local), copies=[];
  for(const entry of current.entries){
    const published=fresh.entries.find(e=>e.id===entry.id);
    if(published && published.updatedAt===entry.updatedAt && entry.status==='published') continue;
    copies.push({...entry,id:published?crypto.randomUUID():entry.id,title:published?entry.title.slice(0,110)+'（本机副本）':entry.title,status:entry.status==='trash'?'trash':'draft',previousStatus:'draft'});
  }
  return {...fresh,entries:[...fresh.entries,...copies]};
}
export const readingMinutes = text => Math.max(1,Math.ceil((text||'').replace(/\s/g,'').length/400));
export const formatDate = value => new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit'}).format(new Date(value));
