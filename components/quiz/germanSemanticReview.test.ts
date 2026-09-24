import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function loadQuiz(slug: string) {
  return JSON.parse(fs.readFileSync(`data/quizzes/${slug}/de.json`, 'utf8'));
}

test('German mechanic copy has no untranslated workshop placeholder', () => {
  const mechanic = loadQuiz('mechanic');
  const text = JSON.stringify(mechanic);
  assert.doesNotMatch(text, /Service Bay|Workshop-Herausforderung/);
  assert.match(mechanic.results.profiles['profile-6'].copy, /Werkstattfragen/);
});

test('German OCD wording distinguishes ordering and reassurance', () => {
  const ocd = loadQuiz('ocd');
  const questions = ocd.stages['stage-1'].questions;
  assert.match(ocd.about.body, /Einholen von Bestätigung/);
  assert.match(questions['ocd-q3'].answers.a3, /Bestätigung/);
  assert.match(questions['ocd-q4'].answers.a3, /ordne Dinge neu/);
  assert.doesNotMatch(JSON.stringify(ocd), /Rückversicherung|Service Bay|ERSCHEINBAR/);
});

test('German health checks retain cautious result and urgent-help wording', () => {
  const depression = loadQuiz('depression');
  const prostate = loadQuiz('prostatetest');
  assert.equal(depression.stages['stage-1'].questions['depression-q1'].answers.a3, 'An mehr als der Hälfte der Tage');
  assert.match(depression.results.profiles['profile-4'].copy, /örtlichen Notruf oder einen Krisendienst/);
  assert.match(prostate.results.profiles['profile-1'].copy, /schließt Prostatakrebs nicht aus/);
  assert.match(prostate.results.profiles['profile-3'].copy, /Suchen Sie dringend medizinische Hilfe/);
});

test('German practical safety answer meanings remain explicit', () => {
  const motorbike = loadQuiz('motorbike').stages['stage-1'].questions;
  const flight = loadQuiz('flightattendant').stages['stage-1'].questions;
  assert.match(motorbike['motorbike-q3'].answers.a3, /größer/);
  assert.match(motorbike['motorbike-q4'].answers.a4, /Beide Bremsen/);
  assert.match(flight['flightattendant-q3'].answers.a3, /eigene Sauerstoffmaske/);
  assert.match(flight['flightattendant-q4'].answers.a4, /Gepäck zurück/);
});

test('German entertainment results avoid visible English placeholders', () => {
  const lovers = loadQuiz('lovers');
  const gross = loadQuiz('grossquiz');
  const actors = loadQuiz('actors');
  assert.doesNotMatch(JSON.stringify(lovers.results), /Lover-Count|Wildcard|Platzhalter|11–20 Liebende/);
  assert.doesNotMatch(JSON.stringify(gross.results), /Biohazard/);
  assert.equal(actors.results.profiles['profile-5'].title, 'Der Kino-Neuling');
});
