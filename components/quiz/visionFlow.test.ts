import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const manifest=JSON.parse(fs.readFileSync('data/quizzes/vision/quiz.json','utf8'));
const copy=JSON.parse(fs.readFileSync('data/quizzes/vision/en.json','utf8'));
const questions=expandQuizLocale(manifest,copy,'en').stages[0].questions;

test('Vision is ten questions with one result checkpoint and an 80% target',()=>{
 assert.equal(manifest.template,'single-stage-rewarded-v1');
 assert.equal(manifest.engine.hardRefreshCheckpoints,false);
 assert.equal(manifest.engine.targetRatio,.8);
 assert.equal(manifest.structure.stages.length,1);
 assert.equal(questions.length,10);
 assert.equal(new Set(questions.map((question:any)=>question.id)).size,10);
 assert.equal(Object.keys(copy.career.stages).length,1);
 assert.doesNotMatch(copy.landing.intro,/10|30/);
 assert.match(copy.about.disclaimer,/not an eye examination/);
});

test('Vision preserves its selected answer keys and visual puzzle data',()=>{
 const expected=['Bottom right','Star','↖','7','B4M','Swatch C','The second character','C','7 and N','Anchor'];
 assert.deepEqual(questions.map((question:any)=>question.answers[question.correct]),expected);
 assert.deepEqual([0,1,2,3].map(position=>questions.filter((question:any)=>question.correct===position).length).sort((a,b)=>b-a),[3,3,2,2]);
 const byId=Object.fromEntries(questions.map((question:any)=>[question.id,question]));
 assert.equal((byId['vision-r3q6'].context.match(/F/g)??[]).length,7);
 assert.equal(byId['vision-r8q5'].study.items[3],'⚓');
 assert.equal(byId['vision-r1q5'].study.items[0],'⭐');
 assert.equal(questions.filter((question:any)=>question.study).length,2);
});

test('all 30 Vision locales retain ten questions and literal puzzle tokens',()=>{
 const locales=fs.readdirSync('data/i18n').filter(file=>file.endsWith('.json')).map(file=>file.slice(0,-5)).sort();
 assert.deepEqual([...manifest.activeLocales].sort(),locales);
 assert.equal(manifest.engine.localeParity,'strict');
 for(const locale of locales){
  const translated=JSON.parse(fs.readFileSync(`data/quizzes/vision/${locale}.json`,'utf8'));
  const data=expandQuizLocale(manifest,translated,locale);
  assert.equal(data.stages.length,1,locale);
  assert.equal(data.stages[0].questions.length,10,locale);
  const byId=Object.fromEntries(data.stages[0].questions.map((question:any)=>[question.id,question])) as Record<string,any>;
  assert.ok(byId['vision-r5q1'].question.includes('↗'),`${locale}: mirror arrow`);
  assert.match(byId['vision-r3q6'].question,/F/,`${locale}: literal Latin F`);
  assert.equal((byId['vision-r3q6'].context.match(/f/gi)??[]).length,7,locale);
  assert.equal(byId['vision-r3q6'].context,'EFPRE PEFER RFEPE PRFEF EPRFP PEFRE',`${locale}: equivalent language-neutral letter scan`);
  for(const id of ['vision-r1q5','vision-r8q5'])assert.deepEqual(byId[id].study.items,questions.find((question:any)=>question.id===id).study.items,`${locale}/${id}: unchanged board`);
  const raw=translated.stages['stage-1'].questions['vision-r10q2'].answers;
  assert.deepEqual(['a1','a2','a3','a4'].map(id=>raw[id].match(/[A-Z0-9]/g)),[['7','N'],['8','6'],['Q','P'],['K','R']],`${locale}: literal code characters`);
  assert.deepEqual(byId['vision-r10q2'].visual.items.map((value:string)=>value.split('::')[1].trim()),['M8Q2-K7P4-R6N3','M8Q2-K1P4-R6M3'],`${locale}: comparison codes`);
  for(const question of data.stages[0].questions){
   assert.equal(new Set(question.answers).size,4,`${locale}/${question.id}`);
   assert.ok(question.answers[question.correct],`${locale}/${question.id}: correct answer`);
  }
 }
});
