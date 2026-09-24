import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(fs.readFileSync('data/quizzes/memory/quiz.json', 'utf8'));
const locales: string[] = manifest.activeLocales;

function read(locale: string) {
  return JSON.parse(fs.readFileSync(`data/quizzes/memory/${locale}.json`, 'utf8'));
}

test('Memory study cues and answer keys remain intact in every locale', () => {
  assert.equal(locales.length, 30);
  for (const locale of locales) {
    const content = read(locale);
    const questions = content.stages['stage-1'].questions;
    assert.equal(Object.keys(questions).length, 10, locale);
    assert.equal(questions['memory-r1q1'].study.items.length, 4, locale);
    assert.match(questions['memory-r1q1'].study.items[2], /6/, locale);
    assert.match(questions['memory-r3q1'].study.items[1], /7:20/, locale);
    assert.equal(questions['memory-r4q1'].study.items.length, 4, locale);
    assert.equal(questions['memory-r4q2'].answers.a2.replace(/[\u2066-\u2069]/gu, ''), 'B7KR', locale);
    assert.equal(questions['memory-r5q2'].answers.a2, '6', locale);
    assert.ok(questions['memory-r4q1'].study.instruction.length > 20, locale);
    assert.equal(content.about.howToPlay.steps.length, 3, locale);
    assert.equal(Object.keys(content.results.profiles).length, 6, locale);
  }
});

test('Reviewed Memory wording does not restore misleading literal translations', () => {
  assert.equal(read('sr').stages['stage-1'].questions['memory-r1q4'].answers.a2, 'Тигар');
  assert.doesNotMatch(read('th').stages['stage-1'].questions['memory-r1q1'].study.instruction, /ถามหลายคำถาม/u);
  assert.doesNotMatch(read('ja').stages['stage-1'].questions['memory-r1q1'].study.title, /キャプチャ/u);
  assert.doesNotMatch(read('fi').results.profiles['profile-2'].copy, /Tyhjennät/u);
  assert.doesNotMatch(read('ms').results.profiles['profile-2'].copy, /mengosongkan baris/u);
  assert.doesNotMatch(read('fil').results.profiles['profile-2'].title, /Mag-alala/u);
  assert.equal(read('he').landing.cta, 'התחילו');
});
