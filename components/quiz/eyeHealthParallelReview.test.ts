import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const slugs = ['cataract', 'maculardegeneration'] as const;
const locales = fs.readdirSync('data/i18n').filter((file) => file.endsWith('.json')).map((file) => file.slice(0, -5));

function read(slug: string, locale: string) {
  return JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
}

test('both eye-health quizzes retain ten scored questions across all locales', () => {
  for (const slug of slugs) {
    const manifest = read(slug, 'quiz');
    const ids: string[] = manifest.structure.stages.flatMap((stage: { questionIds: string[] }) => stage.questionIds);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales) {
      const copy = read(slug, locale);
      const questions = copy.stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions), ids, `${slug}/${locale}: question sequence`);
      for (const id of ids) {
        const answers = questions[id].answers;
        const answerIds = manifest.structure.questions[id].answerIds;
        assert.deepEqual(Object.keys(answers), answerIds, `${slug}/${locale}/${id}: answer IDs`);
        assert.equal(new Set(Object.values(answers)).size, 4, `${slug}/${locale}/${id}: unique answers`);
        assert.ok(answers[manifest.structure.questions[id].correctAnswerId], `${slug}/${locale}/${id}: keyed answer`);
      }
      assert.ok(copy.about.disclaimer.trim(), `${slug}/${locale}: safety disclaimer`);
      assert.ok(copy.results.score.disclaimer.trim(), `${slug}/${locale}: result disclaimer`);
    }
  }
});

test('eye-health visual stimuli and code answers stay identical to the scored master', () => {
  for (const slug of slugs) {
    const source = read(slug, 'en').stages['stage-1'].questions;
    const prefix = slug === 'cataract' ? 'cataract' : 'macular';
    for (const locale of locales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      for (const n of [1, 3, 5]) {
        const id = `${prefix}-q${n}`;
        assert.deepEqual(questions[id].visual.items, source[id].visual.items, `${slug}/${locale}/${id}: visual items`);
      }
      const codeId = `${prefix}-q2`;
      assert.equal(questions[codeId].visual.items[1], source[codeId].visual.items[1], `${slug}/${locale}: reference code`);
      assert.deepEqual(questions[codeId].answers, source[codeId].answers, `${slug}/${locale}: literal code choices`);
      const memoryId = `${prefix}-q4`;
      assert.deepEqual(questions[memoryId].study.items, source[memoryId].study.items, `${slug}/${locale}: memory items`);
    }
  }
});

test('reviewed macular copy names a dilated-pupil exam and prompt eye care', () => {
  const reviewed: Record<string, [RegExp, RegExp]> = {
    ar: [/توسيع حدقة/, /طبيب عيون/],
    bg: [/разширяване на зениците/, /очен лекар/],
    cs: [/rozšířením zornic/, /očního lékaře/],
    da: [/udvidede pupiller/, /øjenlæge/],
    el: [/διαστολή της κόρης/, /οφθαλμίατρο/],
    fil: [/pagpapalawak ng balintataw/, /doktor sa mata/],
    he: [/הרחבת אישונים/, /רופא עיניים/],
    hr: [/širenje zjenica/, /oftalmologu/],
    hu: [/pupillatágítással/, /szemész szakorvoshoz/],
    id: [/pelebaran pupil/, /dokter mata/],
    ms: [/anak mata dikembangkan/, /doktor mata/],
    nb: [/utvidede pupiller/, /øyelege/],
    pl: [/rozszerzeniem źrenic/, /okulistą/],
    ro: [/dilatarea pupilelor/, /medic oftalmolog/],
    sk: [/rozšírením zreníc/, /očného lekára/],
    sr: [/ширење зеница/, /офталмологу/],
    sv: [/vidgade pupiller/, /ögonläkare/],
    th: [/ขยายรูม่านตา/, /จักษุแพทย์/],
    tr: [/Göz bebekleri genişletilerek/, /göz doktoruna/],
    uk: [/розширенням зіниць/, /офтальмолога/],
    vi: [/giãn đồng tử/, /chuyên khoa mắt/],
  };
  for (const [locale, [exam, action]] of Object.entries(reviewed)) {
    const questions = read('maculardegeneration', locale).stages['stage-1'].questions;
    assert.match(questions['macular-q8'].answers.a4, exam, locale);
    assert.match(questions['macular-q9'].answers.a1, action, locale);
  }
});

test('macular result detail stays about the quiz, not a disease inference', () => {
  for (const locale of locales) {
    const copy = read('maculardegeneration', locale);
    assert.ok(copy.results.score.insights.snapshot.trim(), locale);
    assert.ok(copy.stages['stage-1'].questions['macular-q10'].answers.a2.trim(), locale);
  }
  assert.equal(read('maculardegeneration', 'en').results.score.insights.snapshot, 'About your quiz result');
  assert.match(read('maculardegeneration', 'id').stages['stage-1'].questions['macular-q10'].question, /Apa yang dapat diketahui dari skor/);
});
