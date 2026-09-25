import fs from 'node:fs';
import assert from 'node:assert/strict';
import {slugs, locales, ui} from './config.mjs';
import {expandQuizLocale} from '../quiz-schema-v2.mjs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const failures = [];
const report = [];
function strings(value, parts = [], result = []) {
  if (typeof value === 'string') result.push({value, parts});
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) strings(item, [...parts, key], result);
  return result;
}
for (const slug of slugs) {
  const root = `data/quizzes/${slug}`, manifest = read(`${root}/quiz.json`), english = read(`${root}/en.json`);
  for (const locale of locales) try {
    const copy = read(`${root}/${locale}.json`), expanded = expandQuizLocale(manifest, copy, locale);
    assert.equal(copy.landing.cta, ui[locale].start);
    assert.equal(copy.results.share, undefined);
    assert.deepEqual(expanded.stages.map(stage => stage.questions.length), Array(10).fill(7));
    for (const [index, stage] of manifest.structure.stages.entries()) {
      const checkpoint = copy.career.stages[stage.id];
      assert.equal(checkpoint.preAdButton, index === 9 ? ui[locale].result : ui[locale].next);
      if (index < 9) assert.equal(checkpoint.preAdCopy.match(/\{profile\}/g)?.length, 1);
      for (const id of stage.questionIds) {
        const question = copy.stages[stage.id].questions[id], source = english.stages[stage.id].questions[id];
        const answers = Object.values(question.answers);
        assert.deepEqual(Object.keys(question.answers), Object.keys(source.answers), `${id}: answer order changed`);
        assert.equal(new Set(answers.map(answer => answer.normalize('NFKC').trim().toLowerCase())).size, answers.length, `${id}: duplicate answers`);
        assert.equal(answers.length, 4);
      }
    }
    for (const {value, parts} of strings(copy)) {
      assert.ok(value.trim(), `${parts.join('.')}: blank text`);
      assert.doesNotMatch(value, /[⟪⟦]|\[\[M\d|\bundefined\b/, `${parts.join('.')}: draft residue`);
      const source = parts.reduce((object, key) => object?.[key], english);
      const placeholders = text => [...(text?.matchAll(/\{[^{}]+\}/g) ?? [])].map(match => match[0]).sort();
      assert.deepEqual(placeholders(value), placeholders(source), `${parts.join('.')}: placeholders`);
      const sharedDutchPhrase = locale === 'nl' && source === 'In warm water';
      const namedTerm = parts.includes('answers') && ((slug === 'italian' && ['Pesto alla genovese', 'Risotto alla milanese', 'Trentino-Alto Adige'].includes(source)) || (slug === 'nun' && source === 'Dominic de Guzmán'));
      const nameSequence = slug === 'iq' && parts.includes('iq-s7q1') && parts.includes('answers');
      const isSentence = (source?.match(/\b[A-Za-z]{2,}\b/g)?.length ?? 0) >= 3;
      if (isSentence && value === source && !sharedDutchPhrase && !nameSequence && !namedTerm && !/^[A-Z0-9\s.,:;→–—-]+$/.test(source)) failures.push(`${slug}/${locale}/${parts.join('.')}: English sentence remains: ${source}`);
      for (const match of source?.matchAll(/(?=\b([A-Za-z][A-Za-z’']*(?:\s+[A-Za-z][A-Za-z’']*){3})\b)/g) ?? []) {
        const phrase = match[1];
        if (locale === 'nl' && phrase === 'credits per week plus') continue;
        if (phrase.split(/\s+/).filter(word => word.length > 2).length < 3 || phrase.includes('WHO Basic Emergency Care')) continue;
        if (!value.toLowerCase().includes(phrase.toLowerCase())) continue;
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`(?<![\\p{L}])${escaped}(?![\\p{L}])`, 'iu').test(value)) {
          failures.push(`${slug}/${locale}/${parts.join('.')}: English fragment remains: ${phrase}`);
          break;
        }
      }
      if (locale === 'ar' && (parts.length === 1 || parts.at(-1) === 'headerLabel')) assert.match(value, /\p{Script=Arabic}/u, `${parts.join('.')}: Arabic required`);
      if (locale === 'ar' && parts.includes('questions') && !/\p{Script=Arabic}/u.test(value)) {
        // Codes, units and named Latin-letter puzzles may remain literal. A
        // lowercase English word in an otherwise untranslated answer may not.
        assert.doesNotMatch(value, /[a-z]{2}/, `${parts.join('.')}: untranslated Arabic question content`);
      }
    }
    for (const question of expanded.stages.flatMap(stage => stage.questions)) {
      if (question.image?.src) assert.ok(fs.existsSync(`data${question.image.src}`), `${question.id}: missing image`);
    }
    report.push({slug, locale, questions: 70, checkpoints: 10, status: 'PASS'});
  } catch (error) {failures.push(`${slug}/${locale}: ${error.message}`);}
}
fs.writeFileSync('/tmp/quiz-chapter-localization-audit.json', JSON.stringify({report, failures}, null, 2));
if (failures.length) {console.error(failures.join('\n')); process.exitCode = 1;}
else console.log(`Chapter localization audit passed: ${report.length} editions, ${report.length * 70} questions.`);
