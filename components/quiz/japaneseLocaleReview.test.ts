import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: 'en' | 'ja'): any =>
  JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Japanese quizzes preserve all ten questions and four distinct answer choices', () => {
  const slugs = fs.readdirSync('data/quizzes').filter((slug) => fs.existsSync(`data/quizzes/${slug}/ja.json`));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const english = read(slug, 'en').stages['stage-1'].questions;
    const localized = read(slug, 'ja');
    const japanese = localized.stages['stage-1'].questions;
    assert.equal(Object.keys(japanese).length, 10, slug);
    assert.notEqual(localized.results?.score?.bestRound, 'あなたのベストラウンド', slug);
    assert.deepEqual(Object.keys(japanese), Object.keys(english), slug);
    for (const [id, question] of Object.entries(japanese) as [string, any][]) {
      assert.deepEqual(Object.keys(question.answers), Object.keys(english[id].answers), `${slug}/${id}`);
      const choices = Object.values(question.answers) as string[];
      assert.equal(new Set(choices.map((value) => value.trim())).size, choices.length, `${slug}/${id}`);
    }
  }
});

test('Japanese medical and religious safety copy retains corrected meaning', () => {
  const depression = read('depression', 'ja');
  const ocd = read('ocd', 'ja');
  const prostate = read('prostatetest', 'ja');
  const nun = read('nun', 'ja');
  assert.match(depression.about.disclaimer, /診断.+代わるものではありません/);
  assert.match(depression.stages['stage-1'].questions['depression-q7'].answers.a3, /振り払う/);
  assert.match(ocd.about.disclaimer, /診断.+代わるものではありません/);
  assert.match(ocd.stages['stage-1'].questions['ocd-q7'].question, /繰り返す行動/);
  assert.match(prostate.about.disclaimer, /診断検査/);
  assert.match(prostate.results.profiles['profile-1'].copy, /否定はできません/);
  assert.match(nun.stages['stage-1'].questions['nun-q1'].question, /福音的勧告/);
  assert.match(nun.stages['stage-1'].questions['nun-q7'].answers.a3, /有期誓願/);
});

test('Japanese score copy excludes recurring machine-translation fragments', () => {
  for (const slug of fs.readdirSync('data/quizzes')) {
    if (!fs.existsSync(`data/quizzes/${slug}/ja.json`)) continue;
    const profiles = Object.values(read(slug, 'ja').results?.profiles ?? {}) as {copy?: string}[];
    for (const profile of profiles) {
      assert.doesNotMatch(profile.copy ?? '', /見慣れないアイデアがいくつか導入されました|どの接続を再検討する必要があるか/, slug);
    }
  }
});

test('Japanese image and professional quiz results avoid misleading literal calques', () => {
  assert.equal(read('tools', 'ja').stages['stage-1'].questions['tools-q3'].answers.a2, '木製の型枠を浮かせる');
  assert.match(read('tools', 'ja').stages['stage-1'].questions['tools-q6'].image.alt, /ブルフロート/);
  assert.match(read('historicalfigures', 'ja').results.profiles['profile-5'].copy, /顔と名前/);
  assert.match(read('songs', 'ja').results.profiles['profile-4'].copy, /正式なタイトル/);
  assert.match(read('obsolete', 'ja').results.profiles['profile-4'].copy, /答え合わせ/);
  assert.match(read('dentist', 'ja').results.profiles['profile-1'].copy, /このクイズ/);
  assert.match(read('raf', 'ja').results.profiles['profile-2'].copy, /このクイズ/);
});
