import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type { Quiz } from '../../lib/quizzes.ts';
import { scoreQuiz } from './scoring.ts';

const read = (slug: string, locale: string) => JSON.parse(
  fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'),
);
const locales = (slug: string) => fs.readdirSync(`data/quizzes/${slug}`)
  .filter((file) => file.endsWith('.json') && file !== 'quiz.json')
  .map((file) => file.slice(0, -5));

test('Prostate Test and Dementia have ten questions and complete result profiles in all 30 locales', () => {
  for (const slug of ['prostatetest', 'dementia']) {
    const manifest = read(slug, 'quiz');
    const ids: string[] = manifest.structure.stages.flatMap((stage: { questionIds: string[] }) => stage.questionIds);
    assert.equal(locales(slug).length, 30, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales(slug)) {
      const copy = read(slug, locale);
      const questions = copy.stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions), ids, `${slug}/${locale}: questions`);
      assert.equal(Object.keys(copy.results.profiles).length, manifest.structure.results.profiles.length, `${slug}/${locale}: profiles`);
      assert.ok(copy.about.disclaimer.trim(), `${slug}/${locale}: medical disclaimer`);
      for (const id of ids) {
        assert.ok(questions[id].question.trim(), `${slug}/${locale}/${id}: question`);
        assert.deepEqual(Object.keys(questions[id].answers), manifest.structure.questions[id].answerIds, `${slug}/${locale}/${id}: answer IDs`);
        assert.equal(new Set(Object.values(questions[id].answers)).size, 4, `${slug}/${locale}/${id}: distinct answers`);
      }
    }
  }
});

test('Prostate Test no-current result is a fallback, never a vote against symptoms', () => {
  const manifest = read('prostatetest', 'quiz');
  const en = read('prostatetest', 'en');
  const ids: string[] = manifest.structure.stages[0].questionIds;
  const questions = ids.map((id) => ({
    id,
    stage: 0,
    choiceWeights: manifest.structure.questions[id].answerIds.map((answerId: string) => manifest.structure.questions[id].choiceMeanings[answerId]),
  }));
  const quiz = {
    engine: { scoring: { type: 'weighted-profile' } },
    questions,
    stages: [en.stages['stage-1'].title],
    result: {
      profiles: manifest.structure.results.profiles.map((profile: { key: string; id: string }) => ({
        ...en.results.profiles[profile.key], id: profile.id, minRatio: 0,
      })),
      scoreDimensions: [],
    },
  } as Quiz;
  const baseline = Object.fromEntries(ids.map((id) => [id, 0]));
  for (const id of ids) {
    assert.equal(manifest.structure.questions[id].choiceMeanings.a1['no-current-changes'], 0, id);
  }
  assert.equal(scoreQuiz(quiz, baseline).profile.id, 'no-current-changes');
  const cases: [string, number, string][] = [
    ['prostate-test-q1', 1, 'urinary-changes'],
    ['prostate-test-q6', 2, 'pain-or-bleeding'],
    ['prostate-test-q6', 3, 'pain-or-bleeding'],
    ['prostate-test-q7', 3, 'pain-or-bleeding'],
    ['prostate-test-q8', 2, 'pain-or-bleeding'],
    ['prostate-test-q8', 3, 'pain-or-bleeding'],
    ['prostate-test-q9', 3, 'risk-and-next-step'],
  ];
  for (const [id, choiceIndex, expectedProfile] of cases) {
    const answers = { ...baseline, [id]: choiceIndex };
    assert.equal(scoreQuiz(quiz, answers).profile.id, expectedProfile, `${id}/a${choiceIndex + 1}`);
  }
  const priorityCases: [string, number][] = [
    ['prostate-test-q6', 2],
    ['prostate-test-q6', 3],
    ['prostate-test-q7', 3],
    ['prostate-test-q8', 2],
    ['prostate-test-q8', 3],
  ];
  const mixedPositive = Object.fromEntries(ids.map((id) => [id, 1]));
  for (const [id, choiceIndex] of priorityCases) {
    assert.equal(manifest.structure.questions[id].choiceMeanings[`a${choiceIndex + 1}`]['pain-or-bleeding'], 10, `${id}: priority weight`);
    assert.equal(scoreQuiz(quiz, { ...mixedPositive, [id]: choiceIndex }).profile.id, 'pain-or-bleeding', `${id}: mixed positive answers`);
  }
  for (const id of ['prostate-test-q6', 'prostate-test-q7', 'prostate-test-q8']) {
    assert.equal(manifest.structure.questions[id].choiceMeanings.a2['pain-or-bleeding'], 1, `${id}: mild response keeps original weight`);
  }
  assert.match(en.about.disclaimer, /inability to urinate/);
  assert.match(en.about.disclaimer, /heavy bleeding/);
  assert.match(en.about.disclaimer, /rapidly worsening pain/);
});

test('Portuguese prostate check uses Portugal wording without weakening urgent-care advice', () => {
  const pt = read('prostatetest', 'pt');
  const strings: string[] = [];
  const collect = (value: unknown): void => {
    if (typeof value === 'string') strings.push(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };
  collect(pt);
  const copy = strings.join(' ');
  assert.doesNotMatch(copy, /\b(?:câncer|sêmen|quadris|sangramento|está piorando|estou acompanhando)\b/iu);
  assert.match(pt.about.disclaimer, /cancro da próstata/);
  assert.match(pt.about.disclaimer, /assistência médica urgente/);
  assert.match(pt.about.disclaimer, /não conseguir urinar/);
  assert.match(pt.stages['stage-1'].questions['prostate-test-q6'].question, /sémen/);
  assert.match(pt.stages['stage-1'].questions['prostate-test-q8'].question, /ancas/);
});

test('Dementia recalled words and objects agree with the original stimuli in every locale', () => {
  const manifest = read('dementia', 'quiz');
  const normalize = (value: string) => value.normalize('NFKD').toLocaleLowerCase().replace(/\p{Mark}/gu, '').trim();
  for (const locale of locales('dementia')) {
    const q = read('dementia', locale).stages['stage-1'].questions;
    const words: string[] = q['dementia-q1'].study.items;
    assert.equal(words.length, 4, locale);
    assert.equal(normalize(q['dementia-q1'].answers.a2), normalize(words[2]), `${locale}: immediate word recall`);
    assert.equal(normalize(q['dementia-q9'].answers.a2), normalize(words[0]), `${locale}: delayed word recall`);
    const objects: string[] = q['dementia-q5'].study.items;
    assert.deepEqual(objects, ['🧤', '🔑', '☕', '📘'], `${locale}: object stimulus`);
    assert.equal(manifest.structure.questions['dementia-q5'].icons.a2, objects[1], `${locale}: immediate object key`);
    assert.equal(manifest.structure.questions['dementia-q10'].correctAnswerId, 'a1', `${locale}: delayed object key`);
    assert.ok(q['dementia-q5'].study.ariaLabel.trim(), `${locale}: accessible object cue`);
  }
});
