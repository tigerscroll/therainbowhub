import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales = 'ar bg cs da de el en es fi fil fr he hr hu id it ja ms nb nl pl pt ro sk sr sv th tr uk vi'.split(' ');
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Cambridge, Harvard, and Oxford retain all thirty locales and exactly ten distinct keyed questions', () => {
  for (const slug of ['cambridge', 'harvard', 'oxford']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.deepEqual([...manifest.activeLocales].sort(), [...locales].sort(), slug);
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of locales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const item = questions[id];
        assert.ok(item.question?.trim(), `${slug}/${locale}/${id}: missing question`);
        assert.deepEqual(Object.keys(item.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers).map((answer: any) => answer.trim().toLocaleLowerCase(locale))).size, 4, `${slug}/${locale}/${id}: duplicate answers`);
        assert.ok(item.answers[manifest.structure.questions[id].correctAnswerId]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
      }
    }
  }
});

test('Quantitative and logic keys match their conditions', () => {
  const c = read('cambridge', 'quiz').structure.questions;
  const h = read('harvard', 'quiz').structure.questions;
  const o = read('oxford', 'quiz').structure.questions;
  assert.equal(c['cambridge-s1q1'].correctAnswerId, 'a2'); // 5, 7, 11, 17, 25
  assert.equal(c['cambridge-s3q3'].correctAnswerId, 'a4'); // 3, 10, 24, 52
  assert.equal(c['cambridge-s5q8'].correctAnswerId, 'a4'); // |12−13| + |18−17| + |24−24| = 2
  assert.equal(c['cambridge-s5q7'].correctAnswerId, 'a2'); // 26−5 = 21 with fixed sensor bias
  assert.equal(h['harvard-s1q2'].correctAnswerId, 'a4'); // 250 × (1−.36) = 160
  assert.equal(h['harvard-s3q1'].correctAnswerId, 'a2'); // 18000 / 3000 = 6
  assert.equal(h['harvard-s3q4'].correctAnswerId, 'a3'); // 6000/120 < 9000/150
  assert.equal(h['harvard-s5q6'].correctAnswerId, 'a1'); // 80% − 78% = 2 percentage points
  assert.equal(h['harvard-s5q8'].correctAnswerId, 'a4'); // C is least-cost qualifying proposal
  assert.equal(o['oxford-s1q6'].correctAnswerId, 'a1'); // £24 / .8 = £30
  assert.equal(o['oxford-s2q2'].correctAnswerId, 'a3'); // Overlap can vary from 20 to 50
  assert.equal(o['oxford-s3q3'].correctAnswerId, 'a4'); // Only C can be true
  assert.equal(o['oxford-s3q7'].correctAnswerId, 'a1'); // Top-left rotates to bottom-right
  assert.equal(o['oxford-s5q7'].correctAnswerId, 'a2'); // Only Cy reaches both thresholds
  for (const locale of locales) {
    const oxford = read('oxford', locale).stages['stage-1'].questions;
    assert.match(oxford['oxford-s2q2'].question, /100|Sadasta|Száz/);
    assert.match(oxford['oxford-s2q2'].question, /70/);
    assert.match(oxford['oxford-s2q2'].question, /50/);
    assert.match(oxford['oxford-s3q3'].question, /A/);
    assert.match(oxford['oxford-s3q3'].question, /B/);
    assert.match(oxford['oxford-s3q3'].question, /C/);
    assert.deepEqual(oxford['oxford-s3q7'].visual.items.slice(1), ['180°', '?']);
    assert.match(read('harvard', locale).stages['stage-1'].questions['harvard-s5q6'].question, /80.*100|100.*80/);
  }
});

test('Reviewed options preserve the winning region, prevention, and literary-work meaning', () => {
  const h = (locale: string, id: string) => read('harvard', locale).stages['stage-1'].questions[id];
  const o = (locale: string, id: string) => read('oxford', locale).stages['stage-1'].questions[id];
  assert.match(h('ar', 'harvard-s5q6').answers.a1, /المنطقة A.*2 نقطة مئوية/);
  assert.match(h('th', 'harvard-s5q6').answers.a1, /A สูงกว่า 2 จุดเปอร์เซ็นต์/);
  assert.match(h('uk', 'harvard-s4q1').answers.a1, /запобігає негайній шкоді/);
  assert.match(h('el', 'harvard-s2q2').answers.a3, /ενδέχεται να μην/);
  assert.match(h('pl', 'harvard-s2q2').answers.a3, /mogą nie być/);
  assert.match(o('he', 'oxford-s1q1').answers.a2, /יצירות ספרותיות/);
  assert.match(o('pl', 'oxford-s1q1').answers.a2, /utwory literackie/);
  assert.match(o('pt', 'oxford-s1q1').answers.a2, /Obras literárias/);
  assert.match(o('ro', 'oxford-s1q1').answers.a2, /Opere literare/);
  assert.equal(o('ar', 'oxford-s3q7').visual.items[0], 'أعلى اليسار');
  assert.equal(o('fil', 'oxford-s3q7').visual.items[0], 'KALIWA SA ITAAS');
  assert.match(o('pt', 'oxford-s3q3').question, /Quem fez a afirmação verdadeira/);
  assert.match(o('uk', 'oxford-s3q3').question, /C каже: «Твердження B хибне»/);
  assert.match(o('fil', 'oxford-s3q3').question, /Sabi ni C, ‘Mali ang sinabi ni B/);
});
