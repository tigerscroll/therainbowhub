import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { SOCIAL_PROOF_COUNTS } from "./social-proof.mjs";

const args = process.argv.slice(2);
const slug = args.find((value) => !value.startsWith("--"));
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index < 0 ? undefined : args[index + 1];
};
const abort = (message) => { console.error(message); process.exit(1); };
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  abort("Usage: npm run create:quiz -- <slug> [--title \"Title\"] [--icon 🧩] [--social-proof 321000] [--root /tmp/quizzes]");
}

const quizRoot = option("root") ?? path.join(process.cwd(), "data", "quizzes");
const directory = path.join(quizRoot, slug);
if (fs.existsSync(directory)) abort(`Quiz already exists: ${directory}`);
const title = option("title") ?? slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
const icon = option("icon") ?? "🧩";
const requestedCount = Number(option("social-proof"));
const socialProofCount = Number.isInteger(requestedCount) && requestedCount > 0
  ? requestedCount
  : Math.ceil((Math.max(...Object.values(SOCIAL_PROOF_COUNTS)) + 1000) / 1000) * 1000;
if (Object.values(SOCIAL_PROOF_COUNTS).includes(socialProofCount)) abort(`Social-proof count ${socialProofCount} is already used.`);

const stageIds = ["stage-1"];
const questionIds = Array.from({ length: 10 }, (_, index) => `${slug}-q${String(index + 1).padStart(2, "0")}`);
const categories = Array.from({ length: 5 }, (_, index) => `category_${index + 1}`);
const resultMins = [0.9, 0.8, 0.7, 0.6, 0.5, 0];

const manifest = {
  schemaVersion: 2,
  slug,
  engine: { scoring: "correct-answer", targetRatio: 0.8, tieBreaks: { categories: "harder-correct", bestRound: "later" } },
  listing: { thumbnail: "assets/thumbnail.png", published: new Date().toISOString().slice(0, 10), difficulty: "Hard", icon, socialProofCount },
  theme: {
    id: slug, preset: "editorial", layout: { landing: "split", questions: "card", results: "immersive" },
    colors: { page: "#eee9df", pageAlt: "#d8d0c3", surface: "#fffaf1", surfaceRaised: "#f7f0e5", text: "#242320", muted: "#746e65", primary: "#315f53", primaryText: "#fffaf1", border: "#b9aea0", correct: "#39735a", incorrect: "#ad4f42" },
    typography: { heading: "sans", body: "sans" }, shape: { cardRadius: "24px", buttonRadius: "14px" }, effects: { shadow: "soft", texture: "grain" },
    header: { background: "#243b36", text: "#fffaf1", border: "#b99152", shadow: "0 8px 26px rgba(20,27,25,.24)" }, artwork: { icon },
  },
  template: "single-stage-rewarded-v1",
  structure: {
    stages: [{ id: "stage-1", difficultyLevel: "final", questionIds }],
    questions: Object.fromEntries(questionIds.map((id, index) => [id, { presentation: "text", correct: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1][index], category: categories[index % 5], interactionStyle: ["core-concept", "applied-scenario", "reasoning"][index % 3], choiceCount: 4 }])),
    results: {
      profiles: resultMins.map((min, index) => ({ key: `profile-${index + 1}`, min })),
      dimensions: categories.map((category, index) => ({ key: `dimension-${index + 1}`, categories: [category] })),
      score: { showPercentage: true, showBestRound: false },
    },
  },
};

const content = {
  schemaVersion: 2, title, eyebrow: "THE CHALLENGE",
  summary: "A fast, escalating challenge designed to test your judgement from the first question to the final reveal.",
  landing: { intro: "Put your instincts to the test and see whether you can hold your nerve as the questions become harder.", cta: "Start Test" },
  about: {
    body: "This entertainment quiz contains ten carefully selected questions in one focused challenge.\n\nChoose the single answer best supported by each question. Correctness remains hidden until the final result.\n\nYour result is a snapshot of this quiz performance, not a formal assessment.",
    howToPlay: { title: "How to Play", steps: ["Complete ten carefully selected questions.", "Choose one answer each time. Correctness remains hidden.", "Reveal your score and answer review at the end."] },
    disclaimer: "For entertainment and general learning only. This quiz is not a formal assessment.",
  },
  career: {
    resultProgressLabel: "Challenge progress", resultProgressComplete: "{value}% complete",
    stages: { "stage-1": {
      difficulty: "Final Challenge", preAdTitle: "Your results are ready", preAdCopy: "Your score and skill breakdown are ready to reveal.",
      preAdChecks: ["10 answers checked", "Five skill areas compared", "Your final score calculated"], preAdButton: "Reveal My Results",
    } },
  },
  results: {
    name: "YOUR SCORE",
    profiles: Object.fromEntries(resultMins.map((_, index) => [`profile-${index + 1}`, { tier: ["90–100%", "80–89%", "70–79%", "60–69%", "50–59%", "Below 50%"][index], title: `Result Profile ${index + 1}`, copy: "Your answers created a clear result across this escalating challenge." }])),
    dimensions: Object.fromEntries(categories.map((_, index) => [`dimension-${index + 1}`, { label: `Skill area ${index + 1}` }])),
    score: { passed: "You reached the challenge target!", finished: "Challenge complete", correctLabel: "correct", strongest: "Strongest area", trickiest: "Trickiest area", bestRound: "Best section", insights: { overview: "Your score at a glance", correct: "Correct answers", missed: "Questions missed", target: "Correct answers for 80%", breakdown: "Your skill breakdown", snapshot: "What your result suggests", targetReached: "80% challenge reached", targetRemaining: "More correct answers needed for 80%" } },
  },
  stages: { "stage-1": {
    title: "Challenge",
    questions: Object.fromEntries(questionIds.map((id, index) => [id, { headerLabel: `QUESTION TYPE ${index + 1}`, question: `Replace with a unique question for ${id}.`, answers: Array.from({ length: 4 }, (_, answerIndex) => `Unique option ${answerIndex + 1} for ${id}`) }])),
  } },
};

fs.mkdirSync(path.join(directory, "assets"), { recursive: true });
fs.writeFileSync(path.join(directory, "quiz.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(directory, "en.json"), `${JSON.stringify(content, null, 2)}\n`);
fs.writeFileSync(path.join(directory, "theme.css"), `[data-quiz-theme="${slug}"] {\n  --quiz-flow-background: linear-gradient(180deg, color-mix(in srgb, var(--quiz-surface) 97%, white), var(--quiz-surface));\n}\n\n[data-quiz-theme="${slug}"] .quiz-engine__landing,\n[data-quiz-theme="${slug}"] .quiz-engine__continuous-shell {\n  border-color: color-mix(in srgb, var(--quiz-primary) 22%, var(--quiz-border));\n}\n`);
await sharp({ create: { width: 1600, height: 900, channels: 3, background: "#315f53" } }).png().toFile(path.join(directory, "assets", "thumbnail.png"));

if (quizRoot === path.join(process.cwd(), "data", "quizzes")) {
  const socialFile = path.join(process.cwd(), "scripts", "social-proof.mjs");
  const source = fs.readFileSync(socialFile, "utf8");
  const updated = source.replace("\n});\n", `\n  ${JSON.stringify(slug)}: ${socialProofCount},\n});\n`);
  if (updated === source) abort("Could not update scripts/social-proof.mjs; remove the new quiz folder and retry.");
  fs.writeFileSync(socialFile, updated);
}
console.log(`Created schema-v2 quiz scaffold at ${directory}. Replace placeholder copy and thumbnail art before shipping.`);
