// Locale-only additions keep the shared question bank and other editions intact.
export function resolveQuizLocaleManifest(manifest, locale) {
  const extension = manifest.localeExtensions?.[locale];
  const { localeExtensions, ...base } = manifest;
  if (!extension) return base;
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
