import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {baseline,requested as originalBatch,historical} from './config.mjs';
import {grammarMeaning,portablePuzzles,clearSource,finalReasoningTitles} from './localization-adaptations.mjs';
import {twoFamilySource} from './two-family-source.mjs';

const root=process.cwd();
const requested=process.env.QUIZZES?.split(',')??originalBatch;
if(requested.some(s=>![...originalBatch,'mechanic','treatments'].includes(s)))throw Error('Unknown quiz selection');
const cacheDir=process.env.TRANSLATION_CACHE_DIR;
if(!cacheDir||!path.isAbsolute(cacheDir))throw Error('Set TRANSLATION_CACHE_DIR to a task-specific absolute directory.');
export const locales=fs.readdirSync('data/i18n').filter(f=>f.endsWith('.json')&&f!=='en.json').map(f=>f.slice(0,-5));
const chosen=process.env.LOCALES?.split(',')??locales;
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
function patch(file,value){
 const body=JSON.stringify(value,null,2)+'\n',exists=fs.existsSync(file),old=exists?fs.readFileSync(file,'utf8'):'';
 if(body===old)return;
 const head=exists?`*** Update File: ${file}\n@@\n${old.trimEnd().split('\n').map(x=>'-'+x).join('\n')}\n`:`*** Add File: ${file}\n`;
 execFileSync('apply_patch',[],{input:`*** Begin Patch\n${head}${body.trimEnd().split('\n').map(x=>'+'+x).join('\n')}\n*** End Patch\n`,stdio:['pipe','pipe','pipe'],maxBuffer:32*1024*1024,timeout:60000});
}
function leaves(x,p=[],out=[]){if(typeof x==='string')out.push({p,s:x});else if(x&&typeof x==='object')for(const[k,v]of Object.entries(x))leaves(v,[...p,k],out);return out;}
const get=(o,p)=>p.reduce((v,k)=>v?.[k],o);
const set=(o,p,v)=>{p.slice(0,-1).reduce((v,k)=>v[k],o)[p.at(-1)]=v;};
function historicalRead(ref,slug,locale){try{return JSON.parse(execFileSync('git',['show',`${ref}:data/quizzes/${slug}/${locale}.json`],{stdio:['pipe','pipe','pipe'],maxBuffer:4*1024*1024}));}catch{return null;}}
function questions(c){return Object.fromEntries(Object.values(c?.stages??{}).flatMap(st=>Object.entries(st.questions).map(([key,q])=>[q.id??key,q])));}
function normalize(q){if(!q)return null;const c=structuredClone(q);if(Array.isArray(c.answers))c.answers=Object.fromEntries(c.answers.map((v,i)=>[`a${i+1}`,v]));if(Array.isArray(c.trapdoorErrors))c.trapdoorErrors=Object.fromEntries(c.trapdoorErrors.flatMap((v,i)=>v?[[`a${i+1}`,v]]:[]));return c;}
const pinned=Object.fromEntries(requested.map(slug=>[slug,{en:read(`data/quizzes/${slug}/en.json`),before:historicalRead(baseline,slug,'en'),old:historical[slug]?historicalRead(historical[slug],slug,'en'):null}]));
const fullNative=['de','es','fr','it','nl','pt'];
const support=read('scripts/grammar-banks/support.json');
const technical=(s,p)=>!/[A-Za-z]/.test(s)||['src','category','mode','icon','id'].includes(p.at(-1))||/^(?:https?:\/\/|\/quizzes\/)/.test(s)||/^[A-Z]$/.test(s)||/^(?=.*\d)[A-Z\d-]+$/.test(s);

