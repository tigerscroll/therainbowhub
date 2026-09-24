import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Norwegian quiz profiles use answer-review language rather than machine-literal review copy', () => {
  for (const entry of fs.readdirSync('data/quizzes', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = `data/quizzes/${entry.name}/nb.json`;
    if (!fs.existsSync(path)) continue;
    const locale = JSON.parse(fs.readFileSync(path, 'utf8'));
    assert.doesNotMatch(JSON.stringify(locale), /anmeldelse|besøke på nytt|The Service Bay/iu, path);
  }
});

test('Norwegian Train wording keeps rail safety and confirmed communication clear', () => {
  const train = JSON.parse(fs.readFileSync('data/quizzes/train/nb.json', 'utf8'));
  const questions = train.stages['stage-1'].questions;
  assert.match(questions['train-q3'].question, /bremselengden/);
  assert.equal(questions['train-q3'].answers.a3, 'Den øker');
  assert.equal(questions['train-q8'].headerLabel, 'BEKREFTET KOMMUNIKASJON');
  assert.equal(questions['train-q10'].headerLabel, 'SISTE SIKKERHETSVURDERING');
});

test('Norwegian mood check remains understandable and non-diagnostic', () => {
  const mood = JSON.parse(fs.readFileSync('data/quizzes/depression/nb.json', 'utf8'));
  assert.match(mood.about.disclaimer, /ikke en diagnostisk test/);
  assert.match(mood.about.disclaimer, /nødetater eller en krisetjeneste/);
  assert.equal(mood.stages['stage-1'].questions['depression-q9'].headerLabel, 'SOSIAL TILBAKETREKNING');
  assert.doesNotMatch(JSON.stringify(mood), /STEMNINGSSAMMENFATNING|NYDE|MERKbar|PACE OG/);
});

test('Norwegian OCD check distinguishes reassurance from insurance and keeps urgent advice', () => {
  const ocd = JSON.parse(fs.readFileSync('data/quizzes/ocd/nb.json', 'utf8'));
  const questions = ocd.stages['stage-1'].questions;
  assert.equal(questions['ocd-q6'].headerLabel, 'BEHOV FOR BEKREFTELSE');
  assert.equal(questions['ocd-q8'].headerLabel, 'MIDLERTIDIG LETTELSE');
  assert.match(ocd.about.disclaimer, /ikke en diagnostisk test/);
  assert.match(ocd.about.disclaimer, /Søk akutt hjelp lokalt/);
  assert.doesNotMatch(JSON.stringify(ocd), /FORSIKRING|UNNGÅNG|LITTELSE|MERKbar/);
});

test('Norwegian Mechanic preserves oil-warning and jack-safety meaning', () => {
  const mechanic = JSON.parse(fs.readFileSync('data/quizzes/mechanic/nb.json', 'utf8'));
  const questions = mechanic.stages['stage-1'].questions;
  assert.match(questions['mechanic-r1q1'].question, /oljekannesymbol/);
  assert.match(questions['mechanic-r3q3'].question, /Den ene lyser, den andre ikke/);
  assert.match(questions['mechanic-r5q6'].answers.a1, /Ikke gå under bilen før den er sikret/);
});

test('Norwegian Motorbike keeps visibility, following distance and passenger safety clear', () => {
  const motorbike = JSON.parse(fs.readFileSync('data/quizzes/motorbike/nb.json', 'utf8'));
  const questions = motorbike.stages['stage-1'].questions;
  assert.match(questions['motorbike-q3'].question, /avstanden til kjøretøyet foran/);
  assert.match(questions['motorbike-q5'].answers.a1, /Unngå blindsoner/);
  assert.match(questions['motorbike-q6'].question, /når motorsykkelen har en passasjer/);
  assert.match(motorbike.about.disclaimer, /ikke en offisiell førerprøve/);
});
