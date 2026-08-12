import assert from "node:assert/strict";
import test from "node:test";

import type { Quiz, QuizEstimateConfig } from "../../lib/quizzes.ts";
import { answerConsistencyFromShares, calculateDerivedScore, calculateEstimatedAge, getTargetStatus, rankDimensions, scoreQuiz } from "./scoring.ts";

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

function memoryQuiz(): Quiz {
  const categories = ["word_recall", "visual", "numbers", "working_memory", "association", "attention"];
  return {
    engine: {
      scoring: { type: "correct-answer" },
      targetRatio: 0.8,
    },
    questions: Array.from({ length: 60 }, (_, index) => ({
      id: `m-${index + 1}`,
      answerIndex: 0,
      category: categories[index % categories.length],
      stage: Math.floor(index / 6),
    })),
    stages: Array.from({ length: 10 }, (_, index) => `Round ${index + 1}`),
    result: {
      profiles: [
        { minRatio: 0.9, title: "Memory Mastermind" },
        { minRatio: 0.8, title: "Razor-Sharp Recall" },
        { minRatio: 0.7, title: "Almost Unforgettable" },
        { minRatio: 0.6, title: "Selective Genius" },
        { minRatio: 0.5, title: "Memory With Opinions" },
        { minRatio: 0, title: "Beautifully Distracted" },
      ],
      scoreDimensions: categories.map((category) => ({ label: category, categories: [category] })),
    },
  } as Quiz;
}

function answersWithCorrectCount(correct: number) {
  return Object.fromEntries(Array.from({ length: 60 }, (_, index) => [`m-${index + 1}`, index < correct ? 0 : 1]));
}

test("Memory result profiles switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  const cases = [
    [29, "Beautifully Distracted"],
    [30, "Memory With Opinions"],
    [35, "Memory With Opinions"],
    [36, "Selective Genius"],
    [41, "Selective Genius"],
    [42, "Almost Unforgettable"],
    [47, "Almost Unforgettable"],
    [48, "Razor-Sharp Recall"],
    [53, "Razor-Sharp Recall"],
    [54, "Memory Mastermind"],
  ] as const;
  for (const [correct, profile] of cases) {
    assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
  }
});

test("80% target state distinguishes achieved, reachable and unreachable", () => {
  assert.equal(getTargetStatus(48, 48, 60, 0.8), "achieved");
  assert.equal(getTargetStatus(36, 48, 60, 0.8), "reachable");
  assert.equal(getTargetStatus(35, 48, 60, 0.8), "unreachable");
});

test("correct-answer summaries break category and round ties by first encounter", () => {
  const result = scoreQuiz(memoryQuiz(), answersWithCorrectCount(30));
  assert.equal(result.strongestSignal, "word_recall");
  assert.equal(result.weakestSignal, "word_recall");
  assert.equal(result.bestStage, "Round 1");
});

test("derived IQ Challenge Score interpolates and rounds at every acceptance boundary", () => {
  const config = {
    breakpoints: [{ ratio: 0, value: 70 }, { ratio: 0.5, value: 100 }, { ratio: 1, value: 145 }],
    roundTo: 5,
  };
  const expected = new Map([[0, 70], [15, 85], [30, 100], [36, 110], [42, 120], [48, 125], [54, 135], [60, 145]]);
  for (const [correct, score] of expected) assert.equal(calculateDerivedScore(config, correct / 60), score);
  assert.equal(calculateDerivedScore(config, -0.25), 70);
  assert.equal(calculateDerivedScore(config, 1.25), 145);
  assert.equal(calculateDerivedScore(config, 0.5000000001), 100);
});

test("IQ result profiles switch at each exact boundary", () => {
  const quiz = memoryQuiz();
  quiz.engine.derivedScore = {
    breakpoints: [{ ratio: 0, value: 70 }, { ratio: 0.5, value: 100 }, { ratio: 1, value: 145 }],
    roundTo: 5,
  };
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Systems Mastermind" },
    { minRatio: 0.8, title: "The Precision Thinker" },
    { minRatio: 0.7, title: "The Pattern Navigator" },
    { minRatio: 0.6, title: "The Adaptive Solver" },
    { minRatio: 0.5, title: "The Curious Analyst" },
    { minRatio: 0, title: "The Creative Wildcard" },
  ];
  const cases = [
    [29, "The Creative Wildcard"], [30, "The Curious Analyst"], [35, "The Curious Analyst"],
    [36, "The Adaptive Solver"], [41, "The Adaptive Solver"], [42, "The Pattern Navigator"],
    [47, "The Pattern Navigator"], [48, "The Precision Thinker"], [53, "The Precision Thinker"],
    [54, "The Systems Mastermind"], [60, "The Systems Mastermind"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
});

test("configured tie-breaking prefers harder correct categories and the later best round", () => {
  const quiz = {
    engine: { scoring: { type: "correct-answer" }, tieBreaks: { categories: "harder-correct", bestRound: "later" } },
    questions: [
      { id: "a", answerIndex: 0, category: "first", stage: 0 },
      { id: "b", answerIndex: 0, category: "second", stage: 1 },
    ],
    stages: ["First", "Second"],
    result: {
      profiles: [{ minRatio: 0, title: "Profile" }],
      scoreDimensions: [{ label: "First area", categories: ["first"] }, { label: "Second area", categories: ["second"] }],
    },
  } as Quiz;
  const result = scoreQuiz(quiz, { a: 0, b: 0 });
  assert.equal(result.strongestSignal, "Second area");
  assert.equal(result.weakestSignal, "First area");
  assert.equal(result.bestStage, "Second");
});
