import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {slugs, activeLocales as locales} from './chapter-locales/config.mjs';

const chosenSlugs = process.env.QUIZZES?.split(',') ?? slugs;
const chosenLocales = process.env.LOCALES?.split(',') ?? locales;
if (chosenSlugs.some(slug => !slugs.includes(slug)) || chosenLocales.some(locale => !locales.includes(locale))) throw Error('Unknown test selection');
const queue = chosenSlugs.flatMap(slug => chosenLocales.map(locale => ({slug, locale})));
const runName = process.env.QUIZ_TEST_RUN ?? `${process.env.QUIZ_TEST_FAST === '1' ? 'fast' : 'realtime'}-${process.env.QUIZ_TEST_WIDTHS ?? '390'}`;
if (!/^[a-z0-9,-]+$/i.test(runName)) throw Error('Invalid browser test run name');
const artifacts = path.join('/tmp', `chapter-browser-${runName}`);
fs.mkdirSync(artifacts, {recursive: true});
const results = [];
async function worker() {
  while (queue.length) {
    const {slug, locale} = queue.shift(), log = path.join(artifacts, `${slug}-${locale}.log`);
    const stream = fs.openSync(log, 'w');
    console.log(`Checking ${slug}/${locale}`);
    let passed = false;
    try {
      await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['scripts/test-years-left-extended-flow.mjs'], {
          env: {...process.env, QUIZ_TEST_SLUG: slug, QUIZ_TEST_LOCALE: locale, QUIZ_TEST_WIDTHS: process.env.QUIZ_TEST_WIDTHS ?? '390'},
          stdio: ['ignore', stream, stream],
        });
        child.on('error', reject);
        child.on('exit', code => code === 0 ? resolve() : reject(Error(`${slug}/${locale}: exit ${code}, see ${log}`)));
      });
      passed = true;
      console.log(`PASS ${slug}/${locale}`);
    } catch (error) {console.error(error.message);}
    finally {fs.closeSync(stream);}
    results.push({slug, locale, passed, log});
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify(results, null, 2));
  }
}
await Promise.all(Array.from({length: Number(process.env.WORKERS ?? 4)}, worker));
if (results.some(result => !result.passed)) process.exitCode = 1;
