import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Air Force and RAF retain ten keyed questions in all 30 locales', () => {
  const locales = read('airforce', 'quiz').activeLocales as string[];
  assert.equal(locales.length, 30);
  for (const slug of ['airforce', 'raf']) {
    const manifest = read(slug, 'quiz');
    assert.deepEqual([...manifest.activeLocales].sort(), [...locales].sort(), slug);
    assert.equal(manifest.structure.stages.length, 1, slug);
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const question = questions[id];
        const answerId = manifest.structure.questions[id].correctAnswerId;
        assert.ok(question.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(question.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(question.answers).map((value: any) => value.trim().toLocaleLowerCase())).size, 4, `${slug}/${locale}/${id}: duplicate answers`);
        assert.ok(question.answers[answerId]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
      }
    }
  }
});

test('Air Force navigation, controls, and pressure calculation retain exact operands and keys', () => {
  const manifest = read('airforce', 'quiz');
  assert.equal(manifest.structure.questions['airforce-q3'].correctAnswerId, 'a3');
  assert.equal(manifest.structure.questions['airforce-q6'].correctAnswerId, 'a2');
  assert.equal(manifest.structure.questions['airforce-q7'].correctAnswerId, 'a3');
  assert.equal(manifest.structure.questions['airforce-q10'].correctAnswerId, 'a2');
  for (const locale of manifest.activeLocales as string[]) {
    const questions = read('airforce', locale).stages['stage-1'].questions;
    assert.match(questions['airforce-q7'].question, /09/, locale);
    assert.ok(questions['airforce-q3'].answers.a3.trim(), locale);
    assert.ok(questions['airforce-q6'].answers.a2.trim(), locale);
    assert.ok(questions['airforce-q10'].answers.a2.trim(), locale);
  }
});

test('RAF official names, aircraft identifiers, motto, and rank stay anchored', () => {
  const manifest = read('raf', 'quiz');
  assert.equal(manifest.structure.questions['raf-q4'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['raf-q6'].correctAnswerId, 'a2');
  assert.equal(manifest.structure.questions['raf-q7'].correctAnswerId, 'a3');
  assert.equal(manifest.structure.questions['raf-q8'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['raf-q10'].correctAnswerId, 'a2');
  for (const locale of manifest.activeLocales as string[]) {
    const questions = read('raf', locale).stages['stage-1'].questions;
    assert.equal(questions['raf-q4'].answers.a4, 'Per Ardua ad Astra', locale);
    assert.equal(questions['raf-q6'].answers.a2, 'Squadron Leader', locale);
    assert.equal(questions['raf-q7'].answers.a3, 'Hawk T1', locale);
    assert.match(questions['raf-q8'].question, /Chain Home/, locale);
  }
  assert.match(read('raf', 'ja').stages['stage-1'].questions['raf-q2'].question, /Royal Flying Corps/);
});
