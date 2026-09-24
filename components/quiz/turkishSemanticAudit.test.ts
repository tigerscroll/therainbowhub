import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.join(process.cwd(), "data/quizzes");
const read = (slug: string) =>
  JSON.parse(fs.readFileSync(path.join(root, slug, "tr.json"), "utf8"));
const question = (slug: string, id: string) =>
  Object.values(read(slug).stages).flatMap((stage: any) =>
    Object.entries(stage.questions)).find(([key]) => key === id)?.[1] as
      { question: string; answers: Record<string, string> };

test("Turkish pack contains ten questions in each of 53 quiz families", () => {
  const slugs = fs.readdirSync(root).filter((slug) =>
    fs.existsSync(path.join(root, slug, "tr.json")));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const quiz = read(slug);
    const ids = Object.values(quiz.stages).flatMap((stage: any) =>
      Object.keys(stage.questions));
    assert.equal(ids.length, 10, slug);
  }
});

test("Turkish result profiles avoid the literal review-and-connections template", () => {
  for (const slug of fs.readdirSync(root)) {
    if (!fs.existsSync(path.join(root, slug, "tr.json"))) continue;
    const profiles = JSON.stringify(read(slug).results?.profiles ?? {});
    assert.doesNotMatch(profiles, /hangi bağlantıların tekrar ziyaret edilmesi/u, slug);
    assert.doesNotMatch(profiles, /Bu meydan okuma bazı alışılmadık fikirlerin/u, slug);
  }
});

test("Turkish safety and health wording keeps the intended meaning", () => {
  assert.match(question("motorbike", "motorbike-q3").question,
    /takip mesafesini/u);
  assert.match(question("mechanic", "mechanic-r5q6").answers.a1,
    /desteklenmeden altına girmeyin/u);
  assert.match(question("midwifery", "mid-r1q1").question,
    /anne ile bebek arasındaki madde alışverişini/u);
  assert.match(question("paramedic", "paramedic-r1q4").question,
    /gerilim taşıyan bir elektrik kablosu/u);
  assert.match(question("prostatetest", "prostate-test-q9").answers.a3,
    /Babamda veya erkek kardeşimde prostat kanseri/u);
  assert.match(read("dementia").results.profiles["profile-5"].copy,
    /demans tanısı koyamaz veya demansı dışlayamaz/u);
});
