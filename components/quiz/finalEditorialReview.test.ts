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

test('reviewed free-time and future-self questions cannot regress to occupation or past-self translations',()=>{
 const freeTime:{[locale:string]:RegExp}={ja:/職業/,es:/dedicas/,id:/pekerjaanmu/,th:/คุณทำงานอะไร/,vi:/làm nghề/};
 for(const[locale,wrong]of Object.entries(freeTime))assert.doesNotMatch(question('years-left',locale,'yl-s1q2').question,wrong,locale);
 assert.match(question('years-left','ja','yl-s5q4').question,/未来/);
 assert.match(question('years-left','fr','yl-s5q4').question,/quand vous serez plus âgé/);
 assert.match(question('years-left','ja','yl-s4q5').question,/趣味の時間/);
 assert.doesNotMatch(question('years-left','en','yl-s4q5').question,/restart|forgotten/i);
 assert.doesNotMatch(read('years-left','sk').career.stages['stage-1'].preAdCopy,/Now|keeps you going/);
 assert.doesNotMatch(question('years-left','uk','yl-s1q1').question,/Your alarm rings/);
 assert.doesNotMatch(question('years-left','uk','yl-s2q1').question,/Breakfast is available/);
});

test('Memory Japanese recall distinguishes time of day from duration and uses the board noun',()=>{
 assert.match(question('memory','ja','memory-r3q7').question,/時刻/);
 assert.doesNotMatch(question('memory','ja','memory-r3q7').question,/何時間/);
 assert.match(question('memory','ja','memory-r4q5').question,/方位磁針/);
 for(const id of ['memory-r1q7','memory-r2q3'])assert.equal(question('memory','ja',id).answers.a1,'1番目');
});
