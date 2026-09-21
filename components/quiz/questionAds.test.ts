import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { usesQuestionAds } from "./questionAds.ts";

test("question ads are restricted to Memory and Years Left", () => {
  assert.equal(usesQuestionAds("memory"), true);
  assert.equal(usesQuestionAds("years-left"), true);
  for (const slug of ["iq", "vision", "oxford", "memory-other", ""]) assert.equal(usesQuestionAds(slug), false);
});
test("rewarded and display share the configured display ad unit", () => {
  const config = fs.readFileSync("lib/siteConfig.ts", "utf8");
  assert.match(config, /rewardedAdUnitPath: "\/22677279144\/display"/);
  assert.match(config, /displayAdUnitPath: "\/22677279144\/display"/);
  assert.ok(!config.includes("/22677279144/rewarded"));
});
test("both manual quizzes also reveal results without reloading", () => {
  for (const slug of ["memory", "years-left"]) {
    const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, "utf8"));
    assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  }
});
test("interstitial code is absent throughout the application", () => {
  for (const directory of ["components", "lib", "app"]) {
    for (const path of fs.readdirSync(directory, { recursive: true })) {
      if (typeof path !== "string" || !/\.(tsx?|jsx?)$/.test(path) || path.endsWith(".test.ts")) continue;
      assert.doesNotMatch(fs.readFileSync(`${directory}/${path}`, "utf8"), /interstitial/i, `${directory}/${path}`);
    }
  }
});
test("both quizzes have 30 unique questions, one stage and only a final result gate", () => {
  for (const slug of ["memory", "years-left"]) {
    const manifest = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`, "utf8"));
    const copy = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/en.json`, "utf8"));
    assert.equal(copy.landing.intro.split("\n").length, 2);
    assert.doesNotMatch(copy.landing.intro, /30|thirty/i);
    assert.equal(manifest.structure.stages.length, 1);
    const ids = manifest.structure.stages[0].questionIds;
    assert.equal(ids.length, 30);
    assert.equal(new Set(ids).size, 30);
    assert.equal(Object.keys(copy.career.stages).length, 1);
    assert.equal(copy.career.stages["stage-1"].next, undefined);
    assert.equal(copy.career.stages["stage-1"].preAdChecks[0], "30 answers checked");
  }
});

test("Memory retains recall prerequisites and a 24-answer pass target", () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizzes/memory/quiz.json", "utf8"));
  const copy = JSON.parse(fs.readFileSync("data/quizzes/memory/en.json", "utf8"));
  const ids = manifest.structure.stages[0].questionIds;
  assert.equal(ids.length, 30);
  assert.equal(ids.length * manifest.engine.targetRatio, 24);
  const questions = copy.stages["stage-1"].questions;
  for (const [board, recalls] of [
    ["memory-r1q1", ["memory-r1q4", "memory-r1q8", "memory-r5q1", "memory-r5q2"]],
    ["memory-r3q1", ["memory-r3q7", "memory-r3q8", "memory-r5q3", "memory-r5q6"]],
    ["memory-r4q1", ["memory-r4q5", "memory-r4q6", "memory-r5q4"]],
  ] as const) {
    assert.ok(questions[board].study);
    for (const recall of recalls) assert.ok(ids.indexOf(board) >= 0 && ids.indexOf(board) < ids.indexOf(recall), recall);
  }
  assert.ok(ids.indexOf("memory-r1q1") < ids.indexOf("memory-r1q4"));
  assert.ok(questions["memory-r1q1"].study.items.includes("PURPLE ELEPHANT"));
  assert.equal(questions["memory-r1q4"].answers[manifest.structure.questions["memory-r1q4"].correctAnswerId], "Elephant");
  assert.ok(ids.indexOf("memory-r4q1") < ids.indexOf("memory-r4q6"));
  const pairs = questions["memory-r4q1"].study.items;
  assert.ok(pairs.some((pair: string) => /SCARF/i.test(pair)));
  assert.equal(questions["memory-r4q6"].answers[manifest.structure.questions["memory-r4q6"].correctAnswerId], "Scarf");
});
