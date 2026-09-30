import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { expandQuizLocale } from "../../scripts/quiz-schema-v2.mjs";
import { QUIZ_TEMPLATE_CONTRACTS } from "../../scripts/quiz-template-contracts.mjs";
import { resolveQuizLocaleManifest } from "../../lib/quiz/localeManifest.mjs";
import { scoreQuiz } from "./scoring.ts";
import type { Quiz } from "../../lib/quizzes.ts";

test("full-document navigation has no page-load fade or cross-document transition", () => {
  const css = fs.readFileSync("styles/site.css", "utf8");
  assert.doesNotMatch(css, /@view-transition|site-page-in|site-page-out/);
});

test("restoring a quiz keeps its matching shell visible without flashing landing content", () => {
  const css = fs.readFileSync("styles/quiz-engine.css", "utf8");
  assert.doesNotMatch(css, /\.quiz-resuming\s+\.quiz-theme\s*\{[^}]*visibility:\s*hidden/);
  assert.match(css, /\.quiz-resuming \.quiz-engine__landing > \*,\s*\.quiz-resuming \.quiz-engine__about \{ visibility: hidden; \}/);
  assert.match(css, /\.quiz-resuming \.quiz-engine__landing \{ pointer-events: none; \}/);
  assert.match(css, /:where\(html:not\(\.quiz-resuming\)\) \.quiz-theme\[data-quiz-theme\]:has\(\.quiz-engine__landing\)/);
});

