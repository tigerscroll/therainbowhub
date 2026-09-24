import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Midwifery and Chef retain ten keyed questions in all 30 locales', () => {
  const locales = read('midwifery', 'quiz').activeLocales as string[];
  assert.equal(locales.length, 30);
  for (const slug of ['midwifery', 'chef']) {
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
        const item = questions[id];
        const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
        assert.ok(item.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers).map((value: any) => value.trim().toLocaleLowerCase())).size, 4, `${slug}/${locale}/${id}: duplicate answers`);
        assert.ok(item.answers[correctAnswerId]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
      }
    }
  }
});

test('Midwifery urgent-assessment, sterile-wrapper, and fluid-trend keys remain intact', () => {
  const manifest = read('midwifery', 'quiz');
  assert.equal(manifest.structure.questions['mid-r3q2'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['mid-r5q6'].correctAnswerId, 'a1');
  assert.equal(manifest.structure.questions['mid-r7q3'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['mid-r10q2'].correctAnswerId, 'a2');
  for (const locale of manifest.activeLocales as string[]) {
    const questions = read('midwifery', locale).stages['stage-1'].questions;
    const trend = questions['mid-r10q2'];
    assert.match(trend.context, /650/);
    assert.match(trend.context, /450/);
    assert.match(trend.context, /74/);
    assert.match(trend.context, /82/);
    assert.match(trend.answers.a2, /1[,. ]?100/);
    assert.ok(questions['mid-r3q2'].answers.a4.trim(), locale);
    assert.ok(questions['mid-r5q6'].answers.a1.trim(), locale);
    assert.ok(questions['mid-r7q3'].answers.a4.trim(), locale);
  }
  assert.doesNotMatch(read('midwifery', 'de').stages['stage-1'].questions['mid-r10q2'].context, /horoskop/i);
  assert.doesNotMatch(read('midwifery', 'th').stages['stage-1'].questions['mid-r5q6'].answers.a1, /ขยายขนาด/);
  assert.doesNotMatch(read('midwifery', 'fi').stages['stage-1'].questions['mid-r5q6'].answers.a1, /laajenna/);
  assert.doesNotMatch(read('midwifery', 'pl').stages['stage-1'].questions['mid-r5q6'].answers.a1, /zwiększ/);
});

test('Chef glass-contamination response and recipe scaling stay keyed across locales', () => {
  const manifest = read('chef', 'quiz');
  assert.equal(manifest.structure.questions['chef-r2q6'].correctAnswerId, 'a3');
  assert.equal(manifest.structure.questions['chef-r6q1'].correctAnswerId, 'a1');
  for (const locale of manifest.activeLocales as string[]) {
    const questions = read('chef', locale).stages['stage-1'].questions;
    const scaling = questions['chef-r6q1'];
    assert.match(scaling.question, /300/);
    assert.match(scaling.question, /4|أربع/);
    assert.match(scaling.question, /10|عشر/);
    assert.match(scaling.answers.a1, /750/);
    assert.ok(questions['chef-r2q6'].answers.a3.trim(), locale);
  }
});
