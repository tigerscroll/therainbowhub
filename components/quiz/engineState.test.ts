import assert from "node:assert/strict";
import test from "node:test";

import { getCareerResultBand, getStageCompletionPercentage } from "./engineState.ts";

const questions = [
  { id: "first", stage: 0 },
  { id: "second", stage: 0 },
  { id: "third", stage: 0 },
  { id: "next-stage", stage: 1 },
];

test("stage completion starts at zero and counts only submitted answers", () => {
  assert.equal(getStageCompletionPercentage(questions, {}, 0), 0);
  assert.equal(getStageCompletionPercentage(questions, { first: 0 }, 0), 33);
  assert.equal(getStageCompletionPercentage(questions, { first: 0, second: 1, third: 0 }, 0), 100);
});

test("stage completion ignores answers from other stages", () => {
  assert.equal(getStageCompletionPercentage(questions, { first: 0, "next-stage": 0 }, 0), 33);
  assert.equal(getStageCompletionPercentage(questions, { first: 0, "next-stage": 0 }, 1), 100);
  assert.equal(getStageCompletionPercentage(questions, {}, 99), 0);
});

test("eight-question career rounds use exact 7–8, 4–6 and 0–3 result bands", () => {
  assert.deepEqual(
    Array.from({ length: 9 }, (_, correct) => getCareerResultBand(correct, 8)),
    ["low", "low", "low", "low", "medium", "medium", "medium", "high", "high"],
  );
});

test("six-question career rounds retain their 5–6, 3–4 and 0–2 result bands", () => {
  assert.deepEqual(
    Array.from({ length: 7 }, (_, correct) => getCareerResultBand(correct, 6)),
    ["low", "low", "low", "medium", "medium", "high", "high"],
  );
});
