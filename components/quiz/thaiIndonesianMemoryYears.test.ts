import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {getQuizSlugs, getQuizLocaleFiles} from '../../scripts/quiz-catalogue.mjs';
import {translateMemoryAdditional} from '../../scripts/chapter-locales/memory-id-th.mjs';
import {translateYearsLeft} from '../../scripts/localize-years-left-de-fr.mjs';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const read = (slug: string, file: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${file}.json`, 'utf8'));

test('Thai heading spacing is script-specific and does not alter other languages', () => {
  const css = fs.readFileSync('styles/quiz-shell-contract.css', 'utf8');
  assert.match(css, /\.quiz-theme:lang\(th\) h1,[\s\S]*?line-height: 1\.3 !important;[\s\S]*?letter-spacing: normal !important;/);
});
function leaves(value: any, path = '', output: Record<string, string> = {}) {
  if (typeof value === 'string') output[path] = value;
  else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) leaves(child, `${path}/${key}`, output);
  else assert.fail(`${path}: locale leaves must be strings`);
  return output;
}

for (const locale of ['id', 'th']) {
  test(`${locale}: only Memory and Years Left activate the new quiz editions`, () => {
    assert.deepEqual(getQuizSlugs().filter((slug: string) => getQuizLocaleFiles(slug).includes(locale)), ['memory', 'years-left']);
    const shared = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8'));
    const english = JSON.parse(fs.readFileSync('data/i18n/en.json', 'utf8'));
    assert.deepEqual(Object.keys(leaves(shared)).sort(), Object.keys(leaves(english)).sort());
    assert.equal(shared.locale.code, locale);
    assert.equal(shared.locale.direction, 'ltr');
    assert.equal(shared.locale.name, locale === 'th' ? 'Thai' : 'Indonesian');
    assert.equal(shared.quiz.start, read('memory', locale).landing.cta);
    assert.equal(shared.ad.loading, locale === 'th' ? 'กำลังโหลด...' : 'Memuat...');
    const info = JSON.parse(fs.readFileSync(`data/info-pages/${locale}.json`, 'utf8'));
    const sourceInfo = JSON.parse(fs.readFileSync('data/info-pages/en.json', 'utf8'));
    assert.deepEqual(Object.keys(leaves(info)).sort(), Object.keys(leaves(sourceInfo)).sort());
    assert.equal(info.about.sections[1].list.length, 5);
    assert.doesNotMatch(info.about.sections[1].list.join(' '), /sepuluh pertanyaan|คำถามสิบข้อ/);
  });

  for (const slug of ['memory', 'years-left']) test(`${locale}/${slug}: complete repeatable translation with unchanged answer relationships`, () => {
    const manifest = read(slug, 'quiz'), english = read(slug, 'en'), copy = read(slug, locale);
    const before = structuredClone(manifest);
    assert.deepEqual(copy, slug === 'memory' ? translateMemoryAdditional(locale, english, manifest) : translateYearsLeft(locale, english, manifest));
    assert.deepEqual(manifest, before);
    const source = leaves(english), native = leaves(copy);
    assert.deepEqual(Object.keys(native).sort(), Object.keys(source).sort());
    const tokens = (s: string) => [...s.matchAll(/\{[^{}]+\}/g)].map(m => m[0]).sort();
    for (const [path, text] of Object.entries(native)) {
      assert.ok(text.trim(), path);
      assert.deepEqual(tokens(text), tokens(source[path]), path);
    }
    const expanded = expandQuizLocale(manifest, copy, locale);
    const sourceExpanded = expandQuizLocale(manifest, english, 'en');
    assert.deepEqual(expanded.stages.map((s: any) => s.questions.length), Array(10).fill(slug === 'memory' ? 7 : 10));
    const relationships = (data: any) => data.stages.flatMap((s: any) => s.questions.map((q: any) => [q.id, q.answerIds, q.correct, q.weights, q.calibration]));
    assert.deepEqual(relationships(expanded), relationships(sourceExpanded));
    for (const stage of Object.values(copy.stages) as any[]) for (const question of Object.values(stage.questions) as any[]) {
      if (locale === 'th') assert.match(question.question, /\p{Script=Thai}/u);
      else assert.doesNotMatch(question.question, /\p{Script=Thai}|\p{Script=Devanagari}/u);
    }
    if (slug === 'years-left') assert.equal(expanded.stages.at(-1).questions.at(-1).id, 'yl-s10q7');
  });

  test(`${locale}: native word relationships and protected calculations keep the correct choices`, () => {
    const manifest = read('memory', 'quiz'), copy = read('memory', locale);
    const questions = Object.assign({}, ...Object.values(copy.stages).map((s: any) => s.questions));
    const correct = (id: string) => questions[id].answers[manifest.structure.questions[id].correctAnswerId];
    assert.equal(correct('memory-gk-s1q7'), 'R');
    assert.equal(correct('memory-gk-s8q4'), locale === 'th' ? 'ฟัง' : 'Didengarkan');
    assert.equal(correct('memory-gk-s8q5'), locale === 'th' ? 'เขียน' : 'Menulis');
    assert.equal(correct('memory-gk-s9q4'), '3 g/cm³');
    assert.equal(correct('memory-gk-s9q5'), '8');
    assert.equal(correct('memory-gk-s10q4'), '6');
    assert.match(questions['memory-gk-s10q4'].question, /A = 1.*B = 2.*C = 3.*CAB/);
    assert.match(questions['memory-gk-s9q3'].question, locale === 'id' ? /1,5/ : /1\.5/);
  });
}