test("quizzes request only rewarded ads without native, display or interstitial placements", () => {
  const engine = fs.readFileSync("components/quiz/QuizEngine.tsx", "utf8");
  assert.match(engine, /useRewardedGate/);
  assert.match(engine, /if \(quiz\.engine\.rewarded\.start\) void runRewardedGate/);
  assert.match(engine, /if \(quiz\.engine\.rewarded\.stages\) void runRewardedGate/);
  assert.doesNotMatch(engine, /QuizNativeAd|QuestionDisplayAd|mountQuizInterstitial|INTERSTITIAL|nextQuestionHref|data-quiz-next/);
  const config = fs.readFileSync("lib/siteConfig.ts", "utf8");
  assert.doesNotMatch(config, /displayAdUnitPath|quizNativeAdUnitPath/);
  assert.match(config, /rewardedAdUnitPath: "\/22677279144\/rewarded"/);
  const templates = fs.readFileSync("lib/quizzes.ts", "utf8").split("export type QuizTemplateId")[0];
  assert.equal((templates.match(/rewarded: \{ start: true, stages: true, attempts: 3, confirmStart: false \}/g) ?? []).length, Object.keys(QUIZ_TEMPLATE_CONTRACTS).length);
  for (const file of fs.readdirSync("data/i18n")) {
    if (!file.endsWith(".json")) continue;
    const copy = JSON.parse(fs.readFileSync(`data/i18n/${file}`, "utf8"));
    assert.ok(copy.ad.advertisement.trim(), file);
    assert.ok(copy.quiz.nextQuestion.trim(), file);
  }
});
test("Mechanic retains its shared chapters and scoring", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/mechanic/quiz.json", "utf8"));
  assert.equal(manifest.template, "ten-stage-seven-question-v1");
  assert.equal(manifest.engine.hardRefreshCheckpoints, true);
  assert.equal(manifest.structure.stages.length, 10);
  assert.equal(manifest.structure.stages[0].questionIds.length,7);
  assert.equal(manifest.engine.targetRatio, 0.8);
});
test("answers proceed automatically and checkpoint reloads save progress first", () => {
  const source = fs.readFileSync("components/quiz/QuizEngine.tsx", "utf8");
  const renderer = fs.readFileSync("components/quiz/QuestionRenderer.tsx", "utf8");
  assert.match(source, /window\.setTimeout\(moveForward/);
  assert.match(renderer, /<button/);
  assert.doesNotMatch(source, /data-quiz-next|quiz-engine__next-question/);
  assert.match(source, /if \(!writeQuizProgress\(storageKey, JSON\.stringify\(saved\)\)\) return false;\s*window\.location\.reload\(\);/);
  assert.match(renderer, /"data-google-interstitial": "false"/);
});

test("Meta QuizComplete is sent at the final result, never from an ad or answer interaction", () => {
  const source = fs.readFileSync("components/quiz/QuizEngine.tsx", "utf8");
  assert.match(source, /window\.fbq\?\.\("trackCustom", "QuizComplete", \{ quiz_slug: quiz\.slug, locale \}\)/);
  const completion = source.slice(source.indexOf("function continueAfterCheckpoint()"), source.indexOf("function restartQuiz()"));
  assert.match(completion, /if \(isFinalStage\) \{\s*setScreen\("results"\);\s*trackQuizComplete\(quiz, locale\);/);
  const answer = source.slice(source.indexOf("function answerQuestion("), source.indexOf("function completeStudy("));
  assert.doesNotMatch(answer, /fbq|trackQuizComplete|refresh|scrollToTop/);
  assert.doesNotMatch(fs.readFileSync("components/quiz/rewardedAds.ts", "utf8"), /AdClick|QuizComplete/);
});

test("Years Left, Vision, Nursing, Midwifery, Memory, IQ and Marry opt into the first-answer entry across their locales", () => {
  const locales = fs.readdirSync("data/i18n").filter(name => name.endsWith(".json")).map(file => file.slice(0, -5));
  for (const slug of fs.readdirSync("data/quizzes")) {
    const file = `data/quizzes/${slug}/quiz.json`;
    if (!fs.existsSync(file)) continue;
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    const firstAnswerEntry = ["years-left", "vision", "nursing", "midwifery", "memory", "iq", "marry"].includes(slug);
    assert.equal(manifest.engine.entry === "first-answer", firstAnswerEntry, slug);
    if (firstAnswerEntry) {
      for (const locale of locales) assert.equal(resolveQuizLocaleManifest(manifest, locale).engine.entry, "first-answer");
    }
  }
  for (const locale of locales) {
    const translations = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, "utf8"));
    assert.equal(typeof translations.ad.continueNote, "string");
    assert.ok(translations.ad.continueNote.trim().length > 0, locale);
  }
});
test("Years Left keeps each choice's score and calibration regardless of answer order", () => {
  const manifest = resolveQuizLocaleManifest(JSON.parse(fs.readFileSync("data/quizzes/years-left/quiz.json", "utf8")), "en");
  const copy = JSON.parse(fs.readFileSync("data/quizzes/years-left/en.json", "utf8"));
  const originalOrder = structuredClone(manifest);
  for (const question of Object.values(originalOrder.structure.questions) as { answerIds: string[] }[]) question.answerIds.sort();
  const expanded = expandQuizLocale(manifest, copy, "en");
  const baseline = expandQuizLocale(originalOrder, copy, "en");
  const questions = expanded.stages.flatMap((stage: { questions: any[] }) => stage.questions);
  const questionCopy = Object.assign({}, ...Object.values(copy.stages).map((stage: any) => stage.questions));
  for (const q of questions) {
    const logic = manifest.structure.questions[q.id];
    q.answerIds.forEach((id: string, index: number) => {
      const label = questionCopy[q.id].answers[id];
      assert.equal(Object.keys(q.answers)[index], label);
      assert.deepEqual(Object.values(q.answers)[index], logic.choiceMeanings[id]);
      if (logic.calibration) assert.equal(q.calibration[index], logic.calibration[id]);
    });
  }
  const asQuiz = (data: typeof expanded) => ({
    engine: { scoring: { type: "weighted-profile" }, estimate: manifest.engine.estimate },
    stages: data.stages.map((stage: { title: string }) => stage.title),
    questions: data.stages.flatMap((stage: { questions: typeof questions }, stageIndex: number) => stage.questions.map((q: typeof questions[number]) => ({
      id: q.id, stage: stageIndex, choiceIds: q.answerIds, choices: Object.keys(q.answers),
      choiceWeights: Object.values(q.answers), calibrationValues: q.calibration,
    }))),
    result: { profiles: data.results.profiles, scoreDimensions: data.results.dimensions.map((d: { label: string; profiles: string[] }) => ({ label: d.label, categories: d.profiles })) },
  }) as Quiz;
  const shuffledQuiz = asQuiz(expanded);
  const baselineQuiz = asQuiz(baseline);
  let seed = 317;
  for (let run = 0; run < 256; run++) {
    const chosenIds = questions.map((question: { answerIds: string[] }) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return question.answerIds[(seed >>> 16) % question.answerIds.length];
    });
    const answers = (quiz: Quiz) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.choiceIds!.indexOf(chosenIds[i])]));
    assert.deepEqual(scoreQuiz(shuffledQuiz, answers(shuffledQuiz)), scoreQuiz(baselineQuiz, answers(baselineQuiz)));
  }
  const calibrationId = Object.keys(manifest.structure.questions).find(id => manifest.structure.questions[id].calibration)!;
  assert.deepEqual(manifest.structure.questions[calibrationId].calibration, { a1: -1, a3: 0.5, a4: 1 });
  assert.doesNotMatch(questionCopy[calibrationId].question, /how far|clock.*run/i);
});
