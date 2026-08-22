import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

type SourceQuestion = {
  id: string;
  context?: string;
  presentation?: string;
  category?: string;
  answers: string[];
  correct: number;
  explanation?: string;
  visual?: { items: string[]; columns?: number; ariaLabel: string };
};

type SourceQuiz = {
  title: string;
  landing: { cta: string; startNote?: string };
  about: { disclaimer: string };
  results: { profiles: Array<{ min: number }>; score: { disclaimer: string } };
  career: {
    continuousShell: boolean;
    showResultProgress: boolean;
    stages: Array<{ preAdTitle: string; preAdChecks?: string[] }>;
  };
  stages: Array<{ title: string; questions: SourceQuestion[] }>;
};

const slugs = ["oxford", "cambridge", "harvard"] as const;

function source(slug: typeof slugs[number]) {
  return JSON.parse(readFileSync(join(process.cwd(), "data", "quizzes", slug, "en.json"), "utf8")) as SourceQuiz;
}

function question(slug: typeof slugs[number], id: string) {
  const found = source(slug).stages.flatMap((stage) => stage.questions).find((item) => item.id === id);
  assert.ok(found, `${slug}/${id}`);
  return found;
}

test("university challenges keep the approved English-only five-stage contract", () => {
  const expectedStages = {
    oxford: ["Tutorial Foundations", "Evidence & Argument", "Logic at the Board", "Interview Trapdoors", "The Final Tutorial"],
    cambridge: ["College Foundations", "Patterns & Proof", "Scientific Reasoning", "Supervision Challenge", "The Final Assessment"],
    harvard: ["Admissions Briefing", "Evidence & Analysis", "Quantitative Decisions", "The Case Room", "The Final Committee"],
  };
  for (const slug of slugs) {
    const quiz = source(slug);
    const manifest = JSON.parse(readFileSync(join(process.cwd(), "data", "quizzes", slug, "quiz.json"), "utf8"));
    const questions = quiz.stages.flatMap((stage) => stage.questions);
    const correctPositionCounts = [0, 1, 2, 3].map((position) => questions.filter((item) => item.correct === position).length);

    assert.equal(quiz.title, `Only 7% Pass This ${slug[0].toUpperCase()}${slug.slice(1)} Entrance Exam`);
    assert.equal(quiz.landing.cta, "Start Test");
    assert.equal(quiz.landing.startNote, undefined);
    assert.match(quiz.about.disclaimer, new RegExp(`Not an official ${slug}`, "i"));
    assert.equal(quiz.results.score.disclaimer, quiz.about.disclaimer);
    assert.equal(manifest.engine.flow, "staged");
    assert.equal(manifest.engine.localeParity, "independent");
    assert.equal(manifest.engine.targetRatio, 0.8);
    assert.equal(manifest.engine.rewarded.start, true);
    assert.equal(manifest.engine.rewarded.stages, true);
    assert.equal(manifest.engine.rewarded.confirmStart, false);
    assert.deepEqual(manifest.theme.layout, { landing: "split", questions: "card", results: "immersive" });
    assert.equal(manifest.theme.artwork.landing, undefined);
    assert.equal(quiz.stages.length, 5);
    assert.deepEqual(quiz.stages.map((stage) => stage.title), expectedStages[slug]);
    assert.ok(quiz.stages.every((stage) => stage.questions.length === 8));
    assert.equal(questions.length, 40);
    assert.equal(new Set(questions.map((item) => item.id)).size, 40);
    assert.ok(questions.every((item) => item.answers.length === 4 && new Set(item.answers).size === 4 && item.explanation === undefined));
    assert.ok(questions.filter((item) => item.visual).every((item) => item.visual!.ariaLabel.trim().length > 4));
    assert.deepEqual(correctPositionCounts, [10, 10, 10, 10]);
    assert.ok(questions.every((item) => item.category && item.category !== "missing"));
    assert.deepEqual(quiz.results.profiles.map((profile) => profile.min), [0.9, 0.8, 0.7, 0.6, 0.5, 0]);
    assert.ok(quiz.career.continuousShell);
    assert.ok(quiz.career.showResultProgress);
    assert.deepEqual(quiz.career.stages.slice(0, 4).map((stage) => stage.preAdTitle), [
      "First exam section complete",
      "Second exam section complete",
      "More than halfway through",
      "Final assessment next",
    ]);
    assert.ok(quiz.career.stages.slice(0, 4).every((stage) => stage.preAdChecks === undefined));
    assert.equal(quiz.career.stages[4].preAdChecks?.length, 3);
  }
});

test("university result categories describe the skill each question actually tests", () => {
  assert.equal(question("oxford", "oxford-s1q6").category, "quantitative_reasoning");
  assert.equal(question("oxford", "oxford-s1q7").category, "spatial_reasoning");
  assert.equal(question("harvard", "harvard-s3q1").category, "quantitative_reasoning");
  assert.equal(question("harvard", "harvard-s3q7").category, "data_interpretation");
  assert.equal(question("cambridge", "cambridge-s3q1").category, "numerical_reasoning");
  assert.equal(question("cambridge", "cambridge-s3q5").category, "spatial_reasoning");
});

test("Oxford information-limit puzzle has multiple valid overlaps", () => {
  const q5 = question("oxford", "oxford-s2q2");
  const minimumOverlap = Math.max(0, 70 + 50 - 100);
  const maximumOverlap = Math.min(70, 50);
  assert.equal(minimumOverlap, 20);
  assert.equal(maximumOverlap, 50);
  assert.ok(maximumOverlap > minimumOverlap);
  assert.equal(q5.answers[q5.correct], "It cannot be determined");
});

test("Cambridge final movement cancels the vertical displacement", () => {
  const q5 = question("cambridge", "cambridge-s5q5");
  const start = { north: 0, east: 0 };
  const finish = { north: start.north + 2 - 2, east: start.east + 3 };
  assert.deepEqual(finish, { north: 0, east: 3 });
  assert.equal(q5.answers[q5.correct], "Three east");
});

test("Cambridge instrument finale applies the raw rule and calibration separately", () => {
  const q7 = question("cambridge", "cambridge-s5q7");
  const originalTrue = 26 - 2;
  const nextTrue = originalTrue - 5;
  const nextDisplay = nextTrue + 2;
  assert.equal(originalTrue, 24);
  assert.equal(nextDisplay, 21);
  assert.equal(q7.answers[q7.correct], "21");
});

test("Harvard committee finale applies threshold before cost", () => {
  const q8 = question("harvard", "harvard-s5q8");
  const proposals = [
    { id: "A", cost: 9, score: 14 },
    { id: "B", cost: 12, score: 16 },
    { id: "C", cost: 10, score: 15 },
    { id: "D", cost: 8, score: 13 },
  ];
  const winner = proposals.filter((proposal) => proposal.score >= 15).toSorted((a, b) => a.cost - b.cost)[0];
  assert.equal(winner.id, "C");
  assert.equal(q8.answers[q8.correct], "C");
});
