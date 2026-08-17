import assert from "node:assert/strict";
import test from "node:test";

import {
  RESULT_RECOMMENDATIONS,
  nextResultRecommendation,
  supportsResultRecommendation,
} from "./resultRecommendations.ts";

test("the result recommendation pool contains only the five recent quizzes", () => {
  assert.deepEqual(
    RESULT_RECOMMENDATIONS.map((quiz) => quiz.slug),
    ["memory", "chef", "paramedic", "years-left", "vintage"],
  );
});

test("recommendations never return the quiz that has just been completed", () => {
  for (const quiz of RESULT_RECOMMENDATIONS) {
    assert.equal(supportsResultRecommendation(quiz.slug), true);
    assert.notEqual(nextResultRecommendation(quiz.slug)?.slug, quiz.slug);
  }
  assert.equal(supportsResultRecommendation("grammar"), false);
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
