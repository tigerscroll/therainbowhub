import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales = 'ar bg cs da de el en es fi fil fr he hr hu id it ja ms nb nl pl pt ro sk sr sv th tr uk vi'.split(' ');
const read = (locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/obsolete/${locale}.json`, 'utf8'));
const manifest = JSON.parse(fs.readFileSync('data/quizzes/obsolete/quiz.json', 'utf8'));

test('Obsolete retains ten image questions with distinct keyed answers in all thirty locales', () => {
  const ids = manifest.structure.stages[0].questionIds as string[];
  assert.equal(manifest.structure.stages.length, 1);
  assert.equal(ids.length, 10);
  assert.equal(new Set(ids).size, 10);
  assert.deepEqual(fs.readdirSync('data/quizzes/obsolete').filter(name => /^[a-z]{2,3}\.json$/.test(name)).map(name => name.slice(0, -5)).sort(), [...locales].sort());
  for (const id of ids) {
    const src = manifest.structure.questions[id].image.src as string;
    assert.ok(fs.existsSync(`data/quizzes/obsolete${src.replace('/quizzes/obsolete', '')}`), `${id}: image missing`);
  }
  for (const locale of locales) {
    const questions = read(locale).stages['stage-1'].questions;
    assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), locale);
    for (const id of ids) {
      const item = questions[id];
      assert.ok(item.question?.trim(), `${locale}/${id}: missing question`);
      assert.ok(item.image?.alt?.trim().length >= 6, `${locale}/${id}: missing or short alt`);
      assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${locale}/${id}`);
      assert.equal(new Set(Object.values(item.answers).map((answer: any) => answer.trim().toLocaleLowerCase(locale))).size, 4, `${locale}/${id}: duplicate answers`);
      assert.ok(item.answers[manifest.structure.questions[id].correctAnswerId]?.trim(), `${locale}/${id}: missing keyed answer`);
    }
  }
});

test('Reviewed image descriptions match visible details rather than imaginary reels or single tools', () => {
  const q = (locale: string, id: string) => read(locale).stages['stage-1'].questions[id];
  assert.match(q('en', 'obsolete-q1').image.alt, /Two flat square black plastic objects/);
  assert.match(q('en', 'obsolete-q3').image.alt, /two dark rectangular viewing windows/);
  assert.doesNotMatch(q('en', 'obsolete-q3').image.alt, /reel/);
  assert.match(q('en', 'obsolete-q8').image.alt, /Two long-handled tools.*one wire and one woven/);
  for (const locale of locales) {
    const q1 = q(locale, 'obsolete-q1').image.alt;
    const q3 = q(locale, 'obsolete-q3').image.alt;
    const q8 = q(locale, 'obsolete-q8').image.alt;
    assert.notEqual(q1, q('en', 'obsolete-q1').answers.a1, locale);
    assert.ok(!/View-Master|ビューマスター|วิว-มาสเตอร์/i.test(q3), `${locale}: alt gives away brand`);
    assert.ok(!/round picture reel|image reel|képtekercs|bobine d'images|cuộn hình tròn/i.test(q3), `${locale}: alt describes absent reel`);
    assert.ok(q8.length >= 30, `${locale}: q8 alt too short`);
  }
});

test('Reviewed item names and distractors preserve the pictured objects', () => {
  const q = (locale: string, id: string) => read(locale).stages['stage-1'].questions[id];
  assert.equal(q('he', 'obsolete-q5').answers.a1, 'קרש כביסה');
  assert.equal(q('pl', 'obsolete-q5').answers.a1, 'Tarka do prania');
  assert.equal(q('el', 'obsolete-q8').answers.a4, 'Τιναχτήρι χαλιών');
  assert.equal(q('uk', 'obsolete-q10').answers.a2, 'Грілка для ліжка');
  assert.match(q('vi', 'obsolete-q6').answers.a2, /Walkman/);
  assert.equal(q('vi', 'obsolete-q10').answers.a3, 'Chân nến có tay cầm');
});
