import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type { Quiz } from '../../lib/quizzes.ts';
import { expandQuizLocale } from '../../scripts/quiz-schema-v2.mjs';
import { getChapterAnswers } from './engagement.ts';
import { scoreQuiz } from './scoring.ts';

const root = 'data/quizzes/vision/';
const read = (file: string) => JSON.parse(fs.readFileSync(root + file, 'utf8'));
const original = read('en.json');
const manifest = read('english-extended/quiz.json');
const copy = read('english-extended/en.json');
const expanded = expandQuizLocale(manifest, copy, 'en');
const questions = expanded.stages.flatMap((stage: { questions: any[] }) => stage.questions);
const byId = Object.fromEntries(questions.map((question: any) => [question.id, question]));
const answer = (id: string) => byId[id].answers[byId[id].correct];
const sourceAsset = (src: string) => root + src.replace(/^\/quizzes\/vision\//, '');
const svg = (id: string) => fs.readFileSync(sourceAsset(byId[id].image.src), 'utf8');

test('English Vision preserves its headline and intro in ten seven-question rounds', () => {
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
    assert.equal(new Set(question.answers).size, 4, question.id);
    assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4, question.id);
    assert.ok(Boolean(question.image) !== Boolean(question.study), `${question.id}: one clear visual or study phase`);
    assert.equal(categories.filter((category: string) => category === question.category).length, 1, question.id);
    if (question.image) {
      assert.match(question.image.src, /^\/quizzes\/vision\/assets\/icons\/.+\.svg$/);
      assert.ok(fs.existsSync(sourceAsset(question.image.src)), question.id);
      assert.ok(fs.existsSync(`public${question.image.src}`), `${question.id}: exported asset`);
      assert.ok(question.image.alt.trim());
    }
    positions[question.correct]++;
  }
  assert.deepEqual(positions.sort(), [17, 17, 18, 18]);
  assert.deepEqual(byId['vision-s1q1'].answers, ['Top left', 'Top right', 'Bottom left', 'Bottom right']);
  assert.deepEqual(byId['vision-s9q3'].answers, ['Tile A', 'Tile B', 'Tile C', 'Tile D']);
  assert.deepEqual(byId['vision-s7q3'].answers, ['Row A', 'Row B', 'Row C', 'Row D']);
  assert.deepEqual(expanded.career.stages[9].preAdChecks, ['Answers checked', 'Puzzle strengths compared', 'Score calculated']);
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
  assert.doesNotMatch(JSON.stringify(copy), /\b(?:colour|colours|colourful|metres|centre|postcode|NHS)\b/i);
  assert.match(copy.about.disclaimer, /not an eye examination/);
  assert.equal(copy.results.share, undefined);
});

test('Vision counting answers agree with the actual symbols in each SVG', () => {
  const targets = ['ring', 'arrow:0', '6', 'triangle', 'lines:2', 'double-ring', 'E'];
  for (const [index, target] of targets.entries()) {
    const id = `vision-s2q${index + 1}`;
    const actual = [...svg(id).matchAll(/data-symbol="([^"]+)"/g)].filter(([, value]) => value === target).length;
    assert.equal(String(actual), answer(id), id);
  }
  assert.equal(String([...svg('vision-s9q7').matchAll(/data-symbol="Q"/g)].length), answer('vision-s9q7'));
  const numberPairs = [['vision-s7q2', 'R4N7-X2', 'R4M7-X9'], ['vision-s10q4', 'K7M2-R8', 'K1N2-R6']];
  for (const [id, first, second] of numberPairs) {
    assert.ok(svg(id).includes(`>${first}</text>`));
    assert.ok(svg(id).includes(`>${second}</text>`));
    assert.equal(answer(id), String([...first].filter((character, i) => character !== second[i]).length));
  }
});

test('Vision spatial answer keys follow the displayed geometry', () => {
  for (const [id, columns, rows] of [['vision-s8q1', 2, 2], ['vision-s8q2', 3, 3], ['vision-s10q5', 3, 2]] as const) {
    const shape = svg(id);
    const vertical = [...shape.matchAll(/<path[^>]*d="M[\d.]+ [\d.]+V[\d.]+"/g)].length;
    const horizontal = [...shape.matchAll(/<path[^>]*d="M[\d.]+ [\d.]+H[\d.]+"/g)].length;
    assert.equal(vertical, columns + 1);
    assert.equal(horizontal, rows + 1);
    const squares = Array.from({ length: Math.min(columns, rows) }, (_, i) => (columns - i) * (rows - i)).reduce((a, b) => a + b, 0);
    assert.equal(Number(answer(id)), squares, id);
  }
  const ring = svg('vision-s4q7');
  assert.match(ring, /data-symbol="gap:180"/);
  assert.equal(answer('vision-s4q7'), 'Up');
  assert.match(svg('vision-s10q2'), /data-symbol="arrow:225"/);
  assert.equal(answer('vision-s10q2'), 'Up-left');
  const overlap = svg('vision-s8q5');
  const points = [...overlap.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="9"/g)].map(([,x,y]) => [Number(x),Number(y)]);
  const inBoth = points.filter(([x,y]) => Math.hypot(x-190,y-145) < 99 && Math.hypot(x-290,y-145) < 99);
  assert.equal(Number(answer('vision-s8q5')), inBoth.length);
});

test('Vision memory cues are self-paced, ad-free and match their answer keys', () => {
  const cues = questions.filter((question: any) => question.study);
  assert.equal(cues.length, 8);
  for (const question of cues) {
    assert.equal(question.study.mode, 'manual');
    assert.equal(question.study.rewarded, false);
    assert.equal(question.study.continueLabel, 'I’m Ready');
    assert.ok(question.study.items.length >= 4 && question.study.items.length <= 6);
  }
  assert.equal(byId['vision-s6q1'].study.items[2], '🌙');
  assert.equal(answer('vision-s6q1'), 'Moon');
  assert.equal(answer('vision-s6q4'), String(byId['vision-s6q4'].study.items.filter((item: string) => item === '🔵').length));
  assert.equal(byId['vision-s10q3'].study.items[3], '🌵');
  assert.equal(answer('vision-s10q3'), 'Cactus');
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

test('Vision scores all 70 answers and uses only the current round for checkpoint feedback', () => {
  for (const correct of [0, 34, 35, 41, 42, 48, 49, 55, 56, 62, 63, 70]) {
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
