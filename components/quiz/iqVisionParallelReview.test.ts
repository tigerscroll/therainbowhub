import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root='data/quizzes';
const read=(slug:string,locale:string)=>JSON.parse(fs.readFileSync(`${root}/${slug}/${locale}.json`,'utf8'));
const question=(slug:string,locale:string,id:string)=>read(slug,locale).stages['stage-1'].questions[id];
const locales=read('iq','quiz').activeLocales as string[];

test('IQ and Vision have the complete ten-question locale set and unchanged answer identities',()=>{
 for(const slug of ['iq','vision']){
  const manifest=read(slug,'quiz');
  assert.deepEqual([...manifest.activeLocales].sort(),[...locales].sort(),slug);
  assert.equal(manifest.structure.stages.length,1,slug);
  assert.equal(manifest.structure.stages[0].questionIds.length,10,slug);
  for(const locale of locales){
   const copy=read(slug,locale);
   const questions=copy.stages['stage-1'].questions;
   assert.deepEqual(Object.keys(questions).sort(),[...manifest.structure.stages[0].questionIds].sort(),`${slug}/${locale}`);
   for(const[id,item]of Object.entries(questions) as [string,{answers:Record<string,string>}][]){
    const key=manifest.structure.questions[id].correctAnswerId;
    assert.ok(item.answers[key]?.trim(),`${slug}/${locale}/${id}: missing correct answer`);
    assert.equal(new Set(Object.values(item.answers)).size,4,`${slug}/${locale}/${id}: indistinct choices`);
   }
  }
 }
});

test('IQ letter and numerical puzzles preserve the literal operands and unique solutions',()=>{
 const manifest=read('iq','quiz');
 const reference='K7M2-Q9';
 const distance=(a:string,b:string)=>[...a].filter((character,index)=>character!==b[index]).length;
 assert.equal(manifest.structure.questions['iq-s2q2'].correctAnswerId,'a1');
 assert.equal(manifest.structure.questions['iq-s2q6'].correctAnswerId,'a3');
 assert.equal(manifest.structure.questions['iq-s3q4'].correctAnswerId,'a2');
 assert.equal(manifest.structure.questions['iq-s4q4'].correctAnswerId,'a1');
 assert.equal(manifest.structure.questions['iq-s5q8'].correctAnswerId,'a4');
 for(const locale of locales){
  const letter=question('iq',locale,'iq-s2q2');
  assert.match(letter.question,/DOG/,locale);
  assert.match(letter.visual.ariaLabel,/CAT.*DCU/,locale);
  assert.deepEqual(letter.answers,{a1:'EQH',a2:'EPH',a3:'FQH',a4:'ERJ'},locale);
  const pyramid=question('iq',locale,'iq-s2q6');
  assert.deepEqual(pyramid.answers,{a1:'15',a2:'16',a3:'17',a4:'18'},locale);
  assert.equal(Number(pyramid.answers.a3),(3+5)+(5+4),locale);
  const code=question('iq',locale,'iq-s3q4');
  assert.match(code.visual.items[0],/K7M2-Q9/,locale);
  assert.deepEqual(Object.entries(code.answers).filter(([,value])=>distance(reference,value as string)===1).map(([id])=>id),['a2'],locale);
  assert.deepEqual(question('iq',locale,'iq-s5q2').answers,{a1:'17',a2:'15',a3:'16',a4:'20'},locale);
  assert.equal(7*2+3,17);
 }
});

test('Vision literal displays, keyed answers and accessible route remain consistent',()=>{
 const manifest=read('vision','quiz');
 assert.equal(manifest.structure.questions['vision-r8q3'].correctAnswerId,'a3');
 const sourceSvg=fs.readFileSync('data/quizzes/vision/assets/icons/eye-tracking-maze.svg','utf8');
 const publicSvg=fs.readFileSync('public/quizzes/vision/assets/icons/eye-tracking-maze.svg','utf8');
 assert.equal(publicSvg,sourceSvg,'asset preparation must not reintroduce an answer-revealing description');
 const desc=sourceSvg.match(/<desc[^>]*>(.*?)<\/desc>/s)?.[1]??'';
 assert.ok(desc.includes('red dot'));
 assert.doesNotMatch(desc,/\b(?:end|ends|lead|leads|reach|reaches)\s+(?:at\s+)?[ABCD]\b/iu);
 assert.match(sourceSvg,/M62 210[^"\n]*670 250/);
 for(const locale of locales){
  const count=question('vision',locale,'vision-r3q6');
  assert.equal(count.context,'EFPRE PEFER RFEPE PRFEF EPRFP PEFRE',locale);
  assert.equal((count.context.match(/F/g)??[]).length,7,locale);
  assert.equal(count.answers.a2,'7',locale);
  const code=question('vision',locale,'vision-r10q2');
  assert.match(code.visual.items[0],/M8Q2-K7P4-R6N3/,locale);
  assert.match(code.visual.items[1],/M8Q2-K1P4-R6M3/,locale);
  assert.deepEqual(code.answers.a1.match(/[A-Z0-9]/g),['7','N'],locale);
  assert.equal(question('vision',locale,'vision-r5q1').answers.a4,'↖',locale);
  assert.equal(question('vision',locale,'vision-r8q3').answers.a3,'C',locale);
 }
});
