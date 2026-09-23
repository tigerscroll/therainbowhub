import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read=(slug:string,locale:string)=>JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`,'utf8'));
const locales=read('vision','quiz').activeLocales as string[];
const question=(slug:string,locale:string,id:string):any=>Object.values(read(slug,locale).stages).map((s:any)=>s.questions[id]).find(Boolean);

test('all three audited quiz subtitles retain two explicit lines without question counts',()=>{
 for(const slug of ['vision','memory','years-left'])for(const locale of locales){
  const intro=read(slug,locale).landing.intro;
  assert.equal(intro.split('\n').length,2,`${slug}/${locale}`);
  assert.doesNotMatch(intro,/\b(?:10|30)\b/,`${slug}/${locale}`);
 }
});

test('Vision labels preserve the literal F and swatch identities in every locale',()=>{
 for(const locale of locales){
  assert.match(question('vision',locale,'vision-r9q2').answers.a1,/F/,locale);
  assert.deepEqual(Object.values(question('vision',locale,'vision-r4q5').answers).map((v:any)=>v.match(/\b[A-D]\b/g)),[['A'],['B'],['D'],['C']],locale);
 }
});

test('retained Years Left questions cannot regress to occupation or untranslated prompts',()=>{
 const freeTime:{[locale:string]:RegExp}={ja:/職業/,es:/dedicas/,id:/pekerjaanmu/,th:/คุณทำงานอะไร/,vi:/làm nghề/};
 for(const[locale,wrong]of Object.entries(freeTime))assert.doesNotMatch(question('years-left',locale,'yl-s1q2').question,wrong,locale);
 assert.doesNotMatch(read('years-left','sk').career.stages['stage-1'].preAdCopy,/Now|keeps you going/);
 assert.doesNotMatch(question('years-left','uk','yl-s1q1').question,/Your alarm rings/);
 assert.doesNotMatch(question('years-left','uk','yl-s2q1').question,/Breakfast is available/);
});

test('Memory Japanese recall distinguishes time of day from duration and uses the board noun',()=>{
 assert.match(question('memory','ja','memory-r3q7').question,/時刻/);
 assert.doesNotMatch(question('memory','ja','memory-r3q7').question,/何時間/);
 assert.equal(question('memory','ja','memory-r2q3').answers.a1,'1番目');
});

test('Memory requested CTA polish remains in the landing action',()=>{
 for(const[locale,cta]of Object.entries({da:'Start testen',hr:'Započni',nb:'Start testen'})){
  const copy=read('memory',locale);
  assert.equal(copy.landing.cta,cta);
  assert.ok(copy.about.howToPlay.steps[0].trim(),locale);
 }
});

test('Vision audited headings and calls to action retain the corrected translations',()=>{
 const headings={bg:'ЛАБОРАТОРИЯ ЗА ОПТИЧЕН ФОКУС',fi:'OPTISEN TARKKUUDEN LABORATORIO',fil:'PAGSUBOK SA TALAS NG PANINGIN',hu:'OPTIKAI FÓKUSZLABOR',ro:'LABORATOR DE ATENȚIE VIZUALĂ'};
 for(const[locale,expected]of Object.entries(headings))assert.equal(read('vision',locale).eyebrow,expected,locale);
 for(const[locale,expected]of Object.entries({fi:'Aloita testi',hu:'Teszt indítása',ro:'Începe testul'}))assert.equal(read('vision',locale).landing.cta,expected,locale);
 for(const[locale,wrong]of Object.entries({fi:/kaipaavat/,ms:/rindukan/,ro:/ochii tăi prinde|le dor/,ja:/光のトラップ/,th:/กับดักแสง/,vi:/kiểu dịch chuyển/}))assert.doesNotMatch(read('vision',locale).summary,wrong,locale);
});

test('Years Left age units and start instructions cannot regress to mistranslations',()=>{
 for(const locale of locales){
  const copy=read('years-left',locale);
  assert.ok(copy.landing.cta.trim(),locale);
  assert.ok(copy.about.howToPlay.steps[0].trim(),locale);
 }
 const units={he:'שנים',bg:'ГОДИНИ',fi:'VUOTTA',id:'TAHUN',sv:'ÅR',da:'ÅR',nb:'ÅR',ms:'TAHUN',th:'ปี',vi:'TUỔI',fil:'TAONG GULANG'};
 for(const[locale,expected]of Object.entries(units))assert.equal(read('years-left',locale).results.estimate.ageSuffix,expected,locale);
});

test('Years Left targeted answers retain food, stairs and cancelled-plan meanings',()=>{
 assert.equal(question('years-left','fil','yl-s2q2').answers.a4,'Hagdan — baka maunahan ko pa ang elevator');
 assert.equal(question('years-left','th','yl-s2q2').answers.a4,'เลือกบันได แถมลองไปให้ถึงก่อนลิฟต์');
});
