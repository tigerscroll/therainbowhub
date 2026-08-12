import assert from "node:assert/strict";
import test from "node:test";

import type { QuizEstimateConfig } from "../../lib/quizzes.ts";
import { answerConsistencyFromShares, calculateEstimatedAge, rankDimensions } from "./scoring.ts";

const estimate: QuizEstimateConfig = {
  baseAge: 84,
  minAge: 73,
  maxAge: 95,
  calibrationMax: 3,
  profileAdjustments: {},
  brainAdjustments: { "0": -3, "1": -2, "2": -1, "3": 0, "4": 1, "5": 3 },
};

test("brain score boundaries apply the configured restrained adjustment", () => {
  const expected = [81, 82, 83, 84, 85, 87];
  for (let correct = 0; correct <= 5; correct += 1) {
    assert.equal(calculateEstimatedAge(estimate, { personality: 0, brain: estimate.brainAdjustments[String(correct)], calibration: 0 }), expected[correct]);
  }
});

test("personality and calibration extremes remain additive and restrained", () => {
  assert.equal(calculateEstimatedAge(estimate, { personality: 5, brain: 3, calibration: 3 }), 95);
  assert.equal(calculateEstimatedAge(estimate, { personality: -5, brain: -3, calibration: -3 }), 73);
  assert.equal(calculateEstimatedAge(estimate, { personality: 1, brain: 0, calibration: 1.49 }), 86);
});

test("final safety clamp always wins", () => {
  assert.equal(calculateEstimatedAge(estimate, { personality: 50, brain: 50, calibration: 50 }), 95);
  assert.equal(calculateEstimatedAge(estimate, { personality: -50, brain: -50, calibration: -50 }), 73);
});

test("answer consistency uses exact percentage-point thresholds", () => {
  assert.equal(answerConsistencyFromShares(56, 44, 100), "high");
  assert.equal(answerConsistencyFromShares(53, 47, 100), "medium");
  assert.equal(answerConsistencyFromShares(52.99, 47.01, 100), "mixed");
});

test("strongest signal and wildcard use the top two dimensions", () => {
  assert.deepEqual(rankDimensions({ Balance: 24, Adventure: 31, Recovery: 18 }), {
    strongestSignal: "Adventure",
    wildcard: "Balance",
  });
});
