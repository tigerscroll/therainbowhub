import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: 'en' | 'uk'): any =>
  JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Ukrainian quizzes keep ten English-aligned questions and distinct choices', () => {
  const slugs = fs.readdirSync('data/quizzes').filter((slug) => fs.existsSync(`data/quizzes/${slug}/uk.json`));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const english = read(slug, 'en').stages['stage-1'].questions;
    const ukrainian = read(slug, 'uk');
    const questions = ukrainian.stages['stage-1'].questions;
    assert.deepEqual(Object.keys(questions), Object.keys(english), slug);
    assert.equal(Object.keys(questions).length, 10, slug);
    assert.doesNotMatch(ukrainian.results?.score?.bestRound ?? '', /найкращий раунд/i, slug);
    for (const [id, question] of Object.entries(questions) as [string, any][]) {
      assert.deepEqual(Object.keys(question.answers), Object.keys(english[id].answers), `${slug}/${id}`);
      const choices = Object.values(question.answers) as string[];
      assert.equal(new Set(choices.map((choice) => choice.trim())).size, choices.length, `${slug}/${id}`);
    }
  }
});

test('Ukrainian profiles avoid repeated machine-literal review instructions', () => {
  for (const slug of fs.readdirSync('data/quizzes')) {
    if (!fs.existsSync(`data/quizzes/${slug}/uk.json`)) continue;
    for (const profile of Object.values(read(slug, 'uk').results?.profiles ?? {}) as {copy?: string}[]) {
      assert.doesNotMatch(profile.copy ?? '', /які з’єднання слід переглянути|Цей виклик представив деякі незнайомі ідеї/, slug);
    }
  }
});

test('Ukrainian medical copy retains non-diagnostic advice and urgent symptoms', () => {
  const depression = read('depression', 'uk');
  const prostate = read('prostatetest', 'uk');
  const dementia = read('dementia', 'uk');
  const macular = read('maculardegeneration', 'uk');
  assert.match(depression.about.disclaimer, /кризової підтримки/);
  assert.match(depression.stages['stage-1'].questions['depression-q3'].answers.a2, /Менше енергії/);
  assert.match(prostate.about.disclaimer, /неможливості сечовипускання/);
  assert.match(prostate.stages['stage-1'].questions['prostate-test-q5'].question, /підтікання сечі/);
  assert.match(dementia.about.body, /не слугує скринінгом деменції/);
  assert.match(macular.about.body, /якнайшвидше зверніться/);
  assert.match(macular.about.disclaimer, /не медичний скринінг/);
});

test('Ukrainian practical and language-dependent questions preserve keyed meaning', () => {
  assert.match(read('motorbike', 'uk').stages['stage-1'].questions['motorbike-q3'].question, /дистанцію/);
  assert.match(read('mechanic', 'uk').stages['stage-1'].questions['mechanic-r5q6'].answers.a1, /не буде належним чином підтриманий/);
  assert.match(read('midwifery', 'uk').stages['stage-1'].questions['mid-r1q1'].question, /між матір’ю та плодом/);
  assert.match(read('nursing', 'uk').stages['stage-1'].questions['nurse-r1q1'].question, /в легенях/);
  assert.match(read('nun', 'uk').stages['stage-1'].questions['nun-q9'].question, /чернечих обітниць/);
  assert.match(read('grammar', 'uk').about.body, /української мови/);
  assert.equal(read('word', 'uk').stages['stage-1'].questions['word-q10'].answers.a2, 'Пилип');
});
