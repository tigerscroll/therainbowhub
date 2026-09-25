// Generate resumable translation drafts from public quiz copy. Never activate
// drafts: build.mjs applies reviewed vocabulary/adaptations before writing them.
import fs from 'node:fs';
import path from 'node:path';
import {slugs, locales} from './config.mjs';
import {adaptSource, contextualSource} from './source.mjs';

const cacheDir = process.env.CHAPTER_TRANSLATION_CACHE;
if (!cacheDir || !path.isAbsolute(cacheDir)) throw Error('Set CHAPTER_TRANSLATION_CACHE to an absolute task cache directory.');
fs.mkdirSync(cacheDir, {recursive: true});
const chosen = process.env.LOCALES?.split(',') ?? locales;
const selected = process.env.QUIZZES?.split(',') ?? slugs;
if (selected.some(slug => !slugs.includes(slug))) throw Error('Unknown chapter quiz');
if (chosen.some(locale => !locales.includes(locale))) throw Error('Unknown chapter locale');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => { fs.writeFileSync(`${file}.tmp`, JSON.stringify(value, null, 2) + '\n'); fs.renameSync(`${file}.tmp`, file); };
export function leaves(value, parts = [], result = []) {
  if (typeof value === 'string') result.push({parts, value});
  else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) leaves(item, [...parts, key], result);
  return result;
}
const technical = (value, parts) => ['src','icon','id','category','mode'].includes(parts.at(-1))
  || /^(?:https?:\/\/|\/quizzes\/)/.test(value)
  || !/[A-Za-z]/.test(value)
  || /^[A-Z]$/.test(value)
  || /^(?=.*\d)(?=.*[A-Z])[A-Z\d-]+$/.test(value);
