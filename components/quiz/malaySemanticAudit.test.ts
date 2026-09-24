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
  questions(read(slug, "ms")).find(([key]) => key === id)?.[1] as
    { question: string; answers: Record<string, string> };

test("Malay quiz families retain ten English question IDs and answer IDs", () => {
  const slugs = fs.readdirSync(root).filter((slug) =>
    fs.existsSync(path.join(root, slug, "ms.json")));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const english = questions(read(slug, "en"));
    const malay = questions(read(slug, "ms"));
    assert.equal(malay.length, 10, slug);
    assert.deepEqual(malay.map(([id]) => id).sort(), english.map(([id]) => id).sort(), slug);
    const englishById = new Map(english);
    for (const [id, translated] of malay) {
      assert.deepEqual(Object.keys(translated.answers).sort(),
        Object.keys(englishById.get(id)!.answers).sort(), `${slug}/${id}`);
    }
  }
});

test("Malay results avoid recurring literal template and misleading labels", () => {
  for (const slug of fs.readdirSync(root)) {
    if (!fs.existsSync(path.join(root, slug, "ms.json"))) continue;
    const profiles = JSON.stringify(read(slug, "ms").results?.profiles ?? {});
    assert.doesNotMatch(profiles, /sambungan yang hendak dilawati semula/u, slug);
    assert.doesNotMatch(profiles, /Cabaran ini memperkenalkan beberapa idea yang tidak dikenali/u, slug);
  }
  assert.doesNotMatch(JSON.stringify(read("midwifery", "ms").results.profiles), /Peguam Curious Care/u);
  assert.match(read("dementia", "ms").results.profiles["profile-5"].copy,
    /tidak boleh mendiagnosis atau mengecualikan demensia/u);
});

test("Malay safety and health wording preserves the intended distinctions", () => {
  assert.match(question("motorbike", "motorbike-q3").question,
    /jarak dengan kenderaan di hadapan/u);
  assert.match(question("firefighter", "firefighter-s1q2").question,
    /percikan api di sebelah lopak air/u);
  assert.match(question("police", "police-q3").question, /keterangan awal/u);
  assert.match(question("depression", "depression-q1").question, /berasa murung/u);
  assert.match(question("depression", "depression-q2").answers.a3,
    /Jauh kurang/u);
  assert.match(question("depression", "depression-q9").answers.a2,
    /Sedikit lebih kerap/u);
  assert.match(question("ocd", "ocd-q8").question, /kelegaan/u);
  assert.match(question("prostatetest", "prostate-test-q5").question,
    /desakan baharu untuk segera membuang air kecil/u);
  assert.match(question("midwifery", "mid-r3q2").answers.a4,
    /penilaian segera daripada petugas kesihatan yang berkelayakan/u);
  assert.match(question("paramedic", "paramedic-r5q4").answers.a2,
    /penilaian segera oleh petugas kesihatan yang berkelayakan/u);
});

test("Malay language-dependent questions have coherent localized answers", () => {
  assert.equal(question("grammar", "grammar-r5q4").answers.a1,
    "Laporan itu telah saya baca.");
  assert.equal(question("word", "word-q10").answers.a2, "Katak");
  assert.match(question("iq", "iq-s2q2").question, /abjad bahasa Inggeris A–Z/u);
});
