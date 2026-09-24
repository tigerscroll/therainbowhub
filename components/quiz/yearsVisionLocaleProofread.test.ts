import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function read(slug: string, locale: string) {
  return JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
}

test('Vision result headings describe the visual quiz, not a literal vision score', () => {
  const corrected = ['bg', 'el', 'fi', 'hr', 'hu', 'pl', 'ro', 'nb', 'ja'];
  for (const locale of corrected) {
    const name: string = read('vision', locale).results.name;
    assert.ok(name.length > 3, locale);
    assert.doesNotMatch(name, /VISIOPISTESI|VAŠ VID OCJENA|A LÁTÁS PONTJA|TWOJA WYNIK WIZJI|DIN SYNSPOENG|視力スコア/u, locale);
  }
});

test('Vision positional and code answers keep their intended choices', () => {
  const ids = ['vision-r1q1', 'vision-r3q6', 'vision-r7q2', 'vision-r8q3', 'vision-r9q2', 'vision-r10q2'];
  for (const locale of ['fi', 'fil', 'ms', 'pl', 'ro', 'sk', 'el', 'th', 'tr']) {
    const questions = read('vision', locale).stages['stage-1'].questions;
    for (const id of ids) assert.equal(Object.keys(questions[id].answers).length, 4, `${locale}/${id}`);
    assert.deepEqual(Object.values(questions['vision-r3q6'].answers), ['6', '7', '8', '9'], locale);
    assert.deepEqual(Object.values(questions['vision-r8q3'].answers), ['A', 'B', 'C', 'D'], locale);
    assert.match(questions['vision-r10q2'].answers.a1, /7.{1,7}N/u, locale);
  }
});

test('Years Left future-self responses address the player rather than the speaker', () => {
  const filipino = read('years-left', 'fil').stages['stage-1'].questions['yl-s5q1'].answers.a1 as string;
  const vietnamese = read('years-left', 'vi').stages['stage-1'].questions['yl-s5q1'].answers.a1 as string;
  const thai = read('years-left', 'th').stages['stage-1'].questions['yl-s5q1'].answers.a1 as string;
  assert.match(filipino, /ka/u);
  assert.doesNotMatch(filipino, /bago ko/u);
  assert.match(vietnamese, /bạn/u);
  assert.doesNotMatch(vietnamese, /tôi phải/u);
  assert.doesNotMatch(thai, /ก่อนที่ฉัน/u);
});

test('Years Left review labels describe a change in estimated age', () => {
  for (const locale of ['fil', 'ja', 'ms', 'pt', 'th', 'vi']) {
    const review = read('years-left', locale).results.estimate.reviewUnlock;
    assert.ok(review.raised.length > 5 && review.lowered.length > 5, locale);
    assert.notEqual(review.raised, review.lowered, locale);
  }
});

test('Vision result copy preserves the missed-details meaning without machine-literal phrasing', () => {
  const ukrainian = read('vision', 'uk').results.profiles['profile-1'].copy as string;
  const hungarian = read('vision', 'hu').results.profiles['profile-1'].copy as string;
  const finnish = read('vision', 'fi').results.profiles['profile-5'].copy as string;
  assert.match(ukrainian, /пропустити/u);
  assert.doesNotMatch(ukrainian, /відразу помітять/u);
  assert.doesNotMatch(hungarian, /műszakokat|exceptionálisan/u);
  assert.doesNotMatch(finnish, /napsauttamaan/u);
});

test('Years Left recovery advice does not turn rest into a financial cost', () => {
  const thai = read('years-left', 'th').results.profiles.stress_sprinter.copy as string;
  assert.match(thai, /พักผ่อน/u);
  assert.doesNotMatch(thai, /เสียค่าใช้จ่าย/u);
});
