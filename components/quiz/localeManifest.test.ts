import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {resolveQuizLocaleManifest} from '../../lib/quiz/localeManifest.mjs';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const read = (name: string) => JSON.parse(fs.readFileSync(`data/quizzes/years-left/${name}.json`, 'utf8'));

test('the English extension adds thirty questions without mutating shared or translated editions', () => {
  const manifest = read('quiz');
  const before = structuredClone(manifest);
  assert.deepEqual(Object.keys(manifest.localeExtensions), ['en']);
  const english = resolveQuizLocaleManifest(manifest, 'en');
  assert.equal(Object.keys(english.structure.questions).length, 100);
  assert.equal(english.localeExtensions, undefined);
  for (const locale of manifest.activeLocales.filter((value: string) => value !== 'en')) {
    const native = resolveQuizLocaleManifest(manifest, locale);
    assert.equal(native.template, 'ten-stage-seven-question-v1');
    assert.deepEqual(native.structure, manifest.structure);
    const copy = expandQuizLocale(native, read(locale), locale);
    assert.deepEqual(copy.stages.map((stage: any) => stage.questions.length), Array(10).fill(7));
    assert.equal(Object.keys(native.structure.questions).length, 70);
  }
  for (const [id, question] of Object.entries(manifest.structure.questions)) {
    assert.deepEqual(english.structure.questions[id], question, `existing scoring is unchanged: ${id}`);
  }
  assert.deepEqual(manifest, before);
});

test('locale extensions reject missing, reordered, duplicate and unreferenced question definitions', () => {
  for (const corrupt of [
    (manifest: any) => manifest.localeExtensions.en.stageQuestionIds['stage-1'].shift(),
    (manifest: any) => manifest.localeExtensions.en.stageQuestionIds['stage-1'].reverse(),
    (manifest: any) => manifest.localeExtensions.en.stageQuestionIds['stage-1'].push('yl-s1q1'),
    (manifest: any) => delete manifest.localeExtensions.en.questions['yl-s1q8'],
    (manifest: any) => manifest.localeExtensions.en.questions['yl-s1q1'] = {},
    (manifest: any) => manifest.localeExtensions.en.stageQuestionIds['unknown'] = [],
  ]) {
    const manifest = read('quiz');
    corrupt(manifest);
    assert.throws(() => resolveQuizLocaleManifest(manifest, 'en'));
  }
});
