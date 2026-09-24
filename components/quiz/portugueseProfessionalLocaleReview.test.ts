import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string): any => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/pt.json`, 'utf8'));
const questions = (slug: string): any => read(slug).stages['stage-1'].questions;

test('PT-PT professional questions retain clear technical and safety meanings', () => {
  assert.match(questions('teacher')['teacher-q1'].answers.a3, /fim de período/);
  assert.match(questions('teacher')['teacher-q8'].question, /fiável/);
  assert.match(questions('nun')['nun-q3'].answers.a2, /Paróquia/);
  assert.match(questions('raf')['raf-q10'].question, /área de pilotagem/);
  assert.match(questions('train')['train-q1'].answers.a1, /paragem adequado/);
  assert.match(questions('surgeon')['surgeon-q9'].answers.a1, /serviços de emergência/);
  assert.match(questions('socialworker')['socialworker-q10'].answers.a2, /respeite a escolha informada/);
});

test('PT-PT professional copy keeps competence claims bounded', () => {
  assert.match(read('socialworker').about.disclaimer, /deveres de comunicação/);
  assert.match(read('pilot').about.disclaimer, /não é uma avaliação oficial/);
  assert.match(read('surgeon').about.disclaimer, /não é um exame de admissão/);
  assert.match(read('tools').about.disclaimer, /não é uma formação profissional/);
  assert.doesNotMatch(read('tools').results.profiles['profile-3'].copy, /desfocadas/);
});
