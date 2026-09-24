import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve('data/quizzes');
const families = ['personality', 'lovers', 'marry'];
const locales = ['ar', 'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fi', 'fil', 'fr', 'he', 'hr', 'hu', 'id', 'it', 'ja', 'ms', 'nb', 'nl', 'pl', 'pt', 'ro', 'sk', 'sr', 'sv', 'th', 'tr', 'uk', 'vi'];

function read(family: string, name: string): any {
  return JSON.parse(fs.readFileSync(path.join(root, family, name), 'utf8'));
}

for (const family of families) {
  test(`${family}: all 30 locales retain ten questions and stable answer keys`, () => {
    const manifest = read(family, 'quiz.json');
    const questionIds = manifest.structure.stages.flatMap((stage: any) => stage.questionIds);
    assert.equal(questionIds.length, 10);
    assert.equal(new Set(questionIds).size, 10);
    assert.deepEqual(fs.readdirSync(path.join(root, family)).filter((file) => /^[a-z]{2,3}\.json$/.test(file)).map((file) => file.slice(0, -5)).sort(), [...locales].sort());
    const en = read(family, 'en.json');
    for (const locale of locales) {
      const translated = read(family, `${locale}.json`);
      const questions = translated.stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...questionIds].sort(), `${family}/${locale}: question IDs`);
      assert.equal(typeof translated.about.disclaimer, 'string', `${family}/${locale}: disclaimer`);
      for (const id of questionIds) {
        assert.deepEqual(Object.keys(questions[id].answers).sort(), Object.keys(en.stages['stage-1'].questions[id].answers).sort(), `${family}/${locale}/${id}: answer IDs`);
        for (const answer of Object.values(questions[id].answers)) assert.ok(typeof answer === 'string' && answer.trim(), `${family}/${locale}/${id}: blank answer`);
        assert.equal(new Set(Object.values(questions[id].answers)).size, Object.keys(questions[id].answers).length, `${family}/${locale}/${id}: duplicate answer text`);
      }
    }
  });

  test(`${family}: profile weights and references remain coherent`, () => {
    const structure = read(family, 'quiz.json').structure;
    const profiles = new Set(structure.results.profiles.map((profile: any) => profile.id));
    for (const [id, question] of Object.entries<any>(structure.questions)) {
      assert.deepEqual(Object.keys(question.choiceMeanings ?? question.calibration).sort(), [...question.answerIds].sort(), `${family}/${id}: scoring keys`);
      if (question.calibration) {
        assert.ok(Object.values(question.calibration).every((weight) => weight === 0), `${family}/${id}: calibration must be neutral`);
        continue;
      }
      for (const [answerId, weights] of Object.entries<any>(question.choiceMeanings)) {
        assert.ok(Object.keys(weights).every((profile) => profiles.has(profile)), `${family}/${id}/${answerId}: unknown profile`);
        assert.ok(Object.values(weights).every((weight) => typeof weight === 'number' && weight > 0), `${family}/${id}/${answerId}: invalid weight`);
        assert.equal(Object.values<number>(weights).reduce((sum, weight) => sum + weight, 0), 1, `${family}/${id}/${answerId}: weight total`);
      }
    }
  });
}

test('lovers: every portrait choice distinguishes left from right', () => {
  for (const locale of locales) {
    const answers = Object.values<any>(read('lovers', `${locale}.json`).stages['stage-1'].questions).map((question) => question.answers);
    assert.deepEqual(answers, Array(10).fill(null).map(() => answers[0]), `lovers/${locale}: inconsistent repeated side labels`);
    assert.notEqual(answers[0].a1, answers[0].a2);
    assert.ok(!/Правилно|Správně|Σωστά|Tama|Točno|Igaz|Benar|Betul|Jasne|Corect|Správne|У реду|ใช่แล้ว|Правильно|Đúng/.test(answers[0].a2), `lovers/${locale}: right translated as correct`);
  }
});

test('marry: androgynous presentation is not described as intersex', () => {
  for (const locale of ['id', 'th', 'vi']) {
    const answer = read('marry', `${locale}.json`).stages['stage-1'].questions['marry-r1q1'].answers.a3;
    assert.ok(!/berkelamin dua|กะเทย|lưỡng tính/.test(answer), `marry/${locale}: inaccurate presentation label`);
  }
});

test('personality: greeting options do not turn a hand wave into a water wave', () => {
  for (const locale of ['ar', 'cs', 'da', 'fi', 'hu', 'id', 'ja', 'nb', 'pl', 'sk', 'sr', 'sv', 'th', 'tr', 'uk', 'vi']) {
    const answer = read('personality', `${locale}.json`).stages['stage-1'].questions['personality-q1'].answers.a2;
    assert.ok(!/موجة|vlna|bølge|aalto|hullám|Gelombang|波|fala|талас|våg|คลื่น|dalga|хвиля|sóng/.test(answer), `personality/${locale}: water wave in greeting`);
  }
});
