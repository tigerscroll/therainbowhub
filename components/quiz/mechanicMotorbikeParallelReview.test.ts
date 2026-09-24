import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Mechanic and Motorbike have matching 30-locale, ten-question contracts', () => {
  const expectedLocales = read('mechanic', 'quiz').activeLocales as string[];
  assert.equal(expectedLocales.length, 30);
  for (const slug of ['mechanic', 'motorbike']) {
    const manifest = read(slug, 'quiz');
    const stages = manifest.structure.stages;
    const ids = stages[0].questionIds as string[];
    assert.equal(stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    assert.deepEqual([...manifest.activeLocales].sort(), [...expectedLocales].sort(), slug);
    for (const locale of expectedLocales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const item = questions[id];
        const answerId = manifest.structure.questions[id].correctAnswerId;
        assert.ok(item.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers).map((value: any) => value.trim().toLocaleLowerCase())).size, 4, `${slug}/${locale}/${id}: duplicate answers`);
        assert.ok(item.answers[answerId]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
      }
    }
  }
});

test('Mechanic coolant calculation and jack-safety key remain intact in all locales', () => {
  const manifest = read('mechanic', 'quiz');
  assert.equal(manifest.structure.questions['mechanic-r3q4'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['mechanic-r5q6'].correctAnswerId, 'a1');
  for (const locale of manifest.activeLocales as string[]) {
    const items = read('mechanic', locale).stages['stage-1'].questions;
    const calculation = items['mechanic-r3q4'];
    assert.match(calculation.question, /4/);
    assert.match(calculation.question, /50/);
    assert.match(calculation.answers.a4, /2/);
    assert.doesNotMatch(calculation.question, /kraftfoder|kraftfôr/i, locale);
    const jack = items['mechanic-r5q6'];
    assert.ok(jack.answers.a1.trim(), locale);
    assert.doesNotMatch(jack.question, /مقبس|υποδοχή|שקע/, locale);
  }
});

test('Italian Mechanic copy keeps the diagnostic and jack-safety meaning', () => {
  const it = read('mechanic', 'it');
  const items = it.stages['stage-1'].questions;
  assert.match(items['mechanic-r3q3'].question, /Una funziona e l'altra no/);
  assert.match(items['mechanic-r3q4'].question, /liquido di raffreddamento/);
  assert.match(items['mechanic-r5q6'].answers.a1, /Non andare sotto l'auto finché/);
  assert.doesNotMatch(JSON.stringify(it.results), /La tua recensione|Service Bay|workshop/);
});

test('Motorbike correct safety decisions remain keyed through locale adaptations', () => {
  const manifest = read('motorbike', 'quiz');
  assert.equal(manifest.structure.questions['motorbike-q4'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['motorbike-q5'].correctAnswerId, 'a1');
  assert.equal(manifest.structure.questions['motorbike-q7'].correctAnswerId, 'a3');
  assert.equal(manifest.structure.questions['motorbike-q8'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['motorbike-q10'].correctAnswerId, 'a2');
  for (const locale of manifest.activeLocales as string[]) {
    const questions = read('motorbike', locale).stages['stage-1'].questions;
    assert.ok(questions['motorbike-q4'].answers.a4.trim(), locale);
    assert.ok(questions['motorbike-q5'].answers.a1.trim(), locale);
    assert.ok(questions['motorbike-q7'].answers.a3.trim(), locale);
    assert.ok(questions['motorbike-q8'].answers.a4.trim(), locale);
    assert.ok(questions['motorbike-q10'].answers.a2.trim(), locale);
  }
  assert.doesNotMatch(read('motorbike', 'hr').stages['stage-1'].questions['motorbike-q7'].question, /jahač/);
  assert.doesNotMatch(read('motorbike', 'fi').stages['stage-1'].questions['motorbike-q7'].question, /ratsastajan/);
  assert.doesNotMatch(read('motorbike', 'ro').stages['stage-1'].questions['motorbike-q7'].question, /călăreț/);
});
