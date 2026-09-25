export const sources = {
  anatomy: 'https://training.seer.cancer.gov/anatomy/',
  hand: 'https://www.who.int/news/item/05-05-2025-gloves-do-not-replace-hand-hygiene---reminder-from-who',
  precautions: 'https://www.cdc.gov/infection-control/hcp/core-practices/index.html',
  rights: 'https://www.who.int/publications/i/item/9789240093249',
  emergency: 'https://www.who.int/publications/i/item/basic-emergency-care-approach-to-the-acutely-ill-and-injured',
  pregnancy: 'https://www.nichd.nih.gov/health/topics/pregnancy/conditioninfo',
  maternal: 'https://www.cdc.gov/hearher/maternal-warning-signs/index.html',
  birth: 'https://www.nichd.nih.gov/health/topics/labor-delivery/topicinfo/stages',
  newborn: 'https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/newborn-health/essential-newborn-care',
  feeding: 'https://www.who.int/health-topics/breastfeeding',
  newbornSigns: 'https://www.who.int/tools/your-life-your-health/life-phase/newborns-and-children-under-5-years/caring-for-newborns',
  sleep: 'https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment',
  oximeter: 'https://www.fda.gov/medical-devices/products-and-medical-procedures/pulse-oximeters',
};

export const body = [
  ['Which gas does blood pick up in the lungs?', 'Oxygen', 'Nitrogen alone', 'Helium', 'Hydrogen', 'anatomy'],
  ['Which organs remove wastes from blood and help regulate water balance?', 'Kidneys', 'Lungs', 'Salivary glands', 'Tonsils', 'anatomy'],
  ['Which system carries rapid signals between the brain and the body?', 'Nervous system', 'Digestive system', 'Skeletal system', 'Urinary system', 'anatomy'],
  ['Where are most digested nutrients absorbed?', 'Small intestine', 'Stomach', 'Gallbladder', 'Mouth', 'anatomy'],
  ['Which blood cells carry most of the oxygen in blood?', 'Red blood cells', 'White blood cells', 'Platelets', 'Bone cells', 'anatomy'],
  ['Which major muscle helps draw air into the lungs?', 'Diaphragm', 'Biceps', 'Masseter', 'Deltoid', 'anatomy'],
  ['Which heart chamber receives blood returning from the lungs?', 'Left atrium', 'Right atrium', 'Right ventricle', 'Left ventricle', 'anatomy'],
];

export const infection = [
  ['Hands are visibly dirty. Which cleaning method is appropriate?', 'Wash with soap and water', 'Wipe on clothing', 'Put gloves on over the dirt', 'Rinse the gloves only', 'precautions'],
  ['What should happen after protective gloves are removed?', 'Perform hand hygiene', 'Touch clean equipment first', 'Keep the gloves for another person', 'Clean hands only if a glove tore', 'hand'],
  ['Which container is designed for used needles and other sharps?', 'An approved puncture-resistant sharps container', 'An ordinary waste bag', 'A cardboard tissue box', 'An open tray for later sorting', 'precautions'],
  ['A task may splash body fluid toward the face. Which protection addresses that risk?', 'Appropriate eye or face protection', 'Shoe covers alone', 'An apron alone', 'A cloth hat alone', 'precautions'],
  ['Shared observation equipment has been used. What should happen before reuse?', 'Clean it using the approved method', 'Cover old marks with a label', 'Use it unchanged if it looks shiny', 'Clean only its storage shelf', 'precautions'],
  ['A sterile package is torn before use. What is the safe conclusion?', 'Its sterility cannot be assumed', 'The contents are sterile if they look clean', 'Tape restores sterility', 'The printed date cancels the tear', 'precautions'],
  ['Which statement about protective gloves is correct?', 'They do not replace hand hygiene', 'They make hand cleaning unnecessary', 'The same pair is suitable for every patient', 'They stay clean regardless of what they touch', 'hand'],
];

export const communication = [
  ['A person says, “I’m worried about what happens next.” What is the best opening?', 'Acknowledge the worry and invite questions', 'Promise there is no possible risk', 'Change the subject immediately', 'Begin with unexplained technical terms', 'rights'],
  ['Someone wants to discuss a sensitive concern in a busy public area. What protects privacy?', 'Offer an appropriate private setting', 'Ask nearby people to listen', 'Repeat the details more loudly', 'Write the details on a public board', 'rights'],
  ['A person has not understood an explanation. What helps check understanding?', 'Explain plainly and ask them to describe it in their own words', 'Repeat the same jargon louder', 'Treat a nod as proof of understanding', 'Ask another patient to answer for them', 'rights'],
  ['Before a non-urgent examination, what should the person receive?', 'A clear explanation and an opportunity to consent', 'Only a form with no explanation', 'An assurance that questions are not allowed', 'A decision made by the nearest visitor', 'rights'],
  ['A person declines having students present. What is the respectful response?', 'Respect the choice and protect privacy', 'Continue because students want experience', 'Ask the students to decide', 'Assume silence later cancels the choice', 'rights'],
  ['A language barrier makes an important discussion difficult. What is the best support?', 'An appropriate qualified interpreter', 'Unexplained medical abbreviations', 'Guessing from facial expressions alone', 'Asking a young child to interpret sensitive details', 'rights'],
  ['A person with hearing difficulty asks you to repeat yourself. What is helpful?', 'Face them and check their preferred way to communicate', 'Speak while facing away', 'Cover your mouth and rush', 'Assume they cannot make decisions', 'rights'],
];

