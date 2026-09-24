import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: 'en' | 'it'): any =>
  JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Italian questions keep the ten-question English structure and distinct choices', () => {
  const slugs = fs.readdirSync('data/quizzes').filter((slug) => fs.existsSync(`data/quizzes/${slug}/it.json`));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const english = read(slug, 'en').stages['stage-1'].questions;
    const italian = read(slug, 'it').stages['stage-1'].questions;
    assert.equal(Object.keys(italian).length, 10, slug);
    assert.deepEqual(Object.keys(italian), Object.keys(english), slug);
    for (const [id, question] of Object.entries(italian) as [string, any][]) {
      const choices = Object.values(question.answers) as string[];
      assert.deepEqual(Object.keys(question.answers), Object.keys(english[id].answers), `${slug}/${id}`);
      assert.equal(new Set(choices.map((value) => value.trim().toLocaleLowerCase('it'))).size, choices.length, `${slug}/${id}`);
    }
  }
});

test('Italian medical and safety questions retain clear, non-diagnostic meaning', () => {
  assert.match(read('dementia', 'it').stages['stage-1'].questions['dementia-q3'].question, /Quale parola/);
  assert.match(read('maculardegeneration', 'it').stages['stage-1'].questions['macular-q1'].question, /Quale carattere/);
  assert.match(read('nursing', 'it').stages['stage-1'].questions['nurse-r1q1'].question, /sangue che ritorna dai polmoni/);
  assert.match(read('firefighter', 'it').stages['stage-1'].questions['firefighter-s1q1'].question, /combustibile/);
  assert.match(read('tools', 'it').stages['stage-1'].questions['tools-q10'].question, /staggia/);
  assert.match(read('tools', 'it').stages['stage-1'].questions['tools-q6'].image.alt, /frattazzo a manico lungo/);
  assert.match(read('maculardegeneration', 'it').about.body, /\(DMLE\)/);
  assert.equal(read('marry', 'it').results.profileReveal.auraLabel, 'LA SUA ENERGIA');
  for (const slug of ['dementia', 'maculardegeneration', 'prostatetest']) {
    assert.match(read(slug, 'it').about.disclaimer, /non (?:può|è)/i, slug);
  }
});
