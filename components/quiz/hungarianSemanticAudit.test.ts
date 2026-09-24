import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.join(process.cwd(), "data/quizzes");
const read = (slug: string, locale: string) =>
  JSON.parse(fs.readFileSync(path.join(root, slug, `${locale}.json`), "utf8"));
const questions = (quiz: any) =>
  Object.values(quiz.stages).flatMap((stage: any) => Object.entries(stage.questions)) as
    [string, { question: string; answers: Record<string, string> }][];
const question = (slug: string, id: string) =>
  questions(read(slug, "hu")).find(([key]) => key === id)?.[1] as
    { question: string; answers: Record<string, string> };

test("Hungarian quizzes retain ten English-aligned question and answer IDs", () => {
  const slugs = fs.readdirSync(root).filter((slug) =>
    fs.existsSync(path.join(root, slug, "hu.json")));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const en = questions(read(slug, "en"));
    const hu = questions(read(slug, "hu"));
    assert.equal(hu.length, 10, slug);
    assert.deepEqual(hu.map(([id]) => id).sort(), en.map(([id]) => id).sort(), slug);
    const enById = new Map(en);
    for (const [id, translated] of hu) {
      assert.deepEqual(Object.keys(translated.answers).sort(),
        Object.keys(enById.get(id)!.answers).sort(), `${slug}/${id}`);
    }
  }
});

test("Hungarian results avoid recurring literal templates and visible English fragments", () => {
  for (const slug of fs.readdirSync(root)) {
    if (!fs.existsSync(path.join(root, slug, "hu.json"))) continue;
    const profiles = JSON.stringify(read(slug, "hu").results?.profiles ?? {});
    assert.doesNotMatch(profiles, /mely kapcsolatokat érdemes újra felkeresni/u, slug);
    assert.doesNotMatch(profiles, /Ez a kihívás ismeretlen ötleteket hozott/u, slug);
    assert.doesNotMatch(profiles,
      /\b(?:Standout|Explorer|Mastermind|First-Response|First-Alarm|Case Room|Admissions|Nursing Natural|Dental Knowledge Pro)\b/u,
      slug);
  }
  assert.match(read("socialworker", "hu").results.profiles["profile-1"].title,
    /szociális munkával/u);
  assert.match(read("medical", "hu").results.name, /ORVOSI ALAPISMERETEK/u);
});

test("Hungarian health and safety questions keep the intended meaning", () => {
  assert.match(question("motorbike", "motorbike-q3").question,
    /követési távolságot/u);
  assert.match(question("firefighter", "firefighter-s1q2").question,
    /elektromos kapcsolószekrény szikrázik egy víztócsa mellett/u);
  assert.match(question("prostatetest", "prostate-test-q5").question,
    /sürgető vizelési inger/u);
  assert.equal(question("prostatetest", "prostate-test-q5").answers.a2, "Ritkán");
  assert.match(question("prostatetest", "prostate-test-q9").answers.a3,
    /fiútestvéremnek/u);
  assert.match(question("depression", "depression-q10").answers.a3,
    /csökkent energiaszint/u);
  assert.match(question("ocd", "ocd-q4").answers.a3,
    /megfelelőnek nem érzem/u);
  assert.match(question("midwifery", "mid-r3q2").question, /látászavarral/u);
  assert.match(question("nursing", "nurse-r10q1").question,
    /legközvetlenebb következménye/u);
  assert.match(read("dementia", "hu").results.profiles["profile-5"].copy,
    /nem alkalmas a demencia megállapítására vagy kizárására/u);
});

test("Hungarian language-dependent questions retain unique local answers", () => {
  assert.equal(question("grammar", "grammar-r5q4").answers.a1, "rám");
  assert.equal(question("word", "word-q10").answers.a2, "Görög");
  assert.match(question("iq", "iq-s2q2").question, /angol ábécé A–Z/u);
});
