import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const root='data/quizzes/mechanic/';
const manifest=JSON.parse(fs.readFileSync(root+'quiz.json','utf8'));
const copy=JSON.parse(fs.readFileSync(root+'en.json','utf8'));
const expanded=expandQuizLocale(manifest,copy,'en');
const questions=expanded.stages.flatMap((s:any)=>s.questions);

test('Mechanic has five distinct English text-only rounds and a complete worldwide-friendly result',()=>{
 assert.equal(manifest.activeLocales.length,30);
 assert.equal(manifest.engine.localeParity,'strict');
 assert.equal(manifest.structure.results.score.showBestRound,true);
 assert.deepEqual(expanded.stages.map((s:any)=>s.title),['Dashboard Detective','Inside the Car','Workshop Logic','Fact or Fiction?','Final Diagnosis']);
 assert.equal(new Set(questions.map((q:any)=>q.id)).size,30);
 for(const q of questions){
  assert.equal(q.presentation,'text');
  assert.ok(q.headerLabel);
  for(const field of ['image','visual','study','icons'])assert.equal(q[field],undefined,`${q.id}/${field}`);
  assert.equal(new Set(q.answers).size,4,q.id);
 }
 const cats=manifest.structure.results.dimensions.flatMap((d:any)=>d.categories);
 assert.equal(new Set(cats).size,6);
 for(const c of cats)assert.equal(questions.filter((q:any)=>q.category===c).length,5,c);
 assert.equal(copy.landing.intro.split('\n').length,2);
 assert.doesNotMatch(copy.landing.intro,/30|thirty/i);
 assert.doesNotMatch(copy.title,/Only 7%/);
 assert.equal(manifest.listing.showSocialProof,false);
 assert.match(copy.about.disclaimer,/not a professional qualification/);
 assert.match(copy.about.body,/not country-specific/);
 assert.equal(copy.career.stages['stage-5'].preAdChecks[0],'30 answers checked');
 for(let s=1;s<5;s++)assert.ok(copy.career.stages[`stage-${s}`].next);
});

test('Mechanic answer key preserves diagnostic uncertainty and balances correct positions',()=>{
 const expected=['Low oil pressure','Anti-lock braking system','The charging system','Engine coolant temperature','Turning the steering wheel','A normal system or lamp check',
 'Trap particles before air enters the engine','The rotating brake disc','Supplying electrical power and charging the battery','Coolant flow to help control engine temperature','They travel different distances when cornering','A torque wrench',
 '6 L','180 kPa','The supply is not completely dead','2 L','400 rpm','It is below the stated minimum',
 'The specified grade matters; thicker is not always better','It helps prevent wheel lock but cannot guarantee a shorter stop on every surface','Many have a separate low-voltage battery as well as the main drive battery','Follow the vehicle manufacturer’s coolant specification','Balancing corrects weight imbalance; alignment adjusts wheel angles','The circuit needs diagnosis; the sensor is not automatically the cause',
 'The moved ignition coil','Stop safely and arrange a professional inspection','The charging system and its connections','The fan motor, power supply and control circuit','Wheel and tire condition and balance','Do not go underneath until it is correctly supported with suitable equipment'];
 assert.deepEqual(questions.map((q:any)=>q.answers[q.correct]),expected);
 assert.deepEqual([0,1,2,3].map(i=>questions.filter((q:any)=>q.correct===i).length),[8,8,7,7]);
 assert.equal(18/300*100,6);
 assert.equal(4*.5,2);
 assert.equal(1200/3,400);
 assert.match(copy.stages['stage-3'].questions['mechanic-r3q1'].question,/A test car/);
 assert.match(copy.stages['stage-3'].questions['mechanic-r3q5'].question,/3:1 reduction ratio/);
 assert.equal(2.5<3,true);
 assert.equal(Math.ceil(questions.length*manifest.engine.targetRatio),24);
});
