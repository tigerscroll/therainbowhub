import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import test from 'node:test';
import {requested} from '../../scripts/round-expansion/config.mjs';
import {originalTitles} from '../../scripts/round-expansion/original-titles.mjs';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {scoreQuiz} from './scoring.ts';
import type {Quiz} from '../../lib/quizzes.ts';

const read=(slug:string,file:string)=>JSON.parse(readFileSync(`data/quizzes/${slug}/${file}.json`,'utf8'));
const locales=readdirSync('data/i18n').filter(file=>file.endsWith('.json')).map(file=>file.slice(0,-5));

for(const slug of requested){
 test(`${slug}: ten questions, original title and one rewarded result gate`,()=>{
  const manifest=read(slug,'quiz'),copy=read(slug,'en');
  const expanded=expandQuizLocale(manifest,copy,'en');
  const questions=expanded.stages[0].questions;
  assert.equal(copy.title,originalTitles[slug as keyof typeof originalTitles]);
  assert.equal(manifest.template,'single-stage-rewarded-v1');
  assert.equal(manifest.engine.hardRefreshCheckpoints,false);
  assert.deepEqual([...manifest.activeLocales].sort(),[...locales].sort());
  assert.equal(manifest.engine.localeParity,'strict');
  assert.equal(manifest.structure.stages.length,1);
  assert.equal(questions.length,10);
  assert.equal(new Set(questions.map((question:{id:string})=>question.id)).size,10);
  assert.equal(Object.keys(manifest.structure.questions).length,10);
  assert.equal(expanded.career.stages.length,1);
  assert.ok(expanded.career.stages[0].preAdButton.trim());
  assert.equal(copy.landing.intro.split('\n').length,2);
  if(slug==='personality')return;
  const positions=[0,1,2,3].map(position=>questions.filter((question:{correct:number})=>question.correct===position).length);
  assert.deepEqual([...positions].sort((a,b)=>b-a),[3,3,2,2]);
  const categories=manifest.structure.results.dimensions.flatMap((dimension:{categories:string[]})=>dimension.categories);
  assert.ok(questions.every((question:{category:string})=>categories.filter((category:string)=>category===question.category).length===1));
  const quiz={
   engine:{scoring:{type:'correct-answer'},targetRatio:.8},
   questions:questions.map((question:{id:string;correct:number;category:string})=>({id:question.id,answerIndex:question.correct,category:question.category,stage:0})),
   stages:[expanded.stages[0].title],
   result:{profiles:expanded.results.profiles.map((profile:{min:number})=>({...profile,minRatio:profile.min})),scoreDimensions:manifest.structure.results.dimensions.map((dimension:{categories:string[]},index:number)=>({label:String(index),categories:dimension.categories}))},
  } as Quiz;
  for(let score=0;score<=10;score++){
   const answers=Object.fromEntries(quiz.questions.map((question,index)=>[question.id,index<score?question.answerIndex!:(question.answerIndex!+1)%4]));
   const result=scoreQuiz(quiz,answers);
   assert.equal(result.score,score);
   assert.equal(result.total,10);
   assert.equal(result.targetStatus,score>=8?'achieved':'unreachable');
   assert.equal(result.profile.title,expanded.results.profiles.find((profile:{min:number})=>score/10>=profile.min).title);
  }
 });
}

test('Personality retains four reachable weighted profiles with ten questions',()=>{
 const manifest=read('personality','quiz'),copy=read('personality','en');
 const ids=manifest.structure.results.profiles.map((profile:{id:string})=>profile.id);
 const questions=manifest.structure.stages[0].questionIds.map((id:string)=>{
  const logic=manifest.structure.questions[id];
  assert.deepEqual(logic.answerIds.map((answer:string)=>Object.keys(logic.choiceMeanings[answer])[0]).sort(),[...ids].sort());
  return{id,stage:0,choiceWeights:logic.answerIds.map((answer:string)=>logic.choiceMeanings[answer])};
 });
 const quiz={engine:{scoring:{type:'weighted-profile'}},questions,stages:[copy.stages['stage-1'].title],result:{profiles:manifest.structure.results.profiles.map((profile:any)=>({...copy.results.profiles[profile.key],id:profile.id,minRatio:0})),scoreDimensions:[]}} as Quiz;
 for(const id of ids){
  const answers=Object.fromEntries(questions.map((question:any)=>[question.id,question.choiceWeights.findIndex((weight:Record<string,number>)=>weight[id]===1)]));
  const result=scoreQuiz(quiz,answers);
  assert.equal(result.profile.id,id);
  assert.equal(result.score,10);
  assert.equal(result.percentage,100);
 }
});
