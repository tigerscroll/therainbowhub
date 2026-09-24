import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const locales = read('medical', 'quiz').activeLocales as string[];
const question = (slug: string, locale: string, id: string) => read(slug, locale).stages['stage-1'].questions[id];

test('Medical and Nursing retain all 30 locales and exactly ten distinct keyed questions', () => {
  assert.equal(locales.length, 30);
  for (const slug of ['medical', 'nursing']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.deepEqual([...manifest.activeLocales].sort(), [...locales].sort(), slug);
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales) {
      const items = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(items).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const item = items[id];
        assert.ok(item.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers).map((value: any) => value.trim().toLocaleLowerCase())).size, 4, `${slug}/${locale}/${id}: ambiguous duplicate answers`);
        const correctId = manifest.structure.questions[id].correctAnswerId;
        assert.ok(item.answers[correctId]?.trim(), `${slug}/${locale}/${id}: keyed answer missing`);
      }
    }
  }
});

test('Nursing arithmetic and laterality remain answerable in each translation', () => {
  const manifest = read('nursing', 'quiz');
  assert.equal(manifest.structure.questions['nurse-r1q2'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['nurse-r3q1'].correctAnswerId, 'a3');
  assert.equal(manifest.structure.questions['nurse-r5q4'].correctAnswerId, 'a4');
  for (const locale of locales) {
    const volume = question('nursing', locale, 'nurse-r1q2');
    assert.match(volume.question, /750/);
    assert.match(volume.question, /250/);
    assert.match(volume.answers.a4, /1[,. ]?000/);
    const percentage = question('nursing', locale, 'nurse-r3q1');
    assert.match(percentage.question, /600/);
    assert.match(percentage.question, /900/);
    assert.match(percentage.answers.a3, /50/);
    const laterality = question('nursing', locale, 'nurse-r5q4');
    assert.equal(laterality.visual.items.length, 2, locale);
    assert.notEqual(laterality.visual.items[0], laterality.visual.items[1], locale);
    assert.ok(laterality.visual.ariaLabel.trim(), locale);
  }
});

test('Reviewed Nursing visual corrections do not revert to malformed or mixed-language labels', () => {
  const expected: Record<string, [RegExp, RegExp]> = {
    bg: [/ЛЯВА РЪКА/, /ДЯСНА РЪКА/],
    cs: [/LEVÁ PAŽE/, /PRAVÁ PAŽE/],
    el: [/ΑΡΙΣΤΕΡΟ ΜΠΡΑΚΙ/, /ΔΕΞΙ ΧΕΡΙ/],
    fil: [/KALIWANG BRASO/, /KANANG BRASO/],
    ro: [/BRAȚUL STÂNG/, /BRAȚUL DREPT/],
    uk: [/ЛІВА РУКА/, /ПРАВА РУКА/],
  };
  for (const [locale, [left, right]] of Object.entries(expected)) {
    const [first, second] = question('nursing', locale, 'nurse-r5q4').visual.items;
    assert.match(first, left, locale);
    assert.match(second, right, locale);
  }
  const portugueseHandover = question('nursing', 'pt', 'nurse-r5q4');
  assert.match(portugueseHandover.visual.items[0], /PASSAGEM DE INFORMAÇÃO: BRAÇO ESQUERDO/);
  assert.match(portugueseHandover.visual.items[1], /REGISTO: BRAÇO DIREITO/);
  assert.match(portugueseHandover.answers.a4, /lados diferentes/);
  assert.equal(question('nursing', 'pt', 'nurse-r1q2').answers.a4, '1 000 mL');
  assert.match(question('nursing', 'ar', 'nurse-r10q6').visual.items[1], /شاحب.*يصعب إيقاظه.*غير منتظم/);
  assert.match(question('nursing', 'el', 'nurse-r10q6').visual.items[1], /Άτομο B.*Χλωμό.*δύσκολα ξυπνά.*ακανόνιστη αναπνοή/);
  assert.match(question('nursing', 'fil', 'nurse-r10q6').visual.items[1], /Tao B.*Maputla.*mahirap gisingin.*hindi regular ang paghinga/);
  assert.match(question('nursing', 'th', 'nurse-r10q6').visual.items[1], /บุคคล B.*ซีด.*ปลุกตื่นยาก.*หายใจไม่สม่ำเสมอ/);
  assert.doesNotMatch(question('nursing', 'tr', 'nurse-r2q5').context, /nefes alıyorum/);
});

test('Reviewed Medical answers keep correct scientific meaning and natural local terms', () => {
  const manifest = read('medical', 'quiz');
  assert.equal(manifest.structure.questions['medical-q1'].correctAnswerId, 'a1');
  assert.equal(manifest.structure.questions['medical-q4'].correctAnswerId, 'a4');
  assert.equal(manifest.structure.questions['medical-q5'].correctAnswerId, 'a1');
  assert.equal(manifest.structure.questions['medical-q9'].correctAnswerId, 'a1');
  assert.equal(question('medical', 'he', 'medical-q1').answers.a1, 'המוגלובין');
  assert.equal(question('medical', 'ja', 'medical-q1').answers.a1, 'ヘモグロビン');
  assert.match(question('medical', 'ar', 'medical-q5').question, /محلول.*أقل من 7/);
  assert.match(question('medical', 'ar', 'medical-q4').answers.a4, /خلايا العائل.*للتكاثر/);
  assert.match(question('medical', 'hr', 'medical-q5').question, /otopina čiji je pH niži od 7/);
  assert.match(question('medical', 'el', 'medical-q5').question, /Πώς χαρακτηρίζεται ένα διάλυμα/);
});
