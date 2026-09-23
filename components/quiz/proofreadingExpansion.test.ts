import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import test from 'node:test';
import {universityCopy} from '../../scripts/round-expansion/proofreading-copy.mjs';
import {trialCopy,rafContext} from '../../scripts/round-expansion/proofreading-context.mjs';
import {queueQuestions} from '../../scripts/round-expansion/proofreading-puzzles.mjs';
import {clinicalCopy} from '../../scripts/round-expansion/proofreading-clinical.mjs';
import {contextualHeadings} from '../../scripts/round-expansion/proofreading-headings.mjs';
import {subjectTerms,elevatorQuestions} from '../../scripts/round-expansion/proofreading-terms.mjs';
import {evidenceLabels,evidenceKeys,clearRoutes} from '../../scripts/round-expansion/proofreading-visual-labels.mjs';
import {reasoningIntro} from '../../scripts/round-expansion/proofreading-subtitles.mjs';

const locales=readdirSync('data/i18n').filter(f=>f.endsWith('.json')&&f!=='en.json').map(f=>f.slice(0,-5)).sort();
const read=(s:string,l:string)=>JSON.parse(readFileSync(`data/quizzes/${s}/${l}.json`,'utf8'));
const questions=(s:string,l:string):Record<string,any>=>Object.assign({},...Object.values(read(s,l).stages).map((s:any)=>s.questions));

test('proofreading corrections cover all 29 translated locales',()=>{
 for(const copy of [universityCopy,trialCopy,rafContext,queueQuestions,clinicalCopy,contextualHeadings,subjectTerms,elevatorQuestions,evidenceLabels,clearRoutes,reasoningIntro])assert.deepEqual(Object.keys(copy).sort(),locales);
 for(const labels of Object.values(evidenceLabels))assert.equal(labels.length,evidenceKeys.length);
});

test('funded-project logic has a complete premise and pilot means a programme',()=>{
 const en=questions('harvard','en');
 assert.equal(en['harvard-s2q1'].question,'Which conclusion follows? All funded projects were reviewed. Project K was funded.');
 assert.match(en['harvard-s4q4'].question,/trial programme/);
 for(const l of locales){
  const q=questions('harvard',l),copy=universityCopy[l as keyof typeof universityCopy],trial=trialCopy[l as keyof typeof trialCopy];
  assert.equal(q['harvard-s2q1'].question,copy[0],l);
  assert.equal(q['harvard-s2q8'].question,copy[1],l);
  assert.deepEqual(Object.values(q['harvard-s2q8'].answers),copy[2],l);
  assert.equal(q['harvard-s4q4'].question,trial[0],l);
  assert.equal(q['harvard-s4q4'].answers.a1,trial[1],l);
  assert.equal(q['harvard-s4q4'].answers.a2,trial[2],l);
 }
 assert.equal(read('harvard','quiz').structure.questions['harvard-s2q1'].correctAnswerId,'a1');
 assert.equal(read('harvard','quiz').structure.questions['harvard-s2q8'].correctAnswerId,'a1');
 assert.equal(read('harvard','quiz').structure.questions['harvard-s4q4'].correctAnswerId,'a3');
});

test('localized word questions retain their intended meanings and answer positions',()=>{
 for(const l of locales){
  const q=questions('oxford',l),c=universityCopy[l as keyof typeof universityCopy];
  assert.equal(q['oxford-s1q1'].question,c[3],l);
  assert.equal(q['oxford-s1q5'].question,c[4],l);
  assert.deepEqual(Object.values(q['oxford-s1q5'].answers),c[5],l);
  assert.equal(q['oxford-s4q5'].question,c[6],l);
 }
 const m=read('oxford','quiz');
 assert.equal(m.structure.questions['oxford-s1q1'].correctAnswerId,'a2');
 assert.equal(m.structure.questions['oxford-s1q5'].correctAnswerId,'a3');
 assert.equal(m.structure.questions['oxford-s4q5'].correctAnswerId,'a4');
});

test('letter patterns and named ordering puzzles cannot be translated into different data',()=>{
 const e=questions('cambridge','en')['cambridge-s2q1'];
 for(const l of locales){
  const q=questions('cambridge',l)['cambridge-s2q1'];
  assert.deepEqual(q.visual,e.visual,l);
  assert.deepEqual(q.answers,e.answers,l);
  const iq=questions('iq',l)['iq-s3q1'];
  assert.equal(iq.question,queueQuestions[l as keyof typeof queueQuestions]);
  assert.deepEqual(iq.answers,{a1:'Leo — Mara — Nia',a2:'Mara — Nia — Leo',a3:'Mara — Leo — Nia',a4:'Nia — Leo — Mara'});
 }
});

