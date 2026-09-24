import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.join(process.cwd(), "data/quizzes");
const read = (slug: string) =>
  JSON.parse(fs.readFileSync(path.join(root, slug, "id.json"), "utf8"));
const question = (slug: string, id: string) =>
  Object.values(read(slug).stages).flatMap((stage: any) =>
    Object.entries(stage.questions)).find(([key]) => key === id)?.[1] as
      { question: string; answers: Record<string, string> };

test("Indonesian pack has ten questions in each of 53 quiz families", () => {
  const slugs = fs.readdirSync(root).filter((slug) =>
    fs.existsSync(path.join(root, slug, "id.json")));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const quiz = read(slug);
    const ids = Object.values(quiz.stages).flatMap((stage: any) =>
      Object.keys(stage.questions));
    assert.equal(ids.length, 10, slug);
  }
});

test("Indonesian results avoid literal connections boilerplate", () => {
  for (const slug of fs.readdirSync(root)) {
    if (!fs.existsSync(path.join(root, slug, "id.json"))) continue;
    const profiles = JSON.stringify(read(slug).results?.profiles ?? {});
    assert.doesNotMatch(profiles, /koneksi mana yang harus dikunjungi kembali/u, slug);
    assert.doesNotMatch(profiles, /Tantangan ini menimbulkan beberapa ide asing/u, slug);
  }
});

test("Indonesian safety and clinical questions retain their intended meaning", () => {
  assert.match(question("motorbike", "motorbike-q3").question,
    /jarak dengan kendaraan di depan/u);
  assert.match(question("mechanic", "mechanic-r5q6").answers.a1,
    /mobil ditopang/u);
  assert.match(question("firefighter", "firefighter-s1q2").question,
    /memercikkan api di dekat genangan air/u);
  assert.match(question("ocd", "ocd-q8").question,
    /rasa lega itu bertahan/u);
  assert.match(question("midwifery", "mid-r3q2").answers.a4,
    /Segera minta pemeriksaan/u);
  assert.match(read("dementia").results.profiles["profile-5"].copy,
    /tidak dapat mendiagnosis atau menyingkirkan demensia/u);
});
