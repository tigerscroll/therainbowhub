import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "data", "quizzes");
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = path.join(root, entry.name);
  for (const name of fs.readdirSync(directory)) {
    if (!/^(?:en|fr|de|it|nl|es|pt)\.json$/.test(name)) continue;
    const file = path.join(directory, name);
    const content = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!content.checkpoint) continue;
    for (const key of ["adNote", "finalBadge", "finalTitle", "finalCopy", "finalButton", "finalChecklist"]) {
      delete content.checkpoint[key];
    }
    fs.writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`);
  }
}
