import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {requested} from '../../scripts/round-expansion/config.mjs';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {headings,terms,intros} from '../../scripts/round-expansion/two-family-copy.mjs';
import {corrections} from '../../scripts/round-expansion/two-family-corrections.mjs';
import {talkingTherapy,brakingDistance} from '../../scripts/round-expansion/two-family-safety-copy.mjs';
import {resultTitles} from '../../scripts/round-expansion/two-family-result-titles.mjs';

const families=[...requested,'mechanic','treatments','memory','vision','years-left'];
const locales=fs.readdirSync('data/i18n').filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5)).sort();
const read=(s:string,l:string)=>JSON.parse(fs.readFileSync(`data/quizzes/${s}/${l}.json`,'utf8'));
const shape=(x:any,key=''):any=>{
 if(typeof x==='string')return 'text';
 if(Array.isArray(x))return x.map(v=>shape(v));
 if(x&&typeof x==='object')return key==='answers'?Object.values(x).map(v=>shape(v)):Object.fromEntries(Object.keys(x).sort().map(k=>[k,shape(x[k],k)]));
 return x;
};
test('all 35 five-round families resolve completely in all 30 locales (1050 editions)',()=>{
 assert.equal(new Set(families).size,35);assert.equal(locales.length,30);
 for(const slug of families){
  const m=read(slug,'quiz'),english=expandQuizLocale(m,read(slug,'en'),'en');
  assert.deepEqual([...m.activeLocales].sort(),locales,slug);
  assert.equal(m.engine.localeParity,'strict',slug);
  for(const locale of locales){
   const c=read(slug,locale),resolved=expandQuizLocale(m,c,locale),label=`${slug}/${locale}`;
   assert.deepEqual(shape(resolved),shape(english),`${label}: resolved structure and scoring`);
   assert.equal(resolved.stages.length,5,label);
   assert.equal(resolved.career.stages.length,5,label);
   assert.ok(resolved.career.stages.at(-1).preAdButton?.trim(),`${label}: final button`);
   const seen=new Set();
   for(const [i,stage]of resolved.stages.entries()){
    assert.equal(stage.questions.length,6,label);
    assert.ok(stage.title.trim());
    for(const q of stage.questions){
     assert.ok(!seen.has(q.id),`${label}: duplicate ID`);seen.add(q.id);
     assert.ok(q.question.trim(),`${label}/${q.id}`);
     const labels=Array.isArray(q.answers)?q.answers:Object.keys(q.answers);
     assert.equal(labels.length,4);
     assert.equal(new Set(labels.map((s:string)=>s.normalize('NFKC').trim().toLowerCase())).size,4,`${label}/${q.id}: distinct choices`);
     const logic=m.structure.questions[q.id];
     assert.deepEqual(labels,logic.answerIds.map((a:string)=>c.stages[`stage-${i+1}`].questions[q.id].answers[a]));
     if(m.engine.scoring==='correct-answer')assert.equal(q.correct,logic.answerIds.indexOf(logic.correctAnswerId));
    }
   }
   assert.equal(seen.size,30,label);
   assert.doesNotMatch(JSON.stringify(c),/[⟪⟦]|\[\[M\d/,`${label}: translation marker`);
  }
 }
});

test('Mechanic and Treatments preserve reviewed terminology, headings and final-master counts',()=>{
 assert.deepEqual(Object.keys(headings).sort(),locales.filter(l=>l!=='en'));
 for(const locale of locales.filter(l=>l!=='en'))for(const slug of ['mechanic','treatments']){
  const c=read(slug,locale),offset=slug==='mechanic'?0:5;
  assert.equal(headings[locale].length,10);assert.equal(terms[locale].length,6);
  assert.equal(c.landing.intro,`${intros[locale][offset===0?0:1]}\n${intros[locale][2]}`);
  assert.doesNotMatch(c.landing.intro,/\b(?:10|30)\b/);
  assert.match(c.title,/80/);assert.doesNotMatch(c.title,/(?:7|16)\s*%/);
  for(let i=1;i<=5;i++){
   const stage=c.stages[`stage-${i}`];assert.equal(stage.title,headings[locale][offset+i-1]);
   assert.equal(c.career.stages[`stage-${i}`].difficulty,stage.title);
   for(const q of Object.values(stage.questions) as any[])assert.equal(q.headerLabel,stage.title);
  }
  if(slug==='mechanic')assert.equal(c.stages['stage-2'].questions['mechanic-r2q6'].answers.a4,terms[locale][0]);
  else{assert.equal(c.stages['stage-5'].questions['treatments-r5q1'].answers.a2,terms[locale][3]);assert.equal(c.stages['stage-5'].questions['treatments-r5q2'].answers.a1,terms[locale][4]);}
  const safetyPath=slug==='mechanic'?'stages.stage-4.questions.mechanic-r4q2.answers.a2':'stages.stage-1.questions.treatments-r1q3.answers.a1';
  for(const[path,value]of Object.entries(corrections[slug]?.[locale]??{}))if(path!==safetyPath&&!/^results\.profiles\.[^.]+\.title$/.test(path))assert.equal(path.split('.').reduce((o,k)=>o[k],c),value,`${slug}/${locale}/${path}`);
  assert.deepEqual(Object.values(c.results.profiles).map((p:any)=>p.title),(slug==='treatments'?[0,1,2,4,5]:[0,1,2,3,4,5]).map(i=>resultTitles[locale][i]));
  assert.equal(safetyPath.split('.').reduce((o,k)=>o[k],c),slug==='mechanic'?brakingDistance[locale]:talkingTherapy[locale]);
 }
});
