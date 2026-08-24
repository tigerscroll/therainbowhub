// Historical one-time migration retained for auditability. It is not run by the build.
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "data", "quizzes");
const obsoleteCareerKeys = [
  "hideJourneyLength", "continuousShell", "showStageResults", "stageResultMode",
  "showCurrentScore", "showResultProgress", "currentScoreLabel", "levelLabel",
  "scoreSuffix", "journeyLabel", "kitchensCleared", "currentRank", "ranks",
  "unlockEyebrow", "unlockTitle", "unlockCopy", "finalEyebrow", "finalCareerTitle",
  "strongestLabel",
];

for (const quizEntry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!quizEntry.isDirectory()) continue;
  const directory = path.join(root, quizEntry.name);
  for (const localeFile of fs.readdirSync(directory).filter((name) => /^(?:en|fr|de|it|nl|es|pt)\.json$/.test(name))) {
    const file = path.join(directory, localeFile);
    const content = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!content.career) continue;
    if (content.checkpoint) {
      delete content.checkpoint.reveals;
      delete content.checkpoint.nextPrefix;
      delete content.checkpoint.progressLabel;
      delete content.checkpoint.progressComplete;
    }
    for (const key of obsoleteCareerKeys) delete content.career[key];
    content.career.stages?.forEach((stage, index, stages) => {
      delete stage.resultIcon;
      delete stage.resultLabel;
      delete stage.resultBands;
      delete stage.promotion;
      if (index < stages.length - 1) delete stage.preAdButton;
      if (stage.next) delete stage.next.button;
    });
    fs.writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`);
  }
}
