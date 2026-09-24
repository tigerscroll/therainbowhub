import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales = 'ar bg cs da de el en es fi fil fr he hr hu id it ja ms nb nl pl pt ro sk sr sv th tr uk vi'.split(' ');
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const normalize = (value: string, locale: string) => value.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');

test('Alzheimer memory quiz and Treatments keep ten distinct keyed questions in every locale', () => {
  for (const slug of ['alzheimers', 'treatments']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    const files = fs.readdirSync(`data/quizzes/${slug}`).filter(name => /^[a-z]{2,3}\.json$/.test(name)).map(name => name.slice(0, -5));
    assert.deepEqual(files.sort(), [...locales].sort(), slug);
    for (const locale of locales) {
      const copy = read(slug, locale);
      const questions = copy.stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      assert.ok(copy.about.disclaimer.trim().length > 60, `${slug}/${locale}: missing health disclaimer`);
      for (const id of ids) {
        const question = questions[id];
        assert.ok(question.question.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(question.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(question.answers).map((answer: any) => normalize(answer.trim(), locale))).size, 4, `${slug}/${locale}/${id}: duplicate choices`);
        assert.ok(question.answers[manifest.structure.questions[id].correctAnswerId]?.trim(), `${slug}/${locale}/${id}: keyed answer missing`);
      }
    }
  }
});

test('Alzheimer immediate and delayed recall stay aligned with the studied stimuli', () => {
  const manifest = read('alzheimers', 'quiz');
  assert.equal(manifest.structure.questions['alzheimers-q1'].correctAnswerId, 'a1');
  assert.equal(manifest.structure.questions['alzheimers-q5'].correctAnswerId, 'a2');
  assert.equal(manifest.structure.questions['alzheimers-q7'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['alzheimers-q9'].correctAnswerId, 'a2');
  assert.equal(manifest.structure.questions['alzheimers-q10'].correctAnswerId, 'a1');
  for (const locale of locales) {
    const q = read('alzheimers', locale).stages['stage-1'].questions;
    const first = q['alzheimers-q1'];
    const objects = q['alzheimers-q5'];
    assert.equal(first.study.items.length, 5, locale);
    assert.equal(new Set(first.study.items.map((word: string) => normalize(word, locale))).size, 5, locale);
    assert.equal(normalize(first.study.items[3], locale), normalize(first.answers.a1, locale), `${locale}: fourth word`);
    assert.equal(normalize(first.study.items[0], locale), normalize(q['alzheimers-q9'].answers.a2, locale), `${locale}: delayed first word`);
    assert.deepEqual(objects.study.items, ['☂️', '🕯️', '👟', '🍎'], locale);
    assert.equal(normalize(objects.answers.a3, locale), normalize(q['alzheimers-q10'].answers.a1, locale), `${locale}: delayed third object`);
  }
});

test('Reviewed Treatments wording does not revert to medically misleading translation', () => {
  const q = (locale: string, id: string) => read('treatments', locale).stages['stage-1'].questions[id];
  assert.match(q('tr', 'treatments-r4q1').question, /Bilişsel davranışçı terapi \(BDT\)/);
  assert.doesNotMatch(q('tr', 'treatments-r4q1').question, /TCMB/);
  assert.match(q('he', 'treatments-r3q1').answers.a1, /תרופות.*קרינה/);
  assert.match(q('ja', 'treatments-r2q2').question, /どのような働き/);
  assert.match(q('id', 'treatments-r1q2').question, /^Praktik/);
  assert.match(q('ro', 'treatments-r4q1').question, /terapia cognitiv-comportamentală/);
  for (const locale of ['cs', 'el', 'he', 'hr', 'hu', 'id', 'ms', 'pl', 'ro', 'sk', 'sr', 'tr', 'uk']) {
    const insulin = q(locale, 'treatments-r2q2');
    assert.ok(insulin.answers.a1.trim(), `${locale}: insulin answer missing`);
    assert.equal(new Set(Object.values(insulin.answers)).size, 4, `${locale}: insulin choices duplicated`);
  }
  assert.match(read('alzheimers', 'en').about.disclaimer, /cannot diagnose Alzheimer's disease/);
  assert.match(read('alzheimers', 'en').results.score.disclaimer, /cannot diagnose or rule out/);
});
