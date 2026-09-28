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

test("the quiz-only site has no display-ad requests", () => {
  assert.equal(fs.existsSync("components/quiz/QuestionDisplayAd.tsx"), false);
  for (const directory of ["components", "lib", "app"]) {
    for (const path of fs.readdirSync(directory, { recursive: true })) {
      if (typeof path !== "string" || !/\.(tsx?|jsx?)$/.test(path) || path.endsWith(".test.ts")) continue;
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
test("quiz gates use the rewarded placement without an article ad unit", () => {
  const config = fs.readFileSync("lib/siteConfig.ts", "utf8");
  assert.match(config, /rewardedAdUnitPath: "\/22677279144\/rewarded"/);
  assert.doesNotMatch(config, /quizInterstitialAdUnitPath|articleDisplayAdUnitPath|\/22677279144\/display/);
  const quizGate = fs.readFileSync("components/experience/useRewardedGate.ts", "utf8");
  assert.match(quizGate, /adUnitPath: siteConfig.rewardedAdUnitPath/);
  assert.equal(fs.existsSync("components/article/ArticleUnlock.tsx"), false);
  assert.equal(fs.existsSync("components/article/ArticleDisplayAd.tsx"), false);
});
test("answers remain buttons; only an opted-in first-answer entry can request a reward", () => {
  const source = fs.readFileSync("components/quiz/QuizEngine.tsx", "utf8");
  const renderer = fs.readFileSync("components/quiz/QuestionRenderer.tsx", "utf8");
  assert.match(source, /window.setTimeout\(moveForward/);
  assert.match(renderer, /<button/);
  assert.match(renderer, /disabled=\{studyBusy \|\| answer !== undefined\}/);
  assert.doesNotMatch(renderer, /answerHref|data-quiz-interstitial|followAnswer/);
  const answerHandler = source.slice(source.indexOf("function answerQuestion("), source.indexOf("function completeStudy("));
  assert.doesNotMatch(answerHandler, /window\.location|pushState/);
  assert.match(source, /const firstAnswerReward = quiz\.engine\.startOnLoad && quiz\.engine\.rewarded\.start && questionIndex === 0/);
  assert.match(answerHandler, /if \(firstAnswerReward\) \{\s*setPendingAnswer\([\s\S]*?void runGate\(\(\) => \{\s*acceptAnswer\(\);\s*setPendingAnswer\(undefined\);\s*if \(quiz\.engine\.flow\.advance === "automatic"\) moveForward\(\);\s*\}, \{ scrollAfter: false, retryOnClose: false \}\);/);
  assert.doesNotMatch(answerHandler, /setTimeout/, 'first-answer reward completion has no additional answer delay');
  assert.match(answerHandler, /else acceptAnswer\(\)/);
  assert.match(source, /translations\.ad\.continueNote/);
  assert.match(renderer, /aria-describedby=\{answerNoteId\}/);
  assert.match(renderer, /const selected = answer === index \|\| pending/);
  assert.match(renderer, /"data-pending": pending \|\| undefined/);
  assert.ok(source.lastIndexOf('id="quiz-first-answer-note"') > source.lastIndexOf('<QuestionRenderer'), 'ad note follows answers');
});

test("only Years Left opts into the first-answer entry across its locales", () => {
  const locales = fs.readdirSync("data/i18n").filter(name => name.endsWith(".json")).map(file => file.slice(0, -5));
  for (const slug of fs.readdirSync("data/quizzes")) {
    const file = `data/quizzes/${slug}/quiz.json`;
    if (!fs.existsSync(file)) continue;
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.equal(manifest.engine.entry === "first-answer", slug === "years-left", slug);
    if (slug === "years-left") {
      for (const locale of locales) assert.equal(resolveQuizLocaleManifest(manifest, locale).engine.entry, "first-answer");
    }
  }
  for (const locale of locales) {
    const translations = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, "utf8"));
    assert.equal(typeof translations.ad.continueNote, "string");
    assert.ok(translations.ad.continueNote.trim().length > 0, locale);
  }
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
