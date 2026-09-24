import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function loadQuiz(slug: string) {
  return JSON.parse(fs.readFileSync(`data/quizzes/${slug}/da.json`, 'utf8'));
}

test('Danish result profiles avoid the machine-literal review templates', () => {
  for (const entry of fs.readdirSync('data/quizzes', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = `data/quizzes/${entry.name}/da.json`;
    if (!fs.existsSync(path)) continue;
    const locale = JSON.parse(fs.readFileSync(path, 'utf8'));
    assert.doesNotMatch(JSON.stringify(locale.results?.profiles ?? {}), /Din anmeldelse|forbindelser du skal besøge igen|Denne udfordring introducerede nogle ukendte ideer|Standout|Systems Mastermind/iu, path);
  }
});

test('Danish motorcycle wet-weather question clearly asks about following distance', () => {
  const questions = loadQuiz('motorbike').stages['stage-1'].questions;
  assert.match(questions['motorbike-q3'].question, /afstanden til køretøjet foran/);
  assert.equal(questions['motorbike-q3'].answers.a3, 'Øge afstanden');
  assert.match(questions['motorbike-q5'].answers.a1, /Undgå blinde vinkler/);
});

test('Danish IQ quiz does not claim to measure intelligence', () => {
  const iq = loadQuiz('iq');
  assert.match(iq.about.body, /måler ikke din intelligens/);
  assert.match(iq.about.disclaimer, /ikke en standardiseret IQ-test/);
  assert.doesNotMatch(iq.about.body, /aptitude|verdensomspændende underholdningsudfordring/iu);
});

test('Danish OCD quiz does not mistake distress for emergency', () => {
  const ocd = loadQuiz('ocd');
  const questions = ocd.stages['stage-1'].questions;
  assert.match(ocd.about.body, /ikke, om du har OCD/);
  assert.match(ocd.results.profiles['profile-4'].copy, /betydeligt ubehag/);
  assert.match(questions['ocd-q9'].answers.a4, /stort ubehag/);
  assert.match(questions['ocd-q10'].answers.a4, /betydeligt ubehag/);
  assert.doesNotMatch(JSON.stringify(ocd), /forårsage nød|betydelig nød/iu);
});

test('Danish train quiz keeps braking and repeat-back safety explicit', () => {
  const questions = loadQuiz('train').stages['stage-1'].questions;
  assert.match(questions['train-q1'].answers.a1, /Brems efter forholdene/);
  assert.equal(questions['train-q3'].answers.a3, 'Den bliver længere');
  assert.match(questions['train-q8'].answers.a4, /få den bekræftet/);
});

test('Danish mechanic quiz keeps oil warning and jack support unambiguous', () => {
  const questions = loadQuiz('mechanic').stages['stage-1'].questions;
  assert.match(questions['mechanic-r1q1'].question, /oliekandesymbol/);
  assert.match(questions['mechanic-r5q6'].question, /kun oppe af en donkraft/);
  assert.match(questions['mechanic-r5q6'].answers.a1, /forsvarligt understøttet/);
});
