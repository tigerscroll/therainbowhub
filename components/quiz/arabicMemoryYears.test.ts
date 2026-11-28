import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {directionalParts} from './directionalText.ts';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
function leaves(value: any, path = '', output: Record<string, string> = {}) {
  if (typeof value === 'string') output[path] = value;
  else for (const [key, text] of Object.entries(value)) leaves(text, `${path}/${key}`, output);
  return output;
}

test('Arabic Memory and Years Left translate every narrative field without directional-control hacks', () => {
  for (const slug of ['memory', 'years-left']) {
    const copy = read(slug, 'ar'), manifest = read(slug, 'quiz');
    assert.ok(manifest.activeLocales.includes('ar'));
    assert.equal(manifest.engine.entry, 'landing');
    assert.equal(manifest.engine.hardRefreshCheckpoints, true);
    assert.equal(manifest.engine.displayAds, undefined);
    for (const [path, text] of Object.entries(leaves(copy))) {
      if (!path.includes('/answers/') && !path.endsWith('/tier')) assert.match(text, /\p{Script=Arabic}/u, `${slug}${path}`);
      assert.doesNotMatch(text, /[\u202a-\u202e\u2066-\u2069]/u, `${slug}${path}: use the renderer for bidi isolation`);
      if (path.endsWith('/question')) assert.doesNotMatch(text, /\?/u, `${slug}${path}: Arabic question punctuation`);
    }
    const checkpoints = Object.values(copy.career.stages) as Array<{preAdButton: string}>;
    for (const checkpoint of checkpoints.slice(0, -1)) assert.equal(checkpoint.preAdButton, 'متابعة');
    assert.equal(checkpoints.at(-1)?.preAdButton, 'عرض نتيجتي');
  }
  assert.deepEqual(read('years-left', 'ar').landing, {cta: 'ابدأ'});
  assert.equal(read('memory', 'ar').landing.cta, 'ابدأ');
});

test('Arabic Memory retains unambiguous maths, Latin answer tokens and native word relationships', () => {
  const copy = read('memory', 'ar'), manifest = read('memory', 'quiz');
  const questions = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));
  const answer = (id: string) => questions[id].answers[manifest.structure.questions[id].correctAnswerId];
  assert.equal(answer('memory-gk-s1q7'), 'R');
  assert.equal(answer('memory-gk-s8q4'), 'نستمع إليها');
  assert.equal(answer('memory-gk-s8q5'), 'الكتابة');
  assert.equal(answer('memory-gk-s8q6'), 'سمكة وسرب من الأسماك');
  assert.equal(answer('memory-gk-s9q4'), '3 غ/سم³');
  assert.match(questions['memory-gk-s9q5'].question, /سالب 3/);
  assert.equal(answer('memory-gk-s9q5'), '8');
  const final = questions['memory-gk-s10q4'].question;
  for (const token of ['A = 1', 'B = 2', 'C = 3', 'CAB']) assert.ok(directionalParts(final).some(part => part.ltr && part.text.includes(token)), token);
  assert.equal(answer('memory-gk-s10q4'), '6');
});
