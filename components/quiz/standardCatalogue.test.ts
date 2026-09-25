import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import test from 'node:test';
import {getQuizSlugs, getSiteLocales} from '../../scripts/quiz-catalogue.mjs';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {ui} from '../../scripts/chapter-locales/config.mjs';
import {correctClinicalTerm} from '../../scripts/chapter-locales/clinical-language.mjs';
import {correctTerm} from '../../scripts/chapter-locales/corrections.mjs';
import {answerNumbers, normalizedAnswer} from '../../scripts/localization-values.mjs';

const locales = getSiteLocales();
const slugs = getQuizSlugs();
const read = (slug: string, name: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${name}.json`, 'utf8'));

test('the site exposes exactly the eight agreed locales, with no alternate edition directories', () => {
  assert.deepEqual(locales, ['ar','de','en','es','fr','it','nl','pt']);
  assert.deepEqual(fs.readdirSync('data/info-pages').filter(file => file.endsWith('.json')).map(file => file.slice(0,-5)).sort(), locales);
  const config = fs.readFileSync('lib/localeConfig.ts', 'utf8');
  assert.deepEqual([...config.matchAll(/code: "([a-z]+)"/g)].map(match => match[1]).sort(), locales);
  assert.ok(slugs.length > 0);
  for (const slug of slugs) assert.equal(fs.existsSync(`data/quizzes/${slug}/english-extended`), false, slug);
});

for (const slug of slugs) test(`${slug}: its normal folder supplies ten seven-question rounds in every supported language`, () => {
  const manifest = read(slug,'quiz');
  assert.equal(manifest.template, 'ten-stage-seven-question-v1');
  assert.equal(manifest.engine.hardRefreshCheckpoints ?? false, false);
  assert.equal(manifest.listing.showSocialProof, false);
  assert.equal(manifest.listing.compactLanding, true);
  const ids = manifest.structure.stages.flatMap((stage: any) => stage.questionIds);
  assert.equal(ids.length, 70);
  assert.equal(new Set(ids).size, 70);
  assert.deepEqual(manifest.structure.stages.map((stage: any) => stage.questionIds.length), Array(10).fill(7));
  assert.deepEqual(Object.keys(manifest.structure.questions).sort(), [...ids].sort());
  assert.deepEqual(fs.readdirSync(`data/quizzes/${slug}`).filter(file => /^[a-z]{2,3}\.json$/.test(file)).map(file=>file.slice(0,-5)).sort(), locales);
  if (manifest.activeLocales) assert.deepEqual([...manifest.activeLocales].sort(), locales);
  for (const locale of locales) {
    const copy = read(slug, locale), expanded = expandQuizLocale(manifest, copy, locale);
    assert.equal(copy.results.share, undefined);
    assert.equal(copy.landing.cta, locale === 'en' ? 'Start' : ui[locale].start);
    assert.deepEqual(expanded.stages.map((stage: any) => stage.questions.length), Array(10).fill(7));
    assert.equal(expanded.career.stages.length, 10);
    for (const [index, stage] of manifest.structure.stages.entries()) {
      const checkpoint = copy.career.stages[stage.id];
      assert.equal(checkpoint.preAdButton, locale === 'en' ? index === 9 ? 'See My Result' : 'Continue' : index === 9 ? ui[locale].result : ui[locale].next);
      if (index < 9) {
        assert.equal(checkpoint.preAdCopy.match(/\{profile\}/g)?.length, 1);
        assert.ok(checkpoint.next.tagline.trim());
        assert.equal(checkpoint.preAdChecks, undefined);
      } else {
        assert.equal(checkpoint.next, undefined);
        assert.equal(checkpoint.preAdChecks.length, 3);
      }
      for (const id of stage.questionIds) {
        const logic=manifest.structure.questions[id], q=copy.stages[stage.id].questions[id];
        assert.ok(q.question.trim());
        assert.deepEqual(Object.keys(q.answers),logic.answerIds);
        assert.equal(new Set(Object.values(q.answers).map((text:any)=>text.normalize('NFKC').trim().toLowerCase())).size,4,`${locale}/${id}`);
        if(logic.correctAnswerId)assert.ok(q.answers[logic.correctAnswerId]);
      }
    }
  }
});

test('creating a new quiz changes only its folder and discovers its ten-round manifest automatically', () => {
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'quiz-scaffold-'));
  const countSource=fs.readFileSync('scripts/social-proof.mjs','utf8');
  try {
    execFileSync(process.execPath,['scripts/create-quiz.mjs','fixture-challenge','--root',temp,'--title','Fixture challenge'],{stdio:'pipe'});
    assert.deepEqual(getQuizSlugs(temp),['fixture-challenge']);
    const manifest=JSON.parse(fs.readFileSync(`${temp}/fixture-challenge/quiz.json`,'utf8'));
    const content=JSON.parse(fs.readFileSync(`${temp}/fixture-challenge/en.json`,'utf8'));
    const quiz=expandQuizLocale(manifest,content,'en');
    assert.equal(manifest.template,'ten-stage-seven-question-v1');
    assert.equal(manifest.listing.socialProofCount, 0);
    assert.equal(manifest.listing.showSocialProof, false);
    assert.deepEqual(quiz.stages.map((stage:any)=>stage.questions.length),Array(10).fill(7));
    assert.equal(quiz.career.stages.length,10);
    assert.equal(fs.readFileSync('scripts/social-proof.mjs','utf8'),countSource);
  } finally {fs.rmSync(temp,{recursive:true,force:true});}
});

test('reviewed aviation translations distinguish three controls and do not confuse pitch with sound',()=>{
  for(const slug of ['airforce','pilot'])for(const locale of locales){
    const copy=read(slug,locale),manifest=read(slug,'quiz');
    const q=copy.stages['stage-2'].questions[`${slug}-s2q1`];
    assert.equal(new Set(Object.values(q.answers)).size,4);
    if(locale==='pt')assert.equal(q.answers[manifest.structure.questions[`${slug}-s2q1`].correctAnswerId],'Profundor (leme de profundidade)');
    if(locale==='ar'){assert.doesNotMatch(q.question,/الصوت|الملعب/);assert.equal(q.answers[manifest.structure.questions[`${slug}-s2q1`].correctAnswerId],'دفة الارتفاع');}
  }
});

test('authored translation columns stay in the right language after alphabetical locale discovery', () => {
  assert.equal(correctTerm('chef', 'fr', 'Whisk'), 'Fouet');
  assert.equal(correctTerm('chef', 'it', 'Whisk'), 'Frusta');
  assert.equal(correctTerm('chef', 'pt', 'Whisk'), 'Batedor de arame');
  assert.equal(correctTerm('chef', 'ar', 'Whisk'), 'مضرب يدوي');
  assert.match(correctClinicalTerm('doctor', 'fr', 'Previously alert, now newly confused')!, /^La personne/);
  assert.match(correctClinicalTerm('doctor', 'ar', 'Previously alert, now newly confused')!, /^كان/);
});

test('localization checks respect native numbers and retain mathematical differences', () => {
  assert.deepEqual(answerNumbers('1 100 mL', 'fr'), answerNumbers('1100 mL'));
  assert.deepEqual(answerNumbers('4 mm', 'de'), answerNumbers('4.0 mm'));
  assert.deepEqual(answerNumbers('om 10.20 uur', 'nl'), answerNumbers('at 10:20'));
  assert.deepEqual(answerNumbers('ساعتان و 30 دقيقة', 'ar'), answerNumbers('2 hours 30 minutes'));
  assert.deepEqual(answerNumbers('الثالث والرابع', 'ar'), answerNumbers('3rd and 4th'));
  assert.deepEqual(answerNumbers('خانتين إلى اليسار', 'ar'), answerNumbers('2 squares left'));
  assert.deepEqual(answerNumbers('خانة إلى اليمين وخانة إلى الأعلى', 'ar'), answerNumbers('1 right and 1 up'));
  assert.deepEqual(answerNumbers('خانة 4', 'ar'), answerNumbers('cell 4'));
  assert.notDeepEqual(answerNumbers('خانة إلى اليسار', 'ar'), answerNumbers('2 squares left'));
  assert.deepEqual(answerNumbers('نقطة واحدة', 'ar'), answerNumbers('1 dot'));
  assert.deepEqual(answerNumbers('نقطتان', 'ar'), answerNumbers('2 dots'));
  assert.notDeepEqual(answerNumbers('نقطتان', 'ar'), answerNumbers('3 dots'));
  assert.notDeepEqual(answerNumbers('12 L', 'fr'), answerNumbers('120 L'));
  assert.notEqual(normalizedAnswer('(3, 1)'), normalizedAnswer('(-3, 1)'));
});

test('localized domain meanings retain witness accounts, named people and dental distinctions', () => {
  for (const locale of locales) {
    const barrister = read('barrister', locale), m = read('barrister','quiz');
    const q = barrister.stages['stage-7'].questions['barrister-s7q7'];
    assert.equal(q.answers[m.structure.questions['barrister-s7q7'].correctAnswerId],locale === 'ar' ? 'كام' : 'Cam');
  }
  const ar = read('dentist','ar');
  assert.match(ar.stages['stage-4'].questions['dentist-s4q3'].question,/جير الأسنان/);
  assert.match(ar.stages['stage-4'].questions['dentist-s4q5'].question,/دواعم السن/);
  const pt = read('motorbike','pt');
  assert.match(pt.stages['stage-1'].questions['motorbike-s1q2'].question,/embraiagem.*embreagem/);
  assert.doesNotMatch(JSON.stringify(pt.stages),/cavaleiro|resposta sonora|pedalar/);
});