test('clinical alertness remains awake/responsive, never a warning notification',()=>{
 for(const l of locales){
  const awake=clinicalCopy[l as keyof typeof clinicalCopy][2];
  for(const [slug,ids]of Object.entries({midwifery:['mid-r6q3','mid-r10q6'],nursing:['nurse-r10q6','nurse-r10q3']})){
   const qs=questions(slug,l);
   for(const id of ids){
    assert.ok(qs[id].visual.items[0].includes(awake),`${slug}/${l}/${id}`);
    assert.ok(qs[id].visual.ariaLabel.includes(awake),`${slug}/${l}/${id}: accessible copy`);
   }
  }
  assert.ok(questions('paramedic',l)['paramedic-r10q2'].visual.items[0].includes(awake));
  assert.ok(questions('paramedic',l)['paramedic-r5q3'].answers.a1.includes(awake));
 }
});

test('RAF rank comparisons consistently use official names in prompts and choices',()=>{
 for(const l of locales){
  const q=questions('raf',l),c=rafContext[l as keyof typeof rafContext];
  assert.equal(q['raf-q6'].question,c[0]);
  assert.deepEqual(Object.values(q['raf-q6'].answers),['Flying Officer','Squadron Leader','Wing Commander','Group Captain']);
  assert.equal(q['raf-round3-new2'].question,c[1]);
  assert.deepEqual(Object.values(q['raf-round3-new2'].answers),['Wing Commander','Squadron Leader',c[2],c[3]]);
 }
});

test('anatomy and case-analysis round headings agree with checkpoint labels',()=>{
 for(const l of locales){
  const a=read('anatomy',l),h=read('harvard',l),c=contextualHeadings[l as keyof typeof contextualHeadings];
  for(const[n,i]of [[1,0],[4,1],[5,2]]){
   assert.equal(a.stages[`stage-${n}`].title,c[i]);
   assert.equal(a.career.stages[`stage-${n}`].difficulty,c[i]);
  }
  assert.equal(h.stages['stage-4'].title,c[3]);
  for(const slug of ['cambridge','chef','firefighter','grammar','harvard','iq','midwifery','nursing','paramedic','oxford']){
   assert.equal(read(slug,l).landing.intro,reasoningIntro[l as keyof typeof reasoningIntro]);
   assert.equal(read(slug,l).landing.intro.split('\n').length,2);
  }
 }
 assert.equal(read('nursing','ja').stages['stage-2'].title,'身体と観察');
});

test('aviation, dentistry and religious vocabulary keeps its subject-specific meaning',()=>{
 for(const l of locales){
  const [elevator,crown,calling,guide,ordained]=subjectTerms[l as keyof typeof subjectTerms];
  assert.equal(questions('airforce',l)['airforce-round2-new2'].answers.a1,elevator);
  assert.equal(questions('airforce',l)['airforce-q3'].answers.a1,elevator);
  assert.equal(questions('pilot',l)['pilot-round3-new3'].question,elevatorQuestions[l as keyof typeof elevatorQuestions]);
  assert.equal(questions('dentist',l)['dentist-round1-new1'].answers.a1,crown);
  assert.equal(questions('nun',l)['nun-round1-new1'].answers.a1,calling);
  assert.equal(questions('nun',l)['nun-round5-new3'].answers.a1,guide);
  assert.equal(questions('catholic',l)['catholic-round4-new4'].answers.a1,ordained);
 }
 assert.equal(questions('pilot','vi')['pilot-q3'].answers.a3,'Mây vũ tích');
 assert.equal(read('pilot','quiz').structure.questions['pilot-q3'].correctAnswerId,'a3');
});

test('an unobstructed exit and unaccounted-for people stay explicit in evidence cards',()=>{
 for(const l of locales){
  const [clear,routes,missing]=clearRoutes[l as keyof typeof clearRoutes];
  assert.ok(questions('paramedic',l)['paramedic-r4q3'].visual.items[2].endsWith(`::${clear}`));
  const q=questions('firefighter',l);
  assert.ok(q['firefighter-s5q3'].visual.items[1].endsWith(`::${routes}`));
  assert.ok(q['firefighter-s5q8'].visual.items[1].endsWith(`::${missing}`));
  assert.ok(q['firefighter-s5q8'].visual.items[2].endsWith(`::${clear}`));
 }
});
