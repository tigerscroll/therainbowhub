import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales = 'ar bg cs da de el en es fi fil fr he hr hu id it ja ms nb nl pl pt ro sk sr sv th tr uk vi'.split(' ');
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Gross Quiz and Italian have thirty ten-question locales with intact answer IDs', () => {
  for (const slug of ['grossquiz', 'italian']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    assert.deepEqual(fs.readdirSync(`data/quizzes/${slug}`).filter(name => /^[a-z]{2,3}\.json$/.test(name)).map(name => name.slice(0, -5)).sort(), [...locales].sort(), slug);
    for (const locale of locales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const item = questions[id];
        assert.ok(item.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers).map((answer: any) => answer.trim().toLocaleLowerCase(locale))).size, 4, `${slug}/${locale}/${id}: duplicate answers`);
        if (slug === 'italian') assert.ok(item.answers[manifest.structure.questions[id].correctAnswerId]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
        else for (const answerId of ['a1', 'a2', 'a3', 'a4']) assert.equal(Object.keys(manifest.structure.questions[id].choiceMeanings[answerId]).length, 1, `${slug}/${id}/${answerId}: personality scoring changed`);
      }
    }
  }
});

test('Italian food questions preserve precise dish meanings and names', () => {
  const manifest = read('italian', 'quiz');
  assert.equal(manifest.structure.questions['italian-q2'].correctAnswerId, 'a1');
  assert.equal(manifest.structure.questions['italian-q8'].correctAnswerId, 'a2');
  assert.equal(manifest.structure.questions['italian-q9'].correctAnswerId, 'a1');
  for (const locale of locales) {
    const q = read('italian', locale).stages['stage-1'].questions;
    assert.ok(!/traditionally|tradizionalmente|traditionnellement|tradicionalmente/i.test(q['italian-q2'].question), `${locale}: carbonara history overstated`);
    assert.ok(!/Mancha|Plamka|Vlek|Benek|bintik|đốm/.test(q['italian-q2'].answers.a4), `${locale}: Speck mistranslated as a spot`);
    assert.ok(!/Sábio|Verstandig|ปราชญ์|חָכָם|bijak/.test(q['italian-q9'].answers.a1), `${locale}: sage mistranslated as a wise person`);
  }
  const q = (locale: string, id: string) => read('italian', locale).stages['stage-1'].questions[id];
  assert.equal(q('vi', 'italian-q2').answers.a1, 'Guanciale');
  assert.equal(q('vi', 'italian-q2').answers.a2, 'Prosciutto cotto');
  assert.equal(q('vi', 'italian-q2').answers.a4, 'Speck');
  assert.equal(q('he', 'italian-q9').answers.a1, 'מרווה');
  assert.equal(q('nl', 'italian-q9').answers.a1, 'Salie');
  assert.equal(q('pt', 'italian-q9').answers.a1, 'Sálvia');
  assert.equal(q('th', 'italian-q9').answers.a1, 'ใบเสจ');
  assert.equal(q('ms', 'italian-q9').question.includes('daging anak lembu'), true);
});

test('Italian dish names and island, pasta, and opera prompts survive translation', () => {
  const q = (locale: string, id: string) => read('italian', locale).stages['stage-1'].questions[id];
  assert.equal(q('id', 'italian-q5').answers.a1, 'Taleggio');
  assert.equal(q('id', 'italian-q6').answers.a3, 'Capri');
  assert.equal(q('vi', 'italian-q5').answers.a4, 'Asiago');
  assert.equal(q('vi', 'italian-q8').answers.a4, 'Linguine');
  assert.equal(q('fi', 'italian-q3').answers.a2, 'Kurpitsa');
  assert.match(q('ar', 'italian-q6').question, /حلوى الكانولي/);
  assert.match(q('ar', 'italian-q8').question, /راغو ألا بولونيز/);
  assert.match(q('ar', 'italian-q10').question, /أي ملحن/);
  assert.match(q('el', 'italian-q10').question, /ποιου συνθέτη/);
  assert.match(q('tr', 'italian-q6').question, /İtalyan adasıyla/);
});

test('Gross Quiz date question remains a self-report with four ordered habits in every locale', () => {
  const q = (locale: string) => read('grossquiz', locale).stages['stage-1'].questions['grossquiz-q4'];
  for (const locale of locales) {
    assert.ok(q(locale).question.trim().length > 25, locale);
    assert.ok(Object.values(q(locale).answers).every((answer: any) => answer.trim().length > 10), locale);
    assert.ok(read('grossquiz', locale).results.profiles['profile-4'].copy.trim().length > 50, `${locale}: missing revised result copy`);
  }
  assert.match(q('en').question, /use-by date/);
  assert.deepEqual(q('en').answers, {
    a1: 'I have never eaten it after that date',
    a2: 'I have eaten it one day after that date',
    a3: 'I have eaten it several days after that date',
    a4: 'I have eaten it even when I suspected it was spoiled'
  });
  assert.match(read('grossquiz', 'en').about.disclaimer, /not medical, hygiene or public-health advice/);
  assert.match(q('fi').question, /viimeinen käyttöpäivä/);
  assert.match(q('ja').question, /消費期限/);
  assert.match(q('ro').question, /data-limită de consum/);
  const all = (locale: string, id: string) => read('grossquiz', locale).stages['stage-1'].questions[id];
  assert.match(all('fi', 'grossquiz-q2').question, /lakanasi/);
  assert.match(all('fi', 'grossquiz-q9').question, /lusikalle/);
  assert.doesNotMatch(all('fi', 'grossquiz-q9').question, /leipulle/);
  assert.match(all('vi', 'grossquiz-q6').answers.a4, /không tắm/);
  assert.match(all('ja', 'grossquiz-q1').answers.a2, /床がきれいに見えたら/);
  assert.match(all('ar', 'grossquiz-q7').answers.a1, /لا أفعل أيًا منهما/);
  assert.match(all('en', 'grossquiz-q3').question, /What happens to your phone/);
  assert.match(all('sr', 'grossquiz-q9').question, /Пробате храну/);
  assert.equal(Object.keys(read('grossquiz', 'quiz').structure.questions['grossquiz-q9'].choiceMeanings.a1)[0], 'spotless-saint');
  assert.equal(Object.keys(read('grossquiz', 'quiz').structure.questions['grossquiz-q8'].choiceMeanings.a1)[0], 'spotless-saint');
  assert.match(all('el', 'grossquiz-q6').question, /δεν έχετε όρεξη/);
  assert.match(all('th', 'grossquiz-q6').question, /ขี้เกียจอาบน้ำ/);
  assert.match(all('cs', 'grossquiz-q10').question, /vystihuje/);
  assert.doesNotMatch(read('grossquiz', 'en').results.profiles['profile-4'].copy, /sniff test/i);
  assert.match(read('grossquiz', 'el').results.profiles['profile-4'].title, /καλικάντζαρου/);
});
