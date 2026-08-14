import assert from "node:assert/strict";
import test from "node:test";

import type { Quiz, QuizEstimateConfig } from "../../lib/quizzes.ts";
import { answerConsistencyFromShares, calculateDerivedScore, calculateEstimatedAge, getTargetStatus, rankDimensions, rankProfileRevealDimensions, scoreHybridMatch, scoreQuiz } from "./scoring.ts";

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

test("profile reveal excludes the winning animal's dimension from hidden energy", () => {
  const dimensions = [
    { label: "Command and Courage", categories: ["tiger", "eagle"] },
    { label: "Loyalty and Protection", categories: ["wolf", "bear"] },
    { label: "Warmth and Sensitivity", categories: ["deer", "dolphin"] },
  ];
  assert.deepEqual(rankProfileRevealDimensions(dimensions, {
    tiger: 12, eagle: 2, wolf: 5, bear: 3, deer: 6, dolphin: 5,
  }, "tiger"), {
    strongestEnergy: "Command and Courage",
    hiddenEnergy: "Warmth and Sensitivity",
  });
  assert.deepEqual(rankProfileRevealDimensions(dimensions, {
    tiger: 1, eagle: 1, wolf: 1, bear: 1, deer: 1, dolphin: 1,
  }, "tiger"), {
    strongestEnergy: "Command and Courage",
    hiddenEnergy: "Loyalty and Protection",
  });
});

test("weighted-profile ties keep fixed profile order", () => {
  const quiz = {
    engine: { scoring: { type: "weighted-profile" } },
    questions: [{ id: "aura-choice", stage: 0, choiceWeights: [{ tiger: .5, wolf: .5 }] }],
    stages: ["Mirror"],
    result: {
      profiles: [
        { id: "tiger", minRatio: 0, tier: "TIGER", title: "Tiger", copy: "", percentile: "" },
        { id: "wolf", minRatio: 0, tier: "WOLF", title: "Wolf", copy: "", percentile: "" },
      ],
      scoreDimensions: [
        { label: "Command", categories: ["tiger"] },
        { label: "Loyalty", categories: ["wolf"] },
      ],
      profileReveal: {} as Quiz["result"]["profileReveal"],
    },
  } as Quiz;
  assert.equal(scoreQuiz(quiz, { "aura-choice": 0 }).profile.id, "tiger");
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

test("Biology result profiles switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Living Encyclopedia" },
    { minRatio: 0.8, title: "The Natural Scientist" },
    { minRatio: 0.7, title: "The Field Researcher" },
    { minRatio: 0.6, title: "The Curious Biologist" },
    { minRatio: 0.5, title: "The Life Explorer" },
    { minRatio: 0, title: "The Nature Detective" },
  ];
  const cases = [
    [29, "The Nature Detective"], [30, "The Life Explorer"], [35, "The Life Explorer"],
    [36, "The Curious Biologist"], [41, "The Curious Biologist"], [42, "The Field Researcher"],
    [47, "The Field Researcher"], [48, "The Natural Scientist"], [53, "The Natural Scientist"],
    [54, "The Living Encyclopedia"], [60, "The Living Encyclopedia"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
});

test("Mechanic result profiles switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Master Diagnostician" },
    { minRatio: 0.8, title: "The Workshop Natural" },
    { minRatio: 0.7, title: "The Skilled Fault Finder" },
    { minRatio: 0.6, title: "The Practical Problem-Solver" },
    { minRatio: 0.5, title: "The Hands-On Learner" },
    { minRatio: 0, title: "The Curious Car Owner" },
  ];
  const cases = [
    [29, "The Curious Car Owner"], [30, "The Hands-On Learner"], [35, "The Hands-On Learner"],
    [36, "The Practical Problem-Solver"], [41, "The Practical Problem-Solver"], [42, "The Skilled Fault Finder"],
    [47, "The Skilled Fault Finder"], [48, "The Workshop Natural"], [53, "The Workshop Natural"],
    [54, "The Master Diagnostician"], [60, "The Master Diagnostician"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
});

test("Chef result profiles and pass threshold switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Master of the Pass" },
    { minRatio: 0.8, title: "The Kitchen Natural" },
    { minRatio: 0.7, title: "The Skilled Sous Chef" },
    { minRatio: 0.6, title: "The Confident Line Cook" },
    { minRatio: 0.5, title: "The Promising Prep Cook" },
    { minRatio: 0, title: "The Curious Food Lover" },
  ];
  const cases = [
    [29, "The Curious Food Lover"], [30, "The Promising Prep Cook"], [35, "The Promising Prep Cook"],
    [36, "The Confident Line Cook"], [41, "The Confident Line Cook"], [42, "The Skilled Sous Chef"],
    [47, "The Skilled Sous Chef"], [48, "The Kitchen Natural"], [53, "The Kitchen Natural"],
    [54, "The Master of the Pass"], [60, "The Master of the Pass"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
  assert.equal(scoreQuiz(quiz, answersWithCorrectCount(47)).targetStatus, "unreachable");
  assert.equal(scoreQuiz(quiz, answersWithCorrectCount(48)).targetStatus, "achieved");
});

