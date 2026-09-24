import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const slugs=['nursing','midwifery','paramedic'];
const read=(slug:string,locale:string)=>JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`,'utf8'));

test('clinical-knowledge quizzes show quiz results, not an entrance-exam outcome',()=>{
 const locales=read('nursing','quiz').activeLocales as string[];
 assert.equal(locales.length,30);
 for(const slug of slugs){
  const definition=read(slug,'quiz');
  assert.deepEqual(definition.activeLocales,locales);
  assert.equal(definition.engine.targetRatio,0.8);
  assert.equal(definition.structure.stages.length,1);
  assert.equal(definition.structure.stages[0].questionIds.length,10);
 }

 for(const locale of locales){
  const entries=slugs.map(slug=>read(slug,locale));
  const reference=entries[0];
  for(const entry of entries){
   assert.equal(entry.career.stages['stage-1'].difficulty,reference.career.stages['stage-1'].difficulty,locale);
   assert.equal(entry.career.stages['stage-1'].preAdCopy,reference.career.stages['stage-1'].preAdCopy,locale);
   assert.equal(entry.career.stages['stage-1'].preAdChecks[1],reference.career.stages['stage-1'].preAdChecks[1],locale);
   assert.equal(entry.results.name,reference.results.name,locale);
   assert.equal(entry.results.score.passed,reference.results.score.passed,locale);
   assert.equal(entry.results.score.finished,reference.results.score.finished,locale);
   assert.ok(entry.about.disclaimer.trim(),locale);
  }
 }
 assert.equal(read('nursing','en').career.stages['stage-1'].preAdCopy,'Your quiz score and topic breakdown are ready to reveal.');
 assert.equal(read('nursing','en').results.score.passed,'You reached the 80% target in this quiz!');
});
