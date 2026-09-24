import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales = 'ar bg cs da de el en es fi fil fr he hr hu id it ja ms nb nl pl pt ro sk sr sv th tr uk vi'.split(' ');
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Anatomy and Dentist keep all thirty locales and ten distinct keyed questions', () => {
  for (const slug of ['anatomy', 'dentist']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.deepEqual([...manifest.activeLocales].sort(), [...locales].sort(), slug);
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales) {
      const copy = read(slug, locale);
      const questions = copy.stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const item = questions[id];
        assert.ok(item.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers).map((answer: any) => answer.trim().toLocaleLowerCase(locale))).size, 4, `${slug}/${locale}/${id}: duplicate answers`);
        assert.ok(item.answers[manifest.structure.questions[id].correctAnswerId]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
      }
    }
  }
});

test('Anatomy and dental counts retain the qualifiers that make the keyed values true', () => {
  const anatomy = read('anatomy', 'quiz');
  const dentist = read('dentist', 'quiz');
  assert.equal(anatomy.structure.questions['anatomy-q1'].correctAnswerId, 'a1');
  assert.equal(anatomy.structure.questions['anatomy-q10'].correctAnswerId, 'a2');
  assert.equal(anatomy.structure.questions['anatomy-q6'].correctAnswerId, 'a2');
  assert.equal(dentist.structure.questions['dentist-q1'].correctAnswerId, 'a1');
  assert.equal(dentist.structure.questions['dentist-q4'].correctAnswerId, 'a4');
  for (const locale of locales) {
    const anatomyQuestions = read('anatomy', locale).stages['stage-1'].questions;
    const dentalQuestions = read('dentist', locale).stages['stage-1'].questions;
    assert.equal(anatomyQuestions['anatomy-q6'].answers.a2, '206', locale);
    assert.equal(dentalQuestions['dentist-q1'].answers.a1, '32', locale);
    assert.equal(dentalQuestions['dentist-q4'].answers.a4, '20', locale);
    assert.equal(new Set(['a1', 'a2', 'a3', 'a4'].map(id => dentalQuestions['dentist-q1'].answers[id])).size, 4, locale);
  }
  assert.match(read('dentist', 'en').stages['stage-1'].questions['dentist-q1'].question, /all four third molars/);
  assert.match(read('anatomy', 'en').stages['stage-1'].questions['anatomy-q10'].question, /solid internal organ/);
});

test('Reviewed tooth and nerve translations retain their clinical meaning', () => {
  const q = (locale: string, id: string) => read('dentist', locale).stages['stage-1'].questions[id];
  assert.match(q('el', 'dentist-q4').question, /νεογιλά δόντια/);
  assert.doesNotMatch(q('el', 'dentist-q4').question, /δημοτικά δόντια/);
  assert.match(q('da', 'dentist-q4').question, /mælketænder/);
  assert.match(q('fi', 'dentist-q4').question, /maitohammasta/);
  assert.match(q('id', 'dentist-q4').question, /gigi susu/);
  assert.match(q('nb', 'dentist-q4').question, /melketenner/);
  assert.match(q('sv', 'dentist-q4').question, /mjölktänder/);
  assert.match(q('th', 'dentist-q4').question, /ฟันน้ำนม.*ครบชุด/);
  assert.match(q('th', 'dentist-q2').question, /เหนือเหงือก/);
  assert.match(q('th', 'dentist-q8').question, /กระดูกเบ้าฟัน/);
  assert.doesNotMatch(q('th', 'dentist-q8').question, /กระดูกถุงลม/);
  assert.match(q('th', 'dentist-q10').question, /เส้นประสาทสมองคู่ใด/);
  assert.match(q('ro', 'dentist-q1').question, /molari de minte/);
});
