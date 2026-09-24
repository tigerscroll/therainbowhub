import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales=fs.readdirSync('data/i18n').filter(file=>file.endsWith('.json')).map(file=>file.slice(0,-5));
const cases=[
 {slug:'cataract',id:'cataract-q4',icons:'🌙🔑☂️📘🍋',positions:[3,1,4,2]},
 {slug:'maculardegeneration',id:'macular-q4',icons:'🔑🌿☀️📘☕',positions:[3,0,4,2]},
] as const;

function comparable(value:string,locale:string){
 return value.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'');
}

test('Cataract and macular visual-recall choices name their pictured positions in all locales',()=>{
 for(const {slug,id,icons,positions} of cases){
  const manifest=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`,'utf8'));
  assert.equal(manifest.structure.questions[id].correctAnswerId,'a4',slug);
  for(const locale of locales){
   const copy=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`,'utf8'));
   const question=copy.stages['stage-1'].questions[id];
   const described=question.study.ariaLabel.split(locale==='th'?/\s+/u:/[,،、]/u).map((part:string)=>part.trim());
   assert.equal(question.study.items.join('').replace(/\uFE0F/gu,''),icons.replace(/\uFE0F/gu,''),`${slug}/${locale}: visual order`);
   assert.equal(described.length,5,`${slug}/${locale}: five described objects`);
   for(const [index,answer] of (Object.values(question.answers) as string[]).entries()){
    const actual=comparable(answer,locale);
    const expected=comparable(described[positions[index]],locale);
    assert.ok(actual===expected || (actual.length>=3 && expected.includes(actual)),`${slug}/${locale}: ${answer} must name pictured object ${positions[index]+1}`);
   }
  }
 }
});

test('reviewed Finnish and Japanese macular safety copy stays a quiz, not a diagnostic eye test',()=>{
 const expected={
  fi:{title:/visa/iu,central:/keskeiseen näköön/iu,exam:/mustuaiset laajennetaan/iu,action:/viipymättä silmälääkärin arvioon/iu},
  ja:{title:/クイズ/u,central:/細部をはっきり見る力/u,exam:/瞳孔を広げて眼底を調べる/u,action:/速やかに眼科を受診する/u},
 } as const;
 for(const [locale,terms] of Object.entries(expected)){
  const copy=JSON.parse(fs.readFileSync(`data/quizzes/maculardegeneration/${locale}.json`,'utf8'));
  const questions=copy.stages['stage-1'].questions;
  assert.match(copy.title,terms.title,locale);
  assert.match(questions['macular-q6'].answers.a2,terms.central,locale);
  assert.match(questions['macular-q8'].answers.a4,terms.exam,locale);
  assert.match(questions['macular-q9'].answers.a1,terms.action,locale);
  assert.match(copy.about.disclaimer,locale==='fi'?/ei voi todeta eikä sulkea pois/iu:/確定したり否定したりすることはできません/u,locale);
 }
});

test('Portugal macular copy uses local DMI terminology and retains the safety answers',()=>{
 const copy=JSON.parse(fs.readFileSync('data/quizzes/maculardegeneration/pt.json','utf8'));
 const questions=copy.stages['stage-1'].questions;
 assert.match(copy.about.body,/degenerescência macular da idade \(DMI\)/iu);
 assert.doesNotMatch(JSON.stringify(copy),/\b(?:AMD|DMRI)\b/u);
 assert.match(questions['macular-q6'].answers.a2,/visão central/u);
 assert.match(questions['macular-q7'].answers.a3,/linhas direitas.*onduladas/u);
 assert.match(questions['macular-q8'].answers.a4,/fundo do olho.*pupilas dilatadas/u);
 assert.match(questions['macular-q9'].answers.a1,/oftalmologista.*rapidamente possível/u);
 assert.match(copy.about.disclaimer,/não permite confirmar nem excluir/iu);
});
