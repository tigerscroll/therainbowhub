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
  const nursingAwake=locale==='pt'?'alerta e responsiva':awake.toLocaleLowerCase();
  assert.ok(nursing.visual.items[0].toLocaleLowerCase().includes(nursingAwake),`nursing/${locale}`);
  assert.ok(nursing.visual.ariaLabel.toLocaleLowerCase().includes(nursingAwake),`nursing/${locale}: accessible copy`);
  const paramedicAwake=({bg:'Буден и реагира',pt:'ALERTA E RESPONSIVA',sr:'Будан и реагује'} as Record<string,string>)[locale]??awake;
  assert.ok(questions('paramedic',locale)['paramedic-r10q2'].visual.items[0].includes(paramedicAwake),`paramedic/${locale}`);
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

test('one-stage entrance subtitles stay two complete lines while allowing topic-specific copy',()=>{
 const grammarIntros:Record<string,string>={
  fil:'Basahin nang mabuti ang bawat tanong.\nPiliin ang pinakatamang sagot.',
  id:'Baca setiap soal dengan teliti.\nPilih jawaban yang paling tepat.',
  ja:'日本語の細部に注目。\n自然な文を見抜けますか？'
 };
 for(const locale of locales)for(const slug of ['cambridge','chef','firefighter','grammar','harvard','iq','midwifery','nursing','paramedic','oxford']){
  const intro=read(slug,locale).landing.intro;
  if(slug==='grammar'&&grammarIntros[locale])assert.equal(intro,grammarIntros[locale]);
  const lines=intro.split('\n');
  assert.equal(lines.length,2,`${slug}/${locale}`);
  assert.ok(lines.every(line=>line.trim().length>0),`${slug}/${locale}`);
 }
});
