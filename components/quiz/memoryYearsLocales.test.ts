import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {vocabulary,journeyWords} from '../../scripts/memory-locale-vocabulary.mjs';

const locales=fs.readdirSync('data/i18n').filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5)).sort();
const read=(slug:string,locale:string)=>JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`,'utf8'));
const clean=(s:string)=>s.replace(/[\u2066-\u2069]/g,'').normalize('NFKC').toLocaleLowerCase('und');

test('Memory and Years Left have strict five-by-six parity in every locale',()=>{
 for(const slug of ['memory','years-left']){
  const manifest=read(slug,'quiz'),en=expandQuizLocale(manifest,read(slug,'en'),'en');
  assert.deepEqual([...manifest.activeLocales].sort(),locales);
  assert.equal(manifest.engine.localeParity,'strict');
  assert.equal(manifest.engine.hardRefreshCheckpoints,false);
  const logic=(q:any)=>({id:q.id,correct:q.correct,weights:Array.isArray(q.answers)?undefined:Object.values(q.answers),calibration:q.calibration,category:q.category,study:q.study?.mode});
  const expected=en.stages.flatMap((s:any)=>s.questions).map(logic);
  for(const locale of locales){
   const copy=read(slug,locale),quiz=expandQuizLocale(manifest,copy,locale);
   assert.deepEqual(quiz.stages.map((s:any)=>s.questions.length),[6,6,6,6,6],`${slug}/${locale}`);
   assert.deepEqual(quiz.stages.flatMap((s:any)=>s.questions).map(logic),expected,`${slug}/${locale}: scoring unchanged`);
   assert.equal(copy.landing.intro.split('\n').length,2,`${slug}/${locale}: two-line subtitle`);
   assert.doesNotMatch(copy.landing.intro,/\b(?:10|30)\b/);
   assert.equal(Object.keys(copy.career.stages).length,5);
   assert.ok(copy.career.stages['stage-5'].preAdButton);
   if(locale!=='en'){
    const source=read(slug,'en');
    for(const[id,profile]of Object.entries(copy.results.profiles) as [string,any][]){
     assert.notEqual(profile.title,source.results.profiles[id].title,`${slug}/${locale}/${id}: untranslated result title`);
    }
   }
  }
 }
});

test('Memory recall pairs, repeated objects and literal codes agree in all locales',()=>{
 const en=read('memory','en'),source=Object.assign({},...Object.values(en.stages).map((s:any)=>s.questions));
 for(const locale of locales){
  const copy=read('memory',locale),q=Object.assign({},...Object.values(copy.stages).map((s:any)=>s.questions));
  assert.equal(Object.values(q).filter((x:any)=>x.study).length,3);
  for(const id of ['memory-r1q2','memory-r3q2','memory-r4q2','memory-r1q3','memory-r3q3','memory-r2q5','memory-r4q4']){
   assert.deepEqual(Object.values(q[id].answers).map((s:any)=>clean(s)),Object.values(source[id].answers).map((s:any)=>clean(s)),`${locale}/${id}: literal codes or sequences changed`);
  }
  assert.ok(q['memory-r1q7'].question.includes('MIRROR · MIRROR · MIROR · MIRROR'),locale);
  const pairs=q['memory-r4q1'].study.items.map((s:string)=>clean(s).replace(' · ',' — '));
  assert.deepEqual(Object.entries(q['memory-r4q6'].answers).filter(([,s])=>pairs.includes(clean(s as string))).map(([id])=>id),['a3'],`${locale}: exactly one supported pair`);
  const names=q['memory-r4q1'].study.items.map((s:string)=>clean(s.split(' · ')[0]));
  assert.equal(clean(q['memory-r4q3'].answers.a3),names[2],`${locale}: name before Noah`);
  assert.equal(clean(q['memory-r4q5'].answers.a1),names[2],`${locale}: compass owner`);
  assert.equal(q['memory-r1q4'].answers.a4,q['memory-r1q1'].answers.a4,`${locale}: elephant`);
  assert.equal(q['memory-r5q1'].answers.a1,q['memory-r1q8'].answers.a3,`${locale}: silver`);
  assert.equal(q['memory-r5q6'].answers.a2,q['memory-r3q1'].answers.a3,`${locale}: green`);
  assert.equal(q['memory-r5q4'].answers.a4,q['memory-r4q1'].answers.a2,`${locale}: violin`);
  if(locale!=='en'){
   const v=(vocabulary as Record<string,Record<string,string>>)[locale];
   const j=(journeyWords as Record<string,string[]>)[locale];
   assert.deepEqual(q['memory-r3q1'].study.items,[j[0],j[1],j[2],`${j[3]} · ${v.window}`]);
   assert.equal(q['memory-r3q8'].answers.a4,j[4]);
   assert.deepEqual(q['memory-r1q1'].study.items,[v.blueKey,v.purpleElephant,`${v.train} · 6`,v.silverKite]);
   assert.equal(q['memory-r5q8'].answers.a1,`${v.silverKite} · ${v.train} 6 · ${v.window}`);
   assert.equal(q['memory-r2q6'].answers.a3,v.boot);
   assert.ok(q['memory-r2q6'].question.includes(v.coin));
   assert.ok(q['memory-r3q1'].study.items[3].endsWith(v.window));
  }
 }
});
