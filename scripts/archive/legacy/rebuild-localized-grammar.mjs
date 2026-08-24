import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const grammarRoot = path.join(root, "data", "quizzes", "grammar");
const bankRoot = path.join(root, "scripts", "grammar-banks");
const locales = ["fr", "de", "it", "nl", "es", "pt"];
const support = JSON.parse(await fs.readFile(path.join(bankRoot, "support.json"), "utf8"));

for (const locale of locales) {
  const contentPath = path.join(grammarRoot, `${locale}.json`);
  const bankPath = path.join(bankRoot, `${locale}.json`);
  const content = JSON.parse(await fs.readFile(contentPath, "utf8"));
  const bank = JSON.parse(await fs.readFile(bankPath, "utf8"));
  const questions = content.stages.flatMap((stage) => stage.questions);
  if (bank.length !== questions.length) {
    throw new Error(`${locale}: native Grammar bank has ${bank.length} entries; expected ${questions.length}.`);
  }
  questions.forEach((question, index) => {
    const nativeQuestion = bank[index];
    if (!nativeQuestion || nativeQuestion.id !== question.id) {
      throw new Error(`${locale}: Grammar bank entry ${index + 1} must preserve ${question.id}.`);
    }
    if (!Array.isArray(nativeQuestion.answers) || nativeQuestion.answers.length !== 4 || new Set(nativeQuestion.answers).size !== 4) {
      throw new Error(`${locale}: ${question.id} must have four unique native answers.`);
    }
    if (nativeQuestion.correct !== question.correct) {
      throw new Error(`${locale}: ${question.id} must preserve correct position ${question.correct}.`);
    }
    question.question = nativeQuestion.question;
    question.answers = nativeQuestion.answers;
    if (question.visual) {
      if (!nativeQuestion.visual) throw new Error(`${locale}: ${question.id} requires a native visual.`);
      question.visual = { ...question.visual, ...nativeQuestion.visual };
    }
    const nativeSupport = support[locale]?.[question.id];
    if (nativeSupport?.context !== undefined) question.context = nativeSupport.context;
    if (nativeSupport?.visual) question.visual = { ...question.visual, ...nativeSupport.visual };
  });
  await fs.writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`);
}

console.log("Rebuilt Grammar as six independent native-language quizzes.");
