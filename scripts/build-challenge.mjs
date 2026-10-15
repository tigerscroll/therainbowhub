import fs from "node:fs";
import path from "node:path";

const slug = "challenge";
const directory = path.join(process.cwd(), "data", "quizzes", slug);
const answerIds = ["a1", "a2", "a3", "a4"];
const levels = ["foundation", "foundation", "developing", "developing", "skilled", "skilled", "advanced", "advanced", "advanced", "final"];

const stages = [
  {
    id: "stage-1",
    title: "Quick Start",
    difficulty: "QUICK START",
    category: "quick",
    checkpoint: ["First round cleared", "Quick Start: {profile}. Now let’s see how closely you notice the details.", "Small details become surprisingly important."],
    questions: [
      ["Which planet is commonly known as the Red Planet?", ["Venus", "Mars", "Jupiter", "Mercury"], "a2"],
      ["How many sides does a triangle have?", ["3", "4", "5", "6"], "a1"],
      ["Which direction is opposite to north?", ["East", "West", "Up", "South"], "a4"],
      ["Which of these animals is a mammal?", ["Shark", "Trout", "Dolphin", "Octopus"], "a3"],
      ["What time is 15 minutes after 2:30?", ["2:45", "2:35", "3:15", "2:15"], "a1"],
      ["Which of these is frozen water?", ["Steam", "Rain", "Ice", "Cloud"], "a3"],
      ["How many days are in one week?", ["5", "6", "8", "7"], "a4"],
      ["Which letter comes immediately after Q?", ["P", "R", "S", "T"], "a2"],
    ],
  },
  {
    id: "stage-2",
    title: "Sharp Eyes",
    difficulty: "SHARP EYES",
    category: "observation",
    checkpoint: ["Your observation score is in", "Sharp Eyes: {profile}. Next, words start playing tricks.", "The obvious answer is not always the right word."],
    questions: [
      ["Which code exactly matches K7M2Q9?", ["K7N2Q9", "K7M2O9", "K7M2Q9", "K7M9Q2"], "a3"],
      ["How many times does the letter A appear in BANANA CABANA?", ["3", "4", "5", "6"], "a4"],
      ["Which pair shows the second code in the exact reverse order of the first?", ["ABCD / DABC", "ABCD / DCBA", "ABCD / CBDA", "ABCD / ABDC"], "a2"],
      ["Which row contains one symbol twice?", ["◆ ● ◆ ▲", "◆ ● ■ ▲", "○ ● ■ ▲", "◆ ○ ■ ▲"], "a1"],
      ["What comes next: ○ △ □ ○ △ ?", ["△", "□", "○", "◆"], "a2"],
      ["How many zeroes appear in 100200300?", ["6", "5", "4", "7"], "a1"],
      ["Which pair is written identically?", ["ROUND / R0UND", "SHARP / SHRAP", "LEVEL / LEVEL", "QUICK / QUIKC"], "a3"],
      ["What comes next: ▲ ▲ ● ▲ ▲ ● ?", ["●", "■", "○", "▲"], "a4"],
    ],
  },
  {
    id: "stage-3",
    title: "Word Power",
    difficulty: "WORD POWER",
    category: "words",
    checkpoint: ["Your word instincts have spoken", "Word Power: {profile}. Now the numbers take over.", "The next round starts simple, then changes pace."],
    questions: [
      ["Book is to reading as fork is to…", ["Drawing", "Washing", "Building", "Eating"], "a4"],
      ["Which word is the odd one out?", ["Whisper", "Shout", "Murmur", "Mumble"], "a2"],
      ["Complete the saying: A stitch in time saves…", ["Nine", "Thread", "Trouble", "Hours"], "a1"],
      ["Which word is closest in meaning to brief?", ["Loud", "Ancient", "Short", "Soft"], "a3"],
      ["Which word can be made from LISTEN and means ‘making no sound’?", ["Tinsel", "Inlets", "Silent", "Enlist"], "a3"],
      ["Which word means the opposite of scarce?", ["Tiny", "Abundant", "Empty", "Narrow"], "a2"],
      ["Which single word can follow both rain and snow?", ["Fall", "Drop", "Cloud", "Storm"], "a1"],
      ["Puppy is to dog as kitten is to…", ["Rabbit", "Horse", "Bird", "Cat"], "a4"],
    ],
  },
  {
    id: "stage-4",
    title: "Number Instinct",
    difficulty: "NUMBER INSTINCT",
    category: "numbers",
    checkpoint: ["The numbers are settled", "Number Instinct: {profile}. Next, your memory gets something to protect.", "Lock in the details. They will matter again later."],
    questions: [
      ["What comes next: 3, 6, 9, 12, ?", ["15", "14", "16", "18"], "a1"],
      ["A box holds 4 rows of 6 balls. How many balls are there?", ["18", "20", "24", "26"], "a3"],
      ["What comes next: 2, 4, 8, 16, ?", ["20", "24", "30", "32"], "a4"],
      ["What is half of 90?", ["40", "45", "50", "55"], "a2"],
      ["Five machines make five items in five minutes. At the same rate, how many items do ten machines make in five minutes?", ["5", "15", "20", "10"], "a4"],
      ["What is 18 + 27?", ["35", "40", "45", "55"], "a3"],
      ["What is 144 divided by 12?", ["10", "12", "14", "16"], "a2"],
      ["What is 10% of 250?", ["25", "20", "15", "50"], "a1"],
    ],
  },
  {
    id: "stage-5",
    title: "Memory Lock",
    difficulty: "MEMORY LOCK",
    category: "memory",
    checkpoint: ["Your first memory reading is ready", "Memory Lock: {profile}. Keep those details safe while common sense takes the wheel.", "Everyday situations can be trickier than they look."],
    questions: [
      ["What colour was the door?", ["Green", "Blue", "Yellow", "Black"], "a2", {
        title: "Lock in these four details",
        instruction: "Take as long as you need. Some details will return much later.",
        continueLabel: "I’m Ready",
        items: ["RUBY BICYCLE", "BLUE DOOR", "7 STARS", "MIA · ORANGE UMBRELLA"],
      }],
      ["Which object was ruby?", ["Bicycle", "Door", "Umbrella", "Star"], "a1"],
      ["How many stars appeared on the board?", ["5", "6", "7", "8"], "a3"],
      ["Who had the umbrella?", ["Lena", "Noah", "Omar", "Mia"], "a4"],
      ["What colour was the umbrella?", ["Orange", "Purple", "Blue", "Red"], "a1"],
      ["Which detail did NOT appear on the board?", ["Blue door", "7 stars", "Ruby bicycle", "Green boat"], "a4"],
      ["Which two colours appeared on the board?", ["Green and black", "Purple and yellow", "Ruby and blue", "Silver and red"], "a3"],
      ["Which person was named on the board?", ["Noah", "Mia", "Lena", "Omar"], "a2"],
    ],
  },
  {
    id: "stage-6",
    title: "Common Sense",
    difficulty: "COMMON SENSE",
    category: "judgement",
    checkpoint: ["Your practical thinking is showing", "Common Sense: {profile}. Now other people enter the picture.", "What you notice in a conversation can change everything."],
    questions: [
      ["Two appointments are 30 minutes apart, but travelling between them takes 45 minutes. What follows?", ["The second starts earlier", "The journey becomes shorter", "Both can still begin on time", "Both cannot be reached on time"], "a4"],
      ["Your phone is nearly out of power and you will need directions later. What is the most useful move?", ["Increase the screen brightness", "Play a video now", "Charge it or save the route while you can", "Keep every app open"], "a3"],
      ["A recipe serves 4 people, but you need to serve 8. What should happen to the quantities?", ["Halve them", "Double them", "Add one quarter", "Leave them unchanged"], "a2"],
      ["A parcel is clearly marked FRAGILE. What is the sensible way to handle it?", ["Carry it carefully and keep it secure", "Shake it to check the contents", "Place heavy boxes on top", "Remove the label"], "a1"],
      ["You accidentally damage something you borrowed. What is the fairest response?", ["Return it without mentioning it", "Tell the owner promptly and offer to put it right", "Wait to see whether they notice", "Say it was already damaged"], "a2"],
      ["Three tasks are waiting, but one has a much earlier deadline. What is the clearest place to start?", ["The task due soonest", "The easiest-looking task", "A completely new task", "Whichever task has the longest title"], "a1"],
      ["You realise your bus is travelling in the wrong direction. What is the sensible response?", ["Stay on until the final stop", "Pretend not to notice", "Open every map at once", "Check the route and leave at the next safe stop"], "a4"],
      ["Four friends agree to split one shared cost equally. What calculation is needed?", ["Multiply the total by four", "Add four to the total", "Divide the total by four", "Subtract four from the total"], "a3"],
    ],
  },
  {
    id: "stage-7",
    title: "People Reader",
    difficulty: "PEOPLE READER",
    category: "social",
    checkpoint: ["Your people-reading pattern is in", "People Reader: {profile}. Next come patterns with rules of their own.", "Follow the rule, not the answer you expected."],
    questions: [
      ["A friend says, ‘I do not need advice; I just need to talk.’ What best matches that request?", ["Change the subject", "List possible solutions", "Listen and let them finish", "Tell them what you would do"], "a3"],
      ["Someone is quiet during a group conversation. What is the most inclusive response?", ["Speak for them", "Ask why they are so quiet", "Ignore them completely", "Invite them in without putting them under pressure"], "a4"],
      ["A message you wrote could sound harsher than you intended. What should you do before sending it?", ["Reread it and add the missing context", "Send it quickly", "Write it in capital letters", "Remove every greeting"], "a1"],
      ["A teammate takes credit for work you helped complete. What is the clearest first response?", ["Complain publicly", "Speak to them privately and describe the specific contribution", "Delete the work", "Take credit for their next task"], "a2"],
      ["A friend cancels because they have had an exhausting week. What response gives them the least pressure?", ["Insist they come anyway", "Stop speaking to them", "Ask them to prove they are tired", "Wish them well and suggest another time"], "a4"],
      ["Someone asks you not to share their personal news. What best respects that request?", ["Tell everyone except one person", "Keep it private", "Post a vague hint", "Ask others whether they already know"], "a2"],
      ["A short message creates a misunderstanding. What is the clearest next move?", ["Ask a calm, specific question", "Send the same message again", "Make the message more vague", "Stop reading replies"], "a1"],
      ["A newcomer looks unsure about the next step. What is the most helpful response?", ["Wait for someone else to help", "Give every instruction at once", "Take over without speaking", "Explain the next step and check they understand"], "a4"],
    ],
  },
  {
    id: "stage-8",
    title: "Pattern Breaker",
    difficulty: "PATTERN BREAKER",
    category: "pattern",
    checkpoint: ["Your pattern score is locked", "Pattern Breaker: {profile}. Now see what survived in your memory.", "The board from earlier is coming back."],
    questions: [
      ["What comes next: A, C, E, G, ?", ["H", "I", "J", "K"], "a2"],
      ["What comes next: 1, 1, 2, 3, 5, ?", ["6", "7", "8", "10"], "a3"],
      ["What comes next: square, triangle, square, triangle, ?", ["Triangle", "Circle", "Diamond", "Square"], "a4"],
      ["All Zibs are Loms. All Loms are Nars. Which statement must be true?", ["All Zibs are Nars", "All Nars are Zibs", "No Loms are Nars", "Some Zibs are not Loms"], "a1"],
      ["What comes next: 4, 9, 16, 25, ?", ["30", "32", "36", "49"], "a3"],
      ["What comes next: Z, X, V, T, ?", ["S", "Q", "R", "P"], "a3"],
      ["What comes next: 64, 32, 16, 8, ?", ["6", "4", "2", "1"], "a2"],
      ["What comes next: small, medium, large, small, medium, ?", ["Large", "Small", "Medium", "Extra large"], "a1"],
    ],
  },
  {
    id: "stage-9",
    title: "Memory Return",
    difficulty: "MEMORY RETURN",
    category: "recall",
    checkpoint: ["Your delayed memory result is in", "Memory Return: {profile}. One final mix will decide the overall result.", "Every skill returns for the last five questions."],
    questions: [
      ["What colour was the bicycle on the earlier memory board?", ["Ruby", "Silver", "Blue", "Orange"], "a1"],
      ["Which colour was paired with the door?", ["Ruby", "Orange", "Green", "Blue"], "a4"],
      ["Which number appeared with the stars?", ["5", "7", "8", "9"], "a2"],
      ["Which object belonged to Mia?", ["Bicycle", "Door", "Umbrella", "Star"], "a3"],
      ["Which detail did NOT appear on the memory board?", ["Ruby bicycle", "Silver key", "Blue door", "7 stars"], "a2"],
      ["Which word appeared directly before BICYCLE?", ["Blue", "Orange", "Silver", "Ruby"], "a4"],
      ["Which detail contained a person’s name?", ["Ruby bicycle", "Blue door", "Orange umbrella", "7 stars"], "a3"],
      ["Which pairing exactly matches the earlier board?", ["Mia · blue door", "Mia · orange umbrella", "Mia · ruby bicycle", "Mia · 7 stars"], "a2"],
    ],
  },
  {
    id: "stage-10",
    title: "Final Challenge",
    difficulty: "FINAL CHALLENGE",
    category: "final",
    checkpoint: ["Your final result is ready", "All ten rounds are complete. Your score, strongest skill and overall challenge profile are ready.", null],
    questions: [
      ["If CAT becomes DBU by moving every letter forward once, what does DOG become?", ["DPH", "EPG", "FOH", "EPH"], "a4"],
      ["Which statement is always true?", ["A square has four sides", "Every bird can fly", "Every month has 31 days", "All large animals are faster than small ones"], "a1"],
      ["At exactly 3:00, what is the smaller angle between the clock hands?", ["45 degrees", "60 degrees", "90 degrees", "120 degrees"], "a3"],
      ["Which word completes both SUN___ and ___HOUSE?", ["Beam", "Light", "Room", "Rise"], "a2"],
      ["You pass the person in second place during a race. What place are you now in?", ["Second", "First", "Third", "Last"], "a1"],
      ["Which number is NOT a perfect square?", ["45", "16", "25", "36"], "a1"],
      ["If A = 1, B = 2 and C = 3, what is the total value of CAB?", ["4", "5", "7", "6"], "a4"],
      ["A farmer has 17 sheep. All but 9 wander away. How many remain?", ["8", "17", "9", "26"], "a3"],
    ],
  },
];

