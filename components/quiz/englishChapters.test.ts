import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type { Quiz } from '../../lib/quizzes.ts';
import { expandQuizLocale } from '../../scripts/quiz-schema-v2.mjs';
import { getChapterAnswers } from './engagement.ts';
import { scoreQuiz } from './scoring.ts';

const slugs = ['anatomy', 'bible', 'chef', 'catholic', 'mechanic', 'midwifery', 'nursing', 'paramedic', 'iq', 'harvard', 'oxford', 'cambridge'];
const read = (slug: string, file: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${file}`, 'utf8'));

for (const slug of slugs) {
  const original = read(slug, 'en.json');
  const manifest = read(slug, 'english-extended/quiz.json');
  const copy = read(slug, 'english-extended/en.json');
  const expanded = expandQuizLocale(manifest, copy, 'en');
  const questions = expanded.stages.flatMap((stage: { questions: any[] }) => stage.questions);

  test(`${slug}: English has ten seven-question chapters with its original headline and subtitle`, () => {
    assert.equal(copy.title, original.title);
    assert.equal(copy.landing.intro, original.landing.intro);
    assert.equal(copy.landing.cta, 'Start');
    assert.equal(manifest.template, 'ten-stage-seven-question-v1');
    assert.deepEqual(manifest.activeLocales, JSON.parse(fs.readFileSync('data/chapter-locales.json', 'utf8')).locales);
    assert.equal(manifest.engine.localeParity, 'independent');
    assert.equal(manifest.engine.hardRefreshCheckpoints, false);
    assert.equal(manifest.listing.compactLanding, true);
    assert.equal(manifest.listing.showSocialProof, false);
    assert.deepEqual(expanded.stages.map((stage: { questions: any[] }) => stage.questions.length), Array(10).fill(7));
    assert.equal(new Set(questions.map((question: any) => question.id)).size, 70);
    assert.equal(new Set(questions.map((question: any) => question.question)).size, 70);
    const positions = [0, 0, 0, 0];
    const categories = manifest.structure.results.dimensions.flatMap((dimension: { categories: string[] }) => dimension.categories);
    for (const question of questions) {
      assert.equal(question.presentation, 'text');
      assert.equal(new Set(question.answers).size, 4, question.id);
      assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4, question.id);
      assert.equal(categories.filter((category: string) => category === question.category).length, 1, question.id);
      positions[question.correct]++;
    }
    assert.deepEqual(positions.sort(), [17, 17, 18, 18]);
    // The English override leaves the source used by translated routes intact.
    assert.equal(read(slug, 'quiz.json').template, 'single-stage-rewarded-v1');
    assert.equal(Object.keys(read(slug, 'es.json').stages).length, 1);
  });

  test(`${slug}: checkpoints focus on the next topic and preserve the requested CTA sequence`, () => {
    for (const [index, stage] of manifest.structure.stages.entries()) {
      const checkpoint = copy.career.stages[stage.id];
      assert.equal(checkpoint.preAdButton, index === 9 ? 'See My Result' : 'Continue');
      if (index < 9) {
        assert.match(checkpoint.preAdCopy, /\{profile\}/);
        assert.ok(checkpoint.next.tagline.trim());
      }
    }
    assert.deepEqual(expanded.career.stages[9].preAdChecks, ['Answers checked', 'Topic strengths compared', 'Score calculated']);
    const journeyCopy = [copy.landing.intro, copy.summary, copy.about.body, ...copy.about.howToPlay.steps,
      ...Object.values(copy.career.stages).flatMap((stage: any) => [stage.preAdTitle, stage.preAdCopy, stage.next?.tagline ?? ''])].join(' ');
    assert.doesNotMatch(journeyCopy, /\b(?:70|seventy|10|ten|7|seven)\b|halfway|\b(?:one|two|\d+) (?:chapters?|rounds?) (?:left|to go)\b/i);
    assert.doesNotMatch(JSON.stringify(copy.results), /nine or ten|eight of the ten|8\/10|short (?:quiz|trivia set)|these ten/i);
    assert.equal(copy.results.share, undefined);
  });

  test(`${slug}: questions use cross-region English and retain a complete answer key`, () => {
    const visibleQuestions = JSON.stringify(copy.stages);
    assert.doesNotMatch(visibleQuestions, /\b(?:NHS|A&E|Medicare|Medicaid|postcode|zip code|MOT|DMV)\b|(?<![\d,])(?:999|911|111|000)(?![\d,])|\d+\s*(?:cups?|tablespoons?|teaspoons?)\b/i);
    const key = fs.readFileSync(`data/quizzes/${slug}/english-extended/ANSWER_KEY.md`, 'utf8');
    for (const question of questions) assert.ok(key.includes(`| \`${question.id}\` | ${question.answers[question.correct]} |`), question.id);
  });

  const quiz = {
    engine: { scoring: { type: 'correct-answer' }, targetRatio: 0.8 },
    stages: expanded.stages.map((stage: { title: string }) => stage.title),
    questions: expanded.stages.flatMap((stage: { questions: any[] }, stageIndex: number) => stage.questions.map(question => ({
      id: question.id, stage: stageIndex, answerIndex: question.correct, category: question.category,
    }))),
    result: {
      profiles: manifest.structure.results.profiles.map((profile: { key: string; min: number }) => ({ minRatio: profile.min, ...copy.results.profiles[profile.key] })),
      scoreDimensions: manifest.structure.results.dimensions.map((dimension: { key: string; categories: string[] }) => ({ label: copy.results.dimensions[dimension.key].label, categories: dimension.categories })),
    },
  } as Quiz;

  test(`${slug}: 56 answers meet the target and checkpoint feedback cannot inherit previous chapter scores`, () => {
    for (const correct of [0, 20, 21, 27, 28, 34, 35, 41, 42, 48, 49, 55, 56, 62, 63, 70]) {
      const answers = Object.fromEntries(quiz.questions.map((question, index) => [question.id, index < correct ? question.answerIndex! : (question.answerIndex! + 1) % 4]));
      const result = scoreQuiz(quiz, answers);
      assert.equal(result.score, correct);
      assert.equal(result.total, 70);
      assert.equal(result.targetStatus === 'achieved', correct >= 56);
      const expected = manifest.structure.results.profiles.find((profile: { min: number }) => correct / 70 >= profile.min);
      assert.equal(result.profile.title, copy.results.profiles[expected.key].title);
    }
    const answers = Object.fromEntries(quiz.questions.map(question => [question.id, question.stage === 1 ? (question.answerIndex! + 1) % 4 : question.answerIndex!]));
    for (let stage = 0; stage < 10; stage++) {
      const chapter = { ...quiz, questions: quiz.questions.filter(question => question.stage === stage) };
      const result = scoreQuiz(chapter, getChapterAnswers(quiz.questions, answers, stage));
      assert.equal(result.total, 7);
      assert.equal(result.score, stage === 1 ? 0 : 7);
      const key = stage === 1 ? manifest.structure.results.profiles.at(-1).key : 'profile-1';
      assert.equal(result.profile.title, copy.results.profiles[key].title);
    }
  });
}

