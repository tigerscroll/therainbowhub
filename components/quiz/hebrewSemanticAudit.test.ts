import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.join(process.cwd(), "data/quizzes");
const read = (slug: string) =>
  JSON.parse(fs.readFileSync(path.join(root, slug, "he.json"), "utf8"));
const question = (slug: string, id: string) =>
  Object.values(read(slug).stages).flatMap((stage: any) =>
    Object.entries(stage.questions)).find(([key]) => key === id)?.[1] as
      { question: string; answers: Record<string, string>; study?: { items: string[] } };

test("Hebrew quiz pack retains ten questions per family and RTL direction", () => {
  const slugs = fs.readdirSync(root).filter((slug) =>
    fs.existsSync(path.join(root, slug, "he.json")));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const quiz = read(slug);
    const ids = Object.values(quiz.stages).flatMap((stage: any) =>
      Object.keys(stage.questions));
    assert.equal(ids.length, 10, slug);
  }
  const locale = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), "data/i18n/he.json"), "utf8"));
  assert.equal(locale.locale.direction, "rtl");
});

test("Hebrew result profiles avoid literal review and connections boilerplate", () => {
  for (const slug of fs.readdirSync(root)) {
    if (!fs.existsSync(path.join(root, slug, "he.json"))) continue;
    const profiles = JSON.stringify(read(slug).results?.profiles ?? {});
    assert.doesNotMatch(profiles, /אילו קשרים כדאי לבקר מחדש/u, slug);
    assert.doesNotMatch(profiles, /האתגר הזה הציג כמה רעיונות לא מוכרים/u, slug);
  }
});

test("Hebrew safety and health wording preserves the intended actions", () => {
  assert.match(question("motorbike", "motorbike-q3").question,
    /למרחק ביניכם לבין הרכב שלפניכם/u);
  assert.match(question("mechanic", "mechanic-r5q6").answers.a1,
    /אין להיכנס מתחת לרכב/u);
  assert.match(question("police", "police-q3").question,
    /העדויות הראשוניות/u);
  assert.match(question("flightattendant", "flightattendant-q4").answers.a4,
    /להשאיר את כל הכבודה מאחור/u);
  assert.match(read("dementia").results.score.disclaimer,
    /אינו יכול לאבחן דמנציה או לשלול אותה/u);
  assert.match(read("maculardegeneration").about.body,
    /פנו בהקדם/u);
  assert.match(read("prostatetest").results.profiles["profile-3"].copy,
    /פנו לטיפול דחוף/u);
});

test("Hebrew dementia recall uses the bridge noun in study and answers", () => {
  const quiz = read("dementia");
  const questions = quiz.stages["stage-1"].questions;
  assert.equal(questions["dementia-q1"].answers.a1, "גשר");
  assert.equal(questions["dementia-q9"].answers.a4, "גשר");
  assert.ok(questions["dementia-q1"].study.items.includes("גשר"));
});
