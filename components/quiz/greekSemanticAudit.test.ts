import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.join(process.cwd(), "data/quizzes");
const read = (slug: string) =>
  JSON.parse(fs.readFileSync(path.join(root, slug, "el.json"), "utf8"));
const question = (slug: string, id: string) =>
  Object.values(read(slug).stages).flatMap((stage: any) =>
    Object.entries(stage.questions)).find(([key]) => key === id)?.[1] as
      { question: string; answers: Record<string, string> };

test("Greek pack contains ten questions in each of 53 quiz families", () => {
  const slugs = fs.readdirSync(root).filter((slug) =>
    fs.existsSync(path.join(root, slug, "el.json")));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const quiz = read(slug);
    const ids = Object.values(quiz.stages).flatMap((stage: any) =>
      Object.keys(stage.questions));
    assert.equal(ids.length, 10, slug);
  }
});

test("Greek result profiles do not use literal review-and-connections boilerplate", () => {
  for (const slug of fs.readdirSync(root)) {
    if (!fs.existsSync(path.join(root, slug, "el.json"))) continue;
    const profiles = JSON.stringify(read(slug).results?.profiles ?? {});
    assert.doesNotMatch(profiles, /Η κριτική σας δείχνει ποιες συνδέσεις/u, slug);
    assert.doesNotMatch(profiles, /Αυτή η πρόκληση εισήγαγε μερικές άγνωστες ιδέες/u, slug);
  }
});

test("Greek safety and health wording retains the intended actions", () => {
  assert.match(question("motorbike", "motorbike-q3").question,
    /απόσταση από το προπορευόμενο όχημα/u);
  assert.match(question("mechanic", "mechanic-r5q6").answers.a1,
    /Μην μπαίνετε κάτω από το όχημα/u);
  assert.match(question("police", "police-q3").question,
    /πρώτες καταθέσεις/u);
  assert.match(question("firefighter", "firefighter-s1q2").answers.a4,
    /Κρατήστε τους ανθρώπους μακριά/u);
  assert.match(question("depression", "depression-q8").question,
    /δεν μπορείτε να ηρεμήσετε/u);
});
