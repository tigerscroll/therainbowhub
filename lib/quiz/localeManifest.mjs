// Locale-only additions or short editions leave the shared bank intact.
export function resolveQuizLocaleManifest(manifest, locale) {
  const extension = manifest.localeExtensions?.[locale];
  const { localeExtensions, ...base } = manifest;
  if (!extension) return base;
  if (extension.select !== undefined) {
    const ids = extension.select;
    if (extension.template !== 'single-stage-rewarded-v1'
      || Object.keys(extension).some(key => key !== 'template' && key !== 'select')
      || !Array.isArray(ids) || ids.length !== 10 || new Set(ids).size !== ids.length
      || !ids.every(id => typeof id === 'string' && Object.hasOwn(base.structure.questions, id))) {
      throw Error(`Invalid single-round quiz selection: ${locale}`);
    }
    const stages = [{ ...base.structure.stages[0], difficultyLevel: 'final', questionIds: ids }];
    const questions = Object.fromEntries(ids.map(id => [id, base.structure.questions[id]]));
    return { ...base, template: extension.template, structure: { ...base.structure, stages, questions } };
  }
  if (!extension.template || !extension.stageQuestionIds || !extension.questions) throw Error(`Invalid quiz extension: ${locale}`);
  const stages = base.structure.stages.map(stage => {
    const ids = extension.stageQuestionIds[stage.id];
    if (!Array.isArray(ids) || new Set(ids).size !== ids.length) throw Error(`Invalid extension stage: ${locale}/${stage.id}`);
    const originals = ids.filter(id => stage.questionIds.includes(id));
    if (JSON.stringify(originals) !== JSON.stringify(stage.questionIds)) throw Error(`Extension must retain original questions: ${locale}/${stage.id}`);
    return { ...stage, questionIds: ids };
  });
  if (Object.keys(extension.stageQuestionIds).length !== stages.length) throw Error(`Unknown extension stage: ${locale}`);
  for (const id of Object.keys(extension.questions)) {
    if (base.structure.questions[id]) throw Error(`Extension cannot replace shared question: ${id}`);
  }
  const questions = { ...base.structure.questions, ...extension.questions };
  const ids = stages.flatMap(stage => stage.questionIds);
  if (new Set(ids).size !== ids.length || JSON.stringify([...ids].sort()) !== JSON.stringify(Object.keys(questions).sort())) throw Error(`Extension question references differ: ${locale}`);
  return { ...base, template: extension.template, structure: { ...base.structure, stages, questions } };
}

// The long-form copy stays available for checking the other languages. Reuse
// the authored final checkpoint rather than carrying a "next round" prompt.
export function resolveQuizLocaleText(manifest, copy, locale) {
  const ids = manifest.localeExtensions?.[locale]?.select;
  if (ids === undefined) return copy;
  const [first] = manifest.structure.stages;
  const final = manifest.structure.stages.at(-1);
  const questions = Object.assign({}, ...Object.values(copy.stages).map(stage => stage.questions));
  return {
    ...copy,
    stages: {
      [first.id]: { ...copy.stages[first.id], questions: Object.fromEntries(ids.map(id => [id, questions[id]])) },
    },
    career: { ...copy.career, stages: { [first.id]: copy.career.stages[final.id] } },
  };
}
