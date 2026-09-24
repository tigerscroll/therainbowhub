import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const quizRoot = path.join(process.cwd(), "data/quizzes");
const locales = fs.readdirSync(path.join(process.cwd(), "data/i18n"))
  .filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -5));
const read = (slug: string, file: string) => JSON.parse(fs.readFileSync(path.join(quizRoot, slug, file), "utf8"));
type QuestionCopy = { answers: Record<string, string> };
type StageCopy = { questions: Record<string, QuestionCopy> };
const normalized = (value: string) => value.normalize("NFKC").replace(/\s+/gu, " ").trim().toLocaleLowerCase("und");

test("all quiz locales retain visibly distinct answer labels, including profile scales", () => {
  for (const slug of fs.readdirSync(quizRoot)) {
    if (!fs.existsSync(path.join(quizRoot, slug, "quiz.json"))) continue;
    for (const locale of locales) {
      const copy = read(slug, `${locale}.json`);
      for (const stage of Object.values(copy.stages) as StageCopy[]) {
        for (const [id, question] of Object.entries(stage.questions)) {
          const values = Object.values(question.answers).map(normalized);
          assert.ok(values.every(Boolean), `${slug}/${locale}/${id}: blank answer`);
          assert.equal(new Set(values).size, values.length, `${slug}/${locale}/${id}: duplicate visible answers`);
        }
      }
    }
  }
});

test("the localized palindrome question has exactly one correct answer in every locale", () => {
  const correctId = read("word", "quiz.json").structure.questions["word-q10"].correctAnswerId;
  for (const locale of locales) {
    const question = (Object.values(read("word", `${locale}.json`).stages) as Array<{questions: Record<string, QuestionCopy>}>).find(stage => stage.questions["word-q10"])!.questions["word-q10"];
    const palindromeIds = Object.entries(question.answers).filter(([, answer]) => {
      const letters = Array.from(normalized(answer).replace(/[\p{P}\p{Z}\p{M}]/gu, ""));
      return letters.length > 1 && letters.join("") === [...letters].reverse().join("");
    }).map(([id]) => id);
    assert.deepEqual(palindromeIds, [correctId], `${locale}: wordplay must survive translation`);
  }
});

test("Word association answers do not merely repeat the quoted keyword", () => {
  const simple = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").replace(/[^\p{L}]/gu, "").toLocaleLowerCase("und");
  for (const locale of locales) {
    const copy = read("word", `${locale}.json`);
    for (const stage of Object.values(copy.stages) as Array<{questions: Record<string, QuestionCopy & {question: string}>}>) {
      for (const [id, question] of Object.entries(stage.questions)) {
        const keyword = question.question.match(/[«“„「‘](.*?)[»”」’“]/u)?.[1];
        if (!keyword) continue;
        const normalizedKeyword = simple(keyword);
        for (const [answerId, answer] of Object.entries(question.answers)) {
          assert.notEqual(simple(answer), normalizedKeyword, `${locale}/${id}/${answerId}: answer repeats the prompt`);
        }
      }
    }
  }
});

