// Answers come from the stated premises, not regional admissions knowledge.
export const q = (prompt, answer, b, c, d, reason, category) => [prompt, answer, b, c, d, undefined, category, reason];

export function universityPack(slug, summary, topics) {
  const name = slug[0].toUpperCase() + slug.slice(1);
  return {
    slug, summary,
    about: `${summary}\n\nUse the facts, rules and quantities in each question. No specialist university knowledge is required, and there is no speed score. Each checkpoint reflects the topic just completed. The final result combines your answers, with an optional review of the questions you missed.\n\nThis independent entertainment challenge is inspired by academic reasoning. It is not an official ${name} admissions test, an assessment of academic potential or a prediction of admission.`,
    note: 'All questions are authored and self-contained. Institutions, rules, rates and scenarios in the questions are hypothetical. The answer key explains each calculation or deduction. Currency examples use stated credits; times and measurements specify their units.',
    rounds: topics.map(([title, category, checkpoint, teaser, questions]) => ({
      title, category, checkpoint, teaser, questions,
      feedback: `This topic: {profile}.`,
    })),
  };
}
