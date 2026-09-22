import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const root='data/quizzes/treatments/';
const manifest=JSON.parse(fs.readFileSync(root+'quiz.json','utf8'));
const copy=JSON.parse(fs.readFileSync(root+'en.json','utf8'));
const expanded=expandQuizLocale(manifest,copy,'en');
const questions=expanded.stages.flatMap((s:any)=>s.questions);

test('Treatments is English-only, text-only and five distinct six-question rounds',()=>{
 assert.deepEqual(manifest.activeLocales,['en']);
 assert.equal(manifest.engine.localeParity,'independent');
 assert.equal(manifest.template,'five-stage-six-question-v1');
 assert.equal(manifest.engine.hardRefreshCheckpoints,false);
 assert.equal(manifest.engine.targetRatio,.8);
 assert.deepEqual(expanded.stages.map((s:any)=>s.questions.length),[6,6,6,6,6]);
 assert.deepEqual(expanded.stages.map((s:any)=>s.title),['Name That Treatment','How It Works','Spot the Difference','Fact or Mix-Up?','Put It Together']);
 assert.equal(new Set(questions.map((q:any)=>q.id)).size,30);
 for(const q of questions){
  assert.equal(q.presentation,'text');
  for(const field of ['image','visual','study','icons'])assert.equal(q[field],undefined,`${q.id}/${field}`);
  assert.equal(new Set(q.answers).size,4,q.id);
 }
 assert.doesNotMatch(fs.readFileSync(root+'theme.css','utf8'),/url\(/);
 assert.equal(copy.landing.intro.split('\n').length,2);
 assert.doesNotMatch(copy.landing.intro,/10|30/);
 assert.doesNotMatch(copy.title,/16%/);
 assert.match(copy.about.disclaimer,/not medical advice/);
});

test('Treatments answer key matches the reviewed terminology and balanced positions',()=>{
 const expected=['Physiotherapy','Acupuncture','A talking therapy','Chemotherapy','Cups that create suction on the skin','Giving donated blood components through a vein',
 'Waste products and excess fluid','Use glucose for energy','They kill bacteria or stop them multiplying','A weak electrical current','Help the immune system fight cancer','Medicines make the person unconscious for the procedure',
 'Chemotherapy: medicines; radiotherapy: radiation','Helping people manage everyday activities','Ultrasound uses sound; radiotherapy uses radiation','Local numbs an area; general makes you unconscious','Vaccine: prepares immunity; antibiotic: acts against bacteria','No — it can include exercise, hands-on care and advice',
 'It explores links between thoughts, feelings and actions','Some chemotherapy is taken as tablets or capsules','It can support people at home, school or work','Evidence that it helps pain is limited, not conclusive','It can damage cancer-cell DNA to stop growth or kill cells','A treatment plan may combine several approaches',
 'Occupational therapy','Speech and language therapy','Coronary artery bypass graft','Hydrotherapy','Palliative care','Cognitive behavioural therapy'];
 assert.deepEqual(questions.map((q:any)=>q.answers[q.correct]),expected);
 assert.deepEqual([0,1,2,3].map(i=>questions.filter((q:any)=>q.correct===i).length),[8,8,7,7]);
 const categories=manifest.structure.results.dimensions.flatMap((d:any)=>d.categories);
 for(const q of questions)assert.equal(categories.filter((c:string)=>c===q.category).length,1,q.id);
 assert.equal(Math.ceil(questions.length*manifest.engine.targetRatio),24);
 assert.equal(copy.career.stages['stage-5'].preAdChecks.length,3);
 for(let s=1;s<5;s++)assert.ok(copy.career.stages[`stage-${s}`].next);
});
