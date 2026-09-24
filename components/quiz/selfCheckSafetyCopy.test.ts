import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const slugs = ['adhd', 'autism', 'ocd', 'depression'];
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const localesFor = (slug: string) => fs.readdirSync(`data/quizzes/${slug}`).filter(file => file.endsWith('.json') && file !== 'quiz.json').map(file => file.slice(0, -5)).sort();

test('health self-checks retain one-stage ten-question flow and safety copy', () => {
  const locales = localesFor('adhd');
  assert.equal(locales.length, 30);

  for (const slug of slugs) {
    const definition = read(slug, 'quiz');
    assert.deepEqual(localesFor(slug), locales);
    assert.equal(definition.structure.stages.length, 1);
    assert.equal(definition.structure.stages[0].questionIds.length, 10);

    for (const locale of locales) {
      const content = read(slug, locale);
      assert.ok(content.about.disclaimer.trim(), `${slug}/${locale} disclaimer`);
      assert.ok(content.results.profiles['profile-4'].copy.trim(), `${slug}/${locale} result`);
    }
  }

  for (const slug of slugs) {
    const english = read(slug, 'en');
    assert.match(english.about.disclaimer, /not a diagnostic test/i);
    assert.match(english.about.disclaimer, /cannot confirm or rule out/i);
    assert.match(english.results.profiles['profile-4'].copy, /not a diagnosis/i);
  }

  for (const slug of ['ocd', 'depression']) {
    assert.match(read(slug, 'en').about.disclaimer, /urgent|crisis/i);
  }
});

test('Portuguese OCD questions retain complete, natural prompts and a non-diagnostic result', () => {
  const pt = read('ocd', 'pt');
  const questions = pt.stages['stage-1'].questions;
  assert.match(questions['ocd-q3'].question, /preocupações com germes, contaminação ou limpeza o afetam/);
  assert.match(questions['ocd-q6'].question, /pede a outras pessoas que o tranquilizem/);
  assert.equal(questions['ocd-q6'].headerLabel, 'PROCURA DE TRANQUILIZAÇÃO');
  assert.match(pt.about.disclaimer, /não é um teste de diagnóstico/);
  assert.match(pt.results.profiles['profile-1'].copy, /não exclui a POC/);
  assert.doesNotMatch(JSON.stringify(questions), /afetam \?|si pede|Tranqüilidade|continuo duvidando|SENTIDO DE CONTROLE/iu);
});

test('Portuguese mood check retains the two-week scope and clear safety advice', () => {
  const pt = read('depression', 'pt');
  const questions = pt.stages['stage-1'].questions;
  assert.match(questions['depression-q1'].question, /últimas duas semanas/);
  assert.match(questions['depression-q8'].question, /Sentiu-se visivelmente mais lento/);
  assert.match(questions['depression-q9'].question, /Afastou-se de pessoas/);
  assert.match(pt.about.disclaimer, /não é um teste de diagnóstico/);
  assert.match(pt.about.disclaimer, /serviços de emergência locais/);
  assert.doesNotMatch(JSON.stringify(pt), /afeta si|Se sentiu visivelmente|Se afastou de pessoas|estão sendo afetadas|AUTO-VALOR/iu);
});