function seed(slug,locale){
 const {en,before,old}=pinned[slug],previous=historicalRead(baseline,slug,locale),older=old?historicalRead(historical[slug],slug,locale):null;
 const source=structuredClone(en),result=structuredClone(en),retained=new Set();
 // Copy unchanged reviewed UI by path; a changed English value must get a new translation.
 for(const {p,s}of leaves(en))if(!['mechanic','treatments'].includes(slug)&&p[0]!=='stages'&&get(before,p)===s&&typeof get(previous,p)==='string'){set(result,p,get(previous,p));retained.add(p.join('.'));}
 // Main titles and identifiers retain their reviewed native identity.
 const preserve=['mechanic','treatments'].includes(slug)
  ?[['landing','cta']]
  :[['title'],['eyebrow'],['landing','cta'],['about','disclaimer']];
 for(const p of preserve)if(typeof get(previous,p)==='string'){set(result,p,get(previous,p));retained.add(p.join('.'));}
 const bq=questions(before),pq=questions(previous),oq=questions(old),lq=questions(older);
 for(const [stageId,stage]of Object.entries(source.stages))for(const[id,q]of Object.entries(stage.questions)){
  const target=result.stages[stageId].questions[id],orig=normalize(bq[id]??oq[id]),loc=normalize(pq[id]??lq[id]);
  if(loc&&orig){for(const {p,s}of leaves(q))if(get(orig,p)===s&&typeof get(loc,p)==='string'){set(target,p,get(loc,p));retained.add(['stages',stageId,'questions',id,...p].join('.'));}}
  for(const {p} of leaves(q)){
   const contextual=twoFamilySource[`${id}.${p.join('.')}`];
   if(contextual){set(q,p,contextual);set(target,p,contextual);retained.delete(['stages',stageId,'questions',id,...p].join('.'));}
  }
  if(slug==='grammar'){
   // Native grammar must be copied as a whole, including its intentionally incorrect choices.
   let native=pq[id];
   if(!native&&fullNative.includes(locale)){
    const bank=read(`scripts/grammar-banks/${locale}.json`).find(x=>x.id===id);
    if(bank)native={...normalize(bank),...support[locale]?.[id]};
   }
   if(native){
    native=normalize(native);
    for(const {p}of leaves(q))if(p[0]!=='headerLabel'&&get(native,p)!==undefined){set(target,p,get(native,p));retained.add(['stages',stageId,'questions',id,...p].join('.'));}
   }else{
    const [question,answers,context]=grammarMeaning[id]??[];if(!question)throw Error(`Missing native adaptation: ${locale}/${id}`);
    const adapted={question,answers:Object.fromEntries(answers.map((x,i)=>[`a${i+1}`,x]))};if(q.context!==undefined)adapted.context=context??question;
    if(q.trapdoorErrors)adapted.trapdoorErrors={a1:'This changes who performed the action.',a2:'This says that more than one report was revised.',a3:'This excludes the first report instead of selecting it.'};
    Object.assign(q,adapted);Object.assign(target,structuredClone(adapted));
    for(const{p}of leaves(adapted))retained.delete(['stages',stageId,'questions',id,...p].join('.'));
   }
  }
  const portable=portablePuzzles[slug]?.[id];
  if(portable&&!(slug==='iq'&&fullNative.includes(locale)&&lq[id])){
   Object.assign(q,structuredClone(portable));Object.assign(target,structuredClone(portable));
   for(const{p}of leaves(portable))retained.delete(['stages',stageId,'questions',id,...p].join('.'));
  }
  // Old per-question count labels are not appropriate inside the new 30-question flow.
  if(/\b(?:OF 10|QUESTION \d|WORD \d)\b/i.test(q.headerLabel??'')){
   q.headerLabel=stage.title.toUpperCase();target.headerLabel=q.headerLabel;retained.delete(['stages',stageId,'questions',id,'headerLabel'].join('.'));
  }
 }
 // Grammar is a native-language quiz; do not claim to assess English in translated editions.
 if(slug==='grammar')for(const{p,s}of leaves(source))if(s.includes('English-language')){
  const v=s.replaceAll('English-language','language');set(source,p,v);if(!retained.has(p.join('.')))set(result,p,v);
 }
 if(slug==='iq')for(const{p,s}of leaves(source))if(/^(?:The Intelligence Vault|THE INTELLIGENCE VAULT)$/.test(s)){
  set(result,p,finalReasoningTitles[locale]);retained.add(p.join('.'));
 }
 const pending=leaves(source).filter(({p,s})=>!retained.has(p.join('.'))&&!technical(s,p));
 return {source,result,pending};
}

