import assert from 'node:assert/strict';

const entryLabels = {
  iq: {
    en: 'Intelligence Test', ar: 'اختبار الذكاء', de: 'Intelligenztest', es: 'Test de inteligencia',
    fr: 'Test d’intelligence', it: 'Test di intelligenza', nl: 'Intelligentietest', pt: 'Teste de inteligência',
  },
  memory: {
    en: 'Memory Test', ar: 'اختبار الذاكرة', de: 'Gedächtnistest', es: 'Test de memoria',
    fr: 'Test de mémoire', it: 'Test di memoria', nl: 'Geheugentest', pt: 'Teste de memória',
  },
  vision: {
    en: 'Vision Test', ar: 'اختبار بصري', de: 'Visueller Test', es: 'Test visual',
    fr: 'Test visuel', it: 'Test visivo', nl: 'Visuele test', pt: 'Teste visual',
  },
  nursing: {
    en: 'Nursing Test', ar: 'اختبار التمريض', de: 'Pflegewissen-Test', es: 'Test de enfermería',
    fr: 'Test de soins infirmiers', it: 'Test di infermieristica', nl: 'Verpleegkundetest', pt: 'Teste de enfermagem',
  },
  midwifery: {
    en: 'Midwifery Test', ar: 'اختبار القبالة', de: 'Hebammenwissen-Test', es: 'Test de obstetricia',
    fr: 'Test de maïeutique', it: 'Test di ostetricia', nl: 'Verloskundetest', pt: 'Teste de obstetrícia',
  },
};

export function applyEntryLabel(manifest, copies) {
  const stage = manifest.structure.stages[0];
  const id = stage.questionIds[0];
  for (const [locale, copy] of Object.entries(copies)) {
    const label = entryLabels[manifest.slug]?.[locale];
    assert.ok(label, `${manifest.slug}/${locale}: missing first-question label`);
    copy.stages[stage.id].questions[id].headerLabel = label;
  }
  manifest.engine.entry = 'first-answer';
}

// Preserve answer IDs and reading order, removing only a distractor. Keep the
// correct positions balanced without relabelling reviewed translations.
export function choicePlan(questions) {
  for (const question of questions) {
    assert.ok([3, 4].includes(question.answerIds.length));
    assert.equal(new Set(question.answerIds).size, question.answerIds.length);
    assert.ok(question.answerIds.includes(question.correctAnswerId));
  }
  const failed = new Set();
  function visit(index, remaining) {
    if (index === questions.length) return remaining.every(count => count === 0) ? [] : undefined;
    const key = `${index}:${remaining.join(',')}`;
    if (failed.has(key)) return undefined;
    const q = questions[index];
    const options = q.answerIds.length === 3 ? [q.answerIds] : q.answerIds
      .filter(id => id !== q.correctAnswerId).reverse()
      .map(removed => q.answerIds.filter(id => id !== removed));
    options.sort((a, b) => remaining[b.indexOf(q.correctAnswerId)] - remaining[a.indexOf(q.correctAnswerId)]);
    for (const ids of options) {
      const position = ids.indexOf(q.correctAnswerId);
      if (remaining[position] <= 0) continue;
      const next = [...remaining];
      next[position]--;
      const rest = visit(index + 1, next);
      if (rest) return [ids, ...rest];
    }
    failed.add(key);
  }
  const count = questions.length;
  const plan = visit(0, [0, 1, 2].map(i => Math.floor(count / 3) + (i < count % 3 ? 1 : 0)));
  assert.ok(plan, 'Correct answers must stay balanced across three choices');
  return plan;
}

export function applyTextThreeChoices(manifest, copies) {
  assert.equal(manifest.engine.scoring, 'correct-answer');
  const ids = manifest.structure.stages.flatMap(stage => stage.questionIds);
  const questions = ids.map(id => manifest.structure.questions[id]);
  assert.ok(questions.every(q => (q.presentation ?? 'text') === 'text' && !q.image && !q.visual
    && (!q.study || (q.study.mode === 'manual' && q.study.rewarded === false))), 'Only text choices and separate, self-paced study cues are supported');
  // Study items are never choices to trim: later questions may recall them.
  const plan = choicePlan(questions);
  for (const [index, id] of ids.entries()) {
    const logic = manifest.structure.questions[id];
    logic.answerIds = plan[index];
    for (const copy of Object.values(copies)) {
      const words = Object.values(copy.stages).map(stage => stage.questions[id]).find(Boolean);
      assert.ok(words, `Missing ${id}`);
      words.answers = Object.fromEntries(logic.answerIds.map(answerId => {
        assert.ok(words.answers[answerId]?.trim(), `${id}/${answerId}: missing translation`);
        return [answerId, words.answers[answerId]];
      }));
    }
  }
  applyEntryLabel(manifest, copies);
}
