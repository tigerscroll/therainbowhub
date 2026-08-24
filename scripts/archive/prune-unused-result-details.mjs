import fs from "node:fs";
import path from "node:path";

const quizRoot = path.join(process.cwd(), "data", "quizzes");
let changed = 0;

for (const slug of fs.readdirSync(quizRoot)) {
  const directory = path.join(quizRoot, slug);
  if (!fs.existsSync(path.join(directory, "quiz.json"))) continue;
  for (const file of fs.readdirSync(directory).filter((name) => /^(?:en|fr|de|it|nl|es|pt)\.json$/.test(name))) {
    const pathname = path.join(directory, file);
    const source = JSON.parse(fs.readFileSync(pathname, "utf8"));
    let dirty = false;
    for (const insights of [source.results?.score?.insights, source.results?.estimate?.insights]) {
      if (insights?.details !== undefined) {
        delete insights.details;
        dirty = true;
      }
    }
    if (dirty) {
      fs.writeFileSync(pathname, `${JSON.stringify(source, null, 2)}\n`);
      changed += 1;
    }
  }
}

console.log(`Pruned unused result-detail copy from ${changed} locale file(s).`);
