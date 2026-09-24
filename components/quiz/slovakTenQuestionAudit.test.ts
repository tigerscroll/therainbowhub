import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const quizRoot = 'data/quizzes';
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(path.join(quizRoot, slug, `${locale}.json`), 'utf8'));
const families = fs.readdirSync(quizRoot).filter(slug => fs.existsSync(path.join(quizRoot, slug, 'sk.json')));
const question = (slug: string, id: string) => read(slug, 'sk').stages['stage-1'].questions[id];

test('Slovak questions preserve the ten-question masters and keyed answers', () => {
  assert.equal(families.length, 53);
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const en = read(slug, 'en');
    const sk = read(slug, 'sk');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(sk.stages['stage-1'].questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      const answers = sk.stages['stage-1'].questions[id].answers;
      const answerIds = Object.keys(answers);
      assert.deepEqual(answerIds.sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${slug}/${id}`);
      assert.equal(new Set(Object.values(answers)).size, answerIds.length, `${slug}/${id}: duplicate labels`);
      const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
      if (correctAnswerId) assert.ok(answers[correctAnswerId], `${slug}/${id}: missing keyed answer`);
    }
  }
});

test('Slovak safety-sensitive content avoids known literal mistranslations', () => {
  assert.match(question('maculardegeneration', 'macular-q1').question, /znak/);
  assert.match(question('midwifery', 'mid-r3q2').question, /poruchami videnia/);
  assert.match(question('pilot', 'pilot-q5').question, /bezpečnostná rezerva/);
  assert.match(question('surgeon', 'surgeon-q3').answers.a3, /miesto operácie/);
  assert.match(question('tools', 'tools-q10').question, /sťahovacia lata/);
  assert.match(read('prostatetest', 'sk').results.profiles['profile-3'].copy, /neodkladnú pomoc/);
  assert.match(read('lovers', 'sk').about.body, /desiatimi otázkami/);
  for (const slug of families) {
    const profiles = JSON.stringify(read(slug, 'sk').results?.profiles ?? {});
    assert.doesNotMatch(profiles, /Vaša recenzia ukazuje, ktoré spojenia|Pomocou prehľadu odpovedí preskúmajte|Prijímacia skúška Standout|Vynikajúce pôrodné centrum/);
  }
});
