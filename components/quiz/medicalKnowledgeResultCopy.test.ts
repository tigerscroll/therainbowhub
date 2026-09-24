import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const slugs = ['anatomy', 'dentist', 'surgeon'];
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('medical-knowledge quizzes remain ten questions with non-credential result copy', () => {
  const locales = read('anatomy', 'quiz').activeLocales as string[];
  assert.equal(locales.length, 30);

  for (const slug of slugs) {
    const definition = read(slug, 'quiz');
    assert.deepEqual(definition.activeLocales, locales);
    assert.equal(definition.structure.stages.length, 1);
    assert.equal(definition.structure.stages[0].questionIds.length, 10);
    for (const locale of locales) {
      const content = read(slug, locale);
      assert.ok(content.about.disclaimer.trim(), `${slug}/${locale}`);
    }
  }

  for (const locale of locales) {
    const neutral = read('nursing', locale);
    for (const slug of ['dentist', 'surgeon']) {
      const content = read(slug, locale);
      assert.equal(content.career.stages['stage-1'].difficulty, neutral.career.stages['stage-1'].difficulty, `${slug}/${locale}`);
      assert.equal(content.career.stages['stage-1'].preAdTitle, neutral.career.stages['stage-1'].preAdTitle, `${slug}/${locale}`);
      assert.equal(content.results.score.passed, neutral.results.score.passed, `${slug}/${locale}`);
      assert.equal(content.results.score.finished, neutral.results.score.finished, `${slug}/${locale}`);
    }
  }

  assert.equal(read('dentist', 'en').results.score.passed, 'You reached the 80% target in this quiz!');
  assert.equal(read('surgeon', 'en').results.score.passed, 'You reached the 80% target in this quiz!');
});
