import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {scoreQuiz} from './scoring.ts';
import type {Quiz} from '../../lib/quizzes.ts';

const root = 'data/quizzes/mobility_scooter';
const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
const copy = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
const expanded = expandQuizLocale(manifest, copy, 'en');
const quiz = {
  engine: {scoring: {type: 'weighted-profile'}},
  questions: expanded.stages[0].questions.map((q: any) => ({id:q.id, stage:0, choiceIds:q.answerIds, choices:Object.keys(q.answers), choiceWeights:Object.values(q.answers)})),
  result: {profiles:expanded.results.profiles, scoreDimensions:[]},
} as Quiz;

test('Mobility Scooter uses the existing ten-question landing, display and rewarded flow, in English only', () => {
  assert.equal(manifest.slug, 'mobility_scooter');
  assert.deepEqual(manifest.activeLocales, ['en']);
  assert.equal(manifest.template, 'single-stage-rewarded-v1');
  assert.equal(manifest.engine.entry, 'landing');
  assert.equal(manifest.engine.displayAds, true);
  assert.deepEqual(manifest.engine.startPrelude, {delayMs:2000, preload:true});
  assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  assert.equal(copy.title, 'Apply For Your Free Mobility Scooter');
  assert.equal(copy.landing.cta, 'Apply Now');
  assert.equal(quiz.questions.length, 10);
  for (const q of quiz.questions) assert.equal(q.choices.length, 3);
  assert.equal(copy.career.stages['stage-1'].preAdButton, 'See My Options');
  assert.equal(copy.landing.intro, '10 Questions\nSee The Options Available');
  assert.match(copy.results.options.disclaimer, /do not supply scooters or guarantee/);
  const engine = fs.readFileSync('components/quiz/QuizEngine.tsx', 'utf8');
  assert.doesNotMatch(engine, /disclaimer=\{quiz\.result\.options\?\.disclaimer\}/);
  assert.equal(manifest.engine.estimate, undefined);
  assert.deepEqual(manifest.structure.results.dimensions, []);
  assert.ok(fs.existsSync(`${root}/assets/items/mobility-scooter-icon.webp`));
  const header = fs.readFileSync('components/Header.tsx', 'utf8');
  assert.ok(header.includes('[a-z0-9_-]+'), 'underscore routes still filter inactive translations');
  const css = fs.readFileSync(`${root}/theme.css`, 'utf8');
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /font-size: clamp\(38px, 10\.8vw, 48px\) !important/);
});

test('the selected support preference only orders information; all three routes remain available', () => {
  for (let preference = 0; preference < 3; preference++) {
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, preference]));
    const result = scoreQuiz(quiz, answers);
    assert.equal(result.profile.id, manifest.structure.results.profiles[preference].id);
    assert.equal(result.estimatedAge, undefined);
    for (const id of ['mobility-q1','mobility-q2','mobility-q3','mobility-q4','mobility-q5','mobility-q7','mobility-q8']) {
      for (let answer = 0; answer < 3; answer++) assert.equal(scoreQuiz(quiz, {...answers, [id]:answer}).profile.id, result.profile.id);
    }
  }
  const renderer = fs.readFileSync('components/quiz/QuizOptionsResult.tsx', 'utf8');
  assert.match(renderer, /profiles\.map/);
  assert.doesNotMatch(renderer, /percentile|dimensionScores|targetStatus|fetch\(|fbq|submit/i);
  assert.match(renderer, /question\.choices\[answers\[question\.id\]\]/);
  assert.match(copy.results.options.steps[0], /not a clinical assessment/);
  for (const source of copy.results.options.sources) assert.equal(new URL(source.url).protocol, 'https:');
});
