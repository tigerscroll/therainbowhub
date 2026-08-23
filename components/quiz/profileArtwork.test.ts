import assert from "node:assert/strict";
import test from "node:test";

import type { Quiz } from "../../lib/quizzes.ts";
import { resolveArtworkVariant, resolveProfileArtwork } from "./profileArtwork.ts";

const quiz = {
  engine: {
    profileArtworkSelector: {
      questionId: "marry-r1q1",
      fixedVariants: {
        "0": "masculine",
        "1": "feminine",
        "2": "androgynous",
      },
      fallback: "stable-answer-hash",
    },
  },
  theme: {
    artwork: {
      profiles: { warm_anchor: "/fallback.png" },
      profileVariants: {
        warm_anchor: {
          masculine: "/masculine.png",
          feminine: "/feminine.png",
          androgynous: "/androgynous.png",
        },
      },
    },
  },
} as Quiz;

test("fixed selector choices map to the requested portrait presentation", () => {
  assert.equal(resolveProfileArtwork(quiz, { "marry-r1q1": 0 }, "warm_anchor"), "/masculine.png");
  assert.equal(resolveProfileArtwork(quiz, { "marry-r1q1": 1 }, "warm_anchor"), "/feminine.png");
  assert.equal(resolveProfileArtwork(quiz, { "marry-r1q1": 2 }, "warm_anchor"), "/androgynous.png");
  assert.equal(resolveArtworkVariant(quiz, { "marry-r1q1": 0 }, ["masculine", "feminine", "androgynous"]), "masculine");
  assert.equal(resolveArtworkVariant(quiz, { "marry-r1q1": 1 }, ["masculine", "feminine", "androgynous"]), "feminine");
  assert.equal(resolveArtworkVariant(quiz, { "marry-r1q1": 2 }, ["masculine", "feminine", "androgynous"]), "androgynous");
});

test("Surprise me is stable for the same saved answers", () => {
  const answers = {
    "marry-r1q1": 3,
    "marry-r1q2": 1,
    "marry-r2q4": 2,
    "marry-r5q8": 0,
  };
  const first = resolveProfileArtwork(quiz, answers, "warm_anchor");
  const restored = resolveProfileArtwork(quiz, { ...answers }, "warm_anchor");
  assert.equal(first, restored);
  assert.ok(["/masculine.png", "/feminine.png", "/androgynous.png"].includes(first ?? ""));
});

test("Surprise me keeps the same presentation as later answers are added", () => {
  const firstRound = { "marry-r1q1": 3, "marry-r1q2": 1 };
  const completed = { ...firstRound, "marry-r2q4": 2, "marry-r5q8": 0 };
  assert.equal(
    resolveArtworkVariant(quiz, firstRound, ["masculine", "feminine", "androgynous"]),
    resolveArtworkVariant(quiz, completed, ["masculine", "feminine", "androgynous"]),
  );
});

test("unknown profiles fall back without throwing", () => {
  assert.equal(resolveProfileArtwork(quiz, { "marry-r1q1": 0 }, "unknown"), undefined);
});
