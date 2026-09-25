import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {directionalParts} from './directionalText.ts';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const scope = JSON.parse(fs.readFileSync('data/chapter-locales.json', 'utf8'));
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/english-extended/${locale}.json`, 'utf8'));
const questions = (copy: any): Record<string, any> => Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));
const sameWord = (a: string, b: string, locale: string) => assert.equal(a.toLocaleUpperCase(locale), b.toLocaleUpperCase(locale));

for (const locale of scope.locales.filter((value: string) => value !== 'en')) {
  test(`${locale}: translated questions retain all answer IDs and scoring positions`, () => {
    for (const slug of scope.quizzes) {
      const manifest = read(slug, 'quiz'), copy = read(slug, locale);
      const english = expandQuizLocale(manifest, read(slug, 'en'), 'en');
      const native = expandQuizLocale(manifest, copy, locale);
      assert.deepEqual(native.stages.map((stage: any) => stage.questions.length), Array(10).fill(7));
      const indexes = (data: any) => data.stages.flatMap((stage: any) => stage.questions.map((question: any) => [question.id, question.answerIds, question.correct, question.weights]));
      assert.deepEqual(indexes(native), indexes(english), slug);
    }
  });

  test(`${locale}: delayed memory answers still match the original localized cue`, () => {
    const q = questions(read('memory', locale)), manifest = read('memory', 'quiz');
    const correct = (id: string) => q[id].answers[manifest.structure.questions[id].correctAnswerId];
    sameWord(correct('memory-s1q4'), q['memory-s1q4'].study.items[2], locale);
    sameWord(correct('memory-s1q6'), q['memory-s1q4'].study.items[0], locale);
    sameWord(correct('memory-s2q5'), q['memory-s2q1'].study.items[3], locale);
    sameWord(correct('memory-s7q7'), q['memory-s7q1'].study.items[1], locale);
    assert.equal(correct('memory-s6q1'), q['memory-s6q1'].study.items[1].split(' · ')[1]);
    assert.equal(correct('memory-s6q5'), q['memory-s6q1'].study.items[3].split(' · ')[1]);
  });

  test(`${locale}: codes and image-coordinate labels keep the same literal symbols`, () => {
    const native = questions(read('iq', locale)), english = questions(read('iq', 'en'));
    for (const id of ['iq-s6q1','iq-s6q2','iq-s6q4','iq-s6q5','iq-s6q6','iq-s6q7','iq-s9q3','iq-s9q7','iq-s10q2','iq-s10q6']) {
      assert.deepEqual(native[id].answers, english[id].answers, id);
    }
    const vision = questions(read('vision', locale)), source = questions(read('vision', 'en'));
    for (const [id, question] of Object.entries(source)) for (const [key, value] of Object.entries(question.answers)) {
      const label = String(value).match(/^(?:Row|Tile) ([A-D])$/);
      if (label) assert.equal(vision[id].answers[key].match(/[A-D]$/)?.[0], label[1], `${id}/${key}`);
    }
  });
}

test('Arabic puzzle expressions stay together in left-to-right isolates', () => {
  for (const expression of ['K7M2-Q9', '2, 8, 3, 12, 4, 16, 5, ?', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '3 × 4 + 2', '09:20', '1.5 L', '(0, 2)', '(−3, 1)']) {
    const text = `اقرأ ${expression} ثم أجب`;
    const parts = directionalParts(text);
    assert.equal(parts.map(part => part.text).join(''), text);
    assert.ok(parts.some(part => part.ltr && part.text === expression), expression);
  }
  assert.deepEqual(directionalParts('Quel symbole manque ?'), [{text: 'Quel symbole manque ?', ltr: false}]);
  assert.deepEqual(directionalParts('مفتاح أزرق'), [{text: 'مفتاح أزرق', ltr: false}]);
  assert.deepEqual(directionalParts('(5, 1)'), [{text:'(5, 1)',ltr:true}]);
});

test('Arabic sequences use shared Latin labels without translating the puzzle itself', () => {
  const iq = questions(read('iq', 'ar'));
  assert.match(iq['iq-s7q5'].question, /A.*B.*C/u);
  const vision = questions(read('vision', 'ar'));
  assert.match(vision['vision-s2q7'].question, / E /);
  assert.match(vision['vision-s9q7'].question, /Q.*O/);
});
