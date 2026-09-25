// Topic banks are shared only when the same principle belongs in both subjects.
// Every assembled quiz still contains seventy distinct prompts.
export const remainingSlugs = ['airforce', 'barrister', 'dentist', 'doctor', 'firefighter', 'flightattendant', 'italian', 'medical', 'motorbike', 'nun', 'pilot', 'police', 'socialworker', 'surgeon', 'teacher', 'train'];
export const references = {
  flight: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak',
  anatomy: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction',
  dental: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/23-3-the-mouth-pharynx-and-esophagus',
  microbiology: 'https://openstax.org/books/microbiology/pages/1-introduction',
  surgery: 'https://www.who.int/teams/integrated-health-services/patient-safety/research/safe-surgery',
  fire: 'https://www.usfa.fema.gov/prevention/home-fires/learn-about-fire/',
  religious: 'https://www.vatican.va/archive/ENG1104/__P1Y.HTM',
  catechism: 'https://www.vatican.va/content/catechism/en.html',
  rights: 'https://www.ohchr.org/en/instruments-mechanisms/instruments/code-conduct-law-enforcement-officials',
};
export function quiz(subject, rows, sources = {}, note = '') {
  return {
    summary: `Explore ${subject} through clues, practical situations and fresh challenges.`,
    about: `Connect the facts, notice the details and test your understanding of ${subject}. Each checkpoint reveals your topic profile before a different challenge begins.`,
    note: `An independent knowledge challenge, not an official entrance examination or professional qualification. ${note}`,
    sources: {...references, ...sources},
    rounds: rows.map(([title, category, questions, teaser], i) => ({
      title, category, questions,
      checkpoint: ['A strong start', 'The details matter', 'Connections made', 'A new perspective', 'Your knowledge in action', 'Another side revealed', 'The picture grows', 'Sharper connections', 'Ready for the final challenge', 'Your result is ready'][i],
      feedback: `${title}: {profile}.`,
      teaser: teaser ?? `Up next: ${rows[i + 1]?.[0] ?? 'Your result'}.`,
    })),
  };
}
export const sourceBank = (source, rows) => rows.map(row => [...row.slice(0, 5), source, ...row.slice(6)]);
export const calculation = [
  ['A supply box holds 24 items. Six are used. What fraction remains?', 'Three quarters', 'One quarter', 'One half', 'One third'],
  ['A task begins at 14:35 and lasts 50 minutes. When does it finish?', '15:25', '15:15', '15:35', '14:85'],
  ['Four equal groups share 36 items. How many items are in each group?', '9', '6', '8', '12'],
  ['A reading rises from 40 to 50. What is the percentage increase?', '25%', '10%', '20%', '50%'],
  ['A plan uses a scale of 1 cm to 2 m. What distance does 6 cm represent?', '12 m', '3 m', '8 m', '60 m'],
  ['Three loads weigh 12 kg, 15 kg and 18 kg. What is their total mass?', '45 kg', '35 kg', '42 kg', '48 kg'],
  ['A checklist has 20 items. Four remain unchecked. What percentage is complete?', '80%', '20%', '75%', '90%'],
];
export const evidence = [
  ['Two people give different times for the same event. What is the best next step?', 'Check each account against other reliable information', 'Choose the more confident speaker automatically', 'Average the times and call that a fact', 'Delete both accounts without checking'],
  ['Which statement records an observation rather than an assumption about motive?', 'The person left the room at 14:10', 'The person left because they were guilty', 'The person intended to mislead everyone', 'The person never cared about the meeting'],
  ['A photograph has no known date or location. What should be checked before relying on it?', 'Its origin and context', 'Whether its colours are attractive', 'How many people like it', 'Whether it matches a preferred conclusion'],
  ['A claim is repeated by three websites, all quoting one unnamed source. What does that show?', 'Repeated reporting, not three independent confirmations', 'Three independent eyewitnesses', 'Proof that the claim is accurate', 'Proof that no further checking is needed'],
  ['All authorised visitors have a pass. Mira has a pass. What follows from that rule alone?', 'It does not prove Mira is an authorised visitor', 'Mira must be an authorised visitor', 'Mira cannot be an authorised visitor', 'No authorised visitors have passes'],
  ['A new reliable fact contradicts your initial explanation. What is the sound response?', 'Reconsider the explanation', 'Hide the new fact', 'Change the fact to fit the explanation', 'Treat your first idea as unchangeable'],
  ['A report says an event happened after a change. Does that timing alone prove the change caused it?', 'No; other explanations may exist', 'Yes; sequence always proves cause', 'Yes; if the report is long enough', 'No; earlier events can never cause later ones'],
];
