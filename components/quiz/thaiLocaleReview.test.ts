import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: 'en' | 'th'): any =>
  JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Thai quizzes keep ten English-aligned questions and distinct answer choices', () => {
  const slugs = fs.readdirSync('data/quizzes').filter((slug) => fs.existsSync(`data/quizzes/${slug}/th.json`));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const english = read(slug, 'en').stages['stage-1'].questions;
    const thai = read(slug, 'th');
    const questions = thai.stages['stage-1'].questions;
    assert.deepEqual(Object.keys(questions), Object.keys(english), slug);
    assert.equal(Object.keys(questions).length, 10, slug);
    assert.notEqual(thai.results?.score?.bestRound, 'รอบที่ดีที่สุดของคุณ', slug);
    for (const [id, question] of Object.entries(questions) as [string, any][]) {
      assert.deepEqual(Object.keys(question.answers), Object.keys(english[id].answers), `${slug}/${id}`);
      const choices = Object.values(question.answers) as string[];
      assert.equal(new Set(choices.map((choice) => choice.trim())).size, choices.length, `${slug}/${id}`);
    }
  }
});

test('Thai medical and safety wording retains the intended non-diagnostic message', () => {
  const depression = read('depression', 'th');
  const ocd = read('ocd', 'th');
  const prostate = read('prostatetest', 'th');
  const macular = read('maculardegeneration', 'th');
  assert.match(depression.stages['stage-1'].questions['depression-q1'].answers.a3, /ครึ่งหนึ่งของจำนวนวัน/);
  assert.match(depression.about.disclaimer, /ไม่สามารถยืนยันหรือตัดความเป็นไปได้/);
  assert.match(ocd.about.body, /ไม่ได้ใช้วินิจฉัย/);
  assert.match(ocd.stages['stage-1'].questions['ocd-q7'].question, /การกระทำซ้ำ/);
  assert.match(prostate.about.disclaimer, /ปัสสาวะไม่ออก/);
  assert.match(prostate.results.profiles['profile-1'].copy, /ไม่สามารถตัดความเป็นไปได้/);
  assert.match(macular.landing.intro, /ปริศนาภาพ/);
  assert.match(macular.about.disclaimer, /ไม่ใช่การทดสอบด้วยตารางแอมสเลอร์/);
  assert.match(read('dementia', 'th').stages['stage-1'].questions['dementia-q7'].question, /เลข 12 ไปที่เลข 6/);
});

test('Thai Catholic and practical-safety questions retain meaningful technical terms', () => {
  const nun = read('nun', 'th').stages['stage-1'].questions;
  const tools = read('tools', 'th').stages['stage-1'].questions;
  assert.match(nun['nun-q1'].question, /พระวรสาร/);
  assert.match(nun['nun-q3'].answers.a3, /พระพรพิเศษ/);
  assert.match(tools['tools-q3'].answers.a2, /แบบหล่อไม้/);
  assert.match(read('motorbike', 'th').stages['stage-1'].questions['motorbike-q3'].question, /ระยะห่าง/);
});

test('Thai result copy does not revert to repeated machine-literal review instructions', () => {
  for (const slug of fs.readdirSync('data/quizzes')) {
    if (!fs.existsSync(`data/quizzes/${slug}/th.json`)) continue;
    const profiles = Object.values(read(slug, 'th').results?.profiles ?? {}) as {copy?: string}[];
    for (const profile of profiles) {
      assert.doesNotMatch(profile.copy ?? '', /การเชื่อมต่อใดที่ควรกลับมาเยี่ยมชมอีกครั้ง|ความท้าทายนี้ทำให้เกิดแนวคิดที่ไม่คุ้นเคย/, slug);
    }
  }
});

test('Thai personality results describe compatibility rather than a competition', () => {
  const marry = read('marry', 'th');
  const personality = read('personality', 'th');
  assert.match(marry.results.name, /คู่ที่เข้ากับคุณ/);
  assert.equal(marry.results.profiles.grounded_builder.traits[2], 'อดทน');
  assert.equal(marry.results.profiles.magnetic_connector.traits[0], 'มีเสน่ห์');
  assert.match(personality.results.name, /ประเทศที่เข้ากับ/);
  assert.match(personality.results.profiles['profile-2'].traits[1], /ให้เกียรติ/);
  assert.equal(personality.landing.intro.split('\n').length, 2);
});

test('Thai image and professional results use quiz language rather than literal calques', () => {
  assert.match(read('historicalfigures', 'th').results.profiles['profile-5'].copy, /ใบหน้ากับชื่อ/);
  assert.match(read('songs', 'th').results.profiles['profile-4'].copy, /ชื่อเต็มของเพลง/);
  assert.match(read('obsolete', 'th').results.profiles['profile-4'].copy, /ลองดูเฉลย/);
  assert.match(read('dentist', 'th').results.profiles['profile-1'].copy, /แบบทดสอบนี้/);
  assert.match(read('raf', 'th').results.profiles['profile-2'].copy, /คะแนนถึงเป้าหมาย/);
});