test("reviewed Word copy keeps local address and association meaning", () => {
  const spanish = read("word", "es.json");
  assert.match(spanish.about.howToPlay.steps[0], /^Lee\b/u);
  assert.doesNotMatch(JSON.stringify(spanish.results.profiles), /Reconoció|Utilice la revisión|Su revisión/u);

  const portuguese = read("word", "pt.json");
  assert.match(portuguese.about.howToPlay.steps[0], /^Lê /u);
  assert.match(portuguese.career.resultProgressLabel, /teu/u);
  assert.doesNotMatch(JSON.stringify(portuguese), /Suas dez|Sua melhor rodada|Use a revisão/u);

  const polish = read("word", "pl.json");
  assert.doesNotMatch(polish.results.score.insights.overview, /stowarzyszenia/iu);
  assert.equal(polish.stages["stage-1"].questions["word-q4"].answers.a3, "Ładowanie");

  const german = read("word", "de.json");
  assert.doesNotMatch(german.results.profiles["profile-1"].copy, /Thread|Links/u);
  const french = read("word", "fr.json");
  assert.doesNotMatch(french.results.profiles["profile-3"].copy, /Votre avis/u);

  const danish = read("word", "da.json");
  assert.match(danish.results.score.passed, /ordassociationstesten/u);
  assert.doesNotMatch(danish.about.body, /hverdagslinks|single-keyword/u);
  const swedish = read("word", "sv.json");
  assert.match(swedish.results.score.passed, /ordassociationstestet/u);
  assert.doesNotMatch(swedish.about.disclaimer, /föreningar/u);
  const norwegian = read("word", "nb.json");
  assert.match(norwegian.results.score.passed, /ordassosiasjonstesten/u);

  const malay = read("word", "ms.json");
  assert.doesNotMatch(JSON.stringify(malay), /persatuan/iu);
  for (const question of Object.values(malay.stages["stage-1"].questions) as QuestionCopy[]) {
    for (const answer of Object.values(question.answers)) assert.match(answer, /^\p{Lu}/u);
  }
  const indonesian = read("word", "id.json");
  assert.equal(indonesian.stages["stage-1"].questions["word-q5"].answers.a2, "Pulau-pulau");
  assert.equal(indonesian.career.resultProgressLabel, "Kemajuan Anda");
  assert.doesNotMatch(JSON.stringify(indonesian.about), /sambungan langsung|pengungkapan terakhir/iu);

  const romanian = read("word", "ro.json");
  assert.equal(romanian.landing.cta, "Începe testul");
  assert.doesNotMatch(JSON.stringify(romanian.about), /Alegeți|Citiți|meci dintre/iu);
  assert.doesNotMatch(JSON.stringify(romanian.results.profiles), /Ați|dvs\.|Utilizați/iu);
  const turkish = read("word", "tr.json");
  assert.equal(turkish.career.stages["stage-1"].preAdTitle, "Sonucun hazır");
  assert.doesNotMatch(JSON.stringify(turkish.about), /seçin|okuyun|açıklayın/iu);
  assert.doesNotMatch(JSON.stringify(turkish.results.profiles), /geçtiniz|fark ettiniz|bildiğinizi/iu);

  const italian = read("word", "it.json");
  assert.match(italian.eyebrow, /ASSOCIAZIONE DI PAROLE/u);
  assert.doesNotMatch(JSON.stringify(italian.results.profiles), /La tua recensione|connessione è scattata/u);
  const dutch = read("word", "nl.json");
  assert.match(dutch.eyebrow, /WOORDASSOCIATIE/u);
  assert.doesNotMatch(JSON.stringify(dutch.results.profiles), /\buw\b|de antwoordenoverzicht/iu);
});

test("Italian quiz results do not call a quiz stage a giro", () => {
  for (const slug of fs.readdirSync(quizRoot)) {
    if (!fs.existsSync(path.join(quizRoot, slug, "it.json"))) continue;
    const copy = read(slug, "it.json");
    assert.doesNotMatch(copy.results?.score?.bestRound ?? "", /giro migliore/iu, slug);
  }
});

test("visual answer letters stay aligned with the displayed Latin-letter puzzles", () => {
  for (const slug of ["vision", "cataract", "maculardegeneration"]) {
    const source = read(slug, "en.json");
    const activeLocales = read(slug, "quiz.json").activeLocales ?? locales;
    for (const locale of activeLocales) {
      const copy = read(slug, `${locale}.json`);
      for (const [sid, stage] of Object.entries(source.stages) as [string, StageCopy][]) {
        for (const [id, question] of Object.entries(stage.questions)) {
          for (const [answerId, value] of Object.entries(question.answers)) {
            if (/^[A-Z]{1,2}$/.test(value)) {
              assert.equal(copy.stages[sid].questions[id].answers[answerId], value, `${slug}/${locale}/${id}/${answerId}`);
            }
          }
        }
      }
    }
  }
});

test("reviewed actor names retain their spelling in Latin-script answer labels", () => {
  const source = read("actors", "en.json").stages["stage-1"].questions as Record<string, QuestionCopy>;
  // Original name spellings are intentional in these locales. Other writing
  // systems use their own reviewed transliterations, not an English-only rule.
  const originalNameLocales = [
    "en", "fr", "de", "it", "nl", "es", "pt", "pl", "sv", "da", "nb",
    "tr", "cs", "ro", "hu", "fi", "id", "vi", "ms", "fil", "hr", "sr", "sk",
  ];
  for (const locale of originalNameLocales) {
    const questions = read("actors", `${locale}.json`).stages["stage-1"].questions;
    for (const [questionId, question] of Object.entries(source)) {
      for (const [answerId, name] of Object.entries(question.answers)) {
        const expected = locale === "tr" && name === "Omar Sharif" ? "Ömer Şerif" : name;
        assert.equal(questions[questionId].answers[answerId], expected, `actors/${locale}/${questionId}/${answerId}: proper name changed`);
      }
    }
  }
});

