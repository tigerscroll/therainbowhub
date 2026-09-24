import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const quizRoot = 'data/quizzes';
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(path.join(quizRoot, slug, `${locale}.json`), 'utf8'));
const families = fs.readdirSync(quizRoot).filter(slug => fs.existsSync(path.join(quizRoot, slug, 'fr.json')));
const question = (slug: string, id: string) => read(slug, 'fr').stages['stage-1'].questions[id];

test('French questions preserve each ten-question master and answer-key identity', () => {
  assert.equal(families.length, 53);
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const en = read(slug, 'en');
    const fr = read(slug, 'fr');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(fr.stages['stage-1'].questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      const answers = fr.stages['stage-1'].questions[id].answers;
      const answerIds = Object.keys(answers);
      assert.deepEqual(answerIds.sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${slug}/${id}`);
      assert.equal(new Set(Object.values(answers)).size, answerIds.length, `${slug}/${id}: duplicate answer labels`);
      const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
      if (correctAnswerId) assert.ok(answers[correctAnswerId], `${slug}/${id}: missing keyed answer`);
    }
  }
});

test('French high-risk translations retain the intended question and result meaning', () => {
  assert.match(question('doctor', 'doctor-q7').question, /sepsis/i);
  assert.match(question('flightattendant', 'flightattendant-q8').answers.a4, /combustible/);
  assert.match(question('ocd', 'ocd-q6').question, /vous rassurer/);
  assert.match(question('maculardegeneration', 'macular-q1').question, /lettre/);
  assert.notEqual(question('lovers', 'lovers-q5').question, question('lovers', 'lovers-q6').question);
  assert.match(read('memory', 'fr').results.profiles['profile-3'].copy, /fin du défi/);
  assert.doesNotMatch(read('mechanic', 'fr').results.profiles['profile-2'].copy, /emplois|panneaux d'avertissement/);
  for (const slug of families) {
    assert.doesNotMatch(JSON.stringify(read(slug, 'fr').results?.profiles ?? {}), /Votre avis montre les connexions à revoir|Utilisez la révision des réponses pour explorer ce que vous saviez/);
  }
});
