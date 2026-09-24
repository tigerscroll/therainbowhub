import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function loadQuiz(slug: string) {
  return JSON.parse(fs.readFileSync(`data/quizzes/${slug}/fi.json`, 'utf8'));
}

test('Finnish result profiles avoid the recurring literal score templates', () => {
  for (const entry of fs.readdirSync('data/quizzes', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = `data/quizzes/${entry.name}/fi.json`;
    if (!fs.existsSync(path)) continue;
    const locale = JSON.parse(fs.readFileSync(path, 'utf8'));
    const copy = Object.values(locale.results?.profiles ?? {})
      .map((profile) => `${(profile as { title?: string }).title ?? ''} ${(profile as { copy?: string }).copy ?? ''}`)
      .join(' ');
    assert.doesNotMatch(copy, /Arvostelusi näyttää, mihin yhteyksiin|Tämä haaste toi joitain tuntemattomia ajatuksia|Systems Mastermind|Pääsymaksuista erottuva/iu, path);
  }
});

test('Finnish OCD wording keeps reassurance and distress meaning', () => {
  const ocd = loadQuiz('ocd');
  const questions = ocd.stages['stage-1'].questions;
  assert.match(ocd.about.disclaimer, /ei ole diagnostinen testi/);
  assert.match(ocd.results.profiles['profile-3'].copy, /varmistelun hakeminen/);
  assert.match(questions['ocd-q1'].answers.a3, /saadakseni/);
  assert.match(questions['ocd-q10'].answers.a4, /voimakasta ahdistusta/);
  assert.doesNotMatch(JSON.stringify(ocd.results.profiles), /tilaamista tai vakuuttamista/);
});

test('Finnish motorcycle quiz names following distance and the intended riding line', () => {
  const questions = loadQuiz('motorbike').stages['stage-1'].questions;
  assert.match(questions['motorbike-q2'].answers.a2, /haluttua ajolinjaa/);
  assert.match(questions['motorbike-q3'].question, /etäisyyttä edellä ajavaan ajoneuvoon/);
  assert.equal(questions['motorbike-q3'].answers.a3, 'Etäisyyttä pitäisi kasvattaa');
  assert.match(questions['motorbike-q8'].answers.a4, /Katvealueen tarkistaminen/);
});

test('Finnish prostate result distinguishes urinary urgency from emergency treatment', () => {
  const prostate = loadQuiz('prostatetest');
  assert.match(prostate.about.disclaimer, /lääketieteellinen seulontamenetelmä/);
  assert.match(prostate.results.profiles['profile-2'].copy, /äkillistä virtsaamisen tarvetta/);
  assert.match(prostate.results.profiles['profile-3'].copy, /Hakeudu kiireelliseen hoitoon, jos et pysty virtsaamaan/);
  assert.doesNotMatch(prostate.results.profiles['profile-2'].copy, /tiheyteen tai kiireellisyyteen/);
});

test('Finnish mood check uses more than half of days, not half a day', () => {
  const questions = loadQuiz('depression').stages['stage-1'].questions;
  assert.equal(questions['depression-q1'].answers.a3, 'Yli puolet päivistä');
  assert.doesNotMatch(questions['depression-q1'].answers.a3, /päivästä/);
});
