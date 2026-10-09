import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {resolveQuizLocaleManifest} from '../../lib/quiz/localeManifest.mjs';

function fixture() {
  const source = JSON.parse(fs.readFileSync('data/quizzes/years-left/quiz.json', 'utf8'));
  const stage = source.structure.stages[0];
  return {
    ...source,
    localeExtensions: {en: {
      template: 'fixture-extended',
      stageQuestionIds: {[stage.id]: [...stage.questionIds, 'extra-1', 'extra-2']},
      questions: {'extra-1': structuredClone(source.structure.questions[stage.questionIds[0]]), 'extra-2': structuredClone(source.structure.questions[stage.questionIds[1]])},
    }},
  };
}

test('locale extensions add questions without mutating the base or other locales', () => {
  const manifest = fixture();
  const before = structuredClone(manifest);
  const english = resolveQuizLocaleManifest(manifest, 'en');
  assert.equal(Object.keys(english.structure.questions).length, 12);
  assert.equal(english.localeExtensions, undefined);
  const french = resolveQuizLocaleManifest(manifest, 'fr');
  assert.equal(Object.keys(french.structure.questions).length, 10);
  assert.deepEqual(french.structure, manifest.structure);
  for (const [id, question] of Object.entries(manifest.structure.questions)) assert.deepEqual(english.structure.questions[id], question);
  assert.deepEqual(manifest, before);
});

test('locale extensions reject missing, reordered, duplicate and unreferenced question definitions', () => {
  for (const corrupt of [
    (manifest: any) => manifest.localeExtensions.en.stageQuestionIds['stage-1'].shift(),
    (manifest: any) => manifest.localeExtensions.en.stageQuestionIds['stage-1'].reverse(),
    (manifest: any) => manifest.localeExtensions.en.stageQuestionIds['stage-1'].push('yl-s1q1'),
    (manifest: any) => delete manifest.localeExtensions.en.questions['extra-1'],
    (manifest: any) => manifest.localeExtensions.en.questions['yl-s1q1'] = {},
    (manifest: any) => manifest.localeExtensions.en.stageQuestionIds['unknown'] = [],
  ]) {
    const manifest = fixture();
    corrupt(manifest);
    assert.throws(() => resolveQuizLocaleManifest(manifest, 'en'));
  }
});
