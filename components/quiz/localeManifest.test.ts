import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {resolveQuizLocaleManifest, resolveQuizLocaleText} from '../../lib/quiz/localeManifest.mjs';

function fixture() {
  const source = JSON.parse(fs.readFileSync('data/quizzes/years-left/quiz.json', 'utf8'));
  const stage = source.structure.stages[0];
  const stageQuestionIds = Object.fromEntries(source.structure.stages.map((item: any) => [item.id, [...item.questionIds]]));
  stageQuestionIds[stage.id].push('extra-1', 'extra-2');
  return {
    ...source,
    localeExtensions: {en: {
      template: 'fixture-extended',
      stageQuestionIds,
      questions: {'extra-1': structuredClone(source.structure.questions[stage.questionIds[0]]), 'extra-2': structuredClone(source.structure.questions[stage.questionIds[1]])},
    }},
  };
}

test('locale extensions add questions without mutating the base or other locales', () => {
  const manifest = fixture();
  const before = structuredClone(manifest);
  const baseCount = Object.keys(manifest.structure.questions).length;
  const english = resolveQuizLocaleManifest(manifest, 'en');
  assert.equal(Object.keys(english.structure.questions).length, baseCount + 2);
  assert.equal(english.localeExtensions, undefined);
  const french = resolveQuizLocaleManifest(manifest, 'fr');
  assert.equal(Object.keys(french.structure.questions).length, baseCount);
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

test('a short edition reuses only its selected questions and keeps the authored final checkpoint', () => {
  const read = (name: string) => JSON.parse(fs.readFileSync(`data/quizzes/memory/${name}.json`, 'utf8'));
  const manifest = read('quiz'), source = read('en');
  const [stage] = manifest.structure.stages;
  const first = stage.questionIds[0];
  manifest.structure.stages.push({id: 'stage-2', questionIds: ['extra']});
  manifest.structure.questions.extra = structuredClone(manifest.structure.questions[first]);
  source.stages['stage-2'] = {title: 'Fixture', questions: {extra: source.stages['stage-1'].questions[first]}};
  source.career.stages['stage-2'] = {...source.career.stages['stage-1'], preAdTitle: 'Final checkpoint'};
  manifest.localeExtensions = {en: {template: 'single-stage-rewarded-v1', select: [...stage.questionIds.slice(1), 'extra']}};
  const base = structuredClone(source);
  const short = resolveQuizLocaleManifest(manifest, 'en');
  const text = resolveQuizLocaleText(manifest, source, 'en');
  const ids = short.structure.stages[0].questionIds;
  assert.deepEqual(Object.keys(text.stages['stage-1'].questions), ids);
  assert.deepEqual(Object.keys(short.structure.questions), ids);
  assert.deepEqual(text.career.stages, {'stage-1': source.career.stages['stage-2']});
  for (const id of ids) assert.deepEqual(short.structure.questions[id], manifest.structure.questions[id]);
  assert.deepEqual(source, base);
  assert.deepEqual(resolveQuizLocaleManifest(manifest, 'fr').structure, manifest.structure);
  assert.equal(resolveQuizLocaleText(manifest, source, 'fr'), source);
  for (const invalid of [ids.slice(1), [...ids.slice(1), ids[1]], [...ids.slice(1), 'unknown']]) {
    const candidate = structuredClone(manifest);
    candidate.localeExtensions.en.select = invalid;
    assert.throws(() => resolveQuizLocaleManifest(candidate, 'en'), /Invalid single-round quiz selection/);
  }
});
