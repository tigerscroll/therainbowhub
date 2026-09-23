import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const root='data/quizzes';
const locales=fs.readdirSync('data/i18n').filter(name=>name.endsWith('.json')).map(name=>name.slice(0,-5)).sort();
const read=(slug:string,name:string)=>JSON.parse(fs.readFileSync(`${root}/${slug}/${name}.json`,'utf8'));
const slugs=fs.readdirSync(root).filter(slug=>fs.existsSync(`${root}/${slug}/quiz.json`));

test('all 53 quizzes have a single ten-question rewarded journey in every supported locale',()=>{
 assert.equal(slugs.length,53);
 assert.equal(locales.length,30);
 for(const slug of slugs){
  const manifest=read(slug,'quiz');
  assert.equal(manifest.template,'single-stage-rewarded-v1',slug);
  assert.equal(manifest.structure.stages.length,1,slug);
  const ids=manifest.structure.stages[0].questionIds;
  assert.equal(ids.length,10,slug);
  assert.equal(new Set(ids).size,10,slug);
  assert.equal(Object.keys(manifest.structure.questions).length,10,slug);
  const available=fs.readdirSync(`${root}/${slug}`).filter(name=>name.endsWith('.json')&&name!=='quiz.json').map(name=>name.slice(0,-5)).sort();
  assert.deepEqual(available,locales,`${slug}: locale files`);
  if(manifest.activeLocales)assert.deepEqual([...manifest.activeLocales].sort(),locales,`${slug}: active locales`);
  for(const locale of locales){
   const copy=read(slug,locale);
   const expanded=expandQuizLocale(manifest,copy,locale);
   const label=`${slug}/${locale}`;
   assert.equal(expanded.stages.length,1,label);
   assert.equal(expanded.stages[0].questions.length,10,label);
   assert.deepEqual(expanded.stages[0].questions.map((q:{id:string})=>q.id),ids,label);
   assert.equal(expanded.career.stages.length,1,label);
   assert.ok(expanded.career.stages[0].preAdButton?.trim(),`${label}: result ad CTA`);
   assert.equal(Object.keys(copy.stages).length,1,label);
   assert.equal(Object.keys(copy.stages['stage-1'].questions).length,10,label);
   for(const question of expanded.stages[0].questions){
    const source=copy.stages['stage-1'].questions[question.id];
    assert.ok(question.question.trim(),`${label}/${question.id}`);
    assert.ok(source,`${label}/${question.id}: localized copy`);
    const logic=manifest.structure.questions[question.id];
    const labels=Array.isArray(question.answers)?question.answers:Object.keys(question.answers);
    assert.equal(labels.length,logic.answerIds.length,`${label}/${question.id}: answer count`);
    assert.ok(labels.length>=2,`${label}/${question.id}: answer count`);
    assert.equal(new Set(labels.map((value:string)=>value.normalize('NFKC').trim().toLowerCase())).size,labels.length,`${label}/${question.id}: distinct answers`);
    assert.deepEqual(labels,logic.answerIds.map((id:string)=>source.answers[id]),`${label}/${question.id}: answer order`);
    if(manifest.engine.scoring==='correct-answer')assert.equal(question.correct,logic.answerIds.indexOf(logic.correctAnswerId),`${label}/${question.id}: correct answer`);
   }
   assert.doesNotMatch(JSON.stringify(copy),/[⟪⟦]|\[\[M\d/,`${label}: translation marker`);
  }
 }
});
