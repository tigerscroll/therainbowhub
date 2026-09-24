import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(
  fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'),
);

test('Barrister and Police each resolve ten distinct questions in every active locale', () => {
  for (const slug of ['barrister', 'police']) {
    const config = read(slug, 'quiz');
    const ids = config.structure.stages.flatMap((stage: { questionIds: string[] }) => stage.questionIds);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    assert.equal(config.activeLocales.length, 30, slug);
    for (const locale of config.activeLocales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions), ids, `${slug}/${locale}`);
      for (const id of ids) {
        const item = questions[id];
        assert.ok(item.question.trim(), `${slug}/${locale}/${id}`);
        assert.deepEqual(Object.keys(item.answers), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers)).size, 4, `${slug}/${locale}/${id}`);
        assert.ok(item.answers[config.structure.questions[id].correctAnswerId].trim(), `${slug}/${locale}/${id}`);
      }
    }
  }
});

test('Barrister technical legal terms and leading-question key remain stable', () => {
  const config = read('barrister', 'quiz');
  assert.equal(config.structure.questions['barrister-q5'].correctAnswerId, 'a1');
  assert.equal(config.structure.questions['barrister-q6'].correctAnswerId, 'a2');
  assert.equal(config.structure.questions['barrister-q8'].correctAnswerId, 'a4');
  assert.equal(config.structure.questions['barrister-q9'].correctAnswerId, 'a1');
  assert.equal(config.structure.questions['barrister-q10'].correctAnswerId, 'a2');
  for (const locale of config.activeLocales) {
    const questions = read('barrister', locale).stages['stage-1'].questions;
    assert.match(questions['barrister-q5'].answers.a1, /Ratio decidendi/, locale);
    assert.match(questions['barrister-q6'].answers.a2, /Obiter dictum|אוביטר דיקטום|傍論/, locale);
    assert.ok(questions['barrister-q8'].answers.a4.trim(), locale);
  }
});

test('Police radio-alphabet question unambiguously asks for Latin B', () => {
  const config = read('police', 'quiz');
  assert.equal(config.structure.questions['police-q6'].correctAnswerId, 'a2');
  for (const locale of config.activeLocales) {
    const item = read('police', locale).stages['stage-1'].questions['police-q6'];
    assert.match(item.question, /B/, locale);
    assert.equal(item.answers.a2, 'Bravo', locale);
  }
  assert.match(read('police', 'el').stages['stage-1'].questions['police-q6'].question, /λατινικό γράμμα B/);
  assert.match(read('police', 'sr').stages['stage-1'].questions['police-q6'].question, /латиничко слово B/);
});

test('reviewed Police scene-priority wording describes an incident location, not a theatrical scene', () => {
  const expected: Record<string, RegExp> = {
    ar: /موقع حادث/, bg: /място/, cs: /místo/, da: /sted/, de: /Einsatzort/,
    el: /περιστατικό/, es: /lugar/, fi: /tapahtumapaikasta/, fil: /lugar/,
    fr: /lieux/, he: /זירת האירוע/, hr: /mjesto događaja/, hu: /HELYSZÍNI/,
    id: /LOKASI KEJADIAN/, it: /luogo/, ja: /現場/, ms: /TEMPAT KEJADIAN/,
    nb: /stedet/, nl: /plek/, pl: /MIEJSCU ZDARZENIA/, pt: /local/,
    ro: /locului|locul/, sk: /miesto/, sr: /место догађаја/, sv: /platsen/,
    th: /ที่เกิดเหตุ/, tr: /olay yerini/, uk: /МІСЦІ ПОДІЇ/, vi: /HIỆN TRƯỜNG/,
  };
  for (const [locale, pattern] of Object.entries(expected)) {
    const item = read('police', locale).stages['stage-1'].questions['police-q1'];
    assert.match(`${item.question} ${item.answers.a1} ${item.headerLabel}`, pattern, locale);
  }
});

test('Police evidence question keeps its correct key and incident-site documentation headings', () => {
  const config = read('police', 'quiz');
  assert.equal(config.structure.questions['police-q8'].correctAnswerId, 'a4');
  const headings: Record<string, RegExp> = {
    ar: /توثيق موقع الحادث/, bg: /ДОКУМЕНТИРАНЕ НА МЯСТОТО/,
    cs: /DOKUMENTACE MÍSTA UDÁLOSTI/, da: /DOKUMENTATION PÅ STEDET/,
    de: /DOKUMENTATION AM EINSATZORT/, el: /ΤΕΚΜΗΡΙΩΣΗ ΤΟΥ ΧΩΡΟΥ/,
    es: /DOCUMENTACIÓN DEL LUGAR/, fi: /TAPAHTUMAPAIKAN DOKUMENTOINTI/,
    fil: /PAGDODOKUMENTO SA LUGAR/, he: /תיעוד בזירת האירוע/,
    hr: /DOKUMENTIRANJE MJESTA DOGAĐAJA/, hu: /A HELYSZÍN DOKUMENTÁLÁSA/,
    id: /DOKUMENTASI LOKASI KEJADIAN/, it: /DOCUMENTAZIONE DEL LUOGO/,
    ja: /現場の記録/, ms: /DOKUMENTASI TEMPAT KEJADIAN/,
    nb: /DOKUMENTASJON PÅ STEDET/, nl: /VASTLEGGEN VAN DE PLAATS/,
    pl: /DOKUMENTOWANIE MIEJSCA ZDARZENIA/, pt: /DOCUMENTAÇÃO DO LOCAL/,
    ro: /DOCUMENTAREA LOCULUI INCIDENTULUI/, sk: /DOKUMENTÁCIA MIESTA UDALOSTI/,
    sr: /ДОКУМЕНТОВАЊЕ МЕСТА ДОГАЂАЈА/, sv: /DOKUMENTATION PÅ PLATSEN/,
    th: /การบันทึกสภาพที่เกิดเหตุ/, tr: /OLAY YERİNİ BELGELEME/,
    uk: /ДОКУМЕНТУВАННЯ МІСЦЯ ПОДІЇ/, vi: /GHI NHẬN HIỆN TRƯỜNG/,
  };
  for (const [locale, pattern] of Object.entries(headings)) {
    const item = read('police', locale).stages['stage-1'].questions['police-q8'];
    assert.match(item.headerLabel, pattern, locale);
    assert.ok(item.answers.a4.trim(), locale);
  }
});
