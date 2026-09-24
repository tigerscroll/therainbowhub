import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string): any => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const question = (slug: string, locale: string, id: string): any => read(slug, locale).stages['stage-1'].questions[id];

test('Memory recall questions retain their study-board answers and unambiguous blue prompt', () => {
  for (const locale of read('memory', 'quiz').activeLocales as string[]) {
    const copy = read('memory', locale);
    const questions = copy.stages['stage-1'].questions;
    assert.equal(Object.keys(questions).length, 10, locale);
    assert.equal(questions['memory-r1q1'].answers.a1.trim().length > 0, true, locale);
    assert.equal(questions['memory-r1q4'].answers.a4, questions['memory-r1q1'].answers.a4, locale);
    assert.equal(questions['memory-r4q1'].answers.a2, questions['memory-r5q4'].answers.a4, locale);
    assert.deepEqual(Object.values(questions['memory-r3q7'].answers), ['7:02', '7:40', '7:20', '8:20'], locale);
  }
  assert.match(question('memory', 'vi', 'memory-r1q1').question, /xanh dương/);
  for (const id of ['memory-r1q4', 'memory-r3q7', 'memory-r5q2']) {
    assert.doesNotMatch(question('memory', 'fil', id).question, /opening board|journey board/i, id);
  }
  assert.equal(question('memory', 'pt', 'memory-r1q1').answers.a3, 'Comboio');
  assert.equal(question('memory', 'pt', 'memory-r1q1').study.items[2], 'Comboio · 6');
  assert.match(question('memory', 'pt', 'memory-r5q2').question, /comboio/);
});

test('Memory person-pair prompts do not retain broken name grammar', () => {
  const expected: Record<string, [RegExp, RegExp]> = {
    cs: [/Omarovi/, /Mie/],
    fi: [/Omarille/, /Mialle/],
    he: [/לעומר/, /למיה/],
    fil: [/kay Omar/, /kay Mia/],
    hr: [/Omaru/, /Miji/],
    hu: [/Omarhoz/, /Miához/],
    it: [/a Omar/, /a Mia/],
    pl: [/Omara/, /Mii/],
    sk: [/Omarovi/, /Mii/],
    sr: [/Омару/, /Мији/],
    uk: [/Омару/, /Мії/],
  };
  for (const [locale, [omar, mia]] of Object.entries(expected)) {
    assert.match(question('memory', locale, 'memory-r4q1').question, omar, locale);
    assert.match(question('memory', locale, 'memory-r5q4').question, mia, locale);
  }
});

test('Years Left deadline answers preserve panic versus procrastination in corrected locales', () => {
  for (const locale of read('years-left', 'quiz').activeLocales as string[]) {
    const questions = read('years-left', locale).stages['stage-1'].questions;
    assert.equal(Object.keys(questions).length, 10, locale);
    assert.equal(Object.keys(questions['yl-s3q1'].answers).length, 4, locale);
  }
  assert.doesNotMatch(question('years-left', 'vi', 'yl-s3q1').answers.a1, /báo thức.*tắt/);
  assert.doesNotMatch(question('years-left', 'fil', 'yl-s3q1').answers.a2, /Itinigil/);
  assert.doesNotMatch(question('years-left', 'th', 'yl-s3q1').answers.a2, /ไม่สามารถรอ/);
  for (const locale of ['da', 'de', 'es', 'it', 'ms', 'nb', 'sv']) {
    const a2 = question('years-left', locale, 'yl-s3q1').answers.a2;
    assert.ok(a2.trim(), locale);
    assert.doesNotMatch(a2, /cannot wait|nicht mehr warten|no pueda esperar|non potrò più aspettare|tidak boleh menunggu|ikke kan vente|inte kan vänta/i, locale);
  }
});
