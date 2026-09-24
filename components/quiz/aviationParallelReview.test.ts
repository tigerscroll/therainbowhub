import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales = 'ar bg cs da de el en es fi fil fr he hr hu id it ja ms nb nl pl pt ro sk sr sv th tr uk vi'.split(' ');
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const normalize = (value: string, locale: string) => value.toLocaleLowerCase(locale).normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');

test('Pilot and Flight Attendant retain ten keyed questions in all 30 locales', () => {
  for (const slug of ['pilot', 'flightattendant']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(manifest.activeLocales.length, 30, slug);
    assert.deepEqual([...manifest.activeLocales].sort(), [...locales].sort(), slug);
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales) {
      const copy = read(slug, locale);
      const questions = copy.stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const item = questions[id];
        assert.ok(item.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers).map((answer: any) => normalize(answer.trim(), locale))).size, 4, `${slug}/${locale}/${id}: duplicate answers`);
        assert.ok(item.answers[manifest.structure.questions[id].correctAnswerId]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
      }
    }
  }
});

test('Pilot heading and runway directions are consistent in each language', () => {
  const manifest = read('pilot', 'quiz');
  assert.equal(manifest.structure.questions['pilot-q4'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['pilot-q9'].correctAnswerId, 'a1');
  for (const locale of locales) {
    const questions = read('pilot', locale).stages['stage-1'].questions;
    const heading = questions['pilot-q4'];
    const runway = questions['pilot-q9'];
    assert.match(heading.question, /180/, locale);
    assert.match(runway.question, /27/, locale);
    for (const [headingId, runwayId] of [['a1', 'a2'], ['a2', 'a3'], ['a3', 'a1'], ['a4', 'a4']]) {
      assert.equal(normalize(heading.answers[headingId], locale), normalize(runway.answers[runwayId], locale), `${locale}: compass labels disagree`);
    }
  }
  assert.equal(read('pilot', 'fi').stages['stage-1'].questions['pilot-q9'].answers.a1, 'Länsi');
  assert.equal(read('pilot', 'sk').stages['stage-1'].questions['pilot-q9'].answers.a1, 'Západ');
  assert.equal(read('pilot', 'th').stages['stage-1'].questions['pilot-q4'].answers.a4, 'ทิศใต้');
});

test('Aviation safety corrections retain the intended safe responses', () => {
  const pilot = (locale: string, id: string) => read('pilot', locale).stages['stage-1'].questions[id];
  const cabin = (locale: string, id: string) => read('flightattendant', locale).stages['stage-1'].questions[id];
  assert.match(pilot('tr', 'pilot-q5').answers.a1, /iniş yapın/);
  assert.doesNotMatch(pilot('tr', 'pilot-q5').answers.a1, /karaya çıkın/);
  assert.match(pilot('ar', 'pilot-q5').answers.a1, /اهبط/);
  assert.match(cabin('pt', 'flightattendant-q2').answers.a2, /Proteja-se.*cabine/);
  assert.match(cabin('nb', 'flightattendant-q2').answers.a2, /kabinen/);
  assert.match(cabin('hu', 'flightattendant-q3').answers.a3, /oxigénmaszkját/);
  assert.match(cabin('sv', 'flightattendant-q3').answers.a3, /syrgasmask/);
  assert.match(cabin('ms', 'flightattendant-q3').answers.a3, /topeng oksigen/);
  assert.match(cabin('ja', 'flightattendant-q3').answers.a3, /酸素マスク/);
  assert.equal(cabin('pt', 'flightattendant-q8').answers.a4, 'Calor, combustível e O₂');
  assert.match(read('flightattendant', 'en').about.disclaimer, /not an official airline recruitment, safety, medical or employment assessment/);
  assert.match(read('pilot', 'en').about.disclaimer, /not an official pilot aptitude, licensing, medical, training or employment assessment/);
});
