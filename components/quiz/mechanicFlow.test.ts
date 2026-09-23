import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const root='data/quizzes/mechanic/';
const manifest=JSON.parse(fs.readFileSync(root+'quiz.json','utf8'));
const copy=JSON.parse(fs.readFileSync(root+'en.json','utf8'));
const questions=expandQuizLocale(manifest,copy,'en').stages[0].questions;

test('Mechanic keeps a worldwide-friendly, text-only ten-question quiz',()=>{
 assert.equal(manifest.activeLocales.length,30);
 assert.equal(manifest.engine.localeParity,'strict');
 assert.equal(manifest.template,'single-stage-rewarded-v1');
 assert.equal(manifest.structure.results.score.showBestRound,false);
 assert.equal(questions.length,10);
 assert.equal(new Set(questions.map((question:any)=>question.id)).size,10);
 for(const question of questions){
  assert.equal(question.presentation,'text');
  for(const field of ['image','visual','study','icons'])assert.equal(question[field],undefined,`${question.id}/${field}`);
  assert.equal(new Set(question.answers).size,4,question.id);
 }
 assert.equal(copy.landing.intro.split('\n').length,2);
 assert.doesNotMatch(copy.landing.intro,/30|thirty/i);
 assert.equal(manifest.listing.showSocialProof,false);
 assert.match(copy.about.disclaimer,/not a professional qualification/);
 assert.match(copy.about.body,/avoid assuming one make, model or local inspection standard/);
 assert.equal(Math.ceil(questions.length*manifest.engine.targetRatio),8);
});

test('Mechanic retains diagnostic caution, reviewed calculations and the jack-safety closer',()=>{
 const byId=Object.fromEntries(questions.map((question:any)=>[question.id,question]));
 assert.deepEqual([...questions.map((question:any)=>question.correct)].sort(),[0,0,0,1,1,1,2,2,3,3]);
 assert.equal(byId['mechanic-r3q3'].answers[byId['mechanic-r3q3'].correct],'The supply is not completely dead');
 assert.equal(byId['mechanic-r3q4'].answers[byId['mechanic-r3q4'].correct],'2 L');
 assert.equal(byId['mechanic-r5q1'].answers[byId['mechanic-r5q1'].correct],'The moved ignition coil');
 assert.equal(byId['mechanic-r5q6'].answers[byId['mechanic-r5q6'].correct],'Do not go underneath until it is correctly supported with suitable equipment');
 assert.equal(4*.5,2);
});
