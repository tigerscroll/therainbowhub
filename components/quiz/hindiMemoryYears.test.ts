import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {getQuizSlugs, getQuizLocaleFiles} from '../../scripts/quiz-catalogue.mjs';
import {translateMemoryHindi} from '../../scripts/chapter-locales/memory-hi.mjs';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const read = (slug: string, name: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${name}.json`, 'utf8'));
const shared = JSON.parse(fs.readFileSync('data/i18n/hi.json', 'utf8'));
function leaves(value: any, path = '', output: Record<string, string> = {}) {
  if (typeof value === 'string') output[path] = value;
  else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) leaves(child, `${path}/${key}`, output);
  else assert.fail(`${path}: locale leaves must be strings`);
  return output;
}

test('Hindi launches only the two requested quiz editions, with Hindi shared controls', () => {
  assert.deepEqual(getQuizSlugs().filter((slug: string) => getQuizLocaleFiles(slug).includes('hi')), ['memory', 'years-left']);
  assert.equal(shared.locale.code, 'hi');
  assert.equal(shared.locale.direction, 'ltr');
  assert.equal(shared.locale.name, 'Hindi');
  assert.equal(shared.ad.loading, 'लोड हो रहा है…');
  assert.equal(shared.quiz.start, read('memory', 'hi').landing.cta);
  for (const slug of ['memory', 'years-left']) {
    const manifest = read(slug, 'quiz'), copy = read(slug, 'hi');
    assert.ok(manifest.activeLocales.includes('hi'));
    const english = leaves(read(slug, 'en')), hindi = leaves(copy);
    assert.deepEqual(Object.keys(hindi).sort(), Object.keys(english).sort());
    for (const [path, value] of Object.entries(hindi)) {
      assert.ok(value.trim(), path);
      const tokens = (s: string) => [...s.matchAll(/\{[^{}]+\}/g)].map(m => m[0]).sort();
      assert.deepEqual(tokens(value), tokens(english[path]), path);
    }
    const expanded = expandQuizLocale(manifest, copy, 'hi');
    assert.deepEqual(expanded.stages.map((stage: any) => stage.questions.length), Array(10).fill(slug === 'memory' ? 7 : 10));
    for (const stage of Object.values(copy.stages) as any[]) for (const question of Object.values(stage.questions) as any[]) {
      assert.match(question.question, /\p{Script=Devanagari}/u);
    }
  }
});

test('Hindi Memory regenerates exactly and preserves correct answer IDs and protected puzzles', () => {
  const manifest = read('memory', 'quiz'), copy = read('memory', 'hi');
  assert.deepEqual(translateMemoryHindi(read('memory', 'en'), manifest), copy);
  const questions = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));
  const correct = (id: string) => questions[id].answers[manifest.structure.questions[id].correctAnswerId];
  assert.equal(correct('memory-gk-s1q7'), 'R');
  assert.equal(correct('memory-gk-s8q4'), 'उसे सुना जाता है');
  assert.equal(correct('memory-gk-s8q5'), 'लिखने');
  assert.equal(correct('memory-gk-s9q4'), '3 g/cm³');
  assert.equal(correct('memory-gk-s10q4'), '6');
  assert.match(questions['memory-gk-s10q4'].question, /CAB/);
  for (const [id, question] of Object.entries(questions) as [string, any][]) {
    assert.deepEqual(Object.keys(question.answers), manifest.structure.questions[id].answerIds);
    assert.equal(Object.keys(question.answers).length, 3);
  }
});
