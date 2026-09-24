import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function loadQuiz(slug: string) {
  return JSON.parse(fs.readFileSync(`data/quizzes/${slug}/bg.json`, 'utf8'));
}

test('Bulgarian result profiles avoid recurring machine-literal score copy', () => {
  for (const entry of fs.readdirSync('data/quizzes', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = `data/quizzes/${entry.name}/bg.json`;
    if (!fs.existsSync(path)) continue;
    const locale = JSON.parse(fs.readFileSync(path, 'utf8'));
    const profileCopy = Object.values(locale.results?.profiles ?? {})
      .map((profile) => `${(profile as { title?: string }).title ?? ''} ${(profile as { copy?: string }).copy ?? ''}`)
      .join(' ');
    assert.doesNotMatch(profileCopy, /Разпознахте няколко важни идеи|Това предизвикателство въведе някои непознати идеи|Standout|Explorer/iu, path);
  }
});

test('Bulgarian mental-health checks preserve reassurance and urgent-support meaning', () => {
  const ocd = loadQuiz('ocd');
  const depression = loadQuiz('depression');
  assert.match(ocd.results.profiles['profile-3'].copy, /търсене на уверение/);
  assert.match(ocd.stages['stage-1'].questions['ocd-q9'].answers.a4, /силно безпокойство/);
  assert.match(depression.results.profiles['profile-4'].copy, /службите за спешна помощ/);
  assert.doesNotMatch(depression.results.profiles['profile-4'].copy, /поддръжката при спешни случаи/);
});

test('Bulgarian motorcycle questions preserve following-distance and blind-spot safety', () => {
  const questions = loadQuiz('motorbike').stages['stage-1'].questions;
  assert.match(questions['motorbike-q3'].question, /дистанцията до превозното средство отпред/);
  assert.equal(questions['motorbike-q3'].answers.a3, 'Да се увеличи');
  assert.match(questions['motorbike-q8'].answers.a4, /мъртвата зона/);
  assert.doesNotMatch(questions['motorbike-q4'].answers.a3, /Напомпайте/);
});

test('Bulgarian mechanic quiz keeps the jack-safety decision explicit', () => {
  const questions = loadQuiz('mechanic').stages['stage-1'].questions;
  assert.match(questions['mechanic-r3q3'].question, /Едната свети, а другата не/);
  assert.match(questions['mechanic-r5q6'].answers.a1, /преди да бъде стабилно подпрян/);
});

test('Bulgarian prostate result separates urinary urgency from medical emergency', () => {
  const profiles = loadQuiz('prostatetest').results.profiles;
  assert.match(profiles['profile-2'].copy, /внезапни позиви/);
  assert.match(profiles['profile-3'].copy, /Потърсете спешна помощ, ако не можете да уринирате/);
  assert.doesNotMatch(profiles['profile-2'].copy, /спешността/);
});