export const records = [
  ['A note says “left arm” but the handover says “right arm”. What needs clarification?', 'The side being described', 'The number of words', 'The font size', 'The page colour'],
  ['A measurement is written as “12” with no unit. What is missing?', 'The unit needed to interpret the value', 'A decorative heading', 'The patient’s favourite colour', 'An additional unrelated number'],
  ['Which record clearly separates a reported symptom from an observation?', '“Reports dizziness; observed to look pale”', '“Definitely has a diagnosis I have not assessed”', '“Probably exaggerating”', '“Nothing happened because the chart is blank”'],
  ['Why include the time beside a new observation?', 'To place it in the sequence of events', 'To prove the cause by itself', 'To replace the measured value', 'To make later changes irrelevant'],
  ['A chart has no entry for a scheduled measurement. What can you conclude?', 'The value is not recorded', 'The value was definitely normal', 'The value was definitely zero', 'The person refused every assessment'],
  ['Which entry records what happened most clearly?', '“At 10:20, breathing became faster”', '“Something seemed different sometime”', '“A few things perhaps changed”', '“Probably the usual issue”'],
  ['Why compare current observations with earlier ones?', 'To identify changes and trends', 'To avoid looking at the person', 'To make every number match', 'To prove a diagnosis from any difference'],
];

export function numbers(offset = 0) {
  const a = 600 + offset * 50, b = 250;
  return [
    [`A record shows ${a} mL plus ${b} mL. What is the total?`, `${a + b} mL`, `${a - b} mL`, `${a + b + 100} mL`, `${a + b - 100} mL`, undefined, undefined, `${a} + ${b} = ${a + b} mL.`],
    ['How many millilitres are in 1.5 L?', '1,500 mL', '150 mL', '15 mL', '15,000 mL', undefined, undefined, '1 L = 1,000 mL; 1.5 × 1,000 = 1,500.'],
    ['How much time passes from 09:20 to 10:05?', '45 minutes', '35 minutes', '55 minutes', '85 minutes', undefined, undefined, '40 minutes to 10:00, then 5 more.'],
    ['You count 9 breaths in 30 seconds. What is the equivalent rate per minute?', '18 breaths per minute', '9 breaths per minute', '27 breaths per minute', '30 breaths per minute', undefined, undefined, '9 × 2 = 18. This is arithmetic, not a diagnosis.'],
    ['A recorded total rises from 600 mL to 900 mL. What is the percentage increase?', '50%', '25%', '30%', '150%', undefined, undefined, '(900 − 600) ÷ 600 × 100 = 50%.'],
    ['Divide 1.2 L equally across four recorded periods. How much belongs to each?', '300 mL', '200 mL', '400 mL', '600 mL', undefined, undefined, '1,200 ÷ 4 = 300 mL.'],
    ['Three sealed boxes hold eight items each. How many items are there?', '24', '11', '16', '32', undefined, undefined, '3 × 8 = 24.'],
  ];
}

export const observation = [
  ['A pulse changes from 72 to 88 beats per minute. What does the record show?', 'An increase of 16 beats per minute', 'A decrease of 16 beats per minute', 'No change', 'An increase of 8 beats per minute'],
  ['Earlier, a person spoke comfortably. Now they pause between short phrases to breathe. What changed?', 'Breathing appears more difficult', 'Their breathing is certainly unchanged', 'The record proves a specific diagnosis', 'Speaking briefly rules out concern', 'emergency'],
  ['Which observation describes a new change in alertness?', 'Previously alert, now newly confused', 'The same name appears twice', 'The chart has a new page', 'The room lights were switched on', 'emergency'],
  ['Which description records a breathing rate?', '18 breaths per minute', '18 kilograms', '18 millilitres', '18 centimetres'],
  ['What does a pulse oximeter estimate?', 'Blood oxygen saturation', 'Blood glucose concentration', 'Bone density', 'Urine volume', 'oximeter'],
  ['Why should a reassuring device reading not replace assessment of new symptoms?', 'Measurements have limitations and need context', 'Every device always gives random values', 'Symptoms never add information', 'One number proves all body systems are healthy', 'oximeter'],
  ['Which change calls for prompt qualified assessment?', 'New breathing difficulty with reduced alertness', 'An unchanged routine appointment time', 'A different pen used for notes', 'A newly printed information leaflet', 'emergency'],
];

export function makeRound(title, category, checkpoint, feedback, teaser, questions) {
  return { title, category, checkpoint, feedback, teaser, questions };
}

export const healthNote = 'These are entrance-style entertainment questions, not accredited examinations or clinical protocols. No medication doses, national emergency numbers or country-specific scope-of-practice rules are tested. Arithmetic examples describe records and supplies rather than treatment orders.';
