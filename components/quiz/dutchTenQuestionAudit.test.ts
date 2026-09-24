import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const quizRoot = 'data/quizzes';
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(path.join(quizRoot, slug, `${locale}.json`), 'utf8'));
const families = fs.readdirSync(quizRoot).filter(slug => fs.existsSync(path.join(quizRoot, slug, 'nl.json')));
const question = (slug: string, id: string) => read(slug, 'nl').stages['stage-1'].questions[id];

test('Dutch questions preserve the ten-question masters and answer-key identity', () => {
  assert.equal(families.length, 53);
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const en = read(slug, 'en');
    const nl = read(slug, 'nl');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(nl.stages['stage-1'].questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      const answers = nl.stages['stage-1'].questions[id].answers;
      const answerIds = Object.keys(answers);
      assert.deepEqual(answerIds.sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${slug}/${id}`);
      assert.equal(new Set(Object.values(answers)).size, answerIds.length, `${slug}/${id}: duplicate labels`);
      const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
      if (correctAnswerId) assert.ok(answers[correctAnswerId], `${slug}/${id}: missing keyed answer`);
    }
  }
});

test('Dutch high-risk translations retain their meaning and avoid broken result templates', () => {
  assert.match(question('oxford', 'oxford-s1q6').question, /£24/);
  assert.match(question('midwifery', 'mid-r3q2').answers.a4, /verloskundige of arts/);
  assert.match(question('midwifery', 'mid-r7q3').answers.a4, /bevoegde zorgverlener/);
  assert.match(question('maculardegeneration', 'macular-q1').question, /teken/);
  assert.match(question('nun', 'nun-q9').question, /professie/);
  assert.match(question('paramedic', 'paramedic-r1q4').question, /stroomvoerende kabel/);
  assert.match(question('tools', 'tools-q10').question, /afreibalk/);
  assert.match(read('depression', 'nl').about.disclaimer, /geen diagnostische test/);
  assert.match(read('ocd', 'nl').about.disclaimer, /niet bevestigen of uitsluiten/);
  for (const slug of families) {
    const profiles = JSON.stringify(read(slug, 'nl').results?.profiles ?? {});
    assert.doesNotMatch(profiles, /Uit uw beoordeling blijkt welke verbindingen u opnieuw moet bekijken|Gebruik de antwoordenoverzicht om te ontdekken wat u wist/);
  }
});