test("Nursing result profiles switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Admissions Standout" },
    { minRatio: 0.8, title: "The Nursing Natural" },
    { minRatio: 0.7, title: "The Calm Candidate" },
    { minRatio: 0.6, title: "The Careful Problem-Solver" },
    { minRatio: 0.5, title: "The Promising Applicant" },
    { minRatio: 0, title: "The Compassionate Explorer" },
  ];
  const cases = [
    [29, "The Compassionate Explorer"], [30, "The Promising Applicant"], [35, "The Promising Applicant"],
    [36, "The Careful Problem-Solver"], [41, "The Careful Problem-Solver"], [42, "The Calm Candidate"],
    [47, "The Calm Candidate"], [48, "The Nursing Natural"], [53, "The Nursing Natural"],
    [54, "The Admissions Standout"], [60, "The Admissions Standout"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
});

test("Paramedic result profiles and pass threshold switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  quiz.engine.targetRatio = 0.8;
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Emergency Standout" },
    { minRatio: 0.8, title: "The Rapid-Response Natural" },
    { minRatio: 0.7, title: "The Calm Scene Solver" },
    { minRatio: 0.6, title: "The Steady Responder" },
    { minRatio: 0.5, title: "The Promising Candidate" },
    { minRatio: 0, title: "The First-Response Explorer" },
  ];
  const cases = [
    [29, "The First-Response Explorer"], [30, "The Promising Candidate"], [35, "The Promising Candidate"],
    [36, "The Steady Responder"], [41, "The Steady Responder"], [42, "The Calm Scene Solver"],
    [47, "The Calm Scene Solver"], [48, "The Rapid-Response Natural"], [53, "The Rapid-Response Natural"],
    [54, "The Emergency Standout"], [60, "The Emergency Standout"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
  assert.equal(scoreQuiz(quiz, answersWithCorrectCount(47)).targetStatus, "unreachable");
  assert.equal(scoreQuiz(quiz, answersWithCorrectCount(48)).targetStatus, "achieved");
});

test("Midwifery result profiles switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Birth Centre Standout" },
    { minRatio: 0.8, title: "The Midwifery Natural" },
    { minRatio: 0.7, title: "The Calm Candidate" },
    { minRatio: 0.6, title: "The Thoughtful Supporter" },
    { minRatio: 0.5, title: "The Promising Applicant" },
    { minRatio: 0, title: "The Compassionate Explorer" },
  ];
  const cases = [
    [29, "The Compassionate Explorer"], [30, "The Promising Applicant"], [35, "The Promising Applicant"],
    [36, "The Thoughtful Supporter"], [41, "The Thoughtful Supporter"], [42, "The Calm Candidate"],
    [47, "The Calm Candidate"], [48, "The Midwifery Natural"], [53, "The Midwifery Natural"],
    [54, "The Birth Centre Standout"], [60, "The Birth Centre Standout"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
});

test("Idiom result profiles and ace threshold switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Phrase Master" },
    { minRatio: 0.8, title: "The Natural Wordsmith" },
    { minRatio: 0.7, title: "The Idiom Insider" },
    { minRatio: 0.6, title: "The Context Catcher" },
    { minRatio: 0.5, title: "The Phrase Explorer" },
    { minRatio: 0, title: "The Literal Wildcard" },
  ];
  const cases = [
    [29, "The Literal Wildcard"], [30, "The Phrase Explorer"], [35, "The Phrase Explorer"],
    [36, "The Context Catcher"], [41, "The Context Catcher"], [42, "The Idiom Insider"],
    [47, "The Idiom Insider"], [48, "The Natural Wordsmith"], [53, "The Natural Wordsmith"],
    [54, "The Phrase Master"], [60, "The Phrase Master"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
  assert.equal(scoreQuiz(quiz, answersWithCorrectCount(47)).targetStatus, "unreachable");
  assert.equal(scoreQuiz(quiz, answersWithCorrectCount(48)).targetStatus, "achieved");
});

