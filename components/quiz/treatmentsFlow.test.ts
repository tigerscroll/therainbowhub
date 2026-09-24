import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const root='data/quizzes/treatments/';
const manifest=JSON.parse(fs.readFileSync(root+'quiz.json','utf8'));
const copy=JSON.parse(fs.readFileSync(root+'en.json','utf8'));
const expanded=expandQuizLocale(manifest,copy,'en');
const questions=expanded.stages[0].questions;

test('Treatments shared translation baseline is text-only with ten questions in one stage',()=>{
 assert.equal(manifest.activeLocales.length,30);
 assert.equal(manifest.engine.localeParity,'strict');
 assert.equal(manifest.template,'single-stage-rewarded-v1');
 assert.equal(manifest.engine.hardRefreshCheckpoints,false);
 assert.equal(manifest.engine.targetRatio,.8);
 assert.equal(expanded.stages.length,1);
 assert.equal(questions.length,10);
 assert.equal(new Set(questions.map((question:any)=>question.id)).size,10);
 for(const question of questions){
  assert.equal(question.presentation,'text');
  for(const field of ['image','visual','study','icons'])assert.equal(question[field],undefined,`${question.id}/${field}`);
  assert.equal(new Set(question.answers).size,4,question.id);
 }
 assert.doesNotMatch(fs.readFileSync(root+'theme.css','utf8'),/url\(/);
 assert.equal(copy.landing.intro.split('\n').length,2);
 assert.doesNotMatch(copy.landing.intro,/10|30/);
 assert.match(copy.about.disclaimer,/not medical advice/);
});

test('Treatments preserves correct answers, category coverage and the safety qualifier',()=>{
 const expected=['Physiotherapy','Acupuncture','Waste products and excess fluid','Use glucose for energy','Chemotherapy: medicines; radiotherapy: radiation','Helping people manage everyday activities','It explores links between thoughts, feelings and actions','Some chemotherapy is taken as tablets or capsules','Occupational therapy','Speech and language therapy'];
 assert.deepEqual(questions.map((question:any)=>question.answers[question.correct]),expected);
 assert.deepEqual([0,1,2,3].map(position=>questions.filter((question:any)=>question.correct===position).length).sort((a,b)=>b-a),[3,3,2,2]);
 const categories=manifest.structure.results.dimensions.flatMap((dimension:any)=>dimension.categories);
 for(const question of questions)assert.equal(categories.filter((category:string)=>category===question.category).length,1,question.id);
 assert.equal(Math.ceil(questions.length*manifest.engine.targetRatio),8);
 assert.ok(expanded.career.stages[0].preAdButton.trim());
});
