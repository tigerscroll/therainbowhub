import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const quizRoot = 'data/quizzes';
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(path.join(quizRoot, slug, `${locale}.json`), 'utf8'));
const families = fs.readdirSync(quizRoot).filter(slug => fs.existsSync(path.join(quizRoot, slug, 'sr.json')));
const question = (slug: string, id: string) => read(slug, 'sr').stages['stage-1'].questions[id];

test('Serbian questions preserve ten master IDs and keyed answer IDs', () => {
  assert.equal(families.length, 53);
  for (const slug of families) {
    const manifest = read(slug, 'quiz');
    const en = read(slug, 'en');
    const sr = read(slug, 'sr');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(ids.length, 10, slug);
    assert.deepEqual(Object.keys(sr.stages['stage-1'].questions).sort(), [...ids].sort(), slug);
    for (const id of ids) {
      const answers = sr.stages['stage-1'].questions[id].answers;
      const answerIds = Object.keys(answers);
      assert.deepEqual(answerIds.sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${slug}/${id}`);
      assert.equal(new Set(Object.values(answers)).size, answerIds.length, `${slug}/${id}: duplicate labels`);
      const correctAnswerId = manifest.structure.questions[id].correctAnswerId;
      if (correctAnswerId) assert.ok(answers[correctAnswerId], `${slug}/${id}: missing keyed answer`);
    }
  }
});

test('Serbian safety-sensitive questions avoid known literal mistranslations', () => {
  for (const id of ['prostate-test-q2', 'prostate-test-q4', 'prostate-test-q5', 'prostate-test-q6', 'prostate-test-q7', 'prostate-test-q8']) {
    assert.equal(question('prostatetest', id).answers.a1, 'Не');
  }
  assert.match(question('midwifery', 'mid-r3q2').question, /сметње вида/);
  assert.match(question('midwifery', 'mid-r3q2').answers.a4, /Одмах затражити процену/);
  assert.match(question('mechanic', 'mechanic-r5q6').answers.a1, /Не улазите испод аутомобила/);
  assert.match(question('motorbike', 'motorbike-q3').question, /растојање од возила испред/);
  assert.match(question('police', 'police-q4').question, /ланца чувања доказа/);
  assert.match(question('surgeon', 'surgeon-q7').answers.a3, /исцедак из ране/);
  assert.match(question('tools', 'tools-q6').question, /гладилица за бетон/);
  assert.match(question('pilot', 'pilot-q5').question, /безбедносна резерва/);
  assert.match(read('maculardegeneration', 'sr').about.body, /одмах затражите стручну процену вида/);
});

test('Serbian result profiles do not retain the recurring machine-literal template', () => {
  for (const slug of families) {
    const profiles = JSON.stringify(read(slug, 'sr').results?.profiles ?? {});
    assert.doesNotMatch(profiles, /Ваша рецензија показује које везе|Користите преглед одговора да истражите|Природно дојење|Кандидат Стеадy Цреw|Стоматолошки факултет који се истиче|Специјалиста за казне/);
    for (const profile of Object.values(read(slug, 'sr').results?.profiles ?? {}) as { title: string }[]) {
      assert.doesNotMatch(profile.title, /[A-Za-z]|Стандоут|Мастерминд|Регулар|Поурер|првог аларма|првог одговора/, `${slug}: result title`);
    }
  }
});