const questionEntries = [];
const localeStages = {};
for (const [stageIndex, stage] of stages.entries()) {
  const questions = {};
  const questionIds = [];
  stage.questions.forEach(([question, answers, correctAnswerId, study], questionIndex) => {
    const id = `challenge-s${stageIndex + 1}q${questionIndex + 1}`;
    questionIds.push(id);
    questionEntries.push([id, {
      presentation: "text",
      correctAnswerId,
      category: stage.category,
      interactionStyle: questionIndex % 2 === 0 ? "core-concept" : "applied-scenario",
      answerIds,
      ...(study ? { study: { mode: "manual", rewarded: false } } : {}),
    }]);
    questions[id] = {
      question,
      headerLabel: stage.difficulty,
      answers: Object.fromEntries(answerIds.map((answerId, index) => [answerId, answers[index]])),
      ...(study ? { study } : {}),
    };
  });
  localeStages[stage.id] = { title: stage.title, questions };
  stage.questionIds = questionIds;
}

const correctCounts = Object.fromEntries(answerIds.map((id) => [id, 0]));
for (const [, question] of questionEntries) correctCounts[question.correctAnswerId] += 1;
if (JSON.stringify(Object.values(correctCounts).sort()) !== JSON.stringify([20, 20, 20, 20])) {
  throw new Error(`Unbalanced correct-answer positions: ${JSON.stringify(correctCounts)}`);
}

