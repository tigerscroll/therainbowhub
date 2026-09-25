// Exercises each full journey with locally mocked rewards and blocked external requests.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const supported = ['anatomy', 'bible', 'chef', 'catholic', 'mechanic', 'midwifery', 'nursing', 'paramedic', 'iq', 'harvard', 'oxford', 'cambridge', 'personality'];
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : supported;
if (slugs.some(slug => !supported.includes(slug))) throw new Error('Unknown English chapter quiz');
const queue = [...slugs];
const failures = [];

async function worker() {
  while (queue.length) {
    const slug = queue.shift();
    const log = `/tmp/${slug}-chapter-browser.log`;
    console.log(`Checking ${slug}; details in ${log}`);
    const output = fs.openSync(log, 'w');
    try {
      await new Promise((resolve, reject) => {
        const child = spawn(process.execPath, ['scripts/test-years-left-extended-flow.mjs'], {
          env: { ...process.env, QUIZ_TEST_SLUG: slug }, stdio: ['ignore', output, output],
        });
        child.on('error', reject);
        child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${slug}: browser check exited ${code}; ${log}`)));
      });
      console.log(`${slug}: PASS`);
    } catch (error) {
      failures.push(error);
      console.error(error.message);
    } finally {
      fs.closeSync(output);
    }
  }
}

await Promise.all([worker(), worker()]);
if (failures.length) throw new AggregateError(failures, 'English chapter checks failed');
