import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const quizRoot = path.join(process.cwd(), "data/quizzes");
const read = (slug: string, locale: string) =>
  JSON.parse(fs.readFileSync(path.join(quizRoot, slug, `${locale}.json`), "utf8"));
const question = (slug: string, id: string) => {
  const copy = read(slug, "de");
  return Object.values(copy.stages).flatMap((stage: any) =>
    Object.entries(stage.questions)).find(([key]) => key === id)?.[1] as
      { question: string; answers: Record<string, string> };
};

test("German safety questions preserve the intended subject and technical meaning", () => {
  assert.match(question("autism", "autism-q4").question, /wirken sich Geräusche/u);
  assert.match(question("firefighter", "firefighter-s1q1").question, /Brennstoff/u);
  assert.match(question("flightattendant", "flightattendant-q9").question, /bodennahen Notbeleuchtung/u);
  assert.match(question("nun", "nun-q6").question, /Klarissenordens/u);
  assert.match(question("train", "train-q8").answers.a4, /bestätigen/u);
  assert.doesNotMatch(question("nursing", "nurse-r10q1").question, /Downstream/u);
  assert.match(question("ocd", "ocd-q8").answers.a3, /wiederhole die Handlung/u);
  assert.match(question("prostatetest", "prostate-test-q9").answers.a1, /oder ich bin mir nicht sicher/u);
});

test("German relationship prompts preserve the source meaning and form of address", () => {
  assert.match(question("lovers", "lovers-q3").question, /sich .* umdrehen/u);
  assert.match(question("marry", "marry-r1q1").question, /zeichnen/u);
  assert.match(question("marry", "marry-r4q7").question, /^Sie sind beide/u);
});

test("German result copy refers to answer review, not unrelated connections", () => {
  for (const slug of fs.readdirSync(quizRoot)) {
    if (!fs.existsSync(path.join(quizRoot, slug, "de.json"))) continue;
    const copy = read(slug, "de");
    assert.doesNotMatch(JSON.stringify(copy.results?.profiles ?? {}),
      /Verbindungen Sie noch einmal aufgreifen sollten/u, slug);
  }
});
