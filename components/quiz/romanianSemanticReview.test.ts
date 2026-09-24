import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function loadQuiz(slug: string) {
  return JSON.parse(fs.readFileSync(`data/quizzes/${slug}/ro.json`, 'utf8'));
}

test('Romanian result profiles avoid the recurring literal review copy', () => {
  for (const entry of fs.readdirSync('data/quizzes', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = `data/quizzes/${entry.name}/ro.json`;
    if (!fs.existsSync(path)) continue;
    const locale = JSON.parse(fs.readFileSync(path, 'utf8'));
    const copy = Object.values(locale.results?.profiles ?? {})
      .map((profile) => `${(profile as { title?: string }).title ?? ''} ${(profile as { copy?: string }).copy ?? ''}`)
      .join(' ');
    assert.doesNotMatch(copy, /Recenzia|Această provocare a introdus câteva idei necunoscute|Remarcabilul de admitere|Meniul Explorer/iu, path);
  }
});

test('Romanian OCD copy distinguishes reassurance from insurance', () => {
  const ocd = loadQuiz('ocd');
  const questions = ocd.stages['stage-1'].questions;
  assert.match(ocd.about.disclaimer, /nu este un test de diagnostic/);
  assert.match(ocd.results.profiles['profile-3'].copy, /căutarea de reasigurări/);
  assert.equal(questions['ocd-q2'].answers.a3, 'Verific sau repet acțiunea ca să mă liniștesc');
  assert.doesNotMatch(JSON.stringify(ocd.results.profiles), /asigurarea care reduce/);
});

test('Romanian motorcycle quiz names the following distance and intended line through a turn', () => {
  const questions = loadQuiz('motorbike').stages['stage-1'].questions;
  assert.match(questions['motorbike-q2'].answers.a2, /traiectoria dorită/);
  assert.match(questions['motorbike-q3'].question, /distanța față de vehiculul din față/);
  assert.equal(questions['motorbike-q3'].answers.a3, 'Să crească');
});

test('Romanian prostate result does not confuse urinary urgency with emergency care', () => {
  const profiles = loadQuiz('prostatetest').results.profiles;
  assert.match(profiles['profile-2'].copy, /nevoia bruscă de a urina/);
  assert.match(profiles['profile-3'].copy, /Solicitați îngrijiri urgente dacă nu puteți urina/);
  assert.doesNotMatch(profiles['profile-2'].copy, /frecvența sau urgența/);
});