const baseLiteral = /\{[^{}]+\}|\b(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b|\b(?:ABCDEFGHIJKLMNOPQRSTUVWXYZ|CANDLE|EANDLC|EANDCL|ECNDLA|ELDNAC|DOG|EQH|EPH|FQH|ERJ|LAMP|PM4L|P4ML|L4MP|4PML|NIM|TOV|RAK|AB7C2B9|AZ|BY|CX|DW|DX|EV|CV)\b|\b(?:\d{1,3}(?:,\d{3})+|\d+\.\d+)\b/g;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function translate(locale, values, attempt = 0) {
  if (values.some(value => /\n|::/.test(value))) {
    const pieces = values.map(value => value.split(/(\n+|::)/));
    const segments = [...new Set(pieces.flat().filter(value => value && !/^(?:\n+|::)$/.test(value)))];
    const translated = await translate(locale, segments, attempt);
    const mapping = new Map(segments.map((value, i) => [value, translated[i]]));
    return pieces.map(row => row.map(value => mapping.get(value) ?? value).join(''));
  }
  const protectedRows = values.map(value => {
    const tokens = [];
    const text = value.replace(baseLiteral, token => {tokens.push(token); return `⟪${tokens.length - 1}⟫`;});
    return {text, tokens};
  });
  const payload = protectedRows.map((row, i) => `⟦${String(i).padStart(4, '0')}⟧\n${row.text}`).join('\n') + '\n⟦9999⟧';
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  for (const [key, value] of Object.entries({client:'gtx', sl:'en', tl:locale, dt:'t', q:payload})) url.searchParams.set(key, value);
  try {
    const response = await fetch(url, {signal: AbortSignal.timeout(40_000)});
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    const body = await response.json();
    const translated = body[0].map(row => row[0] ?? '').join('');
    const chunks = [...translated.matchAll(/⟦\s*(\d+)\s*⟧([\s\S]*?)(?=⟦|$)/g)].filter(match => Number(match[1]) !== 9999);
    if (chunks.length !== values.length || chunks.some((match, i) => Number(match[1]) !== i)) throw Error('Changed translation boundaries');
    return chunks.map((match, i) => {
      let value = match[2].trim();
      for (const [index, token] of protectedRows[i].tokens.entries()) {
        const pattern = new RegExp(`⟪\\s*${index}\\s*⟫`, 'g');
        if (!pattern.test(value)) throw Error(`Missing protected literal: ${token}`);
        value = value.replace(pattern, token);
      }
      if (!value || /[⟪⟦]/.test(value)) throw Error('Unresolved translation markers');
      return value;
    });
  } catch (error) {
    if (attempt >= 8) throw Error(`${locale}: ${error.message}`);
    if (values.length > 1 && !/HTTP (?:429|50\d)/.test(error.message)) {
      const split = Math.ceil(values.length / 2);
      return [...await translate(locale, values.slice(0, split), attempt + 1), ...await translate(locale, values.slice(split), attempt + 1)];
    }
    await pause(Math.min(20_000, 1000 * 2 ** attempt));
    return translate(locale, values, attempt + 1);
  }
}

function seed(locale) {
  const tasks = {};
  for (const slug of selected) {
    const root = `data/quizzes/${slug}`;
    const manifest = read(`${root}/quiz.json`);
    const source = adaptSource(slug, read(`${root}/en.json`), manifest, locale);
    const original = read(`${root}/en.json`), native = read(`${root}/${locale}.json`);
    const existing = new Map();
    // Match the complete English question before reusing its reviewed native
    // answers. Historical question IDs alone are not evidence of equivalence.
    const oldQuestions = Object.assign({}, ...Object.values(original.stages).map(stage => stage.questions));
    const nativeQuestions = Object.assign({}, ...Object.values(native.stages).map(stage => stage.questions));
    for (const [id, question] of Object.entries(oldQuestions)) {
      if (!nativeQuestions[id]) continue;
      existing.set(question.question, {source: question, native: nativeQuestions[id]});
    }
    const retained = {};
    for (const {parts, value} of leaves(source)) {
      if (['title','eyebrow'].includes(parts[0]) || parts.join('.') === 'landing.intro') {
        const old = parts.reduce((object, key) => object?.[key], native);
        if (typeof old === 'string') {retained[parts.join('.')] = old; continue;}
      }
      if (parts[0] === 'stages' && parts[2] === 'questions') {
        const question = source.stages[parts[1]].questions[parts[3]], match = existing.get(question.question);
        if (match && parts.at(-1) === 'question') {retained[parts.join('.')] = match.native.question; continue;}
        if (match && parts[4] === 'answers') {
          const oldKey = Object.entries(match.source.answers ?? {}).find(([, text]) => text === value)?.[0];
          if (oldKey && match.native.answers?.[oldKey]) {retained[parts.join('.')] = match.native.answers[oldKey]; continue;}
        }
      }
      if (parts[0] === 'results' && parts[1] === 'profiles' && ['title', 'tier', 'label'].includes(parts.at(-1))) {
        const old = parts.reduce((object, key) => object?.[key], native);
        if (typeof old === 'string') {retained[parts.join('.')] = old; continue;}
      }
      if (technical(value, parts)) retained[parts.join('.')] = value;
    }
    tasks[slug] = {source, retained, rows: leaves(source).filter(({parts}) => !(parts.join('.') in retained)).map(({parts, value}) => ({parts, value: contextualSource(slug, value, parts)}))};
  }
  return tasks;
}

async function run(locale) {
  const tasks = seed(locale), file = path.join(cacheDir, `${locale}.json`);
  const cache = fs.existsSync(file) ? read(file) : {};
  const needed = [...new Set(Object.values(tasks).flatMap(task => task.rows.map(row => row.value)))].filter(value => !(value in cache));
  const batches = []; let batch = [], size = 0;
  for (const value of needed) {
    if (batch.length && size + value.length > 3300) {batches.push(batch); batch = []; size = 0;}
    batch.push(value); size += value.length + 22;
  }
  if (batch.length) batches.push(batch);
  console.log(`${locale}: ${needed.length} strings, ${batches.length} batches`);
  if (process.env.EXPORT_ONLY) {
    write(path.join(cacheDir, `${locale}.payload.json`), {destination: 'https://translate.googleapis.com/translate_a/single', sourceLanguage: 'en', targetLanguage: locale, quizSlugs: selected, strings: needed});
    return;
  }
  if (process.env.DRY_RUN) return;
  for (const [index, values] of batches.entries()) {
    const translated = await translate(locale, values);
    values.forEach((value, i) => cache[value] = translated[i]);
    write(file, cache);
    if (index % 10 === 0 || index === batches.length - 1) console.log(`${locale}: ${index + 1}/${batches.length}`);
    await pause(300);
  }
  const draftFile = path.join(cacheDir, `${locale}.draft.json`);
  const result = fs.existsSync(draftFile) ? read(draftFile) : {};
  for (const [slug, task] of Object.entries(tasks)) {
    const copy = structuredClone(task.source);
    const set = (parts, value) => {parts.slice(0,-1).reduce((object, key) => object[key], copy)[parts.at(-1)] = value;};
    for (const [key, value] of Object.entries(task.retained)) set(key.split('.'), value);
    for (const row of task.rows) set(row.parts, cache[row.value]);
    result[slug] = copy;
  }
  write(path.join(cacheDir, `${locale}.draft.json`), result);
  console.log(`${locale}: ${selected.length} draft quizzes complete`);
}
const queue = [...chosen], failures = [];
async function worker() {while (queue.length) {const locale = queue.shift(); try {await run(locale);} catch (error) {failures.push(locale); console.error(error.stack);}}}
await Promise.all([worker(), worker()]);
if (failures.length) throw Error(`Resume these locales: ${failures.join(',')}`);
