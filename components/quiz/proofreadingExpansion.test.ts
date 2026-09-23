import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import test from 'node:test';
import {universityCopy} from '../../scripts/round-expansion/proofreading-copy.mjs';
import {rafContext} from '../../scripts/round-expansion/proofreading-context.mjs';
import {clinicalCopy} from '../../scripts/round-expansion/proofreading-clinical.mjs';
import {subjectTerms} from '../../scripts/round-expansion/proofreading-terms.mjs';
import {clearRoutes} from '../../scripts/round-expansion/proofreading-visual-labels.mjs';
import {reasoningIntro} from '../../scripts/round-expansion/proofreading-subtitles.mjs';

const locales=readdirSync('data/i18n').filter(file=>file.endsWith('.json')&&file!=='en.json').map(file=>file.slice(0,-5)).sort();
const read=(slug:string,locale:string)=>JSON.parse(readFileSync(`data/quizzes/${slug}/${locale}.json`,'utf8'));
const questions=(slug:string,locale:string):Record<string,any>=>read(slug,locale).stages['stage-1'].questions;

test('reviewed translation reference tables still cover all 29 non-English locales',()=>{
 for(const table of [universityCopy,rafContext,clinicalCopy,subjectTerms,clearRoutes,reasoningIntro])assert.deepEqual(Object.keys(table).sort(),locales);
});

test('retained Harvard and Oxford word questions keep their reviewed meanings',()=>{
 for(const locale of locales){
  const h=questions('harvard',locale),o=questions('oxford',locale);
  assert.equal(h['harvard-s2q8'].question,universityCopy[locale as keyof typeof universityCopy][1],locale);
  assert.deepEqual(Object.values(h['harvard-s2q8'].answers),universityCopy[locale as keyof typeof universityCopy][2],locale);
  assert.equal(o['oxford-s1q1'].question,universityCopy[locale as keyof typeof universityCopy][3],locale);
 }
 assert.equal(read('harvard','quiz').structure.questions['harvard-s2q8'].correctAnswerId,'a1');
 assert.equal(read('oxford','quiz').structure.questions['oxford-s1q1'].correctAnswerId,'a2');
});

test('retained clinical alertness evidence still means awake and responsive',()=>{
 for(const locale of locales){
  const awake=clinicalCopy[locale as keyof typeof clinicalCopy][2];
  const nursing=questions('nursing',locale)['nurse-r10q6'];
  assert.ok(nursing.visual.items[0].includes(awake),`nursing/${locale}`);
  assert.ok(nursing.visual.ariaLabel.includes(awake),`nursing/${locale}: accessible copy`);
  assert.ok(questions('paramedic',locale)['paramedic-r10q2'].visual.items[0].includes(awake),`paramedic/${locale}`);
 }
});

test('retained RAF and aviation terms preserve their exact subject meanings',()=>{
 for(const locale of locales){
  const raf=questions('raf',locale)['raf-q6'];
  assert.equal(raf.question,rafContext[locale as keyof typeof rafContext][0]);
  assert.deepEqual(Object.values(raf.answers),['Flying Officer','Squadron Leader','Wing Commander','Group Captain']);
  assert.equal(questions('airforce',locale)['airforce-q3'].answers.a1,subjectTerms[locale as keyof typeof subjectTerms][0]);
 }
 assert.equal(questions('pilot','vi')['pilot-q3'].answers.a3,'Mây vũ tích');
 assert.equal(read('pilot','quiz').structure.questions['pilot-q3'].correctAnswerId,'a3');
});

test('retained firefighter evidence explicitly identifies unaccounted-for people',()=>{
 for(const locale of locales){
  const [clear,,missing]=clearRoutes[locale as keyof typeof clearRoutes];
  const evidence=questions('firefighter',locale)['firefighter-s5q8'].visual.items;
  assert.ok(evidence[1].endsWith(`::${missing}`),locale);
  assert.ok(evidence[2].endsWith(`::${clear}`),locale);
 }
});

test('the revised one-stage entrance subtitles stay two lines',()=>{
 for(const locale of locales)for(const slug of ['cambridge','chef','firefighter','grammar','harvard','iq','midwifery','nursing','paramedic','oxford']){
  const intro=read(slug,locale).landing.intro;
  assert.equal(intro,reasoningIntro[locale as keyof typeof reasoningIntro]);
  assert.equal(intro.split('\n').length,2);
 }
});
