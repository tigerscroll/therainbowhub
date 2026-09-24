import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const families = [
  'airforce', 'anatomy', 'barrister', 'chef', 'dentist', 'doctor',
  'firefighter', 'flightattendant', 'mechanic', 'medical', 'midwifery', 'motorbike'
];
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const question = (slug: string, id: string) => read(slug, 'pt').stages['stage-1'].questions[id];

test('European Portuguese professional quizzes retain ten questions and keyed answers', () => {
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    const questions = read(slug, 'pt').stages['stage-1'].questions;
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      assert.deepEqual(Object.keys(questions[id].answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${id}`);
      assert.equal(new Set(Object.values(questions[id].answers)).size, 4, `${slug}/${id}: duplicate answers`);
      assert.ok(questions[id].answers[manifest.structure.questions[id].correctAnswerId], `${slug}/${id}: missing keyed answer`);
    }
  }
});

test('European Portuguese technical terms preserve the intended meanings', () => {
  assert.match(question('anatomy', 'anatomy-q2').question, /câmaras/);
  assert.match(question('chef', 'chef-r1q2').answers.a3, /natas/);
  assert.match(question('dentist', 'dentist-q6').question, /placa bacteriana/);
  assert.match(question('dentist', 'dentist-q10').answers.a2, /trigémeo/);
  assert.match(question('doctor', 'doctor-q7').answers.a3, /põe a vida em risco/);
  assert.match(question('medical', 'medical-q5').answers.a1, /Ácida/);
  assert.match(question('firefighter', 'firefighter-s5q6').question, /lanternas/);
  assert.match(question('firefighter', 'firefighter-s5q6').visual.ariaLabel, /lanternas/);
  assert.match(question('flightattendant', 'flightattendant-q6').answers.a2, /equipa/);
  assert.match(question('mechanic', 'mechanic-r3q4').question, /líquido de arrefecimento/);
  assert.match(question('mechanic', 'mechanic-r4q4').answers.a1, /líquido de arrefecimento/);
  assert.doesNotMatch(JSON.stringify(read('mechanic', 'pt')), /refrigerante|frenagem|freio/);
  assert.match(question('motorbike', 'motorbike-q6').answers.a2, /distância de travagem/);
});
