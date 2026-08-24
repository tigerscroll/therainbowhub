// Historical one-time migration retained for auditability. It is not run by the build.
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "data", "quizzes");
const sharedKeys = ["flow", "advance", "feedback", "checkpoint", "startOnLoad", "rewarded", "advanceDelayMs"];

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = path.join(root, entry.name, "quiz.json");
  if (!fs.existsSync(file)) continue;
  const quiz = JSON.parse(fs.readFileSync(file, "utf8"));
  quiz.template = "five-stage-rewarded-v1";
  for (const key of sharedKeys) delete quiz.engine[key];
  fs.writeFileSync(file, `${JSON.stringify(quiz, null, 2)}\n`);
}
