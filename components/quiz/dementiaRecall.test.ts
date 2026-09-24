import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales=fs.readdirSync('data/i18n').filter(file=>file.endsWith('.json')).map(file=>file.slice(0,-5));

function normalized(word:string,locale:string){
 return word.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu,'').normalize('NFC');
}

function plain(word:string,locale:string){
 return normalized(word,locale).replace(/[^\p{L}\p{N}]/gu,'');
}

test('Dementia recall answer labels exactly match the words users studied in every locale',()=>{
 for(const locale of locales){
  const copy=JSON.parse(fs.readFileSync(`data/quizzes/dementia/${locale}.json`,'utf8'));
  const questions=copy.stages['stage-1'].questions;
  const studied=questions['dementia-q1'].study.items.map((word:string)=>normalized(word,locale));
  const immediate=questions['dementia-q1'].answers;
  const delayed=questions['dementia-q9'].answers;
  assert.equal(studied.length,4,locale);
  assert.equal(new Set(studied).size,4,locale);
  assert.deepEqual(studied,[immediate.a3,immediate.a4,immediate.a2,immediate.a1].map((word:string)=>normalized(word,locale)),`${locale}: immediate recall options`);
  assert.deepEqual(studied,[delayed.a2,delayed.a1,delayed.a3,delayed.a4].map((word:string)=>normalized(word,locale)),`${locale}: delayed recall options`);
 }
});

test('Dementia object-recall choices name the pictured objects consistently in every locale',()=>{
 for(const locale of locales){
  const copy=JSON.parse(fs.readFileSync(`data/quizzes/dementia/${locale}.json`,'utf8'));
  const questions=copy.stages['stage-1'].questions;
  const immediate=questions['dementia-q5'];
  const delayed=questions['dementia-q10'];
  const objects=Object.values(immediate.answers) as string[];
  assert.equal(immediate.study.items.join(''),'🧤🔑☕📘',locale);
  for(const object of objects){
   assert.ok(plain(immediate.study.ariaLabel,locale).includes(plain(object,locale)),`${locale}: ${object} missing from object description`);
  }
  assert.deepEqual(
   [delayed.answers.a3,delayed.answers.a2,delayed.answers.a4,delayed.answers.a1].map((word:string)=>plain(word,locale)),
   objects.map(word=>plain(word,locale)),
   `${locale}: immediate and delayed object names`,
  );
 }
});

test('reviewed Dementia prompts do not regress to literal or untranslated fragments',()=>{
 const read=(locale:string)=>JSON.parse(fs.readFileSync(`data/quizzes/dementia/${locale}.json`,'utf8')).stages['stage-1'].questions;
 for(const locale of ['fi','sk','sr']){
  const answers=Object.values(read(locale)['dementia-q8'].answers) as string[];
  assert.ok(answers.every(answer=>!/^(?:Cat|Horse|Rabbit|Bird|Хорсе|Бирд)$/u.test(answer)),locale);
 }
 assert.doesNotMatch(read('he')['dementia-q2'].question,/מדויקתP8L4T/u);
 assert.doesNotMatch(read('ja')['dementia-q2'].question,/ですかP8L4T/u);
 const japanese=read('ja');
 assert.equal(japanese['dementia-q1'].study.items[1],'時計');
 assert.equal(japanese['dementia-q9'].answers.a1,'時計');
 assert.match(japanese['dementia-q10'].question,/ものの順番/u);
 assert.doesNotMatch(japanese['dementia-q10'].question,/天体|オブジェクト|シーケンス/u);
 const portuguese=read('pt');
 assert.equal(portuguese['dementia-q5'].answers.a3,'Chávena');
 assert.equal(portuguese['dementia-q10'].answers.a4,'Chávena');
 assert.match(portuguese['dementia-q10'].headerLabel,/RECORDAÇÃO/u);
 assert.doesNotMatch(portuguese['dementia-q10'].headerLabel,/RECALL|ATRASO/u);
 for(const [locale,fragment] of [['fil','late night rappel'],['fi','Kaksi päivää myöhemmin'],['sr','ОДМАХ ПОЗИВ'],['sk','VZOROVÉ ZMLUVOVANIE']] as const){
  assert.ok(Object.values(read(locale)).every((question:any)=>!question.headerLabel.includes(fragment)),locale);
 }
});
