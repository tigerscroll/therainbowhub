import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (slug, locale) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const split = (line, count, label) => {
  const fields = line.split('|').map(value => value.trim());
  assert.equal(fields.length, count, label);
  assert.ok(fields.every(Boolean), label);
  return fields;
};

export const memorySteps = {
  ar: ['اختر إجابة واحدة لكل سؤال من الأسئلة العشرة.', 'أجب عن 8 أسئلة على الأقل إجابة صحيحة لتصل إلى 80٪.', 'اعرض نتيجتك وراجع الأسئلة التي أخطأت فيها.'],
  de: ['Wähle bei jeder der 10 Fragen eine Antwort aus.', 'Mit mindestens 8 richtigen Antworten erreichst du 80 %.', 'Sieh dir dein Ergebnis und die Fragen an, die du falsch beantwortet hast.'],
  en: ['Choose one answer for each of the 10 questions.', 'Get at least 8 correct to reach 80%.', 'Reveal your result and review any questions you missed.'],
  es: ['Elige una respuesta para cada una de las 10 preguntas.', 'Acierta al menos 8 para llegar al 80 %.', 'Consulta tu resultado y revisa las preguntas que fallaste.'],
  fr: ['Choisissez une réponse à chacune des 10 questions.', 'Répondez correctement à au moins 8 questions pour atteindre 80 %.', 'Consultez votre résultat et revoyez les questions manquées.'],
  hi: ['10 सवालों में से हर सवाल के लिए एक जवाब चुनें।', '80% तक पहुँचने के लिए कम से कम 8 सही जवाब दें।', 'अपना नतीजा देखें और जिन सवालों में गलती हुई, उन्हें दोबारा देखें।'],
  id: ['Pilih satu jawaban untuk masing-masing dari 10 pertanyaan.', 'Jawab minimal 8 dengan benar untuk mencapai 80%.', 'Lihat hasil Anda dan tinjau pertanyaan yang jawabannya keliru.'],
  it: ['Scegli una risposta per ognuna delle 10 domande.', 'Rispondi correttamente ad almeno 8 domande per raggiungere l’80%.', 'Scopri il tuo risultato e rivedi le domande che hai sbagliato.'],
  nl: ['Kies bij elk van de 10 vragen één antwoord.', 'Met minstens 8 goede antwoorden haal je 80%.', 'Bekijk je resultaat en neem de vragen door die je fout had.'],
  pt: ['Escolha uma resposta para cada uma das 10 perguntas.', 'Acerte pelo menos 8 para atingir 80%.', 'Veja o resultado e reveja as perguntas em que errou.'],
  th: ['เลือกคำตอบหนึ่งข้อสำหรับคำถามแต่ละข้อจากทั้งหมด 10 ข้อ', 'ตอบถูกอย่างน้อย 8 ข้อเพื่อให้ได้ 80%', 'ดูผลของคุณและทบทวนข้อที่ตอบผิด'],
};

export function reuseShortMemoryCopy(source, manifest, locale) {
  const ids = manifest.structure.stages[0].questionIds;
  const bank = Object.assign({}, ...Object.values(source.stages).map(stage => stage.questions));
  const stage = source.stages['stage-1'];
  const final = Object.values(source.career.stages).at(-1);
  const steps = memorySteps[locale];
  const disclaimer = source.about.disclaimer;
  return {
    ...source,
    about: {...source.about, body: `${source.summary}\n\n${steps.join(' ')}\n\n${disclaimer}`, howToPlay: {...source.about.howToPlay, steps}},
    landing: {cta: source.landing.cta},
    career: {...source.career, stages: {'stage-1': final}},
    stages: {'stage-1': {...stage, questions: Object.fromEntries(ids.map(id => {
      assert.ok(bank[id], `${locale}/${id}: missing source question`);
      return [id, bank[id]];
    }))}},
  };
}

// Rows are written in display answer order (A, B, C), never as a correct-first
// translation feed. The existing manifest owns correctness and stable IDs.
export function authoredShortMemoryCopy(locale, entry, manifest) {
  const ui = JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`, 'utf8'));
  const [title, topic, summary, disclaimer, choose, target, review] = split(entry.landing, 7, `${locale}: landing`);
  const [progress, resultName, ready, resultCopy, resultButton, checked, compared, calculated,
    world, science, words, passed, strongest, trickiest, best, overview, correct, missed,
    targetLabel, snapshot, reached, remaining, below] = split(entry.result, 23, `${locale}: results`);
  const headers = split(entry.headers, 8, `${locale}: question headers`);
  const steps = [choose, target, review];
  const [stage] = manifest.structure.stages;
  assert.equal(entry.questions.length, 10, locale);
  assert.equal(entry.profiles.length, 6, locale);
  const ranges = ['90–100%', '80–89%', '70–79%', '60–69%', '50–59%', below];
  return {
    title,
    eyebrow: topic,
    summary,
    about: {body: `${summary}\n\n${steps.join(' ')}\n\n${disclaimer}`, howToPlay: {steps}, disclaimer},
    landing: {cta: ui.quiz.start},
    career: {resultProgressLabel: progress, stages: {'stage-1': {
      difficulty: headers[7], preAdTitle: ready, preAdCopy: resultCopy,
      ...(resultButton === ui.quiz.revealMyResults ? {} : {preAdButton: resultButton}),
      preAdChecks: [checked, compared, calculated],
    }}},
    results: {
      name: resultName,
      profiles: Object.fromEntries(manifest.structure.results.profiles.map(({key}, i) => {
        const [title, copy] = split(entry.profiles[i], 2, `${locale}/${key}`);
        return [key, {tier: ranges[i], title, copy}];
      })),
      dimensions: Object.fromEntries([world, science, words].map((label, i) => [`dimension-${i + 1}`, {label}])),
      score: {passed, finished: resultName, strongest, trickiest, bestRound: best, disclaimer,
        insights: {overview, correct, missed, target: targetLabel, breakdown: resultName, snapshot,
          targetReached: reached, targetRemaining: remaining}},
    },
    stages: {'stage-1': {title: headers[1], questions: Object.fromEntries(stage.questionIds.map((id, i) => {
      const [question, ...answers] = split(entry.questions[i], 4, `${locale}/${id}`);
      const headerLabel = headers[[0, 1, 2, 3, 4, 2, 5, 6, 5, 7][i]];
      return [id, {question, headerLabel, answers: Object.fromEntries(manifest.structure.questions[id].answerIds.map((answerId, j) => [answerId, answers[j]]))}];
    }))}},
  };
}

export function memoryShortManifest(source) {
  const {localeExtensions, ...base} = source;
  const template = 'single-stage-rewarded-v1';
  const ids = localeExtensions?.en?.select ?? base.structure.stages[0].questionIds;
  assert.equal(ids.length, 10);
  return {...base, activeLocales: read('years-left', 'quiz').activeLocales, template, structure: {
    ...base.structure,
    stages: [{id: 'stage-1', difficultyLevel: 'final', questionIds: ids}],
    questions: Object.fromEntries(ids.map(id => [id, base.structure.questions[id]])),
  }};
}
