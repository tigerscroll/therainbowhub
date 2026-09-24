import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) =>
  JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

const locales = fs.readdirSync('data/quizzes/depression')
  .filter((file) => file.endsWith('.json') && file !== 'quiz.json')
  .map((file) => file.slice(0, -5))
  .sort();

test('Depression and OCD retain every locale, all ten questions and stable profile scoring', () => {
  assert.equal(locales.length, 30);
  for (const slug of ['depression', 'ocd']) {
    const files = fs.readdirSync(`data/quizzes/${slug}`)
      .filter((file) => file.endsWith('.json') && file !== 'quiz.json')
      .map((file) => file.slice(0, -5))
      .sort();
    assert.deepEqual(files, locales, slug);
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales) {
      const data = read(slug, locale);
      const questions = data.stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}: question IDs`);
      assert.deepEqual(Object.keys(data.results.profiles).sort(), ['profile-1', 'profile-2', 'profile-3', 'profile-4'], `${slug}/${locale}: result profiles`);
      assert.ok(data.about.disclaimer.trim(), `${slug}/${locale}: missing disclaimer`);
      for (const id of ids) {
        const item = questions[id];
        assert.ok(item.question.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}: answer IDs`);
        const answers = Object.values(item.answers).map((value) => String(value).trim().toLocaleLowerCase(locale));
        assert.ok(answers.every(Boolean), `${slug}/${locale}/${id}: blank answer`);
        assert.equal(new Set(answers).size, 4, `${slug}/${locale}/${id}: duplicate answer`);
        assert.deepEqual(Object.keys(manifest.structure.questions[id].choiceMeanings).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${id}: scoring`);
      }
    }
  }
});

test('Reviewed safety language and symptom concepts do not regress', () => {
  const depression = read('depression', 'en');
  const ocd = read('ocd', 'en');
  assert.match(depression.stages['stage-1'].questions['depression-q1'].question, /past two weeks/i);
  assert.match(depression.about.disclaimer, /not a diagnostic test/i);
  assert.match(depression.about.disclaimer, /harm yourself.*emergency services/i);
  assert.match(ocd.about.body, /difficult to control, time-consuming, distressing or disruptive/i);
  assert.match(ocd.about.disclaimer, /cannot confirm or rule out OCD/i);
  assert.match(read('depression', 'da').results.profiles['profile-3'].tier, /INTERESSE ELLER ENERGI/);
  assert.doesNotMatch(read('depression', 'da').results.profiles['profile-3'].tier, /RENTER/);
  assert.match(read('ocd', 'da').stages['stage-1'].questions['ocd-q6'].headerLabel, /BEHOV FOR BEKRÆFTELSE/);
  assert.match(read('depression', 'ja').about.disclaimer, /自分を傷つける.*緊急通報先/);
  assert.match(read('ocd', 'ja').results.profiles['profile-3'].copy, /確認.*洗浄.*安心を求める/);
  assert.doesNotMatch(read('depression', 'pt').stages['stage-1'].questions['depression-q1'].question, /si se/);
  const interestTerms: Record<string, RegExp> = {
    da: /INTERESSE/, de: /INTERESSE/, he: /עניין/, id: /MINAT/, nb: /INTERESSE/,
    nl: /INTERESSE/, sv: /INTRESSE/, th: /ความสนใจ/, tr: /İLGİ/, vi: /HỨNG THÚ/,
  };
  for (const [locale, term] of Object.entries(interestTerms)) {
    assert.match(read('depression', locale).results.profiles['profile-3'].tier, term, `${locale}: interest must not mean financial interest`);
  }
  assert.match(read('ocd', 'tr').results.profiles['profile-2'].tier, /DÜŞÜNCELER/);
  assert.doesNotMatch(read('ocd', 'tr').results.profiles['profile-2'].tier, /GİRİŞİMCİ/);
});
