import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales = 'ar bg cs da de el en es fi fil fr he hr hu id it ja ms nb nl pl pt ro sk sr sv th tr uk vi'.split(' ');
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Bible, Catholic, and Nun retain thirty complete ten-question locale packs', () => {
  for (const slug of ['bible', 'catholic', 'nun']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.deepEqual([...manifest.activeLocales].sort(), [...locales].sort(), slug);
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const item = questions[id];
        assert.ok(item.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers).map((value: any) => value.trim().toLocaleLowerCase(locale))).size, 4, `${slug}/${locale}/${id}: duplicate answers`);
        assert.ok(item.answers[manifest.structure.questions[id].correctAnswerId]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
      }
    }
  }
});

test('Religious-question qualifiers and fixed counts remain attached to the keyed answers', () => {
  const bible = read('bible', 'quiz');
  const catholic = read('catholic', 'quiz');
  const nun = read('nun', 'quiz');
  assert.equal(bible.structure.questions['bible-q6'].correctAnswerId, 'a3');
  assert.equal(catholic.structure.questions['catholic-q5'].correctAnswerId, 'a1');
  assert.equal(nun.structure.questions['nun-q9'].correctAnswerId, 'a1');
  for (const locale of locales) {
    assert.match(read('bible', locale).stages['stage-1'].questions['bible-q6'].question, /150/, locale);
    assert.match(read('catholic', locale).stages['stage-1'].questions['catholic-q5'].question, /2002/, locale);
  }
  assert.match(read('bible', 'en').stages['stage-1'].questions['bible-q6'].question, /most Christian traditions/);
  assert.match(read('catholic', 'en').stages['stage-1'].questions['catholic-q1'].question, /Roman Rite/);
  assert.match(read('catholic', 'en').stages['stage-1'].questions['catholic-q9'].question, /Roman Rite/);
});

test('Reviewed Nun terminology preserves vows, contemplative enclosure, and active ministry', () => {
  const q = (locale: string, id: string) => read('nun', locale).stages['stage-1'].questions[id];
  assert.match(q('ja', 'nun-q1').answers.a1, /清貧、貞潔、従順/);
  assert.match(q('ja', 'nun-q8').answers.a4, /観想的な生活/);
  assert.match(q('hu', 'nun-q8').answers.a4, /szemlélődő életre/);
  assert.match(q('th', 'nun-q8').answers.a4, /ภายในอาราม/);
  assert.match(q('tr', 'nun-q9').answers.a1, /dinî yeminlerin/);
  assert.doesNotMatch(q('tr', 'nun-q9').answers.a1, /ayinlerin/);
  assert.match(q('ro', 'nun-q9').answers.a1, /voturilor călugărești/);
  assert.doesNotMatch(q('ms', 'nun-q10').answers.a2, /kementerian/);
  assert.doesNotMatch(q('de', 'nun-q10').answers.a2, /Dienst oder Dienst/);
});
