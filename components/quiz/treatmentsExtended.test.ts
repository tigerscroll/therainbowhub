import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type { Quiz } from '../../lib/quizzes.ts';
import { expandQuizLocale } from '../../scripts/quiz-schema-v2.mjs';
import { getChapterAnswers } from './engagement.ts';
import { scoreQuiz } from './scoring.ts';

const root = 'data/quizzes/treatments/';
const read = (file: string) => JSON.parse(fs.readFileSync(root + file, 'utf8'));
const original = read('en.json');
const manifest = read('english-extended/quiz.json');
const copy = read('english-extended/en.json');
const expanded = expandQuizLocale(manifest, copy, 'en');
const questions = expanded.stages.flatMap((stage: { questions: any[] }) => stage.questions);

test('English treatments preserves the title and subtitle in a ten-by-seven chapter flow', () => {
  assert.equal(copy.title, original.title);
  assert.equal(copy.landing.intro, original.landing.intro);
  assert.equal(copy.landing.cta, 'Start');
  assert.equal(manifest.template, 'ten-stage-seven-question-v1');
  assert.deepEqual(manifest.activeLocales, ['en']);
  assert.equal(manifest.engine.localeParity, 'independent');
  assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  assert.equal(manifest.listing.compactLanding, true);
  assert.equal(manifest.listing.showSocialProof, false);
  assert.deepEqual(expanded.stages.map((stage: { questions: any[] }) => stage.questions.length), Array(10).fill(7));
  assert.equal(new Set(questions.map((question: any) => question.id)).size, 70);
  assert.equal(new Set(questions.map((question: any) => question.question)).size, 70);
  const positions = [0, 0, 0, 0];
  for (const question of questions) {
    assert.equal(question.presentation, 'text');
    for (const field of ['image', 'visual', 'study', 'icons']) assert.equal(question[field], undefined);
    assert.equal(new Set(question.answers).size, 4, question.id);
    assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4, question.id);
    positions[question.correct]++;
  }
  assert.deepEqual(positions.sort(), [17, 17, 18, 18]);
  for (const [index, stage] of manifest.structure.stages.entries()) {
    const checkpoint = copy.career.stages[stage.id];
    assert.equal(checkpoint.preAdButton, index === 9 ? 'See My Result' : 'Continue');
    if (index < 9) {
      assert.match(checkpoint.preAdCopy, /\{profile\}/);
      assert.ok(checkpoint.next.tagline.trim());
    }
  }
  const journeyCopy = [copy.landing.intro, copy.summary, copy.about.body, ...copy.about.howToPlay.steps,
    ...Object.values(copy.career.stages).flatMap((stage: any) => [stage.preAdTitle, stage.preAdCopy, stage.next?.tagline ?? ''])].join(' ');
  assert.doesNotMatch(journeyCopy, /\b(?:70|seventy|10|ten|7|seven)\b|halfway|\b(?:one|two|\d+) (?:chapters?|rounds?) (?:left|to go)\b/i);
  assert.equal(copy.results.share, undefined);
});

test('Treatments uses worldwide English and every answer has a checked primary reference', () => {
  const visibleContent = JSON.stringify(copy);
  assert.doesNotMatch(visibleContent, /\b(?:NHS|GP|A&E|Medicare|Medicaid|postcode|paracetamol|salbutamol|Ventolin|Tylenol|999|111)\b/i);
  assert.match(visibleContent, /Physical therapy \(physiotherapy\)/);
  assert.match(visibleContent, /Radiation therapy \(radiotherapy\)/);
  assert.match(copy.about.disclaimer, /not medical advice/i);
  const record = fs.readFileSync(root + 'english-extended/SOURCES.md', 'utf8');
  const rows = [...record.matchAll(/^\| `(treatments-s\d+q\d+)` \| (.+?) \| \[.+?\]\((https:\/\/[^)]+)\) \|$/gm)];
  assert.equal(rows.length, 70);
  const evidence = new Map(rows.map(([, id, answer, url]) => [id, { answer, url }]));
  assert.equal(evidence.size, 70);
  const categories = manifest.structure.results.dimensions.flatMap((dimension: { categories: string[] }) => dimension.categories);
  for (const question of questions) {
    const source = evidence.get(question.id);
    assert.ok(source, question.id);
    assert.equal(question.answers[question.correct], source.answer, question.id);
    assert.match(new URL(source.url).hostname, /(?:^|\.)(?:nhs\.uk|cancer\.gov|nih\.gov|medlineplus\.gov)$/);
    assert.equal(categories.filter((category: string) => category === question.category).length, 1, question.id);
  }
});

const scoringQuiz = {
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

test('Treatments passes at 56 out of 70 and chapter previews only score that chapter', () => {
  for (const correct of [0, 27, 28, 41, 42, 55, 56, 62, 63, 70]) {
    const answers = Object.fromEntries(scoringQuiz.questions.map((question, index) => [question.id, index < correct ? question.answerIndex! : (question.answerIndex! + 1) % 4]));
    const result = scoreQuiz(scoringQuiz, answers);
    assert.equal(result.score, correct);
    assert.equal(result.total, 70);
    assert.equal(result.targetStatus === 'achieved', correct >= 56);
    const expected = manifest.structure.results.profiles.find((profile: { min: number }) => correct / 70 >= profile.min);
    assert.equal(result.profile.title, copy.results.profiles[expected.key].title);
  }
  const allCorrect = Object.fromEntries(scoringQuiz.questions.map(question => [question.id, question.answerIndex!]));
  for (let stage = 0; stage < 10; stage++) {
    const chapter = { ...scoringQuiz, questions: scoringQuiz.questions.filter(question => question.stage === stage) };
    const result = scoreQuiz(chapter, getChapterAnswers(scoringQuiz.questions, allCorrect, stage));
    assert.equal(result.total, 7);
    assert.equal(result.profile.title, copy.results.profiles['profile-1'].title);
  }
});
