import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const quizDir = path.join(root, "data", "quizzes", "paramedic");
const english = JSON.parse(fs.readFileSync(path.join(quizDir, "en.json"), "utf8"));
const ids = english.stages.flatMap((stage) => stage.questions.map((question) => question.id));
const locales = ["fr", "de", "it", "nl", "es", "pt"];
const support = JSON.parse(
  fs.readFileSync(path.join(root, "scripts", "localization-banks", "paramedic-support.json"), "utf8"),
);

for (const locale of locales) {
  const bank = JSON.parse(
    fs.readFileSync(path.join(root, "scripts", "localization-banks", `paramedic-${locale}.json`), "utf8"),
  );
  if (bank.length !== ids.length) throw new Error(`${locale}: expected ${ids.length} questions, received ${bank.length}`);

  const file = path.join(quizDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const questions = data.stages.flatMap((stage) => stage.questions);
  const questionById = new Map(questions.map((question) => [question.id, question]));

  ids.forEach((id, index) => {
    const question = questionById.get(id);
    question.question = bank[index][0];
    question.answers = bank[index][1];
  });

  for (const [id, localized] of Object.entries(support[locale])) {
    const question = questionById.get(id);
    if (typeof localized === "string") {
      question.context = localized;
    } else {
      question.visual.items = localized.items;
      question.visual.ariaLabel = localized.ariaLabel;
    }
  }

  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Rebuilt native Paramedic bank: ${locale}`);
}
