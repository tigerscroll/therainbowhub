// Read-only review packs and an explicit, content-hashed editorial ledger.
// A passing schema check never marks text as editorially reviewed.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {getQuizSlugs, getSiteLocales} from './quiz-catalogue.mjs';

const root = 'docs/native-audit-2026-09-25';
const ledgerFile = `${root}/progress.json`;
const locales = ['en', ...getSiteLocales().filter(locale => locale !== 'en')];
const slugs = getQuizSlugs();
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const data = Object.fromEntries(slugs.map(slug => [slug, {
  manifest: read(`data/quizzes/${slug}/quiz.json`),
  copies: Object.fromEntries(locales.map(locale => [locale, read(`data/quizzes/${slug}/${locale}.json`)])),
}]));
const questionGroups = new Map();
for (const slug of slugs) {
  const {manifest, copies} = data[slug];
  for (const [stageId, stage] of Object.entries(copies.en.stages)) for (const [id, q] of Object.entries(stage.questions)) {
    const key = JSON.stringify([q.question, Object.values(q.answers).sort(), q.study ?? null, q.image ?? null]);
    if (!questionGroups.has(key)) questionGroups.set(key, []);
    questionGroups.get(key).push({slug, stageId, id, logic: manifest.structure.questions[id], copies: Object.fromEntries(locales.map(locale => [locale, copies[locale].stages[stageId].questions[id]]))});
  }
}
const groups = [...questionGroups.values()];
const ledger = fs.existsSync(ledgerFile) ? read(ledgerFile) : {scope: {slugs, locales}, questions: {}, interfaces: {}, shared: {}, notes: []};

function questionContent(question) {
  const {headerLabel, ...content} = question;
  return content;
}
function interfaceContent(copy) {
  const {stages, ...rest} = copy;
  return {...rest, stageLabels: Object.fromEntries(Object.entries(stages).map(([id, stage]) => [id, {
    title: stage.title,
    headers: [...new Set(Object.values(stage.questions).map(q => q.headerLabel))],
  }]))};
}
function questionReviewed(member, locale) {
  return ledger.questions[`${member.slug}/${member.id}/${locale}`] === hash(questionContent(member.copies[locale]));
}
function summarize() {
  const byLocale = Object.fromEntries(locales.map(locale => [locale, {questions: 0, interfaces: 0, shared: 0}]));
  for (const group of groups) for (const member of group) for (const locale of locales) if (questionReviewed(member, locale)) byLocale[locale].questions++;
  for (const slug of slugs) for (const locale of locales) if (ledger.interfaces[`${slug}/${locale}`] === hash(interfaceContent(data[slug].copies[locale]))) byLocale[locale].interfaces++;
  for (const locale of locales) if (ledger.shared[locale] === hash(read(`data/i18n/${locale}.json`))) byLocale[locale].shared++;
  return {scope: {quizzes: slugs.length, locales, questionInstances: slugs.length * 70 * locales.length, questionGroups: groups.length}, reviewed: byLocale,
    nextUnreviewedGroup: groups.findIndex(group => group.some(member => locales.some(locale => !questionReviewed(member, locale))))};
}

const [command = 'status', selector = '0', countArg = '10'] = process.argv.slice(2);
const selectedLocales = process.env.AUDIT_LOCALES?.split(',') ?? locales;
if (selectedLocales.some(locale => !locales.includes(locale))) throw Error('Unknown audit locale');
if (command === 'questions' || command === 'questions-for') {
  if (command === 'questions-for' && !slugs.includes(selector)) throw Error('Unknown quiz');
  const start = Number(selector), count = Number(countArg);
  const indices = command === 'questions-for'
    ? groups.flatMap((group, i) => group.some(member => member.slug === selector) && group.some(member => selectedLocales.some(locale => !questionReviewed(member, locale))) ? [i] : []).slice(0, count)
    : Array.from({length: Math.max(0, Math.min(count, groups.length - start))}, (_, offset) => start + offset);
  for (const index of indices) {
    const group = groups[index], first = group[0];
    const sourceAnswers = Object.values(first.copies.en.answers);
    console.log(`\n[${index}] ${group.map(member => member.id).join(', ')} | correct: ${first.logic.correctAnswerId ? sourceAnswers.indexOf(first.copies.en.answers[first.logic.correctAnswerId]) + 1 : 'preferences'}`);
    const keys = group.map(member => member.logic.correctAnswerId ? sourceAnswers.indexOf(member.copies.en.answers[member.logic.correctAnswerId]) + 1 : 'preferences');
    if (new Set(keys).size > 1) console.log('ANSWER KEY DISAGREEMENT:', group.map((member, i) => `${member.id}: ${keys[i]}`).join(', '));
    for (const locale of selectedLocales) {
      const variants = new Map();
      for (const member of group) {
        const q = member.copies[locale], en = member.copies.en;
        const answers = sourceAnswers.map(answer => q.answers[Object.entries(en.answers).find(([, value]) => value === answer)[0]]);
        const view = {q: q.question, a: answers};
        if (q.study) view.study = q.study;
        if (q.image) view.image = q.image;
        for (const [key, value] of Object.entries(q)) if (!['question','answers','study','image','headerLabel'].includes(key)) view[key] = value;
        const key = JSON.stringify(view);
        if (!variants.has(key)) variants.set(key, []);
        variants.get(key).push(member.id);
      }
      for (const [view, ids] of variants) console.log(`${locale}${variants.size > 1 ? ` (${ids.join(',')})` : ''}: ${view}`);
    }
  }
} else if (command === 'interface') {
  if (!slugs.includes(selector)) throw Error('Unknown quiz');
  for (const locale of selectedLocales) console.log(locale, JSON.stringify(interfaceContent(data[selector].copies[locale])));
} else if (command === 'shared') {
  for (const locale of selectedLocales) console.log(locale, JSON.stringify(read(`data/i18n/${locale}.json`)));
} else if (command === 'mark-questions') {
  // Use the stable representative IDs printed by the review pack, not a range
  // whose position could change after a source edit.
  const ids = selector.split(',');
  for (const id of ids) {
    const group = groups.find(group => group[0].id === id);
    if (!group) throw Error(`Unknown review group: ${id}`);
    for (const member of group) for (const locale of selectedLocales) ledger.questions[`${member.slug}/${member.id}/${locale}`] = hash(questionContent(member.copies[locale]));
  }
} else if (command === 'mark-interface') {
  for (const slug of selector.split(',')) {
    if (!slugs.includes(slug)) throw Error('Unknown quiz');
    for (const locale of selectedLocales) ledger.interfaces[`${slug}/${locale}`] = hash(interfaceContent(data[slug].copies[locale]));
  }
} else if (command === 'mark-shared') {
  for (const locale of selectedLocales) ledger.shared[locale] = hash(read(`data/i18n/${locale}.json`));
} else if (command !== 'status') throw Error('Unknown command');

if (command.startsWith('mark-')) {
  fs.mkdirSync(root, {recursive: true});
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2) + '\n');
}
if (command === 'status' || command.startsWith('mark-')) console.log(JSON.stringify(summarize(), null, 2));
