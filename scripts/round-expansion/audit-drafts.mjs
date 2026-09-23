import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {requested,baseline} from './config.mjs';
import {clearSource} from './localization-adaptations.mjs';
import {expandQuizLocale} from '../quiz-schema-v2.mjs';
const locales=fs.readdirSync('data/i18n').filter(f=>f.endsWith('.json')&&f!=='en.json').map(f=>f.slice(0,-5));
const ready=locales.filter(locale=>requested.every(slug=>Object.keys(JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`)).stages).length===5));
let count=0;const errors=[];
const read=(slug,locale)=>JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`));
function leaves(x,p=[],out=[]){if(typeof x==='string')out.push({p,s:x});else if(x&&typeof x==='object')for(const[k,v]of Object.entries(x))leaves(v,[...p,k],out);return out;}
for(const locale of ready)for(const slug of requested){
 const m=read(slug,'quiz'),c=read(slug,locale),en=read(slug,'en'),expanded=expandQuizLocale(m,c,locale);
 const original=JSON.parse(execFileSync('git',['show',`${baseline}:data/quizzes/${slug}/${locale}.json`],{maxBuffer:2*1024*1024}));
 if(c.title!==original.title)errors.push(`${slug}/${locale}: original title changed`);
 if(c.landing.intro.split('\n').length!==2)errors.push(`${slug}/${locale}: subtitle must have two explicit lines`);
 const q=expanded.stages.flatMap(s=>s.questions);
 if(q.length!==30||expanded.stages.some(s=>s.questions.length!==6))errors.push(`${slug}/${locale}: not five rounds of six`);
 for(const item of q){
  const answers=Array.isArray(item.answers)?item.answers:Object.keys(item.answers);
  if(new Set(answers.map(s=>s.normalize('NFKC').replace(/\s+/gu,' ').trim().toLowerCase())).size!==4)errors.push(`${slug}/${locale}/${item.id}: duplicate answers`);
  if(slug!=='personality'&&(item.correct<0||item.correct>3))errors.push(`${slug}/${locale}/${item.id}: invalid answer key`);
 }
 for(const {p,s}of leaves(c))if(/[⟪⟦]|\[\[M\d/.test(s))errors.push(`${slug}/${locale}/${p.join('.')}: translator marker left`);
 count++;
}
console.log(JSON.stringify({readyLocales:ready,files:count,expected:requested.length*locales.length,errors},null,2));
if(errors.length)process.exitCode=1;
