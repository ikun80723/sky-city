import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const original = path.resolve('../sky-city/dist/content.js');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(original,'utf8'),context);
const source = context.window.SKY_CITY;
const titles = ['周末留一点空白','考公错题复盘的四个问题','一篇论文的阅读笔记应该记什么','学习记录：把没弄懂的问题写下来','工作结束后，给自己留三句话','读书笔记，不只摘抄','晚上的音乐时间'];
const dates = ['2026-10-14','2026-10-12','2026-10-09','2026-10-06','2026-10-03','2026-09-27','2026-09-21'];
const entries = source.articles.map((article,index)=>({id:article.id,type:'article',status:'published',title:titles[index],excerpt:article.subtitle,body:article.blocks.map(block=>[block.heading?'## '+block.heading:'',block.text||'',block.quote?'> '+block.quote:''].filter(Boolean).join('\n\n')).join('\n\n'),category:article.category,tags:article.category==='考公笔记'?['错题复盘','学习方法']:article.category==='科研札记'?['论文阅读','研究笔记']:article.category==='读书'?['阅读记录']:['日常记录'],featured:index===2,demo:true,createdAt:dates[index]+'T08:00:00Z',updatedAt:dates[index]+'T08:00:00Z',cover:'',link:'',author:'',artist:'',bookState:'want',rating:0}));
for(const [index,book] of source.books.entries())entries.push({id:'book-'+index,type:'book',status:'published',title:book.title,author:book.author,artist:'',excerpt:book.note,body:'这是一条可编辑的示例书目。\n\n可以在写作台记录阅读进度、感想与摘录，也可以换成自己的书单。',category:'读书',tags:['阅读'],featured:false,demo:true,cover:'',link:'',bookState:'want',rating:0,createdAt:'2026-10-01T08:00:00Z',updatedAt:'2026-10-01T08:00:00Z'});
entries.push({id:'music-sky-city',type:'music',status:'published',title:'天空之城',artist:'久石让',author:'',excerpt:'留给安静的时候。',body:'这是一条示例音乐记录。可以在写作台填写自己的收听链接，记下听见这首曲子时的心情。',category:'音乐',tags:['纯音乐'],featured:false,demo:true,cover:'',link:'',bookState:'want',rating:0,createdAt:'2026-10-01T08:00:00Z',updatedAt:'2026-10-01T08:00:00Z'});
const data={schemaVersion:2,revision:'initial-react-v2',site:{name:'天空之城',subtitle:'关于考公、科研、读书，以及生活里值得记下来的事。',bio:'这里是一处整理思考和日常记录的地方。\n\n考公笔记留下练习与复盘；科研札记记录论文阅读和研究中的问题；读书、音乐与随笔，则留给那些想再次想起的片刻。\n\n不必每一篇都有结论。把问题说清楚，把经历留下来，就已经有意义。\n\n目前展示的是可替换的示例内容。你可以从写作台开始，慢慢把这里变成自己的记录。'},entries};
fs.mkdirSync('public/data',{recursive:true});
fs.writeFileSync('public/data/content.json',JSON.stringify(data,null,2)+'\n');
console.log('Migrated',entries.length,'records; all marked as examples.');
