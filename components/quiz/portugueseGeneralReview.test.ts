import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const families = [
  'actors', 'bible', 'cambridge', 'catholic', 'grammar', 'grossquiz', 'harvard',
  'historicalfigures', 'iq', 'italian', 'lovers', 'marry', 'obsolete', 'oxford',
  'personality', 'songs', 'word'
];
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const question = (slug: string, id: string) => read(slug, 'pt').stages['stage-1'].questions[id];

test('European Portuguese general quizzes retain ten questions and unambiguous answer labels', () => {
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    const questions = read(slug, 'pt').stages['stage-1'].questions;
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      const answerIds = Object.keys(questions[id].answers);
      assert.deepEqual(answerIds.sort(), Object.keys(read(slug, 'en').stages['stage-1'].questions[id].answers).sort(), `${slug}/${id}`);
      assert.equal(new Set(Object.values(questions[id].answers)).size, answerIds.length, `${slug}/${id}: duplicate answers`);
      const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
      if (correctAnswerId) {
        assert.ok(questions[id].answers[correctAnswerId], `${slug}/${id}: missing keyed answer`);
      }
    }
  }
});

test('high-risk European Portuguese meanings remain intact', () => {
  assert.equal(question('obsolete', 'obsolete-q9').answers.a2, 'Game Boy');
  assert.equal(question('obsolete', 'obsolete-q10').answers.a3, 'Castiçal de mão');
  assert.match(question('oxford', 'oxford-s4q3').answers.a4, /sala/);
  assert.match(question('marry', 'marry-r1q1').question, /possível par/);
  assert.match(read('marry', 'pt').results.profileReveal.eyebrow, /POSSÍVEL PAR/);
  assert.doesNotMatch(read('songs', 'pt').summary, /7%/);
});
