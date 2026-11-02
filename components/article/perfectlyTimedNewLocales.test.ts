import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {reviewJapaneseArticle, reviewJapaneseShared, reviewJapaneseInfo} from '../../scripts/perfectly-timed-japanese.mjs';

const source = JSON.parse(fs.readFileSync('data/galleries/perfectly-timed.json','utf8'));
const locales = ['th','hi','tr','id','bn','fil','vi','ur','ms','ja'];
const scripts: Record<string, RegExp> = {th:/\p{Script=Thai}/u,hi:/\p{Script=Devanagari}/u,bn:/\p{Script=Bengali}/u,ur:/\p{Script=Arabic}/u,ja:/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u};

function compare(english: unknown, localized: unknown, path = ''): void {
  assert.equal(typeof localized,typeof english,path);
  if (Array.isArray(english)) {
    assert(Array.isArray(localized),path);
    assert.equal(localized.length,english.length,path);
    english.forEach((item,index) => compare(item,localized[index],`${path}/${index}`));
  } else if (english && typeof english === 'object') {
    assert(localized && typeof localized === 'object',path);
    assert.deepEqual(Object.keys(localized).sort(),Object.keys(english).sort(),path);
    for (const [key,item] of Object.entries(english)) compare(item,(localized as Record<string,unknown>)[key],`${path}/${key}`);
  } else if (typeof english === 'string') {
    const text = localized as string;
    if (/\/(?:id|slug|publishedAt|presentation|flow)$/.test(path) || !english) assert.equal(text,english,path);
    else if (path !== '/locale') {
      assert(text.trim(),path);
      assert.notEqual(text,english,`English fallback at ${path}`);
      assert.doesNotMatch(text,/[⟦⟪\u202a-\u202e\u2066-\u2069]/u,path);
      assert.deepEqual(text.match(/\{\w+\}/g) ?? [],english.match(/\{\w+\}/g) ?? [],path);
    }
  } else assert.equal(localized,english,path);
}

for (const locale of locales) test(`perfectly-timed ${locale}: all 57 sections and entry UI are translated with unchanged behaviour`, () => {
  const copy = JSON.parse(fs.readFileSync(`data/galleries/perfectly-timed.${locale}.json`,'utf8'));
  compare(source,copy);
  assert.equal(copy.locale,locale);
  assert.equal(copy.metadata.title,copy.landing.title);
  assert.equal(copy.gallery.flow,'article');
  assert.equal(copy.landing.presentation,'overlay');
  assert.equal(copy.landing.followUpQuestions,undefined);
  assert.equal(copy.items.length,57);
  assert.equal(copy.items.reduce((count: number,item: {paragraphs:string[]})=>count+item.paragraphs.length,0),114);
  assert.match(copy.metadata.description,/57/);
  if (scripts[locale]) for (const text of [copy.landing.title,copy.landing.popupTitle,...copy.items.flatMap((item: {title:string;paragraphs:string[]})=>[item.title,...item.paragraphs])]) assert.match(text,scripts[locale]);
  assert.doesNotMatch(JSON.stringify(copy),/magpapaganda|nagpapaganda|cuộc thi lặn|thợ lặn|kepekatan yang diperlukan|ความนิยมของไวรัส|ক্ষতিকারক ফটোগ্রাফিক/u);
});

test('Japanese article and shell retain reviewed wording with reproducible source mapping', () => {
  const article = JSON.parse(fs.readFileSync('data/galleries/perfectly-timed.ja.json','utf8'));
  const shared = JSON.parse(fs.readFileSync('data/i18n/ja.json','utf8'));
  const info = JSON.parse(fs.readFileSync('data/info-pages/ja.json','utf8'));
  assert.deepEqual(reviewJapaneseArticle(source), article);
  assert.deepEqual(reviewJapaneseShared(shared), shared);
  assert.deepEqual(reviewJapaneseInfo(info), info);
  assert.equal(shared.ad.loading, '読み込み中…');
  assert.equal(article.landing.cta, '続ける');
  assert.equal(article.gallery.continueLabel, '続きを読む');
  assert.match(article.items[29].title, /飛び込み競技/);
  assert.match(article.items[51].paragraphs.join(''), /拡散|出典|元の情報/);
  assert.match(article.items[54].paragraphs.join(''), /同意/);
  assert.doesNotMatch(JSON.stringify(article), /写真爆弾|ウイルス|頭がおかしく|遠近法を強制/);
  assert.doesNotMatch(JSON.stringify(info), /QuizStart|国際送金|化学パーセント/);
});

test('new article-only languages include translated shell, footer pages and explicit Urdu RTL; Punjabi is not activated', () => {
  const config = fs.readFileSync('lib/localeConfig.ts','utf8');
  for (const locale of ['tr','bn','fil','vi','ur','ms','ja']) {
    assert(config.includes(`code: "${locale}"`));
    const shared=JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`,'utf8'));
    const info=JSON.parse(fs.readFileSync(`data/info-pages/${locale}.json`,'utf8'));
    assert.equal(shared.locale.code,locale);
    assert.equal(shared.locale.direction,locale==='ur'?'rtl':'ltr');
    assert.notEqual(shared.ad.loading,'Loading...');
    assert.doesNotMatch(shared.ad.loading,/reklam|اشتہار|বিজ্ঞাপন|quảng cáo|patalastas|iklan/i,'loading remains generic, as requested');
    assert.equal(Object.keys(info).length,7);
  }
  assert(!config.includes('code: "pa"'));
  assert(!fs.existsSync('data/galleries/perfectly-timed.pa.json'));
});
