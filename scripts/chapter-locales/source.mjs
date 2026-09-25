// These adaptations retain the English answer IDs and correct-answer positions.
// They replace English-only compound words with equivalent relationship tasks.
export function adaptSource(slug, input, manifest, locale) {
  const copy = structuredClone(input);
  const questions = Object.assign({}, ...Object.values(copy.stages).map(stage => stage.questions));
  const replace = (id, prompt, correct, wrong) => {
    const question = questions[id], logic = manifest.structure.questions[id];
    question.question = prompt;
    let i = 0;
    question.answers = Object.fromEntries(logic.answerIds.map(key => [key, key === logic.correctAnswerId ? correct : wrong[i++]]));
  };
  if (slug === 'iq') {
    replace('iq-s3q4', 'A book is read. Music is…', 'Listened to', ['Weighed', 'Folded', 'Watered']);
    replace('iq-s3q5', 'A knife is used for cutting. A pen is used for…', 'Writing', ['Cooking', 'Measuring temperature', 'Locking a door']);
    questions['iq-s3q6'].question = 'Bird → flock means an animal and a group of that animal. Which pair has the same relationship?';
    for (const [id, prompt] of Object.entries({
      'iq-s6q3': 'Read the digits from left to right. Compare 847196 with 847916. Which two positions have been exchanged?',
      'iq-s6q7': 'Read the code CANDLE from left to right. Swap only the first and last letters. What is the new code?',
      'iq-s9q3': 'Use this alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ. Move the first letter forward and the second backward by one: AZ, BY, CX. What comes next?',
      'iq-s9q7': 'Use this alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ. Move forward by 2, then 3, then 4, then 5 letters: A, C, F, J. What comes next?',
      'iq-s10q2': 'Use this alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ. In the code DOG, move the letters forward by 1, 2 and 1 places respectively. What is the new code?',
      'iq-s10q6': 'Read the code LAMP from left to right. Reverse its letters, then replace A with 4. What is the new code?',
    })) questions[id].question = prompt;
  }
  if (slug === 'memory' && locale === 'pt') {
    // The recall task depends on the numbers, departure and tag colour, never
    // on the vehicle being a train. "Veículo" avoids comboio/trem regionalism.
    // Use an airplane instead of the kite: "avião" is natural on both sides
    // of the Atlantic and avoids teaching a regional object name mid-test.
    function adapt(value) {
      if (typeof value === 'string') return value.replace(/\btrain\b/g, 'vehicle').replace(/\bTRAIN\b/g, 'VEHICLE').replace(/\bTrain\b/g, 'Vehicle')
        .replace(/\bkite\b/g, 'airplane').replace(/\bKITE\b/g, 'AIRPLANE').replace(/\bKite\b/g, 'Airplane');
      if (Array.isArray(value)) return value.map(adapt);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, adapt(item)]));
      return value;
    }
    copy.stages = adapt(copy.stages);
  }
  return copy;
}

// Context disambiguates short answer labels for the draft translator. The source
// key remains unchanged so a later reviewed dictionary can replace the draft.
const context = {
  'Mass': 'The Catholic Mass', 'Vespers': 'Evening prayer (Vespers)',
  'Acts': 'Acts of the Apostles', 'Numbers': 'The Book of Numbers',
  'Job': 'Job (the biblical person)', 'Mark': 'Mark (the evangelist)',
  'James': 'James (the biblical person)', 'John': 'John (the biblical person)',
  'Whisk': 'Kitchen whisk', 'Tongs': 'Kitchen tongs', 'Stock': 'Cooking stock',
  'Pitch': 'Musical pitch', 'School': 'A group of fish',
  'Fish → school': 'Fish → a group of fish', 'Bird → flock': 'Bird → a flock of birds',
  'Checks': 'Checkered pattern', 'Plain key': 'Key without a pattern',
  'Window': 'Seat beside the window', 'Aisle': 'Seat beside the aisle',
  'Front': 'Seat at the front', 'Back': 'Seat at the back',
  'Bar': 'Metal bar', 'Lead': 'The metal lead', 'Charge': 'Electrical charge',
};
export function contextualSource(slug, value, path) {
  // The same short answer can belong to unrelated subjects.
  if (value === 'Mass' && !['catholic', 'bible'].includes(slug)) return 'Mass (physical quantity)';
  if (path.includes('answers') && context[value]) return context[value];
  return value.replace(/\bbreakdown\b/gi, 'detailed results').replace(/\bin \{profile\} territory\b/g, 'in the category {profile}');
}
