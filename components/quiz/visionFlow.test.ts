import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { expandQuizLocale } from "../../scripts/quiz-schema-v2.mjs";

const manifest = JSON.parse(fs.readFileSync("data/quizzes/vision/quiz.json", "utf8"));
const copy = JSON.parse(fs.readFileSync("data/quizzes/vision/en.json", "utf8"));
const expanded = expandQuizLocale(manifest, copy, "en");
const questions = expanded.stages.flatMap((s: any) => s.questions);

test("Vision retains five six-question rounds, an 80% target and SPA checkpoints", () => {
  assert.equal(manifest.template, "five-stage-six-question-v1");
  assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  assert.equal(manifest.engine.targetRatio, .8);
  assert.deepEqual(manifest.structure.stages.map((s: any) => s.questionIds.length), [6,6,6,6,6]);
  assert.equal(new Set(questions.map((q: any) => q.id)).size, 30);
  assert.equal(Object.keys(copy.career.stages).length, 5);
  assert.equal(copy.career.stages["stage-5"].preAdChecks[0], "30 answers checked");
  assert.equal(copy.career.stages["stage-5"].next, undefined);
  assert.doesNotMatch(copy.landing.intro, /10|30/);
  assert.match(copy.about.disclaimer, /not an eye examination/);
});

test("Vision answer ordering preserves all thirty reviewed answer keys", () => {
  const expected = ["Bottom right", "Third", "M7K2P9", "▲", "←", "Star",
    "↖", "K4M8P2 / K4M8P2", "•••••••", "●", "7", "Key",
    "Coral square", "B4M", "Hexagon", "O", "Swatch C", "◇ ● ▲ ■",
    "Surrounding contrast changes their appearance", "C", "3", "The second character", "↙", "Third",
    "7 and N", "4", "Bottom centre", "Anchor", "5", "●"];
  assert.deepEqual(questions.map((q: any) => q.answers[q.correct]), expected);
  assert.deepEqual([0,1,2,3].map(i => questions.filter((q: any) => q.correct === i).length), [8,8,7,7]);
  assert.equal(new Set(questions.map((q: any) => q.category)).size, 6);
  const byId = Object.fromEntries(questions.map((q: any) => [q.id,q]));
  assert.equal((byId["vision-r3q6"].context.match(/F/g) ?? []).length, 7);
  assert.equal((byId["vision-r7q1"].context.match(/\bTHE\b/g) ?? []).length, 3);
  assert.equal((byId["vision-r8q6"].visual.items.join("").match(/★/g) ?? []).length, 5);
  assert.equal(byId["vision-r8q5"].study.items[3], "⚓");
  assert.equal(byId["vision-r1q5"].study.items[0], "⭐");
  assert.equal(questions.filter((q: any) => q.study).length, 4);
});

test("all thirty Vision locales preserve puzzle content and complete round coverage", () => {
  const locales = fs.readdirSync('data/i18n').filter(f => f.endsWith('.json')).map(f => f.slice(0,-5)).sort();
  assert.deepEqual([...manifest.activeLocales].sort(), locales);
  assert.equal(manifest.engine.localeParity, 'strict');
  for (const locale of locales) {
    const translated = JSON.parse(fs.readFileSync(`data/quizzes/vision/${locale}.json`, 'utf8'));
    const data = expandQuizLocale(manifest, translated, locale);
    assert.deepEqual(data.stages.map((s: any) => s.questions.length), [6,6,6,6,6], locale);
    const byId = Object.fromEntries(data.stages.flatMap((s: any) => s.questions).map((q: any) => [q.id,q])) as Record<string, any>;
    assert.equal((byId['vision-r7q1'].context.match(/\bTHE\b/g) ?? []).length, 3, locale);
    assert.ok(byId['vision-r7q1'].question.includes('THE'), locale);
    assert.ok(byId['vision-r5q1'].question.includes('↗'), `${locale}: mirror source arrow`);
    assert.match(byId['vision-r3q6'].question, /F/, `${locale}: literal Latin F`);
    assert.equal((byId['vision-r3q6'].context.match(/f/gi) ?? []).length, 7, locale);
    for (const id of ['vision-r1q5', 'vision-r8q5', 'vision-r9q5']) {
      const original = questions.find((q: any) => q.id === id);
      assert.deepEqual(byId[id].study.items, original.study.items, `${locale}/${id}: unchanged recall board`);
    }
    assert.deepEqual(byId['vision-r9q6'].visual.items.map((s: string) => s.match(/\p{Extended_Pictographic}/gu)?.join('')),
      ['🟦', '🟩', '🟦', '🟨'], `${locale}: colour-mismatch swatches`);
    const rawPairs = translated.stages['stage-5'].questions['vision-r10q2'].answers;
    assert.deepEqual(['a1','a2','a3','a4'].map(a => rawPairs[a].match(/[A-Z0-9]/g)),
      [['7','N'], ['8','6'], ['Q','P'], ['K','R']], `${locale}: literal code characters`);
    assert.deepEqual(byId['vision-r10q2'].visual.items.map((s: string) => s.split('::')[1].trim()),
      ['M8Q2-K7P4-R6N3', 'M8Q2-K1P4-R6M3'], `${locale}: comparison codes`);
    const translatedVisuals = new Set(['vision-r1q1', 'vision-r1q2', 'vision-r9q1', 'vision-r9q6', 'vision-r10q2']);
    for (const original of questions) {
      if (original.visual?.items && !translatedVisuals.has(original.id)) {
        assert.deepEqual(byId[original.id].visual.items, original.visual.items, `${locale}/${original.id}: literal puzzle`);
      }
    }
    const q = byId['vision-r5q6'];
    const raw = translated.stages['stage-2'].questions['vision-r5q6'];
    [raw.answers.a4,raw.answers.a3,raw.answers.a1,raw.answers.a2].forEach((object: string,i: number) => {
      assert.ok(q.study.items[i].toLocaleLowerCase(locale).includes(object.toLocaleLowerCase(locale)), `${locale}: recall object ${i}`);
    });
    for (const s of data.stages) for (const q of s.questions) {
      assert.equal(new Set(q.answers).size, 4, `${locale}/${q.id}`);
      assert.ok(q.answers[q.correct], `${locale}/${q.id}: correct answer`);
    }
    if (locale !== 'en') {
      const svg = fs.readFileSync(`data/quizzes/vision/assets/icons/paper-fold-punch-${locale}.svg`, 'utf8');
      assert.doesNotMatch(svg, /FOLD LEFT TO RIGHT|FOLD TOP TO BOTTOM|PUNCH ONCE|UNFOLD|Four illustrated steps/);
      assert.match(svg, /<desc id="desc">[^<]+<\/desc>/);
      assert.ok(byId['vision-r10q4'].image.src.includes(`paper-fold-punch-${locale}.svg`));
    }
  }
});
