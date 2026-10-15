(() => {
"use strict";
const data=window.SKY_CITY, posts=data.articles, page=document.body.dataset.page;
const $=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=post=>'article.html?id='+encodeURIComponent(post.id);
const date=post=>post.date.replace(/-/g,'.');
const meta=post=>'<div class="article-meta"><span>'+esc(post.category)+'</span><span>'+date(post)+'</span><span class="pill">示例</span></div>';
const menu=$("menu-toggle"),nav=$("site-nav");
menu.addEventListener("click",()=>{const expanded=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!expanded));menu.setAttribute("aria-label",expanded?"展开导航":"收起导航");nav.classList.toggle("is-open",!expanded)});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("is-open");menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","展开导航")}));
$("year").textContent=new Date().getFullYear();
const searchDialog=$("search-dialog"),searchInput=$("site-search"),searchResults=$("search-results");
const searchable=post=>[post.title,post.subtitle,post.category,post.section,...post.blocks.map(b=>b.text||b.quote||b.heading||"")].join(" ").toLowerCase();
function drawSearch(){const query=searchInput.value.trim().toLowerCase();const found=posts.filter(p=>searchable(p).includes(query));searchResults.innerHTML=found.length?found.map(p=>'<a href="'+link(p)+'"><span class="result-name">'+esc(p.title)+' ↗</span><span class="result-meta">'+esc(p.category)+' · 阅读约 '+p.minutes+' 分钟 · 示例文章</span></a>').join(""):'<p class="empty-state">暂时没有找到这段文字，换一个关键词试试。</p>'}
$("open-search").addEventListener("click",()=>{nav.classList.remove("is-open");menu.setAttribute("aria-expanded","false");searchDialog.showModal();drawSearch();searchInput.focus()});
$("close-search").addEventListener("click",()=>searchDialog.close());
searchInput.addEventListener("input",drawSearch);
searchDialog.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();searchDialog.close()}});
searchDialog.addEventListener("click",event=>{if(event.target===searchDialog){const r=searchDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)searchDialog.close()}});
function visual(post,artText,num){return post.image?'<div class="photo-frame"><img src="'+esc(post.image)+'" alt="'+esc(post.title)+'的氛围配图" loading="lazy" width="1500" height="1000"></div>':'<div class="text-art '+(post.category==="科研札记"?"blue":"")+'" aria-hidden="true"><span class="art-text">'+artText+'</span><span class="art-number">'+num+'</span></div>'}
function studyItem(post,number){return '<a class="study-item" href="'+link(post)+'"><span class="number">'+number+'</span><div><h4>'+esc(post.title)+'</h4><p>'+esc(post.subtitle)+'</p></div><span class="arrow" aria-hidden="true">↗</span></a>'}
if(page==="home"){
 const feature=posts[0];
 $("featured-story").innerHTML='<a class="featured-story" href="'+link(feature)+'">'+visual(feature,"","")+meta(feature)+'<h3>'+esc(feature.title)+'</h3><p>'+esc(feature.subtitle)+'</p><div class="featured-bottom"><span class="eyebrow">阅读约 '+feature.minutes+' 分钟</span><span class="text-link">读这篇手记 <span aria-hidden="true">↗</span></span></div></a>';
 $("side-stories").innerHTML=[posts[3],posts[2]].map((post,index)=>'<a class="side-story" href="'+link(post)+'"><div>'+meta(post)+'<h3>'+esc(post.title)+'</h3><p>'+esc(post.subtitle)+'</p></div><span class="issue-number '+(index?"blue":"")+'" aria-hidden="true">0'+(index+2)+'</span></a>').join("");
 $("exam-notes").innerHTML=studyItem(posts[1],"01")+studyItem(posts[3],"02");
 $("research-notes").innerHTML=studyItem(posts[2],"01")+studyItem(posts[4],"02");
 $("book-shelf").innerHTML=data.books.map(book=>'<article class="book-item"><a class="book-cover '+book.color+'" href="article.html?id='+book.article+'" aria-label="阅读'+esc(book.title)+'相关读书手记"><span class="cover-name">'+esc(book.title)+'</span><span class="cover-label">THE READING ROOM</span></a><div><h3>'+esc(book.title)+'</h3><p class="author">'+esc(book.author)+'</p><p class="book-note">'+esc(book.note)+'</p><a class="text-link" href="article.html?id='+book.article+'">读书手记 <span aria-hidden="true">↗</span></a></div></article>').join("");
 $("recent-stories").innerHTML=[posts[3],posts[5],posts[4]].map((post,index)=>'<a class="visual-card" href="'+link(post)+'">'+visual(post,index===2?"思考<br>有迹":"",String(index+1).padStart(2,"0"))+meta(post)+'<h3>'+esc(post.title)+'</h3><p>'+esc(post.subtitle)+'</p></a>').join("");
 setupMusic();
}
if(page==="journal"){
 const params=new URLSearchParams(location.search),categories=["全部",...new Set(posts.map(p=>p.category))];
 let category=categories.includes(params.get("category"))?params.get("category"):"全部";
 let section=["手记","书与音乐"].includes(params.get("section"))?params.get("section"):null;
 const queryInput=$("archive-query");queryInput.value=params.get("q")||"";
 const descriptions={"考公笔记":"方法、错题与复盘，把每一次练习变成下一次的底气。","科研札记":"论文、问题与探索，给每一次好奇留下思考的痕迹。","生活随笔":"记录那些平凡而珍贵的日常。","学习心得":"让学习有迹可循，让理解慢慢发生。","工作思考":"把事情做清楚，也把过程中的思考留下来。","读书":"在书页之间，找回一段自己的时间。","音乐":"给夜晚一段旋律，给思绪一个出口。"};
 function renderArchive(){
   $("archive-title").textContent=category!=="全部"?category:section||"所有手记";
   $("archive-description").textContent=descriptions[category]||(section==="书与音乐"?"在阅读和聆听之间，遇见另一种生活的节奏。":"把思考写下来，让走过的日子有迹可循。");
   document.title=$("archive-title").textContent+"｜天空之城";
   $("archive-filters").innerHTML=categories.map(c=>'<button class="filter" data-category="'+esc(c)+'" aria-pressed="'+String(category===c)+'">'+esc(c)+'</button>').join("");
   $("archive-filters").querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{category=button.dataset.category;section=null;updateUrl();renderArchive()}));
   const query=queryInput.value.trim().toLowerCase();
   const found=posts.filter(p=>(category==="全部"||p.category===category)&&(!section||p.section===section)&&searchable(p).includes(query));
   $("archive-count").textContent="共 "+found.length+" 篇手记 · 首版示例内容";
   $("archive-list").innerHTML=found.length?found.map((p,index)=>'<a class="archive-item" href="'+link(p)+'"><span class="archive-no">'+String(index+1).padStart(2,"0")+'</span><div>'+meta(p)+'<h2>'+esc(p.title)+'</h2><p>'+esc(p.subtitle)+'</p></div>'+(p.image?'<img src="'+esc(p.image)+'" alt="" loading="lazy" width="280" height="196">':'<div class="mini-art" aria-hidden="true">'+esc(p.category.slice(0,2))+'</div>')+'</a>').join(""):'<p class="empty-state">这里暂时没有匹配的手记，试试其他分类或关键词。</p>';
 }
 function updateUrl(){const url=new URL(location.href);url.search="";if(category!=="全部")url.searchParams.set("category",category);if(section)url.searchParams.set("section",section);if(queryInput.value.trim())url.searchParams.set("q",queryInput.value.trim());history.replaceState(null,"",url)}
 queryInput.addEventListener("input",()=>{updateUrl();renderArchive()});
 renderArchive();
 const current=category==="考公笔记"?1:category==="科研札记"?2:0;nav.querySelectorAll("a")[current].setAttribute("aria-current","page");
}
if(page==="article"){
 const id=new URLSearchParams(location.search).get("id"),post=posts.find(p=>p.id===id),container=$("article-content");
 if(!post){container.innerHTML='<section class="not-found"><div class="eyebrow">A PAGE YET TO BE WRITTEN</div><h1>这篇手记，还未落笔。</h1><p>你寻找的文章可能已搬到了别处。</p><a class="button-line" href="journal.html">回到所有手记 <span aria-hidden="true">↗</span></a></section>'}
 else{
 document.title=post.title+"｜天空之城";document.querySelector('meta[name="description"]').content=post.subtitle;
 const headings=post.blocks.map((b,index)=>b.heading?{text:b.heading,id:"part-"+index}:null).filter(Boolean);
 const index=posts.indexOf(post),previous=posts[(index-1+posts.length)%posts.length],next=posts[(index+1)%posts.length];
 container.innerHTML='<div class="breadcrumb"><a href="./">天空之城</a> / <a href="journal.html?category='+encodeURIComponent(post.category)+'">'+esc(post.category)+'</a></div><header class="article-header">'+meta(post)+'<h1>'+esc(post.title)+'</h1><p class="subtitle">'+esc(post.subtitle)+'</p><p class="eyebrow" style="margin:18px 0 0">阅读约 '+post.minutes+' 分钟 / 示例文章</p></header>'+(post.image?'<img class="article-cover" src="'+esc(post.image)+'" width="1500" height="1000" alt="'+esc(post.title)+'的氛围配图">':'')+(headings.length?'<details class="article-toc" open><summary>这篇手记的目录</summary><ul>'+headings.map(h=>'<li><a href="#'+h.id+'">'+esc(h.text)+'</a></li>').join("")+'</ul></details>':'')+'<article class="article-body">'+post.blocks.map((b,i)=>(b.heading?'<h2 id="part-'+i+'">'+esc(b.heading)+'</h2>':'')+(b.text?'<p>'+esc(b.text)+'</p>':'')+(b.quote?'<blockquote>'+esc(b.quote)+'</blockquote>':'')).join("")+'</article><section class="article-end"><p class="demo-notice">这是一篇展示网站内容与排版的原创示例文章，可替换成你的真实记录。<br>愿每一段留下的文字，都能与未来的自己重逢。</p><div class="article-related"><a href="'+link(previous)+'"><span class="eyebrow">← 上一篇手记</span>'+esc(previous.title)+'</a><a href="'+link(next)+'"><span class="eyebrow">下一篇手记 →</span>'+esc(next.title)+'</a></div></section>';
 }
}
if(page==="about")nav.querySelectorAll("a")[4].setAttribute("aria-current","page");
function setupMusic(){
 const button=$("play-music"),status=$("music-status"),record=$("music-record");
 let context=null,master=null,playing=false,timer=null,start=0;
 function stop(){playing=false;clearInterval(timer);timer=null;if(master&&context){try{master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,.03)}catch(error){}const closingContext=context;context=null;setTimeout(()=>closingContext.close().catch(()=>{}),180)}button.textContent="▶";button.setAttribute("aria-label","播放晚风来信");button.setAttribute("aria-pressed","false");record.classList.remove("playing");status.textContent="点击试听"}
 async function play(){const AudioClass=window.AudioContext||window.webkitAudioContext;if(!AudioClass){status.textContent="当前浏览器暂不支持试听";return}try{context=new AudioClass();await context.resume();master=context.createGain();master.gain.value=.55;const filter=context.createBiquadFilter();filter.type="lowpass";filter.frequency.value=2000;master.connect(filter);filter.connect(context.destination);start=context.currentTime+.1;playing=true;button.textContent="■";button.setAttribute("aria-label","停止晚风来信");button.setAttribute("aria-pressed","true");record.classList.add("playing");
 const freq=n=>440*Math.pow(2,(n-69)/12);
 function tone(note,time,length,level,type){const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type||"sine";oscillator.frequency.value=freq(note);gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level,time+.05);gain.gain.exponentialRampToValueAtTime(.0001,time+length);oscillator.connect(gain);gain.connect(master);oscillator.start(time);oscillator.stop(time+length+.05)}
 const chords=[[48,55,60,64],[45,52,57,60],[53,60,65,69],[43,50,55,59]];
 for(let bar=0;bar<8;bar++){const time=start+bar*3.6;chords[bar%4].forEach((note,i)=>tone(note,time+i*.09,3.5,.046,"sine"))}
 const melody=[72,76,79,76,74,72,67,71,72,69,76,72,71,67,69,72];
 for(let i=0;i<40;i++)tone(melody[i%melody.length],start+i*.72,.95,.075,"sine");
 timer=setInterval(()=>{if(!playing||!context)return;const elapsed=Math.max(0,Math.floor(context.currentTime-start));status.textContent="00:"+String(Math.min(elapsed,30)).padStart(2,"0")+" / 00:30";if(elapsed>=30)stop()},300);
 }catch(error){playing=false;status.textContent="暂时无法试听，请再试一次";button.textContent="▶";button.setAttribute("aria-pressed","false");if(context){context.close().catch(()=>{});context=null}}}
 button.addEventListener("click",()=>{if(playing)stop();else{button.disabled=true;play().finally(()=>button.disabled=false)}});
 window.addEventListener("pagehide",()=>{clearInterval(timer);if(context)context.close().catch(()=>{})});
}
})();