test("Grammar result profiles and pass threshold switch at every exact score boundary", () => {
  const quiz = memoryQuiz();
  quiz.result.profiles = [
    { minRatio: 0.9, title: "The Master Editor" },
    { minRatio: 0.8, title: "The Natural Grammarian" },
    { minRatio: 0.7, title: "The Sentence Specialist" },
    { minRatio: 0.6, title: "The Careful Communicator" },
    { minRatio: 0.5, title: "The Language Improver" },
    { minRatio: 0, title: "The Grammar Detective" },
  ];
  const cases = [
    [29, "The Grammar Detective"], [30, "The Language Improver"], [35, "The Language Improver"],
    [36, "The Careful Communicator"], [41, "The Careful Communicator"], [42, "The Sentence Specialist"],
    [47, "The Sentence Specialist"], [48, "The Natural Grammarian"], [53, "The Natural Grammarian"],
    [54, "The Master Editor"], [60, "The Master Editor"],
  ] as const;
  for (const [correct, profile] of cases) assert.equal(scoreQuiz(quiz, answersWithCorrectCount(correct)).profile.title, profile);
  assert.equal(scoreQuiz(quiz, answersWithCorrectCount(47)).targetStatus, "unreachable");
  assert.equal(scoreQuiz(quiz, answersWithCorrectCount(48)).targetStatus, "achieved");
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

test("category ranking uses percentage before harder-correct tie-breaking when denominators differ", () => {
  const questions = [
    ...Array.from({ length: 6 }, (_, index) => ({ id: `short-${index}`, answerIndex: 0, category: "short", stage: 0 })),
    ...Array.from({ length: 9 }, (_, index) => ({ id: `long-${index}`, answerIndex: 0, category: "long", stage: 0 })),
  ];
  const quiz = {
    engine: { scoring: { type: "correct-answer" }, tieBreaks: { categories: "harder-correct", bestRound: "later" } },
    questions,
    stages: ["Only round"],
    result: {
      profiles: [{ minRatio: 0, title: "Profile" }],
      scoreDimensions: [
        { label: "Short category", categories: ["short"] },
        { label: "Long category", categories: ["long"] },
      ],
    },
  } as Quiz;
  const answers = Object.fromEntries([
    ...questions.slice(0, 6).map((question) => [question.id, 0]),
    ...questions.slice(6).map((question, index) => [question.id, index < 7 ? 0 : 1]),
  ]);

  const result = scoreQuiz(quiz, answers);

  assert.deepEqual(result.dimensionScores, { "Short category": 100, "Long category": 78 });
  assert.equal(result.strongestSignal, "Short category");
  assert.equal(result.weakestSignal, "Long category");
});

test("hybrid matching normalises academic weights and keeps fit choices out of the raw score", () => {
  const quiz = {
    slug: "match-test",
    engine: {
      scoring: { type: "hybrid-match" },
      match: {
        academicWeight: .55,
        styleWeight: .45,
        categories: ["words", "numbers"],
        traits: ["debate", "build"],
        candidates: [
          { id: "scholar", academicWeights: { words: 10, numbers: 1 }, styleWeights: { debate: 1, build: .2 } },
          { id: "maker", academicWeights: { words: 1, numbers: 10 }, styleWeights: { debate: .2, build: 1 } },
          { id: "balanced", academicWeights: { words: 1, numbers: 1 }, styleWeights: { debate: .6, build: .6 } },
        ],
      },
    },
    questions: [
      { id: "word", answerIndex: 0, category: "words", stage: 0 },
      { id: "number", answerIndex: 0, category: "numbers", stage: 0 },
      { id: "fit", choiceWeights: [{ debate: .7, build: .3 }, { debate: .2, build: .8 }], stage: 0 },
    ],
    stages: ["Round"],
    result: {
      profiles: [
        { id: "scholar", minRatio: 0, title: "Oxford", tier: "Scholar" },
        { id: "maker", minRatio: 0, title: "MIT", tier: "Maker" },
        { id: "balanced", minRatio: 0, title: "NUS", tier: "Balanced" },
      ],
      scoreDimensions: [{ label: "Words", categories: ["words"] }, { label: "Numbers", categories: ["numbers"] }],
      match: { traitLabels: { debate: "Debate", build: "Building" } },
    },
  } as Quiz;
  const result = scoreHybridMatch(quiz, { word: 0, number: 1, fit: 0 });
  assert.equal(result.score, 1);
  assert.equal(result.total, 2);
  assert.equal(result.profile.id, "scholar");
  assert.equal(result.preferredStyle, "Debate");
  assert.notEqual(result.alternativeMatch, result.profile.title);
  assert.notEqual(result.wildcardMatch, result.profile.title);
});
