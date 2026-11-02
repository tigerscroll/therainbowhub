// Stage translations of public editorial copy. Review drafts before activation.
// Reuse matching archived site translations; never reuse changed English copy.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const cacheRoot = process.env.ARTICLE_TRANSLATION_CACHE;
if (!cacheRoot || !path.isAbsolute(cacheRoot)) throw Error('Set an absolute ARTICLE_TRANSLATION_CACHE directory.');
const locales = (process.env.ARTICLE_LOCALES ?? 'th,hi,tr,id,bn,fil,vi,ur,ms').split(',');
const languageNames = {th:'Thai', hi:'Hindi', tr:'Turkish', id:'Indonesian', bn:'Bengali', fil:'Filipino', vi:'Vietnamese', ur:'Urdu', ms:'Malay', ja:'Japanese'};
if (locales.some(locale => !languageNames[locale])) throw Error('Unknown article locale.');
const archivedRevision = '01872180eaeeefeda87f2712ab03b1add0d7ffff^';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const save = (file, value) => {fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');};
const leaves = (value, parts = []) => typeof value === 'string' ? [{parts, value}]
  : value && typeof value === 'object' ? Object.entries(value).flatMap(([key,item]) => leaves(item, [...parts,key])) : [];
const at = (object, parts) => parts.reduce((value,key) => value?.[key], object);
const set = (object, parts, value) => {parts.slice(0,-1).reduce((value,key) => value[key], object)[parts.at(-1)] = value;};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const technical = (value, parts) => ['id','slug','publishedAt','lastModified','flow','presentation','direction','code','name'].includes(parts.at(-1))
  || parts[0] === 'locale' && parts[1] !== 'switcherLabel'
  || !value.trim() || /^https?:\/\//.test(value) || /^\{[\w-]+\}$/.test(value)
  || ['The Rainbow Hub','Rainbow Hub'].includes(value);
const literal = /\{[^{}]+\}|\b(?:The Rainbow Hub|Rainbow Hub|Oxford|Cambridge|Harvard|Meta|Google|Facebook|Instagram|Photoshop)\b|https?:\/\/[^\s)]+|[\w.+-]+@[\w.-]+\.[A-Za-z]+|\b\d+(?:[.,]\d+)*\b/g;

async function translate(locale, values, attempt = 0) {
  const rows = values.map(text => {
    const tokens = [];
    const protectedText = text.replace(literal, token => {tokens.push(token); return `⟪${tokens.length-1}⟫`;});
    return {text:protectedText, tokens};
  });
  const payload = rows.map((row,index) => `⟦${String(index).padStart(4,'0')}⟧\n${row.text}`).join('\n') + '\n⟦9999⟧';
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  for (const [key,value] of Object.entries({client:'gtx',sl:'en',tl:locale === 'fil' ? 'tl' : locale,dt:'t',q:payload})) url.searchParams.set(key,value);
  try {
    const response = await fetch(url, {signal:AbortSignal.timeout(40000)});
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    const data = await response.json();
    const text = data[0].map(row => row[0] ?? '').join('');
    const chunks = [...text.matchAll(/⟦\s*(\d+)\s*⟧([\s\S]*?)(?=⟦|$)/g)].filter(match => Number(match[1]) !== 9999);
    if (chunks.length !== values.length || chunks.some((match,index) => Number(match[1]) !== index)) throw Error('Translation boundary mismatch');
    return chunks.map((match,index) => {
      let result = match[2].trim();
      for (const [tokenIndex,token] of rows[index].tokens.entries()) {
        const marker = new RegExp(`⟪\\s*${tokenIndex}\\s*⟫`,'g');
        if (!marker.test(result)) throw Error('Protected token missing');
        result = result.replace(marker,token);
      }
      if (!result || /[⟪⟦]/.test(result)) throw Error('Incomplete translated string');
      return result;
    });
  } catch (error) {
    if (attempt >= 6) throw error;
    if (values.length > 1 && !/HTTP (429|50\d)/.test(error.message)) {
      const split = Math.ceil(values.length/2);
      return [...await translate(locale,values.slice(0,split),attempt+1), ...await translate(locale,values.slice(split),attempt+1)];
    }
    await sleep(Math.min(15000,800*2**attempt));
    return translate(locale,values,attempt+1);
  }
}

function archived(file) {
  try {return JSON.parse(execFileSync('git',['show',`${archivedRevision}:${file}`],{encoding:'utf8',stdio:['ignore','pipe','ignore']}));}
  catch {return null;}
}

async function draft(locale, kind, sourceFile, existingFile) {
  const source = read(sourceFile), output = structuredClone(source);
  const file = path.join(cacheRoot,locale,`${kind}.draft.json`);
  const translationCacheFile = path.join(cacheRoot,locale,'strings.json');
  const dictionary = fs.existsSync(translationCacheFile) ? read(translationCacheFile) : {};
  const existing = fs.existsSync(existingFile) ? read(existingFile) : null;
  const oldSource = kind === 'article' ? null : archived(sourceFile);
  const oldTarget = kind === 'article' ? null : archived(existingFile);
  const pending = [];
  let reused = 0;
  for (const row of leaves(source)) {
    const current = at(existing,row.parts);
    if (kind === 'article' && typeof current === 'string' && current !== row.value && row.parts[0] !== 'locale') {
      set(output,row.parts,current); reused++; continue;
    }
    if (technical(row.value,row.parts)) continue;
    const previous = at(oldTarget,row.parts);
    if (oldSource && at(oldSource,row.parts) === row.value && typeof previous === 'string' && previous.trim() && previous !== row.value) {
      set(output,row.parts,previous); reused++; continue;
    }
    pending.push(row);
  }
  const needed = [...new Set(pending.map(row => row.value))].filter(value => !dictionary[value]);
  save(path.join(cacheRoot,locale,`${kind}.payload.json`), {destination:'translate.googleapis.com',sourceHash:createHash('sha256').update(JSON.stringify(source)).digest('hex'),strings:needed});
  let done = 0;
  while (done < needed.length) {
    const batch = []; let size = 0;
    while (done+batch.length < needed.length && (size < 1500 || !batch.length)) {
      const value = needed[done+batch.length]; batch.push(value); size += value.length+20;
    }
    const translations = await translate(locale,batch);
    batch.forEach((value,index) => {dictionary[value] = translations[index];});
    done += batch.length;
    save(translationCacheFile,dictionary);
    if (done % 40 < batch.length || done === needed.length) console.log(`${locale} ${kind}: ${done}/${needed.length} drafted, ${reused} reused`);
    await sleep(180);
  }
  for (const row of pending) set(output,row.parts,dictionary[row.value]);
  if (kind === 'article') output.locale = locale;
  if (kind === 'shared') output.locale = {...output.locale,code:locale,name:languageNames[locale],direction:locale === 'ur' ? 'rtl' : 'ltr'};
  save(file,output);
}

const queue = [...locales];
await Promise.all(Array.from({length:3},async () => {
  while (queue.length) {
    const locale = queue.shift();
    await draft(locale,'article','data/galleries/perfectly-timed.json',`data/galleries/perfectly-timed.${locale}.json`);
    if (!fs.existsSync(`data/i18n/${locale}.json`)) await draft(locale,'shared','data/i18n/en.json',`data/i18n/${locale}.json`);
    if (!fs.existsSync(`data/info-pages/${locale}.json`)) await draft(locale,'info','data/info-pages/en.json',`data/info-pages/${locale}.json`);
    console.log(`${locale}: drafts complete; not activated`);
  }
}));
