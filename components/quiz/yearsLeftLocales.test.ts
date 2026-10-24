import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type {Quiz} from '../../lib/quizzes.ts';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {translateYearsLeft} from '../../scripts/localize-years-left-de-fr.mjs';
import {scoreQuiz} from './scoring.ts';

const read = (name: string) => JSON.parse(fs.readFileSync(`data/quizzes/years-left/${name}.json`, 'utf8'));
const manifest = read('quiz'), english = read('en');
function leaves(value: any, path = '', output: Record<string, string> = {}) {
  if (typeof value === 'string') output[path] = value;
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) leaves(item, `${path}/${key}`, output);
  else assert.fail(`${path}: every locale leaf must be a string`);
  return output;
}
const placeholders = (text: string) => [...text.matchAll(/\{[^{}]+\}/g)].map(m => m[0]).sort();

for (const locale of ['de', 'fr', 'pt']) {
  test(`Years Left ${locale}: complete, repeatable translation with identical IDs and no missing text`, () => {
    const copy = read(locale);
    assert.deepEqual(copy, translateYearsLeft(locale, english, manifest));
    const sourceLeaves = leaves(english), nativeLeaves = leaves(copy);
    assert.deepEqual(Object.keys(nativeLeaves).sort(), Object.keys(sourceLeaves).sort());
    for (const [path, text] of Object.entries(nativeLeaves)) {
      assert.ok(text.trim(), path);
      assert.deepEqual(placeholders(text), placeholders(sourceLeaves[path]), path);
      assert.notEqual(text, sourceLeaves[path], `${path}: English has been translated`);
    }
    assert.equal(copy.landing.intro.split('\n').length, 2);
    if (locale === 'de') assert.equal(copy.stages['stage-1'].title, 'Dein Start in den Tag');
    if (locale === 'fr') {
      assert.equal(copy.landing.cta, 'Faire le test');
      assert.match(copy.landing.intro, /choix\u202f\?/);
    }
    const expanded = expandQuizLocale(manifest, copy, locale);
    assert.deepEqual(expanded.stages.map((s: any) => s.questions.length), Array(10).fill(10));
    const nativeQuestions = expanded.stages.flatMap((s: any) => s.questions);
    const sourceQuestions = expandQuizLocale(manifest, english, 'en').stages.flatMap((s: any) => s.questions);
    assert.deepEqual(nativeQuestions.map((q: any) => [q.id, q.answerIds, Object.values(q.answers), q.calibration]), sourceQuestions.map((q: any) => [q.id, q.answerIds, Object.values(q.answers), q.calibration]));
    assert.equal(nativeQuestions.at(-1).id, 'yl-s10q7');
    for (const stage of Object.values(copy.stages) as any[]) for (const [id, question] of Object.entries(stage.questions) as [string, any][]) {
      assert.deepEqual(Object.keys(question.answers), manifest.structure.questions[id].answerIds);
      assert.equal(new Set(Object.values(question.answers)).size, 4);
      for (const text of Object.values(question.answers) as string[]) assert.doesNotMatch(text, /\b(?:Je [aeioué]|Ich Ich|Je Je|Je J’)/i);
    }
  });
}

function scoringQuiz(locale: string): Quiz {
  const data = expandQuizLocale(manifest, read(locale), locale);
  return {
    engine: {scoring: {type: 'weighted-profile'}, estimate: manifest.engine.estimate},
    questions: data.stages.flatMap((s: any, stage: number) => s.questions.map((q: any) => ({id: q.id, stage, choiceWeights: Object.values(q.answers), calibrationValues: q.calibration}))),
    result: {profiles: data.results.profiles, scoreDimensions: data.results.dimensions.map((d: any) => ({label: d.label, categories: d.profiles}))},
  } as Quiz;
}

test('identical choices produce the same age, profile and consistency in all four languages', () => {
  const source = scoringQuiz('en');
  for (let pattern = 0; pattern < 20; pattern++) {
    const answers = Object.fromEntries(source.questions.map((q, i) => [q.id, (i * (pattern + 1) + pattern) % 4]));
    const expected = scoreQuiz(source, answers);
    for (const locale of ['de', 'fr', 'pt']) {
      const result = scoreQuiz(scoringQuiz(locale), answers);
      assert.equal(result.profile.id, expected.profile.id, `${locale}/${pattern}`);
      assert.equal(result.estimatedAge, expected.estimatedAge, `${locale}/${pattern}`);
      assert.equal(result.consistency, expected.consistency, `${locale}/${pattern}`);
    }
  }
});

test('Years Left Portuguese uses neutral vocabulary and avoids region-specific alternatives', () => {
  const copy = read('pt');
  const visible = Object.values(leaves(copy)).join('\n');
  assert.equal(copy.landing.cta, 'Iniciar teste');
  assert.match(copy.stages['stage-2'].questions['yl-s2q1'].question, /primeira refeição do dia/);
  assert.match(copy.stages['stage-4'].questions['yl-s4q1'].question, /telefone/);
  assert.doesNotMatch(visible, /\b(?:telemóvel|celular|frigorífico|geladeira|autocarro|ônibus|comboio|trem|ecrã|tela|fixe|bacana|olhadela|algures|apetecer|planeei|você|tu)\b|pequeno-almoço|café da manhã|\b(?:estou|está|estamos|ando) a\b|\bpara si\b/iu);
  assert.doesNotMatch(visible, /\([^)]*(?:Portugal|Brasil|PT|BR)[^)]*\)/u, 'no paired national variants in the reader-facing copy');
});
