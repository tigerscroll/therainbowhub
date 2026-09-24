import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Swedish quiz copy uses answer-review language rather than machine-literal recension', () => {
  for (const entry of fs.readdirSync('data/quizzes', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = `data/quizzes/${entry.name}/sv.json`;
    if (!fs.existsSync(path)) continue;
    const locale = JSON.parse(fs.readFileSync(path, 'utf8'));
    assert.doesNotMatch(JSON.stringify(locale), /recension|besöka igen/iu, path);
  }
});

test('Swedish Train safety headings describe reasoning and confirmed communication', () => {
  const train = JSON.parse(fs.readFileSync('data/quizzes/train/sv.json', 'utf8'));
  const questions = train.stages['stage-1'].questions;
  assert.equal(questions['train-q7'].headerLabel, 'MEKANISKT RESONEMANG');
  assert.equal(questions['train-q8'].headerLabel, 'BEKRÄFTAD KOMMUNIKATION');
  assert.equal(questions['train-q10'].headerLabel, 'SISTA SÄKERHETSBESLUTET');
});

test('Swedish mental-health self-checks preserve non-diagnostic safety and reassurance meaning', () => {
  const depression = JSON.parse(fs.readFileSync('data/quizzes/depression/sv.json', 'utf8'));
  const ocd = JSON.parse(fs.readFileSync('data/quizzes/ocd/sv.json', 'utf8'));
  assert.match(depression.about.disclaimer, /inte ett diagnostiskt test/);
  assert.match(depression.about.disclaimer, /lokal akutsjukvård eller en krisjour/);
  assert.equal(depression.stages['stage-1'].questions['depression-q9'].headerLabel, 'SOCIAL TILLBAKADRAGENHET');
  assert.equal(ocd.stages['stage-1'].questions['ocd-q6'].headerLabel, 'BEHOV AV BEKRÄFTELSE');
  assert.equal(ocd.stages['stage-1'].questions['ocd-q8'].headerLabel, 'TILLFÄLLIG LÄTTNAD');
  assert.doesNotMatch(JSON.stringify(ocd), /FÖRSÄKRING|TVIVÅ|UPPREPPAD|LÄTTNING/);
});

test('Swedish Motorbike keeps following distance, visibility and passenger safety clear', () => {
  const motorbike = JSON.parse(fs.readFileSync('data/quizzes/motorbike/sv.json', 'utf8'));
  const questions = motorbike.stages['stage-1'].questions;
  assert.match(questions['motorbike-q3'].question, /avståndet till fordonet framför/);
  assert.match(questions['motorbike-q5'].answers.a1, /Undvik döda vinklar/);
  assert.match(questions['motorbike-q6'].question, /när motorcykeln har en passagerare/);
  assert.match(motorbike.about.disclaimer, /Inte ett licensprov/);
});
