import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string): any => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/pt.json`, 'utf8'));

test('European Portuguese health copy preserves non-diagnostic and urgent-care guidance', () => {
  assert.match(read('depression').about.disclaimer, /instrumento de rastreio validado/);
  assert.match(read('depression').about.disclaimer, /serviços de emergência locais/);
  assert.match(read('autism').results.profiles['profile-4'].copy, /avaliação do autismo em adultos/);
  assert.match(read('prostatetest').about.disclaimer, /instrumento validado de avaliação de sintomas/);
  assert.match(read('cataract').about.disclaimer, /perda súbita de visão/);
  assert.match(read('treatments').about.disclaimer, /não é aconselhamento médico/);
});

test('European Portuguese results do not misstate a quiz threshold or claim to measure sight', () => {
  assert.match(read('memory').results.profiles['profile-2'].copy, /meta de 80% foi atingida/);
  assert.doesNotMatch(read('memory').results.profiles['profile-2'].copy, /meta de 80% foi superada/);
  assert.match(read('vision').results.score.insights.overview, /pontuação no desafio/);
  assert.match(read('vision').about.body, /não a visão em si/);
  assert.match(read('years-left').about.disclaimer, /não prevê longevidade/);
});