const manifest = {
  schemaVersion: 2,
  slug,
  activeLocales: ["en"],
  engine: {
    scoring: "correct-answer",
    targetRatio: 0.8,
    tieBreaks: { categories: "harder-correct", bestRound: "later" },
    localeParity: "independent",
    hardRefreshCheckpoints: true,
  },
  listing: {
    thumbnail: "assets/thumbnail.svg",
    published: "2026-10-15",
    difficulty: "Medium",
    icon: "lucide:zap",
    socialProofCount: 0,
    showSocialProof: false,
    compactLanding: true,
  },
  theme: {
    id: slug,
    preset: "editorial",
    layout: { landing: "split", questions: "card", results: "immersive" },
    colors: {
      page: "#12223d",
      pageAlt: "#233b63",
      surface: "#f6f0e3",
      surfaceRaised: "#fffaf0",
      text: "#18233a",
      muted: "#687087",
      primary: "#e85f4c",
      primaryText: "#fffaf1",
      border: "#d7aa58",
      correct: "#328263",
      incorrect: "#b54953",
    },
    typography: { heading: "sans", body: "sans" },
    shape: { cardRadius: "22px", buttonRadius: "16px" },
    effects: { shadow: "dramatic", texture: "grain" },
    header: {
      background: "linear-gradient(90deg, #0c1930, #1e3961)",
      text: "#fff7e6",
      border: "#e0ad4f",
      shadow: "0 8px 26px rgba(5, 14, 30, 0.34)",
    },
    artwork: { icon: "lucide:zap" },
  },
  template: "ten-stage-eight-question-v1",
  structure: {
    stages: stages.map((stage, index) => ({ id: stage.id, difficultyLevel: levels[index], questionIds: stage.questionIds })),
    questions: Object.fromEntries(questionEntries),
    checkpoint: { finalIcon: "✓" },
    results: {
      profiles: [
        { key: "profile-1", min: 0.9 },
        { key: "profile-2", min: 0.8 },
        { key: "profile-3", min: 0.7 },
        { key: "profile-4", min: 0.6 },
        { key: "profile-5", min: 0.5 },
        { key: "profile-6", min: 0 },
      ],
      dimensions: [
        { key: "dimension-1", categories: ["observation", "memory", "recall"] },
        { key: "dimension-2", categories: ["numbers", "pattern"] },
        { key: "dimension-3", categories: ["words"] },
        { key: "dimension-4", categories: ["judgement", "social"] },
        { key: "dimension-5", categories: ["quick", "final"] },
      ],
      score: { showPercentage: true, showBestRound: true },
    },
  },
};

