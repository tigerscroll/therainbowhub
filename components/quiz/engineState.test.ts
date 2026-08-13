import assert from "node:assert/strict";
import test from "node:test";

import { getStageCompletionPercentage } from "./engineState.ts";

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
