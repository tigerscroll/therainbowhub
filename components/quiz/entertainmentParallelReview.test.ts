import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve('data/quizzes');
const locales = ['ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fil', 'fr', 'he', 'hr', 'hu', 'id', 'it', 'ja', 'ms', 'nb', 'nl', 'pl', 'pt', 'ro', 'sk', 'sr', 'sv', 'th', 'tr', 'uk', 'vi'];
const families = ['actors', 'historicalfigures', 'songs'];

function read(family: string, file: string): any {
  return JSON.parse(fs.readFileSync(path.join(root, family, file), 'utf8'));
}

for (const family of families) {
  test(`${family}: all 30 locales retain ten questions and the scored answer IDs`, () => {
    const manifest = read(family, 'quiz.json');
    const ids = manifest.structure.stages.flatMap((stage: any) => stage.questionIds);
    assert.equal(ids.length, 10);
    assert.equal(new Set(ids).size, 10);
    assert.deepEqual(fs.readdirSync(path.join(root, family)).filter((file) => /^[a-z]{2,3}\.json$/.test(file)).map((file) => file.slice(0, -5)).sort(), [...locales].sort());
    const en = read(family, 'en.json');
    for (const id of ids) {
      const scoring = manifest.structure.questions[id];
      assert.ok(scoring.answerIds.includes(scoring.correctAnswerId), `${family}/${id}: invalid correct answer`);
      assert.equal(scoring.answerIds.length, 4, `${family}/${id}: answer count`);
      if (scoring.image) assert.ok(fs.existsSync(path.resolve('public', scoring.image.src.slice(1))), `${family}/${id}: missing image`);
    }
    for (const locale of locales) {
      const questions = read(family, `${locale}.json`).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${family}/${locale}: question IDs`);
      for (const id of ids) {
        const answers = questions[id].answers;
        assert.deepEqual(Object.keys(answers).sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${family}/${locale}/${id}: answer IDs`);
        assert.ok(questions[id].question.trim(), `${family}/${locale}/${id}: blank prompt`);
        assert.equal(new Set(Object.values(answers)).size, 4, `${family}/${locale}/${id}: duplicate answer text`);
      }
    }
  });
}

test('songs: English song titles and answer words remain unchanged in every locale', () => {
  const en = read('songs', 'en.json').stages['stage-1'].questions;
  const manifest = read('songs', 'quiz.json');
  for (const locale of locales) {
    const questions = read('songs', `${locale}.json`).stages['stage-1'].questions;
    for (const [id, original] of Object.entries<any>(en)) {
      const title = original.question.match(/“([^”]+)”/)?.[1];
      assert.ok(title && questions[id].question.includes(title), `songs/${locale}/${id}: title fragment changed`);
      assert.deepEqual(questions[id].answers, original.answers, `songs/${locale}/${id}: original song words changed`);
      assert.equal(questions[id].image, undefined, `songs/${locale}/${id}: misleading or answer-revealing image`);
      assert.equal(manifest.structure.questions[id].image, undefined, `songs/${id}: misleading or answer-revealing image source`);
    }
  }
});

test('historical figures: corrected proper names remain names, not literal translations or inflected phrases', () => {
  const examples: Record<string, Record<string, string>> = {
    pl: { 'historicalfigures-q1': 'Abraham Lincoln', 'historicalfigures-q8': 'Florence Nightingale' },
    pt: { 'historicalfigures-q1': 'Abraham Lincoln', 'historicalfigures-q5': 'Nikola Tesla' },
    tr: { 'historicalfigures-q1': 'Abraham Lincoln', 'historicalfigures-q8': 'Florence Nightingale' },
  };
  for (const [locale, expected] of Object.entries(examples)) {
    const questions = read('historicalfigures', `${locale}.json`).stages['stage-1'].questions;
    for (const [id, name] of Object.entries(expected)) assert.ok(Object.values(questions[id].answers).includes(name), `${locale}/${id}: ${name}`);
  }
});
