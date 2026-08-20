import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  RESULT_RECOMMENDATIONS,
  nextResultRecommendation,
  otherResultRecommendations,
  supportsResultRecommendation,
} from "./resultRecommendations.ts";

test("the result recommendation pool contains the approved recent quizzes", () => {
  assert.deepEqual(
    RESULT_RECOMMENDATIONS.map((quiz) => quiz.slug),
    ["memory", "paramedic", "years-left", "vintage", "vision", "nursing", "midwifery", "grammar", "idiom", "iq"],
  );
});

test("every promoted result recommendation is a one-stage supported-length quiz", () => {
  for (const recommendation of RESULT_RECOMMENDATIONS) {
    const folder = join(process.cwd(), "data", "quizzes", recommendation.slug);
    const config = JSON.parse(readFileSync(join(folder, "quiz.json"), "utf8"));
    const locale = JSON.parse(readFileSync(join(folder, "en.json"), "utf8"));
    assert.equal(
      config.engine.flow === "linear" ||
        (config.engine.flow === "staged" && config.engine.localeParity === "independent"),
      true,
      recommendation.slug,
    );
    assert.equal(locale.stages.length, 1, recommendation.slug);
    assert.equal(
      locale.stages[0].questions.length,
      10,
      recommendation.slug,
    );
  }
});

test("recommendations never return the quiz that has just been completed", () => {
  for (const quiz of RESULT_RECOMMENDATIONS) {
    assert.equal(supportsResultRecommendation(quiz.slug), true);
    assert.notEqual(nextResultRecommendation(quiz.slug)?.slug, quiz.slug);
  }
  assert.equal(supportsResultRecommendation("mechanic"), false);
});

test("repeat result visits rotate through every other recent quiz", () => {
  for (const quiz of RESULT_RECOMMENDATIONS) {
    const seen: string[] = [];
    let previous: string | undefined;
    for (let visit = 0; visit < RESULT_RECOMMENDATIONS.length - 1; visit += 1) {
      const recommendation = nextResultRecommendation(quiz.slug, previous);
      assert.ok(recommendation);
      assert.notEqual(recommendation.slug, quiz.slug);
      seen.push(recommendation.slug);
      previous = recommendation.slug;
    }
    assert.equal(new Set(seen).size, RESULT_RECOMMENDATIONS.length - 1);
  }
});

test("the full recommendation section excludes the current and sticky quizzes", () => {
  const recommendations = otherResultRecommendations("vision", "midwifery");
  assert.equal(recommendations.length, 4);
  assert.equal(recommendations.some((quiz) => quiz.slug === "vision"), false);
  assert.equal(recommendations.some((quiz) => quiz.slug === "midwifery"), false);
  assert.deepEqual(recommendations.map((quiz) => quiz.slug), ["memory", "paramedic", "years-left", "vintage"]);
});
