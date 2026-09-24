import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const quizRoot = 'data/quizzes';
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(path.join(quizRoot, slug, `${locale}.json`), 'utf8'));
const families = fs.readdirSync(quizRoot).filter(slug => fs.existsSync(path.join(quizRoot, slug, 'pl.json')));
const question = (slug: string, id: string) => read(slug, 'pl').stages['stage-1'].questions[id];

test('Polish questions preserve ten-question masters and answer-key identity', () => {
  assert.equal(families.length, 53);
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const en = read(slug, 'en');
    const pl = read(slug, 'pl');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(pl.stages['stage-1'].questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      const answers = pl.stages['stage-1'].questions[id].answers;
      const answerIds = Object.keys(answers);
      assert.deepEqual(answerIds.sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${slug}/${id}`);
      assert.equal(new Set(Object.values(answers)).size, answerIds.length, `${slug}/${id}: duplicate labels`);
      const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
      if (correctAnswerId) assert.ok(answers[correctAnswerId], `${slug}/${id}: missing keyed answer`);
    }
  }
});

test('Polish safety-critical terminology and results avoid known mistranslations', () => {
  assert.match(question('midwifery', 'mid-r3q2').question, /zaburzeniami widzenia/);
  assert.match(question('maculardegeneration', 'macular-q1').question, /znak/);
  assert.match(question('surgeon', 'surgeon-q3').answers.a3, /miejsce operacji/);
  assert.match(question('tools', 'tools-q10').question, /łaty do wyrównywania betonu/);
  assert.match(read('depression', 'pl').results.profiles['profile-4'].copy, /kryzysow/);
  assert.match(read('prostatetest', 'pl').results.profiles['profile-3'].copy, /pilnie szukaj pomocy medycznej/);
  for (const slug of families) {
    const profiles = JSON.stringify(read(slug, 'pl').results?.profiles ?? {});
    assert.doesNotMatch(profiles, /Twoja recenzja pokazuje, do których połączeń|Skorzystaj z przeglądu odpowiedzi, aby sprawdzić, co już wiesz|pomoc techniczna|hazardem|półfabrykaty/);
  }
});