const content = {
  title: "Are You Ready To Start The Quiz?",
  eyebrow: "THE 10-ROUND CHALLENGE",
  summary: "Ten fast rounds mix observation, words, numbers, memory, judgement and patterns into one final result.",
  landing: {
      intro: "Every answer brings you one step closer to your results.\nReady to find out?",
    cta: "Start Quiz",
  },
  about: {
    body: "Take on ten rounds that switch between quick facts, observation, language, numbers, memory, everyday judgement and patterns. Each round contains eight questions, with a fresh type of challenge waiting at every checkpoint.\n\nChoose the single answer best supported by each question. Your correct answers remain hidden until the final reveal. One early memory board returns later, so keep its details somewhere safe in your mind.\n\nYour result combines an overall score, your strongest skill area, your best round and an optional answer review. It describes this attempt only and is not a formal ability assessment.",
    howToPlay: {
      steps: [
        "Choose the answer best supported by each question.",
        "Complete ten eight-question rounds, each testing a different kind of thinking.",
        "Reveal your score, strongest skill and answer review at the end.",
      ],
    },
    disclaimer: "For entertainment and general learning only. This quiz is not an intelligence, psychological, educational or professional assessment.",
  },
  career: {
    resultProgressLabel: "Your challenge",
    stages: Object.fromEntries(stages.map((stage, index) => [stage.id, {
      difficulty: stage.difficulty,
      preAdTitle: stage.checkpoint[0],
      preAdCopy: stage.checkpoint[1],
      preAdButton: index === stages.length - 1 ? "See My Result" : "Continue",
      ...(index === stages.length - 1 ? {
        preAdChecks: ["All 80 answers checked", "Your strongest skill identified", "Your challenge profile ready"],
      } : {
        next: { eyebrow: "UP NEXT", tagline: stage.checkpoint[2] },
      }),
    }])),
  },
  results: {
    name: "YOUR CHALLENGE RESULT",
    profiles: {
      "profile-1": { tier: "90–100%", title: "The Challenge Master", copy: "You stayed accurate while the rules kept changing. Observation, recall and reasoning all held up under pressure, making this an exceptional all-round result." },
      "profile-2": { tier: "80–89%", title: "The All-Round Ace", copy: "You handled a wide mix of challenges with impressive consistency. Your breakdown reveals the skill that gave you the clearest edge." },
      "profile-3": { tier: "70–79%", title: "The Sharp Contender", copy: "You made strong connections across very different rounds. A few traps caught you, but your strongest skill showed up repeatedly." },
      "profile-4": { tier: "60–69%", title: "The Quick Thinker", copy: "You found your rhythm across several challenge types. Your result shows where instinct worked and where an extra look would have changed the score." },
      "profile-5": { tier: "50–59%", title: "The Rising Challenger", copy: "You solved plenty of the clues and discovered which rounds suit you best. The answer review will show where the trickiest turns appeared." },
      "profile-6": { tier: "Below 50%", title: "The Fearless Starter", copy: "You reached the end of a challenge that constantly changed direction. Your breakdown highlights the skill to trust and the rounds worth trying again." },
    },
    dimensions: {
      "dimension-1": { label: "Sharp Observer" },
      "dimension-2": { label: "Pattern Hunter" },
      "dimension-3": { label: "Word Player" },
      "dimension-4": { label: "Cool Strategist" },
      "dimension-5": { label: "Fast Thinker" },
    },
    score: {
      passed: "You conquered the 10-round challenge!",
      finished: "Challenge complete",
      strongest: "Your strongest skill",
      trickiest: "Your trickiest skill",
      bestRound: "Your best round",
      insights: {
        overview: "Your result at a glance",
        correct: "Correct answers",
        missed: "Questions missed",
        target: "Correct answers for 80%",
        breakdown: "Your skill breakdown",
        snapshot: "What your result suggests",
        targetReached: "80% challenge reached",
        targetRemaining: "More correct answers needed for 80%",
      },
    },
  },
  stages: localeStages,
};

