import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: 'en' | 'fil'): any =>
  JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Filipino quizzes keep ten English-aligned question and answer IDs', () => {
  const slugs = fs.readdirSync('data/quizzes').filter((slug) => fs.existsSync(`data/quizzes/${slug}/fil.json`));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const english = read(slug, 'en').stages['stage-1'].questions;
    const filipino = read(slug, 'fil');
    const questions = filipino.stages['stage-1'].questions;
    assert.deepEqual(Object.keys(questions), Object.keys(english), slug);
    assert.equal(Object.keys(questions).length, 10, slug);
    assert.notEqual(filipino.results?.score?.bestRound, 'Ang iyong pinakamahusay na round', slug);
    for (const [id, question] of Object.entries(questions) as [string, any][]) {
      assert.deepEqual(Object.keys(question.answers), Object.keys(english[id].answers), `${slug}/${id}`);
      const choices = Object.values(question.answers) as string[];
      assert.equal(new Set(choices.map((choice) => choice.trim())).size, choices.length, `${slug}/${id}`);
    }
  }
});

test('Filipino results avoid recurring literal templates and English title fragments', () => {
  for (const slug of fs.readdirSync('data/quizzes')) {
    if (!fs.existsSync(`data/quizzes/${slug}/fil.json`)) continue;
    for (const profile of Object.values(read(slug, 'fil').results?.profiles ?? {}) as {title?: string; copy?: string}[]) {
      assert.doesNotMatch(profile.copy ?? '', /aling mga koneksyon ang muling bisitahin|Ang hamon na ito ay nagpakilala ng ilang hindi pamilyar na ideya/, slug);
      assert.doesNotMatch(profile.title ?? '', /\b(?:Standout|Explorer|Mastermind|First-Response|First-Alarm|Rookie|Solver|Applicant|Recruit|Thinker|Expert|Pro|Tourist|Jukebox|Cucina|Trattoria|Heartbreaker|Flirt)\b/i, slug);
    }
  }
});

test('Filipino health wording retains important temporal and non-diagnostic meaning', () => {
  const depression = read('depression', 'fil');
  const prostate = read('prostatetest', 'fil');
  const dementia = read('dementia', 'fil');
  const macular = read('maculardegeneration', 'fil');
  assert.match(depression.stages['stage-1'].questions['depression-q1'].answers.a3, /kalahati ng mga araw/);
  assert.match(depression.about.disclaimer, /pangkrisis/);
  assert.match(prostate.stages['stage-1'].questions['prostate-test-q5'].question, /pagtagas ng ihi/);
  assert.match(prostate.about.disclaimer, /hindi ka makaihi/);
  assert.match(dementia.about.body, /hindi ito kasangkapan sa pag-screen ng dementia/);
  assert.match(macular.about.body, /magpatingin kaagad/);
});

test('Filipino safety and language-dependent questions preserve intended choices', () => {
  assert.match(read('motorbike', 'fil').stages['stage-1'].questions['motorbike-q3'].question, /distansiya/);
  assert.match(read('mechanic', 'fil').stages['stage-1'].questions['mechanic-r5q6'].answers.a1, /Huwag pumunta sa ilalim/);
  assert.match(read('midwifery', 'fil').stages['stage-1'].questions['mid-r1q1'].question, /ina at sanggol/);
  assert.match(read('nursing', 'fil').stages['stage-1'].questions['nurse-r1q1'].question, /mga baga/);
  assert.match(read('nun', 'fil').stages['stage-1'].questions['nun-q9'].question, /pagbigkas ng mga panata/);
  assert.match(read('grammar', 'fil').about.body, /balarilang Filipino/);
  assert.equal(read('word', 'fil').stages['stage-1'].questions['word-q10'].answers.a2, 'Ama');
});
