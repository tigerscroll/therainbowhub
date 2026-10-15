import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const manifest = JSON.parse(fs.readFileSync("data/quizzes/challenge/quiz.json", "utf8"));
const content = JSON.parse(fs.readFileSync("data/quizzes/challenge/en.json", "utf8"));

test("Challenge is an English ten-by-eight experience with a universal landing", () => {
  assert.equal(manifest.slug, "challenge");
  assert.deepEqual(manifest.activeLocales, ["en"]);
  assert.equal(manifest.template, "ten-stage-eight-question-v1");
  assert.equal(manifest.structure.stages.length, 10);
  assert.deepEqual(manifest.structure.stages.map((stage: any) => stage.questionIds.length), Array(10).fill(8));
  assert.equal(content.title, "Are You Ready To Start The Quiz?");
  assert.equal(content.landing.cta, "Start Quiz");
  assert.equal(content.landing.intro.split("\n").length, 2);
});

test("Challenge answer keys are balanced and every skill appears once in the result model", () => {
  const questions = Object.values(manifest.structure.questions) as Array<{ answerIds: string[]; correctAnswerId: string; category: string }>;
  const positions = questions.reduce((counts, question) => {
    counts[question.answerIds.indexOf(question.correctAnswerId)] += 1;
    return counts;
  }, [0, 0, 0, 0]);
  assert.deepEqual([...positions].sort(), [20, 20, 20, 20]);
  const categories = questions.map(question => question.category);
  const dimensionCategories = manifest.structure.results.dimensions.flatMap((dimension: any) => dimension.categories);
  assert.deepEqual([...new Set(categories)].sort(), [...dimensionCategories].sort());
});

test("Challenge plants one self-paced memory board and recalls it in a later round", () => {
  const planted = manifest.structure.questions["challenge-s5q1"];
  assert.deepEqual(planted.study, { mode: "manual", rewarded: false });
  assert.deepEqual(content.stages["stage-5"].questions["challenge-s5q1"].study.items, [
    "RUBY BICYCLE",
    "BLUE DOOR",
    "7 STARS",
    "MIA · ORANGE UMBRELLA",
  ]);
  const callbacks = Object.values(content.stages["stage-9"].questions).map((question: any) => question.question).join(" ");
  assert.match(callbacks, /bicycle/i);
  assert.match(callbacks, /door/i);
  assert.match(callbacks, /stars/i);
  assert.match(callbacks, /Mia/i);
});
