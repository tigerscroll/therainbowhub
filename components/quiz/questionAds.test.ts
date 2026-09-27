import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { expandQuizLocale } from "../../scripts/quiz-schema-v2.mjs";
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

test("display-ad requests are isolated to the opt-in article implementation", () => {
  assert.equal(fs.existsSync("components/quiz/QuestionDisplayAd.tsx"), false);
  for (const directory of ["components", "lib", "app"]) {
    for (const path of fs.readdirSync(directory, { recursive: true })) {
      if (typeof path !== "string" || !/\.(tsx?|jsx?)$/.test(path) || path.endsWith(".test.ts")) continue;
      if (directory === "components" && path === "article/articleAds.ts") continue;
      assert.doesNotMatch(fs.readFileSync(`${directory}/${path}`, "utf8"), /mountDisplayAd|QuestionDisplayAd|data-display-ad|\.defineSlot(?:\?\.)?\s*\(|displayAdUnitPath/, `${directory}/${path}`);
    }
  }
});
test("Mechanic uses the automatic rewarded-only flow", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/mechanic/quiz.json", "utf8"));
  assert.equal(manifest.template, "ten-stage-seven-question-v1");
  assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  assert.equal(manifest.structure.stages.length, 10);
  assert.equal(manifest.structure.stages[0].questionIds.length,7);
  assert.equal(manifest.engine.targetRatio, 0.8);
});
test("quiz gates keep rewarded while monetized articles share display for banners and rewards", () => {
  const config = fs.readFileSync("lib/siteConfig.ts", "utf8");
  assert.match(config, /rewardedAdUnitPath: "\/22677279144\/rewarded"/);
  assert.doesNotMatch(config, /quizInterstitialAdUnitPath/);
  assert.match(config, /articleDisplayAdUnitPath: "\/22677279144\/display"/);
  const quizGate = fs.readFileSync("components/experience/useRewardedGate.ts", "utf8");
  assert.match(quizGate, /adUnitPath: siteConfig.rewardedAdUnitPath/);
  const articleGate = fs.readFileSync("components/article/ArticleUnlock.tsx", "utf8");
  assert.match(articleGate, /requestArticleReward\(\{ adUnitPath: siteConfig.articleDisplayAdUnitPath/);
  const articleDisplay = fs.readFileSync("components/article/ArticleDisplayAd.tsx", "utf8");
  assert.match(articleDisplay, /mountArticleDisplayAd\(id, siteConfig.articleDisplayAdUnitPath/);
});
test("answers remain buttons and do not trigger ads or link navigation", () => {
  const source = fs.readFileSync("components/quiz/QuizEngine.tsx", "utf8");
  const renderer = fs.readFileSync("components/quiz/QuestionRenderer.tsx", "utf8");
  assert.match(source, /window.setTimeout\(moveForward/);
  assert.match(renderer, /<button/);
  assert.match(renderer, /disabled=\{answer !== undefined\}/);
  assert.doesNotMatch(renderer, /answerHref|data-quiz-interstitial|followAnswer/);
  const answerHandler = source.slice(source.indexOf("function answerQuestion("), source.indexOf("function completeStudy("));
  assert.doesNotMatch(answerHandler, /runRewardedGate|window\.location|pushState/);
});
test("Start, checkpoints and result breakdowns restore rewarded gates; interstitials are removed", () => {
  const engine = fs.readFileSync("components/quiz/QuizEngine.tsx", "utf8");
  assert.match(engine, /useRewardedGate/);
  assert.match(engine, /runRewardedGate\(beginQuiz\)/);
  assert.match(engine, /runRewardedGate\(next\)/);
  assert.match(engine, /runRewardedGate\(\(\) => setReviewUnlocked\(true\)/);
  assert.equal(fs.existsSync("components/quiz/QuizInterstitial.tsx"), false);
  for (const directory of ["components", "lib", "app"]) {
    for (const path of fs.readdirSync(directory, { recursive: true })) {
      if (typeof path !== "string" || !/\.(tsx?|jsx?)$/.test(path) || path.endsWith(".test.ts")) continue;
      assert.doesNotMatch(fs.readFileSync(`${directory}/${path}`, "utf8"), /INTERSTITIAL|useQuizInterstitial|data-quiz-interstitial/, `${directory}/${path}`);
    }
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
    const chosenIds = questions.map(() => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return `a${1 + ((seed >>> 16) % 4)}`;
    });
    const answers = (quiz: Quiz) => Object.fromEntries(quiz.questions.map((q, i) => [q.id, q.choiceIds!.indexOf(chosenIds[i])]));
    assert.deepEqual(scoreQuiz(shuffledQuiz, answers(shuffledQuiz)), scoreQuiz(baselineQuiz, answers(baselineQuiz)));
  }
  const calibrationId = Object.keys(manifest.structure.questions).find(id => manifest.structure.questions[id].calibration)!;
  assert.deepEqual(manifest.structure.questions[calibrationId].calibration, { a1: -1, a2: -0.25, a3: 0.5, a4: 1 });
  assert.doesNotMatch(questionCopy[calibrationId].question, /how far|clock.*run/i);
});
