import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

type SourceQuestion = {
  id: string;
  context?: string;
  presentation?: string;
  answers: string[];
  correct: number;
  explanation: string;
  visual?: { items: string[]; columns?: number; ariaLabel: string };
};

type SourceQuiz = {
  title: string;
  landing: { cta: string };
  about: { disclaimer: string };
  results: { profiles: Array<{ min: number }>; score: { disclaimer: string } };
  stages: Array<{ questions: SourceQuestion[] }>;
};

const slugs = ["oxford", "cambridge", "harvard"] as const;
const disclaimer = "Independent entertainment challenge inspired by admissions-style reasoning. Not an official university admissions test and not affiliated with Oxford, Cambridge or Harvard.";

function source(slug: typeof slugs[number]) {
  return JSON.parse(readFileSync(join(process.cwd(), "data", "quizzes", slug, "en.json"), "utf8")) as SourceQuiz;
}

function question(slug: typeof slugs[number], id: string) {
  const found = source(slug).stages.flatMap((stage) => stage.questions).find((item) => item.id === id);
  assert.ok(found, `${slug}/${id}`);
  return found;
}

test("university challenges keep the approved English-only ten-question contract", () => {
  for (const slug of slugs) {
    const quiz = source(slug);
    const manifest = JSON.parse(readFileSync(join(process.cwd(), "data", "quizzes", slug, "quiz.json"), "utf8"));
    const questions = quiz.stages.flatMap((stage) => stage.questions);
    const presentations = questions.map((item) => item.presentation ?? "text");
    const correctPositionCounts = [0, 1, 2, 3].map((position) => questions.filter((item) => item.correct === position).length);

    assert.equal(quiz.title, `Only 7% Pass This ${slug[0].toUpperCase()}${slug.slice(1)} Entrance Exam`);
    assert.equal(quiz.landing.cta, "Start Test");
    assert.equal(quiz.about.disclaimer, disclaimer);
    assert.equal(quiz.results.score.disclaimer, disclaimer);
    assert.equal(manifest.engine.flow, "linear");
    assert.equal(manifest.engine.localeParity, "independent");
    assert.equal(manifest.engine.targetRatio, 0.8);
    assert.equal(quiz.stages.length, 1);
    assert.equal(questions.length, 10);
    assert.equal(new Set(questions.map((item) => item.id)).size, 10);
    assert.ok(questions.every((item) => item.answers.length === 4 && item.explanation.trim().length > 30));
    assert.ok(questions.filter((item) => item.visual).every((item) => item.visual!.ariaLabel.trim().length > 20));
    assert.ok(new Set(presentations).size >= 4);
    assert.ok(presentations.every((value, index) => index < 2 || value !== presentations[index - 1] || value !== presentations[index - 2]));
    assert.equal(new Set(presentations.slice(7)).size, 3);
    assert.deepEqual(correctPositionCounts, [3, 3, 2, 2]);
    assert.deepEqual(quiz.results.profiles.map((profile) => profile.min), [0.9, 0.8, 0.7, 0.6, 0.5, 0]);
    assert.match(questions[7].context ?? "", /^Q8 — ADMISSIONS LEVEL/);
    assert.match(questions[8].context ?? "", /^Q9 — FINAL SHORTLIST/);
    assert.match(questions[9].context ?? "", /^Q10 — FINAL ASSESSMENT/);
  }
});

test("Oxford information-limit puzzle has multiple valid overlaps", () => {
  const q5 = question("oxford", "oxford-q5");
  const minimumOverlap = Math.max(0, 60 + 55 - 100);
  const maximumOverlap = Math.min(60, 55);
  assert.equal(minimumOverlap, 15);
  assert.equal(maximumOverlap, 55);
  assert.ok(maximumOverlap > minimumOverlap);
  assert.equal(q5.answers[q5.correct], "It cannot be determined");
});

test("Cambridge spatial shift rotates around the 3x3 centre before moving down", () => {
  const q7 = question("cambridge", "cambridge-q7");
  const start = { row: -1, column: 0 };
  const rotated = { row: start.column, column: -start.row };
  const moved = { row: rotated.row + 1, column: rotated.column };
  assert.deepEqual(rotated, { row: 0, column: 1 });
  assert.deepEqual(moved, { row: 1, column: 1 });
  assert.equal(q7.visual?.items.length, 9);
  assert.equal(q7.visual?.columns, 3);
  assert.equal(q7.answers[q7.correct], "Bottom-right");
});

test("Cambridge instrument finale applies the raw rule and calibration separately", () => {
  const q10 = question("cambridge", "cambridge-q10");
  const nextRaw = 46 * 2 + 2;
  const display = (nextRaw - 14) / 4;
  assert.equal(nextRaw, 94);
  assert.equal(display, 20);
  assert.equal(q10.answers[q10.correct], "20");
});

test("Harvard committee finale resolves the intentional tie with evidence", () => {
  const q10 = question("harvard", "harvard-q10");
  const proposals = [
    { id: "A", impact: 9, feasibility: 6, evidence: 8 },
    { id: "B", impact: 8, feasibility: 8, evidence: 7 },
    { id: "C", impact: 7, feasibility: 9, evidence: 9 },
  ].map((proposal) => ({ ...proposal, score: 2 * proposal.impact + proposal.feasibility + proposal.evidence }));
  const winner = proposals.toSorted((a, b) => b.score - a.score || b.evidence - a.evidence)[0];
  assert.deepEqual(proposals.map(({ id, score }) => [id, score]), [["A", 32], ["B", 31], ["C", 32]]);
  assert.equal(winner.id, "C");
  assert.equal(q10.answers[q10.correct], "Proposal C");
});
