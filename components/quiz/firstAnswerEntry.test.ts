import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {applyEntryLabel, applyTextThreeChoices, choicePlan} from '../../scripts/three-choice-entry.mjs';
import {expandQuizLocale} from '../../scripts/quiz-schema-v2.mjs';

const read = (slug: string, name: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${name}.json`, 'utf8'));

for (const slug of ['vision', 'nursing', 'midwifery', 'memory', 'iq']) {
  test(`${slug}: the first-question pill is localized without replacing subsequent topic labels`, () => {
    const manifest = read(slug, 'quiz');
    const copies = Object.fromEntries(manifest.activeLocales.map((locale: string) => [locale, read(slug, locale)]));
    const next = structuredClone(copies);
    applyEntryLabel(structuredClone(manifest), next);
    assert.deepEqual(next, copies, 'authored first-question labels survive regeneration');
    const stage = manifest.structure.stages[0], [id, secondId] = stage.questionIds;
    for (const [locale, copy] of Object.entries(copies) as [string, any][]) {
      const first = copy.stages[stage.id].questions[id];
      assert.ok(first.headerLabel.trim());
      assert.notEqual(first.headerLabel, copy.stages[stage.id].questions[secondId].headerLabel);
      if (locale === 'en') assert.equal(first.headerLabel, slug === 'iq' ? 'Intelligence Test' : `${slug[0].toUpperCase()}${slug.slice(1)} Test`);
      else assert.notEqual(first.headerLabel, copies.en.stages[stage.id].questions[id].headerLabel);
      if (locale !== 'ar') assert.notEqual(first.headerLabel, first.headerLabel.toLocaleUpperCase(locale), 'opening labels use natural casing, not all caps');
    }
  });
}

for (const slug of ['nursing', 'midwifery', 'iq']) {
  test(`${slug}: all locales share three choices, correct-answer IDs and balanced scoring`, () => {
    const manifest = read(slug, 'quiz');
    const copies = Object.fromEntries(manifest.activeLocales.map((locale: string) => [locale, read(slug, locale)]));
    const english = expandQuizLocale(manifest, copies.en, 'en').stages.flatMap((stage: any) => stage.questions);
    assert.equal(manifest.engine.entry, 'first-answer');
    const key = fs.readFileSync(`data/quizzes/${slug}/ANSWER_KEY.md`, 'utf8');
    for (const [locale, copy] of Object.entries(copies)) {
      const expanded = expandQuizLocale(manifest, copy, locale);
      assert.deepEqual(expanded.stages.map((stage: any) => stage.questions.length), Array(10).fill(7));
      const questions = expanded.stages.flatMap((stage: any) => stage.questions);
      assert.deepEqual(questions.map((q: any) => [q.id, q.answerIds, q.correct]), english.map((q: any) => [q.id, q.answerIds, q.correct]));
      const positions = [0, 0, 0];
      for (const q of questions) {
        assert.equal(q.answers.length, 3);
        assert.equal(new Set(q.answers).size, 3);
        assert.ok(q.answers[q.correct]);
        positions[q.correct]++;
        if (locale === 'en') assert.ok(key.includes(`| \`${q.id}\` | ${q.answers[q.correct]} |`));
      }
      assert.deepEqual(positions, [24, 23, 23]);
    }
    const nextManifest = structuredClone(manifest), nextCopies = structuredClone(copies);
    applyTextThreeChoices(nextManifest, nextCopies);
    assert.deepEqual(nextManifest, manifest);
    assert.deepEqual(nextCopies, copies);
  });
}

test('three-choice authoring removes only wrong answers without changing reading order', () => {
  const questions = Array.from({length: 12}, (_, index) => ({answerIds: ['a1', 'a2', 'a3', 'a4'], correctAnswerId: `a${index % 4 + 1}`}));
  const original = structuredClone(questions), positions = [0, 0, 0];
  const plan = choicePlan(questions);
  for (const [index, answers] of plan.entries()) {
    assert.equal(answers.length, 3);
    assert.deepEqual(answers, questions[index].answerIds.filter(id => answers.includes(id)));
    assert.ok(answers.includes(questions[index].correctAnswerId));
    positions[answers.indexOf(questions[index].correctAnswerId)]++;
  }
  assert.deepEqual(questions, original);
  assert.deepEqual(positions, [4, 4, 4]);
  assert.throws(() => choicePlan([{answerIds: ['a1', 'a2', 'a3', 'a4'], correctAnswerId: 'missing'}]));
});
