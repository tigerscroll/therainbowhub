import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { usesQuestionAds } from "./questionAds.ts";

test("question ads are restricted to Memory and Years Left", () => {
  assert.equal(usesQuestionAds("memory"), true);
  assert.equal(usesQuestionAds("years-left"), true);
  for (const slug of ["iq", "vision", "oxford", "memory-other", ""]) assert.equal(usesQuestionAds(slug), false);
});
test("both manual quizzes also reveal results without reloading", () => {
  for (const slug of ["memory", "years-left"]) {
    const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, "utf8"));
    assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  }
});

test("Memory's shortened sequence retains recall prerequisites and an eight-answer pass target", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/memory/quiz.json", "utf8"));
  const copy = JSON.parse(fs.readFileSync("data/quizzes/memory/en.json", "utf8"));
  const ids = manifest.structure.stages[0].questionIds;
  assert.equal(ids.length, 10);
  assert.equal(ids.length * manifest.engine.targetRatio, 8);
  const questions = copy.stages["stage-1"].questions;
  assert.ok(ids.indexOf("memory-r1q1") < ids.indexOf("memory-r1q4"));
  assert.ok(questions["memory-r1q1"].study.items.includes("PURPLE ELEPHANT"));
  assert.equal(questions["memory-r1q4"].answers[manifest.structure.questions["memory-r1q4"].correctAnswerId], "Elephant");
  assert.ok(ids.indexOf("memory-r4q1") < ids.indexOf("memory-r4q6"));
  const pairs = questions["memory-r4q1"].study.items;
  assert.ok(pairs.some((pair: string) => /SCARF/i.test(pair)));
  assert.equal(questions["memory-r4q6"].answers[manifest.structure.questions["memory-r4q6"].correctAnswerId], "Scarf");
});
