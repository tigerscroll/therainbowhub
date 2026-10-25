import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type {Quiz} from '../../lib/quizzes.ts';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';
import {buildMemoryGeneralKnowledge} from '../../scripts/memory-general-knowledge.mjs';
import {reviewedMemoryLocales} from '../../scripts/chapter-locales/memory-reviewed-locales.mjs';
import {scoreQuiz} from './scoring.ts';

const read = (locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/memory/${locale}.json`, 'utf8'));
const manifest = read('quiz'), english = read('en');
const leaves = (value: any, path = '', result: Record<string, string> = {}) => {
  if (typeof value === 'string') result[path] = value;
  else if (value && typeof value === 'object') for (const [key, text] of Object.entries(value)) leaves(text, `${path}/${key}`, result);
  else assert.fail(`${path}: locale leaves must be visible strings`);
  return result;
};
const placeholders = (text: string) => [...text.matchAll(/\{[^{}]+\}/g)].map(match => match[0]).sort();

for (const locale of reviewedMemoryLocales) {
  test(`Memory ${locale}: complete current English journey, stable answer IDs and repeatable authoring`, () => {
    const native = read(locale);
    assert.deepEqual(buildMemoryGeneralKnowledge().copies[locale], native);
    const sourceLeaves = leaves(english), nativeLeaves = leaves(native);
    assert.deepEqual(Object.keys(nativeLeaves).sort(), Object.keys(sourceLeaves).sort());
    for (const [path, text] of Object.entries(nativeLeaves)) {
      assert.ok(text.trim(), path);
      assert.deepEqual(placeholders(text), placeholders(sourceLeaves[path]), path);
      if (!path.includes('/answers/') && !path.endsWith('/tier')) assert.notEqual(text, sourceLeaves[path], `${path}: untranslated English interface`);
    }
    const expanded = expandQuizLocale(manifest, native, locale);
    const source = expandQuizLocale(manifest, english, 'en');
    const signature = (quiz: any) => quiz.stages.flatMap((stage: any) => stage.questions.map((q: any) => [q.id, q.answerIds, q.correct]));
    assert.deepEqual(signature(expanded), signature(source));
    assert.deepEqual(expanded.stages.map((s: any) => s.questions.length), Array(10).fill(7));
    for (const stage of manifest.structure.stages) {
      const translated = native.stages[stage.id];
      assert.equal(native.career.stages[stage.id].difficulty, translated.title.toLocaleUpperCase(locale));
      for (const id of stage.questionIds) {
        assert.deepEqual(Object.keys(translated.questions[id].answers), manifest.structure.questions[id].answerIds);
        assert.equal(new Set(Object.values(translated.questions[id].answers)).size, 3);
      }
    }
    assert.equal(native.career.stages['stage-10'].next, undefined);
    assert.equal(native.career.stages['stage-10'].preAdChecks.length, 3);
  });
}

test('Memory German consistently uses du in instructions, profiles and result labels', () => {
  const copy = read('de');
  const visible = Object.values(leaves({about: copy.about, landing: copy.landing, career: copy.career, results: copy.results})).join('\n');
  assert.doesNotMatch(visible, /\b(?:Sie|Ihnen|Ihr|Ihre|Ihren|Ihrem)\b/u);
  assert.equal(copy.results.score.strongest, 'Dein stärkstes Themengebiet');
});

test('Memory Portuguese avoids paired national variants and regional forms of address', () => {
  const copy = read('pt');
  const visible = Object.values(leaves(copy)).join('\n');
  assert.match(copy.landing.intro, /Faça o teste/);
  // "Celular" is legitimate biology vocabulary here, not a regional phone term.
  assert.doesNotMatch(visible, /\b(?:você|tu|telemóvel|fixe|bacana|ecrã|tela|autocarro|ônibus|comboio|trem)\b|\b(?:está|estou|estamos) a\b|\bpara si\b|\bpor si\b/iu);
  assert.doesNotMatch(visible, /(?:Vénus|Tamisa|oxigénio|lisossoma|ribossoma|cromossoma|termómetro|DNA)\w*\s*\(/iu);
  assert.equal(copy.results.profiles['profile-4'].title, 'Passo a passo');
  assert.equal(copy.stages['stage-8'].questions['memory-gk-s8q4'].answers.a2, 'Ouvir');
  assert.equal(copy.stages['stage-8'].questions['memory-gk-s8q5'].answers.a2, 'Escrever');
});

test('Memory Spanish has paired punctuation and consistent answer capitalization', () => {
  const copy = read('es');
  for (const [path, text] of Object.entries(leaves(copy))) {
    assert.equal((text.match(/¿/g) ?? []).length, (text.match(/\?/g) ?? []).length, path);
    assert.equal((text.match(/¡/g) ?? []).length, (text.match(/!/g) ?? []).length, path);
    if (path.includes('/answers/')) assert.equal(text[0], text[0].toLocaleUpperCase('es'), path);
  }
});

function scoringQuiz(locale: string): Quiz {
  const native = read(locale), expanded = expandQuizLocale(manifest, native, locale);
  return {
    engine: {scoring: {type: 'correct-answer'}, targetRatio: manifest.engine.targetRatio},
    stages: expanded.stages.map((stage: any) => stage.title),
    questions: manifest.structure.stages.flatMap((stage: any, index: number) => stage.questionIds.map((id: string) => {
      const logic = manifest.structure.questions[id];
      return {id, stage: index, answerIndex: logic.answerIds.indexOf(logic.correctAnswerId), category: logic.category};
    })),
    result: {
      profiles: manifest.structure.results.profiles.map((p: any) => ({minRatio: p.min, ...native.results.profiles[p.key]})),
      scoreDimensions: manifest.structure.results.dimensions.map((d: any) => ({label: native.results.dimensions[d.key].label, categories: d.categories})),
    },
  } as Quiz;
}

test('Memory score, pass threshold and profile band match English in the reviewed languages', () => {
  const source = scoringQuiz('en');
  for (let pattern = 0; pattern < 20; pattern++) {
    const answers = Object.fromEntries(source.questions.map((q, i) => [q.id, (i * (pattern + 1) + pattern) % 3]));
    const expected = scoreQuiz(source, answers);
    for (const locale of reviewedMemoryLocales) {
      const nativeQuiz = scoringQuiz(locale), result = scoreQuiz(nativeQuiz, answers);
      assert.equal(result.score, expected.score, locale);
      assert.equal(result.total, 70, locale);
      assert.equal(result.targetStatus, expected.targetStatus, locale);
      assert.equal(nativeQuiz.result.profiles.indexOf(result.profile), source.result.profiles.indexOf(expected.profile), locale);
    }
  }
});
