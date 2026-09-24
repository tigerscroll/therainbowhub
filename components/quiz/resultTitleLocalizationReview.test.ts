import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('translated result titles do not retain English profile labels', () => {
  const untranslated = /\b(?:Standout|Explorer|Mastermind|First-Alarm|First-Response|Case Room|Admissions)\b/;

  for (const quiz of fs.readdirSync('data/quizzes', { withFileTypes: true })) {
    if (!quiz.isDirectory()) continue;

    const directory = path.join('data/quizzes', quiz.name);
    for (const filename of fs.readdirSync(directory)) {
      if (!filename.endsWith('.json') || filename === 'en.json') continue;

      const locale = JSON.parse(fs.readFileSync(path.join(directory, filename), 'utf8'));
      for (const [profileId, profile] of Object.entries(locale.results?.profiles ?? {})) {
        const title = (profile as { title?: string }).title ?? '';
        assert.doesNotMatch(title, untranslated, `${quiz.name}/${filename} ${profileId}: ${title}`);
      }
    }
  }
});
