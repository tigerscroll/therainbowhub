import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run = promisify(execFile);
const manifest = JSON.parse(fs.readFileSync('data/quizzes/vision/quiz.json', 'utf8'));
const queue = (process.env.QUIZ_TEST_LOCALES ?? manifest.activeLocales.join(',')).split(',');
const failures = [];
// Reuse the current 70-question, first-answer/reload/no-fill suite instead of
// keeping a second, outdated copy of the engine's navigation expectations.
await Promise.all(Array.from({length: 2}, async () => {
  while (queue.length) {
    const locale = queue.shift();
    try {
      const {stdout} = await run(process.execPath, ['scripts/test-vision-rewarded-flow.mjs'], {
        env: {...process.env, QUIZ_TEST_LOCALE: locale, QUIZ_TEST_FAST: '1', QUIZ_TEST_WIDTHS: '390'},
        maxBuffer: 1024 * 1024,
      });
      console.log(locale + ': ' + stdout.trim());
    } catch (error) {
      failures.push({locale, error: error.stderr || error.message});
      console.error(locale, error.stderr || error.message);
    }
  }
}));
assert.deepEqual(failures, []);
