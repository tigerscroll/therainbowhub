import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {polishNeutralPortuguese, neutralPortugueseText} from '../../scripts/chapter-locales/portuguese-neutral.mjs';

const read = (slug: string, file = 'pt') => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${file}.json`, 'utf8'));
const questions = (slug: string): Record<string, any> => Object.assign({}, ...Object.values(read(slug).stages).map((stage: any) => stage.questions));
const correct = (slug: string, id: string) => questions(slug)[id].answers[read(slug, 'quiz').structure.questions[id].correctAnswerId];

test('Portuguese technical alternatives preserve meaning and grammatical context', () => {
  assert.equal(correct('anatomy', 'anatomy-s8q3'), 'Pupila');
  assert.equal(correct('anatomy', 'anatomy-s7q1'), 'Encéfalo e medula espinal');
  assert.equal(correct('anatomy', 'anatomy-s2q5'), 'Fémur (fêmur)');
  assert.match(correct('treatments', 'treatments-s6q2'), /músculos e articulações com as mãos/);
  assert.match(questions('treatments')['treatments-s5q1'].question, /tumores malignos/);
  assert.match(correct('treatments', 'treatments-s10q5'), /própria pessoa/);
  // A heart chamber is “câmara” in both countries; “câmera” means a camera.
  for (const slug of ['doctor', 'medical', 'nursing', 'paramedic', 'surgeon']) {
    const prompt = questions(slug)[`${slug}-s1q7`].question;
    assert.match(prompt, /câmara do coração/);
    assert.doesNotMatch(prompt, /câmera/);
  }
});

test('Portuguese clinical and religious false friends keep their intended meaning', () => {
  assert.equal(correct('bible', 'bible-s3q5'), 'Saul');
  assert.match(questions('bible')['bible-s10q3'].question, /Saulo/);
  assert.doesNotMatch(questions('surgeon')['surgeon-s10q7'].question, /descarga/);
  assert.match(correct('surgeon', 'surgeon-s6q5'), /Tecido de reparação/);
  assert.match(questions('vision')['vision-s7q1'].question, /carácter \(caractere\)/);
  assert.match(questions('vision')['vision-s7q3'].question, /cópia exata do modelo/);
});

test('Portuguese memory instructions name the actual study button', () => {
  for (const slug of ['memory', 'vision']) {
    const copy = read(slug);
    for (const q of Object.values(questions(slug))) if (q.study) {
      assert.ok(copy.about.body.includes(q.study.continueLabel), slug);
      assert.ok(copy.about.howToPlay.steps.some((step: string) => step.includes(q.study.continueLabel)) || slug === 'vision');
    }
  }
  assert.doesNotMatch(JSON.stringify(read('memory')), /recall|retornos de chamada|limpar 80%/i);
  assert.doesNotMatch(JSON.stringify(read('personality')), /My Match|inspirado no country|FORÇA DO JOGO|Balanço sueco/);
});

test('Portuguese editorial rules are repeatable and keep quiz structure intact', () => {
  for (const slug of fs.readdirSync('data/quizzes')) {
    if (!fs.existsSync(`data/quizzes/${slug}/pt.json`)) continue;
    const copy = read(slug), polished = structuredClone(copy);
    polishNeutralPortuguese(slug, polished, read(slug, 'quiz'));
    assert.deepEqual(polished, copy, `${slug}: a repeat pass must not duplicate technical aliases or alter content`);
    for (const q of Object.values(questions(slug))) {
      assert.deepEqual(Object.keys(q.answers), ['a1', 'a2', 'a3', 'a4']);
      assert.equal(new Set(Object.values(q.answers)).size, 4, `${slug}: distinct answer choices`);
    }
  }
  for (const term of ['Oxigénio (oxigênio)', 'Travões (freios)', 'Fumo (fumaça)', 'Génesis (Gênesis)']) {
    assert.equal(neutralPortugueseText(term), term);
  }
  // A survey questionnaire is not an assessment of the respondent's ability.
  assert.equal(neutralPortugueseText('60 pessoas responderam a um questionário.'), '60 pessoas responderam a um questionário.');
});
