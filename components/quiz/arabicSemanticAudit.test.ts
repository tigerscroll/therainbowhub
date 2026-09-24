import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const quizRoot = path.join(process.cwd(), "data/quizzes");
const read = (slug: string) =>
  JSON.parse(fs.readFileSync(path.join(quizRoot, slug, "ar.json"), "utf8"));
const question = (slug: string, id: string) =>
  Object.values(read(slug).stages).flatMap((stage: any) =>
    Object.entries(stage.questions)).find(([key]) => key === id)?.[1] as
      { question: string; answers: Record<string, string> };

test("Arabic clinical and safety wording keeps the intended action clear", () => {
  assert.match(question("firefighter", "firefighter-s1q2").question, /شرارات/u);
  assert.match(question("motorbike", "motorbike-q3").question, /للمسافة بينك وبين المركبة/u);
  assert.match(question("nursing", "nurse-r10q1").answers.a1, /أكسجين أقل إلى الدم/u);
  assert.match(question("paramedic", "paramedic-r1q4").answers.a2, /أبعد الجميع/u);
  assert.match(question("midwifery", "mid-r4q3").question, /المتدربين/u);
  assert.match(question("nun", "nun-q1").question, /المشورات الإنجيلية/u);
  assert.match(question("harvard", "harvard-s4q3").answers.a2, /لا يتفوق أي منهما/u);
});

test("Arabic result profiles do not use the machine-literal connections template", () => {
  for (const slug of fs.readdirSync(quizRoot)) {
    if (!fs.existsSync(path.join(quizRoot, slug, "ar.json"))) continue;
    assert.doesNotMatch(JSON.stringify(read(slug).results?.profiles ?? {}),
      /الاتصالات التي يجب إعادة زيارتها/u, slug);
  }
});

test("Arabic high-visibility result labels are intelligible", () => {
  assert.equal(read("personality").results.profiles["profile-4"].tier, "السويد");
  assert.equal(read("dementia").results.profiles["profile-5"].title, "كان التحدي صعبًا اليوم");
  assert.equal(read("tools").results.profiles["profile-1"].title, "خبير أدوات الخرسانة");
  assert.equal(read("lovers").results.profiles["profile-4"].tier, "11–20 علاقة");
  assert.equal(read("lovers").results.profiles["profile-5"].tier, "أكثر من 20 علاقة");
  assert.match(read("marry").results.profiles.warm_anchor.copy, /الاستقرار والراحة/u);
});

test("Arabic legacy result copy stays readable and medically cautious", () => {
  assert.match(read("prostatetest").about.body, /لا تحدد احتمال الإصابة/u);
  assert.match(read("maculardegeneration").results.profiles["profile-5"].copy,
    /لا تحل محل فحص العين/u);
  assert.equal(read("historicalfigures").results.profiles["profile-3"].title,
    "مستكشف الأرشيف");
  assert.equal(read("train").results.profiles["profile-5"].title,
    "بداية التعلّم في السكك الحديدية");
  assert.match(read("memory").results.profiles["profile-6"].copy,
    /فلا تعتبر النتيجة حكمًا على ذاكرتك/u);
  assert.match(read("ocd").results.profiles["profile-4"].copy,
    /الأفعال المتكررة/u);
  assert.match(question("ocd", "ocd-q7").question, /أفعال متكررة/u);
  assert.match(question("mechanic", "mechanic-r5q6").answers.a1,
    /لا تدخل تحت السيارة/u);
  assert.match(question("maculardegeneration", "macular-q9").question,
    /إذا تدهورت الرؤية فجأة/u);
});