test("the reviewed Redford clue retains its film year and correct answer relationship", () => {
  const manifest = read("actors", "quiz.json");
  const questionId = "actors-q4";
  const correctId = manifest.structure.questions[questionId].correctAnswerId;
  assert.equal(correctId, "a4");
  assert.equal(read("actors", "en.json").stages["stage-1"].questions[questionId].answers[correctId], "Robert Redford");
  for (const locale of locales) {
    const question = read("actors", `${locale}.json`).stages["stage-1"].questions[questionId];
    assert.match(question.question, /1962/u, `actors/${locale}: verified film year missing`);
    assert.doesNotMatch(question.question, /1960/u, `actors/${locale}: ambiguous film/TV debut clue restored`);
  }
});

test("the barrister Latin-term question preserves exact choices under stable answer IDs in every locale", () => {
  const questionId = "barrister-q5";
  const question = read("barrister", "quiz.json").structure.questions[questionId];
  const expected = {
    a1: "Ratio decidendi",
    a2: "Habeas corpus",
    a3: "Bona fide",
    a4: "Prima facie",
  };
  assert.deepEqual([...question.answerIds].sort(), Object.keys(expected).sort());
  assert.equal(question.correctAnswerId, "a1");
  // The prompt asks which Latin term fits. Translating choices into their
  // definitions, or transliterating only the distractors, gives away the answer.
  // Compare by ID rather than display position so reordering remains safe.
  for (const locale of locales) {
    const copy = (Object.values(read("barrister", `${locale}.json`).stages) as Array<{questions: Record<string, QuestionCopy>}>).find(stage => stage.questions[questionId])!.questions[questionId];
    assert.deepEqual(copy.answers, expected, `barrister/${locale}/${questionId}: preserve the Latin choices`);
  }
});

test("Alzheimer's visual-memory answer icons match their stable answer labels", () => {
  const manifest = read("alzheimers", "quiz.json");
  const question = manifest.structure.questions["alzheimers-q5"];
  const copy = read("alzheimers", "en.json").stages["stage-1"].questions["alzheimers-q5"];
  const expectedIcons: Record<string, string> = { Apple: "🍎", Candle: "🕯️", Shoe: "👟", Umbrella: "☂️" };
  for (const answerId of question.answerIds) {
    assert.equal(question.icons[answerId], expectedIcons[copy.answers[answerId]], answerId);
  }
  assert.equal(question.icons[question.correctAnswerId], copy.study.items[1]);
});

test("Alzheimer's study words remain consistent with immediate and delayed answer labels in every locale", () => {
  for (const locale of locales) {
    const questions = read("alzheimers", `${locale}.json`).stages["stage-1"].questions;
    // Locale-aware uppercase accounts for Greek uppercase accent omission and
    // Turkish dotted/dotless i without stripping meaningful marks globally.
    const comparable = (value: string) => value.normalize("NFKC").toLocaleUpperCase(locale).trim();
    const wordLinks: [number, string, number][] = [
      [1, "a1", 3], [1, "a2", 1], [1, "a3", 0], [1, "a4", 4],
      [9, "a1", 1], [9, "a2", 0], [9, "a3", 4], [9, "a4", 2],
    ];
    for (const [questionNumber, answerId, studyPosition] of wordLinks) {
      assert.equal(
        comparable(questions[`alzheimers-q${questionNumber}`].answers[answerId]),
        comparable(questions["alzheimers-q1"].study.items[studyPosition]),
        `${locale}: q${questionNumber}/${answerId} differs from its study cue`,
      );
    }
    for (const [firstId, laterId] of [["a1", "a3"], ["a2", "a2"], ["a3", "a1"], ["a4", "a4"]]) {
      assert.equal(
        comparable(questions["alzheimers-q5"].answers[firstId]),
        comparable(questions["alzheimers-q10"].answers[laterId]),
        `${locale}: visual-memory labels differ between q5 and q10`,
      );
    }
  }
});
