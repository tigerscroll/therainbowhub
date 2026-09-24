import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const locales = (slug: string) => fs.readdirSync(`data/quizzes/${slug}`).filter((name) => /^[a-z]{2,3}\.json$/.test(name)).map((name) => name.slice(0, -5));

test('Train and Tools retain ten keyed questions in the same 30 locales', () => {
  const expectedLocales = locales('train');
  assert.equal(expectedLocales.length, 30);
  assert.deepEqual(locales('tools'), expectedLocales);
  for (const slug of ['train', 'tools']) {
    const manifest = read(slug, 'quiz');
    assert.equal(manifest.structure.stages.length, 1, slug);
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of expectedLocales) {
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

test('Train safety decisions remain keyed, with reviewed track and braking terms', () => {
  const manifest = read('train', 'quiz');
  assert.equal(manifest.structure.questions['train-q1'].correctAnswerId, 'a1');
  assert.equal(manifest.structure.questions['train-q4'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['train-q8'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['train-q10'].correctAnswerId, 'a2');
  assert.match(read('train', 'el').stages['stage-1'].questions['train-q4'].question, /σιδηροδρομική γραμμή/);
  assert.match(read('train', 'pt').stages['stage-1'].questions['train-q1'].answers.a1, /sistema de paragem/);
});

test('Concrete tool images and corrected mixer semantics remain aligned', () => {
  const manifest = read('tools', 'quiz');
  const ids = manifest.structure.stages[0].questionIds as string[];
  for (const id of ids) {
    const imagePath = manifest.structure.questions[id].image.src.replace(/^\//, '');
    assert.ok(fs.existsSync(`public/${imagePath}`) || fs.existsSync(`data/${imagePath}`), `${id}: image missing`);
  }
  assert.equal(manifest.structure.questions['tools-q5'].correctAnswerId, 'a3');
  assert.equal(manifest.structure.questions['tools-q7'].correctAnswerId, 'a2');
  assert.equal(manifest.structure.questions['tools-q9'].correctAnswerId, 'a2');
  assert.doesNotMatch(read('tools', 'en').stages['stage-1'].questions['tools-q5'].answers.a3, /cement, sand, and water into concrete/);
  assert.match(read('tools', 'hu').stages['stage-1'].questions['tools-q7'].answers.a2, /légbuborékok/);
  const q9 = (locale: string) => read('tools', locale).stages['stage-1'].questions['tools-q9'].answers.a2 as string;
  assert.match(q9('cs'), /smršťovacích spár/);
  assert.match(q9('da'), /svindfuger/);
  assert.match(q9('de'), /Scheinfugen/);
  assert.match(q9('fr'), /joints de retrait/);
  assert.match(q9('nl'), /krimpvoegen/);
  assert.match(q9('ro'), /rosturi de contracție/);
  assert.match(q9('th'), /ร่องควบคุมแนวการแตกร้าว/);
  assert.match(q9('vi'), /rãnh kiểm soát vết nứt/);
});
