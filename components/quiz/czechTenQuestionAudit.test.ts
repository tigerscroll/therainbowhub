import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const quizRoot = 'data/quizzes';
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(path.join(quizRoot, slug, `${locale}.json`), 'utf8'));
const families = fs.readdirSync(quizRoot).filter(slug => fs.existsSync(path.join(quizRoot, slug, 'cs.json')));
const question = (slug: string, id: string) => read(slug, 'cs').stages['stage-1'].questions[id];

test('Czech questions preserve the ten-question masters and keyed answer identities', () => {
  assert.equal(families.length, 53);
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const en = read(slug, 'en');
    const cs = read(slug, 'cs');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(cs.stages['stage-1'].questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      const answers = cs.stages['stage-1'].questions[id].answers;
      const answerIds = Object.keys(answers);
      assert.deepEqual(answerIds.sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${slug}/${id}`);
      assert.equal(new Set(Object.values(answers)).size, answerIds.length, `${slug}/${id}: duplicate labels`);
      const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
      if (correctAnswerId) assert.ok(answers[correctAnswerId], `${slug}/${id}: missing keyed answer`);
    }
  }
});

test('Czech safety-sensitive wording and result copy avoid known literal errors', () => {
  assert.match(question('maculardegeneration', 'macular-q1').question, /znak/);
  assert.match(question('midwifery', 'mid-r3q2').question, /poruchami vidění/);
  assert.match(question('pilot', 'pilot-q5').question, /bezpečnostní rezerva/);
  assert.match(question('surgeon', 'surgeon-q3').answers.a3, /místo operace/);
  assert.match(question('tools', 'tools-q10').question, /stahovací lať/);
  assert.match(read('prostatetest', 'cs').results.profiles['profile-3'].copy, /neodkladnou pomoc/);
  for (const slug of families) {
    const profiles = JSON.stringify(read(slug, 'cs').results?.profiles ?? {});
    assert.doesNotMatch(profiles, /Vaše recenze ukazuje, která spojení|Pomocí recenze odpovědí prozkoumejte|Přijímací zkouška Standout|Porodní centrum Standout/);
  }
});