const thumbnail = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-labelledby="title description">
  <title id="title">The 10-Round Challenge</title>
  <desc id="description">A bright question mark surrounded by ten challenge markers.</desc>
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#294d7e"/><stop offset="1" stop-color="#0c1930"/></radialGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffd26f"/><stop offset="1" stop-color="#e85f4c"/></linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="24" stdDeviation="24" flood-color="#07101f" flood-opacity=".45"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="800" cy="450" r="310" fill="none" stroke="#fff7e6" stroke-opacity=".16" stroke-width="3"/>
  <g fill="#63d4cc">
    <circle cx="800" cy="110" r="18"/><circle cx="1000" cy="175" r="18"/><circle cx="1125" cy="345" r="18"/><circle cx="1125" cy="555" r="18"/><circle cx="1000" cy="725" r="18"/>
    <circle cx="600" cy="725" r="18"/><circle cx="475" cy="555" r="18"/><circle cx="475" cy="345" r="18"/><circle cx="600" cy="175" r="18"/><circle cx="800" cy="790" r="18"/>
  </g>
  <circle cx="800" cy="450" r="235" fill="#fffaf0" stroke="#d7aa58" stroke-width="12" filter="url(#shadow)"/>
  <text x="800" y="585" text-anchor="middle" fill="url(#mark)" font-family="Arial, Helvetica, sans-serif" font-size="390" font-weight="900">?</text>
  <text x="800" y="835" text-anchor="middle" fill="#fff7e6" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="800" letter-spacing="12">10 ROUNDS</text>