const literal=/\{[^{}]+\}|\b(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b|\b(?:CAT|DOG|DCU|EQH|EPH|FQH|ERJ|LOCK|NIM|TOV|RAK)\b|::|\n+/g;
function protect(s){const tokens=[];const text=clearSource(s).replace(literal,v=>{tokens.push(v);return `⟪${tokens.length-1}⟫`;});return {text,tokens};}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const allowedEnglish=new Set(['Royal Air Force','Royal Flying Corps','Royal Naval Air Service','Fleet Air Arm','NEXT QUIZ ROUND']);
const unchanged=(source,target)=>!allowedEnglish.has(source)
 &&!(/→/.test(source)&&/^[ABCD\s→?]+$/.test(source))
 &&!/^(?:Leo|Mara|Nia)(?:\s+—\s+(?:Leo|Mara|Nia)){2}$/.test(source)
 &&source.match(/\b[A-Za-z]{2,}\b/g)?.length>=3
 &&source.replace(/\s+/g,' ').trim().toLowerCase()===target.replace(/\s+/g,' ').trim().toLowerCase();
async function translate(locale,items,attempt=0){
 // Keep paragraph boundaries outside the translation request. Some languages discard
 // placeholders for line breaks, even while translating every visible word correctly.
 if(items.some(s=>s.includes('\n')||s.includes('::'))){
  const parts=items.map(s=>s.split(/(\n+|::)/)),segments=[...new Set(parts.flat().filter(s=>s&&!/^(?:\n+|::)$/.test(s)))];
  const values=await translate(locale,segments,attempt),mapped=new Map(segments.map((s,i)=>[s,values[i]]));
  return parts.map(p=>p.map(s=>mapped.get(s)??s).join(''));
 }
 const protectedItems=items.map(protect);
 const payload=protectedItems.map((x,i)=>`⟦${String(i).padStart(4,'0')}⟧\n${x.text}`).join('\n')+'\n⟦9999⟧';
 const url=new URL('https://translate.googleapis.com/translate_a/single');
 for(const[k,v]of Object.entries({client:'gtx',sl:'en',tl:({fil:'tl',nb:'no',he:'iw'}[locale]??locale),dt:'t',q:payload}))url.searchParams.set(k,v);
 try{
  const r=await fetch(url,{signal:AbortSignal.timeout(45000)});
  if(!r.ok){const err=Error(`HTTP ${r.status}`);err.retry=Math.max(5000,Number(r.headers.get('retry-after')??0)*1000);throw err;}
  const json=await r.json(),text=json[0].map(x=>x[0]??'').join('');
  const chunks=[...text.matchAll(/⟦\s*(\d+)\s*⟧([\s\S]*?)(?=⟦|$)/g)].filter(m=>Number(m[1])!==9999);
  if(chunks.length!==items.length||chunks.some((m,i)=>Number(m[1])!==i))throw Error('Translation boundaries changed');
  return chunks.map((m,i)=>{let s=m[2].trim();for(const[j,t]of protectedItems[i].tokens.entries()){const re=new RegExp(`⟪\\s*${j}\\s*⟫`,'g');if(!re.test(s))throw Error(`Literal placeholder lost: ${t}`);s=s.replace(re,t);}if(!s||/[⟪⟦]/.test(s))throw Error('Unresolved translation marker');if(unchanged(clearSource(items[i]),s)){
   if(requested.every(slug=>['mechanic','treatments'].includes(slug))&&items[i].split(/\s+/).length>5)throw Error('Provider returned an untranslated sentence');
   console.warn(`${locale}: needs native-copy review: ${items[i]}`);
  }return s;});
 }catch(e){
  if(attempt>=12||(e.retry&&attempt>=4))throw Error(`${locale}: ${e.message}`);
  if(!e.retry&&items.length>1){const middle=Math.ceil(items.length/2);return [...await translate(locale,items.slice(0,middle),attempt+1),...await translate(locale,items.slice(middle),attempt+1)];}
  if(items.length===1&&attempt>=8)throw Error(`${locale}: ${e.message}`);
  const delay=Math.max(e.retry??1000,Math.min(10000,1000*2**attempt));console.log(`${locale}: ${e.message}; retry in ${delay}ms`);await pause(delay);return translate(locale,items,attempt+1);
 }
}
async function processLocale(locale){
 const cacheFile=path.join(cacheDir,`${locale}.json`),cache=fs.existsSync(cacheFile)?read(cacheFile):{};
 for(const [key,value]of Object.entries(cache))if(unchanged(clearSource(key),value))delete cache[key];
 const revisionFile=path.join(cacheDir,`${locale}.revision.json`);
 if(!fs.existsSync(revisionFile)){
  // Reuse draft work, but regenerate ambiguous terminology and numeric sentences without
  // placeholder interference with native date order and number inflection.
  for(const key of Object.keys(cache))if(/\d/.test(key)||clearSource(key)!==key||['Pitch','Play','Mass','Flame','Charge','Light'].includes(key))delete cache[key];
  patch(cacheFile,cache);patch(revisionFile,{version:2});
 }
 const drafts=Object.fromEntries(requested.map(slug=>[slug,seed(slug,locale)]));
 const texts=[...new Set(Object.values(drafts).flatMap(x=>x.pending.map(p=>p.s)))].filter(s=>!cache[s]);
 const batches=[];let batch=[],size=0;for(const s of texts){if(size+s.length>3400&&batch.length){batches.push(batch);batch=[];size=0;}batch.push(s);size+=s.length+20;}if(batch.length)batches.push(batch);
 console.log(`${locale}: ${texts.length} new strings, ${batches.length} batches`);
 if(process.env.DRY_RUN)return;
 for(const [i,items]of batches.entries()){
  const out=await translate(locale,items);items.forEach((s,j)=>cache[s]=out[j]);patch(cacheFile,cache);
  if(i%5===0||i===batches.length-1)console.log(`${locale}: batch ${i+1}/${batches.length}`);await pause(500);
 }
 for(const[slug,{result,pending}]of Object.entries(drafts)){
  for(const{p,s}of pending){if(!cache[s])throw Error(`Untranslated ${locale}/${slug}/${p.join('.')}`);set(result,p,cache[s]);}
  patch(path.join(root,`data/quizzes/${slug}/${locale}.json`),result);
 }
 console.log(`${locale}: ${requested.length} draft files complete; activation unchanged.`);
}
// Sequential by default. Cache commits after every batch make interrupted runs resumable.
const failed=[];
for(const locale of chosen){try{await processLocale(locale);}catch(error){failed.push(locale);console.error(`Draft ${locale} stopped safely: ${error.message}`);}}
if(failed.length){console.error(`Locales needing a resumed pass: ${failed.join(',')}`);process.exitCode=1;}
