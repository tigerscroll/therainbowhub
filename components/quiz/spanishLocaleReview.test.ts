import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: 'en' | 'es'): any => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Spanish quiz question IDs and answer choices remain complete and distinct', () => {
  const slugs = fs.readdirSync('data/quizzes').filter((slug) => fs.existsSync(`data/quizzes/${slug}/es.json`));
  assert.equal(slugs.length, 33);
  for (const slug of slugs) {
    const english = read(slug, 'en').stages['stage-1'].questions;
    const spanish = read(slug, 'es').stages['stage-1'].questions;
    assert.deepEqual(Object.keys(spanish), Object.keys(english), slug);
    for (const [id, question] of Object.entries(spanish) as [string, any][]) {
      const choices = Object.values(question.answers) as string[];
      assert.deepEqual(Object.keys(question.answers), Object.keys(english[id].answers), `${slug}/${id}`);
      assert.equal(new Set(choices.map((value) => value.trim().toLocaleLowerCase('es'))).size, choices.length, `${slug}/${id}`);
    }
  }
});
