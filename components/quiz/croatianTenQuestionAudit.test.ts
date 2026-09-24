import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const quizRoot = 'data/quizzes';
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(path.join(quizRoot, slug, `${locale}.json`), 'utf8'));
const families = fs.readdirSync(quizRoot).filter(slug => fs.existsSync(path.join(quizRoot, slug, 'hr.json')));
const question = (slug: string, id: string) => read(slug, 'hr').stages['stage-1'].questions[id];

test('Croatian questions preserve all ten master IDs and keyed answer IDs', () => {
  assert.equal(families.length, 53);
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const en = read(slug, 'en');
    const hr = read(slug, 'hr');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(hr.stages['stage-1'].questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      const answers = hr.stages['stage-1'].questions[id].answers;
      const answerIds = Object.keys(answers);
      assert.deepEqual(answerIds.sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${slug}/${id}`);
      assert.equal(new Set(Object.values(answers)).size, answerIds.length, `${slug}/${id}: duplicate labels`);
      const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
      if (correctAnswerId) assert.ok(answers[correctAnswerId], `${slug}/${id}: missing keyed answer`);
    }
  }
});

test('Croatian safety-critical wording avoids known mistranslations', () => {
  for (const id of ['prostate-test-q2', 'prostate-test-q4', 'prostate-test-q5', 'prostate-test-q6', 'prostate-test-q7', 'prostate-test-q8']) {
    assert.equal(question('prostatetest', id).answers.a1, 'Ne');
  }
  assert.match(question('midwifery', 'mid-r3q2').question, /smetnje vida/);
  assert.match(question('midwifery', 'mid-r3q2').answers.a4, /Odmah zatražiti procjenu/);
  assert.match(question('mechanic', 'mechanic-r5q6').answers.a1, /Ne ulaziti ispod auta/);
  assert.match(question('motorbike', 'motorbike-q3').question, /razmak od vozila ispred/);
  assert.match(question('pilot', 'pilot-q5').question, /sigurnosna se rezerva/);
  assert.match(question('surgeon', 'surgeon-q7').answers.a3, /iscjedak iz rane/);
  assert.match(question('tools', 'tools-q6').question, /gladilica za beton/);
  assert.match(question('police', 'police-q4').question, /lanca čuvanja dokaza/);
  assert.match(read('maculardegeneration', 'hr').about.body, /odmah zatražite stručnu procjenu vida/);
  assert.match(read('depression', 'hr').results.profiles['profile-4'].copy, /odmah se obratite hitnoj službi/);
});

test('Croatian result profiles do not retain the recurring mistranslated template', () => {
  for (const slug of families) {
    const profiles = JSON.stringify(read(slug, 'hr').results?.profiles ?? {});
    assert.doesNotMatch(profiles, /Vaša recenzija pokazuje koje veze|Koristite pregled odgovora da istražite|Calm rješavač incidenata|Prirodno dojenje|Sposobna ruka na web mjestu/);
  }
});