const iq = expandQuizLocale(read('iq', 'english-extended/quiz.json'), read('iq', 'english-extended/en.json'), 'en');
const iqQuestions = Object.fromEntries(iq.stages.flatMap((stage: any) => stage.questions.map((question: any) => [question.id, question])));
const iqAnswer = (id: string) => iqQuestions[id].answers[iqQuestions[id].correct];

test('IQ code transformations and the truth-teller puzzle have the stated unique answers', () => {
  assert.equal(iqAnswer('iq-s6q4'), [...'6173'].reverse().join(''));
  assert.equal(iqAnswer('iq-s6q7'), 'E' + 'CANDLE'.slice(1, -1) + 'C');
  assert.equal(iqAnswer('iq-s6q6'), String([...'R4N7-X2'].filter((c, i) => c !== 'R4M7-X9'[i]).length));
  const reference = 'K7M2-Q9';
  const options = iqQuestions['iq-s6q2'].answers;
  assert.deepEqual(options.filter((option: string) => [...option].filter((c, i) => c !== reference[i]).length === 1), [iqAnswer('iq-s6q2')]);
  assert.equal(iqAnswer('iq-s10q2'), [...'DOG'].map((letter, i) => String.fromCharCode(letter.charCodeAt(0) + [1, 2, 1][i])).join(''));
  assert.equal(iqAnswer('iq-s10q6'), [...'LAMP'].reverse().join('').replace('A', '4'));
  const solutions = [];
  for (let mask = 0; mask < 8; mask++) {
    const [a, b, c] = [0, 1, 2].map(bit => Boolean(mask & (1 << bit)));
    if (Number(a) + Number(b) + Number(c) === 1 && a === !b && b === !c && c === (!a && !b)) solutions.push(['A', 'B', 'C'][[a, b, c].indexOf(true)]);
  }
  assert.deepEqual(solutions, [iqAnswer('iq-s10q1')]);
});

test('IQ arithmetic and combined rules agree with independent calculations', () => {
  const expected: Record<string, number | string> = {
    'iq-s2q1': 3 * 5, 'iq-s2q2': 24 - 6 - 2 * 6, 'iq-s2q3': (17 - 3) / 2,
    'iq-s2q4': 28 / 4, 'iq-s2q5': 45 - 18, 'iq-s2q6': 36 / 4,
    'iq-s8q1': 6 * 3 - 2, 'iq-s8q2': (4 + 5) * 2, 'iq-s8q3': 20 / 4 + 7,
    'iq-s8q4': 27 / 3, 'iq-s8q5': 4 * 5 + 4, 'iq-s8q6': 3 + 2 * 5 + 4,
    'iq-s8q7': 18 / 2 + 4, 'iq-s9q2': 8 + 3 * 4, 'iq-s9q4': 15 * 2,
    'iq-s9q5': 14 - 4, 'iq-s9q6': 17 * 2 - 1, 'iq-s10q5': `Day ${2 + 3 * 3}`, 'iq-s10q7': 12 / 3,
  };
  for (const [id, value] of Object.entries(expected)) assert.equal(iqAnswer(id), String(value), id);
});
