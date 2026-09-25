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
  : 0;
if (socialProofCount > 0 && Object.values(SOCIAL_PROOF_COUNTS).includes(socialProofCount)) abort(`Social-proof count ${socialProofCount} is already used.`);

const stageIds = Array.from({length: 10}, (_, index) => `stage-${index + 1}`);
const questionIds = Array.from({ length: 70 }, (_, index) => `${slug}-s${Math.floor(index / 7) + 1}q${index % 7 + 1}`);
const categories = Array.from({ length: 5 }, (_, index) => `category_${index + 1}`);
const resultMins = [0.9, 0.8, 0.7, 0.6, 0.5, 0];
const answerIds = ["a1", "a2", "a3", "a4"];

const manifest = {
  schemaVersion: 2,
  slug,
  engine: { scoring: "correct-answer", hardRefreshCheckpoints: false, localeParity: "independent", targetRatio: 0.8, tieBreaks: { categories: "harder-correct", bestRound: "later" } },
  listing: { thumbnail: "assets/thumbnail.png", published: new Date().toISOString().slice(0, 10), difficulty: "Hard", icon, socialProofCount, compactLanding: true, showSocialProof: false },
  theme: {
    id: slug, preset: "editorial", layout: { landing: "split", questions: "card", results: "immersive" },
    colors: { page: "#eee9df", pageAlt: "#d8d0c3", surface: "#fffaf1", surfaceRaised: "#f7f0e5", text: "#242320", muted: "#746e65", primary: "#315f53", primaryText: "#fffaf1", border: "#b9aea0", correct: "#39735a", incorrect: "#ad4f42" },
    typography: { heading: "sans", body: "sans" }, shape: { cardRadius: "24px", buttonRadius: "14px" }, effects: { shadow: "soft", texture: "grain" },
    header: { background: "#243b36", text: "#fffaf1", border: "#b99152", shadow: "0 8px 26px rgba(20,27,25,.24)" }, artwork: { icon },
  },
  template: "ten-stage-seven-question-v1",
  structure: {
    stages: stageIds.map((id, index) => ({id, difficultyLevel: index === 9 ? "final" : "developing", questionIds: questionIds.slice(index * 7, (index + 1) * 7)})),
    questions: Object.fromEntries(questionIds.map((id, index) => [id, { presentation: "text", correctAnswerId: answerIds[index % 4], category: categories[index % 5], interactionStyle: ["core-concept", "applied-scenario", "reasoning"][index % 3], answerIds }])),
    results: {
      profiles: resultMins.map((min, index) => ({ key: `profile-${index + 1}`, min })),
      dimensions: categories.map((category, index) => ({ key: `dimension-${index + 1}`, categories: [category] })),
      score: { showPercentage: true, showBestRound: false },
    },
  },
};

const content = {
  title, eyebrow: "THE CHALLENGE",
  summary: "A fast, escalating challenge designed to test your judgement from the first question to the final reveal.",
  landing: { intro: "Put your instincts to the test and see whether you can hold your nerve as the questions become harder.", cta: "Start" },
  about: {
    body: "Explore a sequence of themed challenges, each with a fresh set of clues.\n\nChoose the single answer best supported by each question. Correctness remains hidden until the final result.\n\nYour result is a snapshot of this quiz performance, not a formal assessment.",
    howToPlay: { steps: ["Choose the answer best supported by each question.", "See your topic profile at each checkpoint and continue to a new challenge.", "Reveal your score and answer review at the end."] },
    disclaimer: "For entertainment and general learning only. This quiz is not a formal assessment.",
  },
  career: {
    resultProgressLabel: "Your challenge",
    stages: Object.fromEntries(stageIds.map((id, index) => [id, {
      difficulty: `TOPIC ${index + 1}`,
      preAdTitle: index === 9 ? "Your result is ready" : "Your topic profile",
      preAdCopy: index === 9 ? "Did you reach 80%? Your score and strengths are ready." : "Your profile for this topic: {profile}.",
      preAdButton: index === 9 ? "See My Result" : "Continue",
      ...(index === 9 ? {preAdChecks: ["Answers checked", "Topic strengths compared", "Score calculated"]}
        : {next: {eyebrow: "UP NEXT", tagline: "A fresh set of clues awaits."}}),
    }])),
  },
  results: {
    name: "YOUR SCORE",
    profiles: Object.fromEntries(resultMins.map((_, index) => [`profile-${index + 1}`, { tier: ["90–100%", "80–89%", "70–79%", "60–69%", "50–59%", "Below 50%"][index], title: `Result Profile ${index + 1}`, copy: "Your answers created a clear result across this escalating challenge." }])),
    dimensions: Object.fromEntries(categories.map((_, index) => [`dimension-${index + 1}`, { label: `Skill area ${index + 1}` }])),
    score: { passed: "You reached the challenge target!", finished: "Challenge complete", strongest: "Strongest area", trickiest: "Trickiest area", bestRound: "Best section", insights: { overview: "Your score at a glance", correct: "Correct answers", missed: "Questions missed", target: "Correct answers for 80%", breakdown: "Your skill breakdown", snapshot: "What your result suggests", targetReached: "80% challenge reached", targetRemaining: "More correct answers needed for 80%" } },
  },
  stages: Object.fromEntries(stageIds.map((stageId, stageIndex) => [stageId, {
    title: `Topic ${stageIndex + 1}`,
    questions: Object.fromEntries(questionIds.slice(stageIndex * 7, (stageIndex + 1) * 7).map(id => [id, {
      headerLabel: `TOPIC ${stageIndex + 1}`, question: `Replace with a unique question for ${id}.`,
      answers: Object.fromEntries(answerIds.map((answerId, index) => [answerId, `Unique option ${index + 1} for ${id}`])),
    }])),
  }])),
};

fs.mkdirSync(path.join(directory, "assets"), { recursive: true });
fs.writeFileSync(path.join(directory, "quiz.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(directory, "en.json"), `${JSON.stringify(content, null, 2)}\n`);
fs.writeFileSync(path.join(directory, "theme.css"), `[data-quiz-theme="${slug}"] {\n  --quiz-flow-background: linear-gradient(180deg, color-mix(in srgb, var(--quiz-surface) 97%, white), var(--quiz-surface));\n}\n\n[data-quiz-theme="${slug}"] .quiz-engine__landing,\n[data-quiz-theme="${slug}"] .quiz-engine__continuous-shell {\n  border-color: color-mix(in srgb, var(--quiz-primary) 22%, var(--quiz-border));\n}\n`);
await sharp({ create: { width: 1600, height: 900, channels: 3, background: "#315f53" } }).png().toFile(path.join(directory, "assets", "thumbnail.png"));

console.log(`Created schema-v2 quiz scaffold at ${directory}. Replace placeholder copy and thumbnail art, then add fr/de/it/nl/es/pt/ar JSON copies before shipping. The folder is discovered automatically.`);