</svg>`;

const themeCss = `[data-quiz-theme="challenge"] .quiz-engine__landing-badge {
  width: 78px !important;
  height: 78px !important;
}

[data-quiz-theme="challenge"] .quiz-engine__landing-badge > span {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--quiz-primary);
}

[data-quiz-theme="challenge"] .quiz-engine__lucide-icon {
  display: block;
  width: 50px;
  height: 50px;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.25;
  filter: drop-shadow(0 4px 7px rgba(22, 35, 58, .18));
}

[data-quiz-theme="challenge"] .quiz-engine__result-icon .quiz-engine__lucide-icon {
  width: 1.05em;
  height: 1.05em;
  margin: auto;
}

@media (max-width: 640px) {
  [data-quiz-theme="challenge"] .quiz-engine__landing-badge {
    width: 72px !important;
    height: 72px !important;
  }

  [data-quiz-theme="challenge"] .quiz-engine__landing-badge .quiz-engine__lucide-icon {
    width: 48px;
    height: 48px;
  }
}
`;

fs.mkdirSync(path.join(directory, "assets"), { recursive: true });
fs.writeFileSync(path.join(directory, "quiz.json"), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(directory, "en.json"), `${JSON.stringify(content, null, 2)}\n`);
fs.writeFileSync(path.join(directory, "assets", "thumbnail.svg"), thumbnail);
fs.writeFileSync(path.join(directory, "theme.css"), themeCss);

console.log(`Built ${stages.length} rounds and ${questionEntries.length} questions at data/quizzes/${slug}.`);
