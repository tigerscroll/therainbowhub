import fs from "node:fs";
import path from "node:path";

const output = path.join(process.cwd(), "data", "quizzes", "marry", "en.json");
const profiles = [
  "warm_anchor",
  "playful_spark",
  "quiet_creative",
  "grounded_builder",
  "magnetic_connector",
  "curious_explorer",
  "thoughtful_dreamer",
  "ambitious_teammate",
];
const pairings = [
  [[0, 7], [1, 6], [2, 5], [3, 4]],
  [[0, 6], [7, 5], [1, 4], [2, 3]],
  [[0, 5], [6, 4], [7, 3], [1, 2]],
  [[0, 4], [5, 3], [6, 2], [7, 1]],
  [[0, 3], [4, 2], [5, 1], [6, 7]],
  [[0, 2], [3, 1], [4, 7], [5, 6]],
  [[0, 1], [2, 7], [3, 6], [4, 5]],
];

const Q = (id, question, choices, visualKey) => ({ id, question, choices, visualKey });
const stageDefinitions = [
  {
    title: "Your Attraction Code ✨",
    questions: [
      Q("marry-r1q2", "Which smile catches you first?", ["Warm and confident", "Softly mischievous", "Subtle and unusual", "Open and easy"], "smile"),
      Q("marry-r1q3", "Which pair of eyes would hold your attention?", ["Kind and observant", "Bold and curious", "Bright and expressive", "Calm and focused"], "eyes"),
      Q("marry-r1q4", "Which personal style feels most attractive?", ["Relaxed with adventurous details", "Artful with one statement piece", "Polished and practical", "Playful and creative"], "style"),
      Q("marry-r1q5", "Which first impression pulls you closer?", ["Safe, warm and charismatic", "Independent and capable", "Gentle and intriguing", "Energetic and driven"]),
      Q("marry-r1q6", "Pick the date-night look you notice first.", ["Timeless and understated", "Expressive and artful", "Colourful and carefree", "Thoughtful and polished"], "date-look"),
      Q("marry-r1q7", "Which kind of voice would you want to keep listening to?", ["Low, calm and considered", "Warm, lively and teasing", "Confident and animated", "Curious and dreamy"]),
      Q("marry-r1q8", "What do you usually notice first?", ["A warm smile", "Their style and posture", "Calm, thoughtful eyes", "Their expressive energy"]),
    ],
  },
  {
    title: "The Personality Match ❤️",
    questions: [
      Q("marry-r2q1", "Which presence feels right beside you?", ["Reassuring with quiet purpose", "Funny with real sensitivity", "Original and open-minded", "Steady with social ease"]),
      Q("marry-r2q2", "What makes trust grow fastest for you?", ["Listening closely and remembering", "Respecting freedom and cheering you on", "Honest laughter and open conversation", "Quiet consistency and follow-through"]),
      Q("marry-r2q3", "Which long-term quality matters most?", ["A warm sense of adventure", "Emotional depth with people skills", "Shared ambition with reliability", "Playfulness with imagination"]),
      Q("marry-r2q4", "Which kind of humour wins you over?", ["Warm stories that bring everyone in", "Dry observations during an adventure", "Quiet, clever jokes just for you", "Bold teasing with perfect timing"]),
      Q("marry-r2q5", "When you are overwhelmed, what support feels best?", ["Practical help and a steady presence", "A thoughtful talk that shifts perspective", "A change of scene and a reason to laugh", "Gentle reassurance and a clear plan"]),
      Q("marry-r2q6", "What makes someone unforgettable?", ["Quiet warmth and originality", "Grounded confidence with a playful side", "Magnetic focus and big energy", "Curiosity and emotional depth"]),
      Q("marry-r2q7", "Which harmless flaw could you live with?", ["Turns serious moments into jokes", "Gets lost inside a new project", "Overthinks the smallest details", "Says yes before checking the plan"]),
      Q("marry-r2q8", "At 2am, who do you want beside you?", ["The calm fixer who stays", "The gentle joker who understands", "The quiet thinker with a wild idea", "The practical person who knows everyone"]),
    ],
  },
  {
    title: "Your Life Together 🏡",
    questions: [
      Q("marry-r3q1", "Your ideal Saturday together starts with...", ["Coffee, a real talk and nowhere to rush", "A plan that turns into an adventure", "Friends, laughter and a last-minute booking", "A shared project and a good playlist"]),
      Q("marry-r3q2", "Which home feels most like your future?", ["A welcoming base near open space", "A beautiful home full of people", "A well-designed place built for progress", "A colourful hideaway full of ideas"]),
      Q("marry-r3q3", "How should money decisions feel?", ["Open, kind and easy to discuss", "Practical, with room for experiences", "Thoughtful and aligned with your values", "Goal-focused, with a fun budget too"]),
      Q("marry-r3q4", "Pick your shared travel rhythm.", ["Comfortable, calm and well organised", "Culture, conversation and hidden corners", "Loose plan, bold detours, great stories", "Meaningful places and a dream itinerary"]),
      Q("marry-r3q5", "What should your social life look like?", ["A small circle and creative evenings", "Reliable plans with plenty of laughter", "A lively network with shared goals", "New faces mixed with deep one-to-one time"]),
      Q("marry-r3q6", "Which daily rhythm sounds happiest?", ["Affectionate routines with playful surprises", "Independent focus, then shared ambitions", "Useful teamwork and slow evening talks", "Busy connection with spontaneous escapes"]),
      Q("marry-r3q7", "A pet joins the picture. What happens?", ["You build a loving routine together", "It gets a ridiculous name and endless attention", "It joins creative weekends and road trips", "It becomes the calm centre of every gathering"]),
      Q("marry-r3q8", "Which shared future feels happiest?", ["Deeply understood and emotionally safe", "Growing, travelling and cheering each other on", "Full of friends, laughter and connection", "Quietly creative, stable and well built"]),
    ],
  },
  {
    title: "The Chemistry Test 🔥",
    questions: [
      Q("marry-r4q1", "A difficult conversation begins. What feels right?", ["Step outside, breathe and talk honestly", "Name the feeling and keep the warmth", "Define the problem and solve it together", "Use humour gently, then go deeper"]),
      Q("marry-r4q2", "After a disagreement, what matters most?", ["Warm repair and real reconnection", "Space to reset, then a practical talk", "A careful apology that shows understanding", "A clear next step and a shared laugh"]),
      Q("marry-r4q3", "Which gesture would mean the most?", ["Quietly taking care of something difficult", "Planning something personal and beautifully specific", "Turning a normal day into an adventure", "Remembering a dream and helping it happen"]),
      Q("marry-r4q4", "Who should make the first move?", ["Whoever creates a calm, genuine moment", "Whoever can make it feel natural and fun", "The one confident enough to be clear", "Whoever follows the spark of curiosity"]),
      Q("marry-r4q5", "Which kind of affection feels most natural?", ["Warm touch and private jokes", "Quiet closeness while building something", "Reliable care and thoughtful words", "Big energy and spontaneous invitations"]),
      Q("marry-r4q6", "Your partner plans a surprise. Pick the vibe.", ["Intimate, thoughtful and confidently planned", "Funny, tender and full of tiny details", "Unusual, creative and somewhere new", "Effortless, welcoming and beautifully organised"]),
      Q("marry-r4q7", "You are both exhausted. What restores the connection?", ["A quiet check-in and being looked after", "A walk, a plan and a change of scene", "Takeaway, laughter and talking it out", "Comfortable silence while doing something useful"]),
      Q("marry-r4q8", "Which couple dynamic feels most magnetic?", ["Soft place to land, bold world to explore", "Deep understanding with electric social energy", "Two capable people building the next chapter", "Creative co-conspirators who keep life playful"]),
    ],
  },
  {
    title: "Your Future Clues 🔮",
    questions: [
      Q("marry-r5q1", "Which place feels like a clue?", ["A welcoming city courtyard", "A quiet cabin beyond the map", "A hidden studio at dusk", "A rooftop glowing after rain"], "place"),
      Q("marry-r5q2", "Pick the season that feels most romantic.", ["Golden autumn", "Early spring", "High summer", "Clear winter"]),
      Q("marry-r5q3", "Which colour combination calls to you?", ["Ivory and charcoal", "Copper and coral", "Wine and midnight blue", "Sage and storm grey"]),
      Q("marry-r5q4", "Choose one symbol without overthinking.", ["A small flame", "An open window", "A compass", "A shooting star"]),
      Q("marry-r5q5", "Which doorway would you open?", ["The warmly lit doorway", "The vine-covered doorway", "The carved studio doorway", "The grand open doorway"], "doorway"),
      Q("marry-r5q6", "Which journey feels like yours?", ["A quiet train through the hills", "A sunrise road into the unknown", "A ferry arriving at a lively harbour", "A lantern path through an old town"], "journey"),
      Q("marry-r5q7", "Where might a chance meeting happen?", ["At a quiet lookout after a long walk", "At an exhibition opening with mutual friends", "While working toward the same goal", "During a funny, slightly chaotic detour"]),
      Q("marry-r5q8", "Final instinct: which feeling do you choose?", ["Known and welcomed", "Free and capable", "Understood and inspired", "Energised and unstoppable"]),
    ],
  },
];

let scoredIndex = 0;
const stages = stageDefinitions.map((stage, stageIndex) => ({
  title: stage.title,
  questions: [
    ...(stageIndex === 0 ? [{
      id: "marry-r1q1",
      question: "Who should we draw as your future partner?",
      answers: ["A masculine person", "A feminine person", "An androgynous person", "Surprise me"],
      calibration: [0, 0, 0, 0],
    }] : []),
    ...stage.questions.map((question) => {
      const matching = pairings[scoredIndex % pairings.length];
      scoredIndex += 1;
      return {
        id: question.id,
        question: question.question,
        ...(question.visualKey ? {
          presentation: "icons",
          icons: ["a", "b", "c", "d"].map((choice) => `/quizzes/marry/assets/items/${question.visualKey}-${choice}.webp`),
        } : {}),
        answers: Object.fromEntries(question.choices.map((choice, choiceIndex) => [
          choice,
          Object.fromEntries(matching[choiceIndex].map((profileIndex) => [profiles[profileIndex], 0.5])),
        ])),
      };
    }),
  ],
}));

const profileResults = [
  ["warm_anchor", "The Warm Anchor", "You are drawn to someone whose steadiness feels like relief, never routine. This match makes space for honesty, brings warmth to ordinary moments and helps the relationship feel safe enough to grow.", "Warm, calm and quietly confident", ["Protective", "Steady", "Reassuring"], "their expressive, reassuring eyes."],
  ["playful_spark", "The Playful Spark", "Your match brings lightness without avoiding the serious stuff. The chemistry grows through private jokes, spontaneous plans and the feeling that even an ordinary evening can become a favourite memory.", "Bright, affectionate and spontaneous", ["Quick-witted", "Joyful", "Affectionate"], "their impossible-to-ignore smile."],
  ["quiet_creative", "The Quiet Creative", "You are matched with someone who notices what other people miss. Their imagination, calm originality and understated confidence create a connection that deepens slowly and keeps revealing new layers.", "Calm, intriguing and original", ["Imaginative", "Observant", "Original"], "their distinctive, effortless style."],
  ["grounded_builder", "The Grounded Builder", "Your future works best with someone who turns care into action. They bring patience, reliability and practical optimism, creating the kind of partnership where plans become real without losing their warmth.", "Steady, capable and grounded", ["Dependable", "Practical", "Patient"], "their calm, self-assured presence."],
  ["magnetic_connector", "The Magnetic Connector", "You are drawn to someone who makes people feel seen. Their social confidence comes with real emotional awareness, so the attraction feels exciting while the relationship still has generosity and depth.", "Charismatic, generous and perceptive", ["Magnetic", "Empathetic", "Expressive"], "their animated, instantly engaging eyes."],
  ["curious_explorer", "The Curious Explorer", "Your match sees life as something to discover together. They bring energy, independence and genuine curiosity, making the relationship feel spacious enough for adventure and close enough to feel like home.", "Adventurous, open and energising", ["Curious", "Independent", "Energetic"], "their bright, adventurous grin."],
  ["thoughtful_dreamer", "The Thoughtful Dreamer", "You are matched with someone who brings tenderness and imagination to the connection. They listen closely, remember the small things and make shared hopes feel emotionally rich rather than unrealistic.", "Gentle, reflective and emotionally precise", ["Tender", "Perceptive", "Reflective"], "their soft, thoughtful expression."],
  ["ambitious_teammate", "The Ambitious Teammate", "Your strongest match wants a relationship that moves forward together. Their drive is balanced by loyalty and encouragement, turning two separate ambitions into the feeling of being on the same team.", "Driven, loyal and motivating", ["Focused", "Supportive", "Determined"], "their confident posture and direct gaze."],
].map(([id, title, copy, aura, traits, firstFeature]) => ({ id, tier: "MATCH ARCHETYPE", title, copy, icon: "✦", aura, traits, firstFeature }));

const checkpointTitles = [
  "Your attraction pattern is forming",
  "Their personality is coming through",
  "Your future together is becoming clearer",
  "Your match is almost complete",
  "YOUR FUTURE PARTNER HAS BEEN MATCHED",
];
const checkpointBadges = ["ATTRACTION CODE COMPLETE", "PERSONALITY MATCH COMPLETE", "LIFE TOGETHER COMPLETE", "CHEMISTRY TEST COMPLETE", "FUTURE CLUES COMPLETE"];
const checkpointCopies = [
  "The first lines of the portrait are now taking shape.",
  "The match now has a clearer emotional shape.",
  "Shared-life clues have added depth to the portrait.",
  "Only one final instinctive read remains.",
  "Your portrait is ready to reveal.",
];
const nextStages = [
  ["NEXT · DEVELOPING", "The Personality Match ❤️", "Developing", "Who feels right at your side?"],
  ["NEXT · SKILLED", "Your Life Together 🏡", "Skilled", "What kind of future fits you both?"],
  ["NEXT · ADVANCED", "The Chemistry Test 🔥", "Advanced", "How should the connection feel?"],
  ["NEXT · FINAL MATCH", "Your Future Clues 🔮", "Final Match", "One last instinctive read before the reveal."],
];
const checks = ["Attraction pattern analysed", "Personality and chemistry matched", "Future clues combined"];

const result = {
  title: "AI Will Draw The Person You’ll Marry",
  summary: "Attraction, personality, lifestyle and chemistry clues shape the portrait of the person you could marry.",
  landing: {
    intro: "Follow your instincts through attraction, personality, lifestyle and chemistry, then reveal the pencil portrait AI matched to your future.",
    cta: "Start",
  },
  about: {
    body: `This playful five-part experience follows your instincts across attraction, personality, lifestyle, chemistry and future-facing choices. There are no right or wrong answers: every selection adds two relationship-style signals to the portrait match.\n\nYour result is matched deterministically from a purpose-built library of original portraits and relationship archetypes using your quiz answers. It is not generated live from a photo or based on a real person.\n\nThe portrait and relationship reading are designed for entertainment and self-reflection. They do not imply certainty, destiny, real-world identification or a guaranteed future relationship outcome.`,
    howToPlay: {
      title: "How to Play",
      steps: [
        "Choose the person, mood or future that feels most instinctively right.",
        "Complete each eight-choice chapter as the portrait takes shape.",
        "Reveal the fictional portrait and relationship archetype matched to your answers.",
      ],
    },
    disclaimer: "For entertainment and self-reflection only. This quiz matches your preferences to an original fictional portrait and relationship archetype. It does not identify a real person or predict an actual relationship or marriage.",
  },
  results: {
    name: "YOUR FUTURE MATCH",
    profiles: profileResults,
    dimensions: [
      { label: "Steady devotion", profiles: ["warm_anchor", "grounded_builder"] },
      { label: "Playful connection", profiles: ["playful_spark", "magnetic_connector"] },
      { label: "Creative depth", profiles: ["quiet_creative", "thoughtful_dreamer"] },
      { label: "Shared momentum", profiles: ["curious_explorer", "ambitious_teammate"] },
    ],
    profileReveal: {
      eyebrow: "THE PERSON YOU’LL MARRY",
      auraLabel: "THEIR VIBE",
      auraLabelFirst: true,
      traitsLabel: "THREE TRAITS",
      strongestEnergy: "What draws you together",
      hiddenEnergy: "Where you’ll click",
      consistency: "YOUR CHEMISTRY",
      consistencyLabels: {
        high: "96% · High chemistry",
        medium: "91% · Balanced chemistry",
        mixed: "86% · Varied chemistry",
      },
      firstFeatureLabel: "The feature you’ll notice first:",
      portraitAlt: "Pencil portrait of {profile}",
      disclaimer: "For entertainment and self-reflection only. This quiz matches your preferences to an original fictional portrait and relationship archetype. It does not identify a real person or predict an actual relationship or marriage.",
    },
  },
  stages,
  checkpoint: {
    nextPrefix: "NEXT",
    adNote: "Short ad first — then continue.",
    finalAdNote: "Short ad first — then reveal their face.",
    progressLabel: "Portrait match",
    progressComplete: "{value}% complete",
    finalBadge: "FINAL MATCH COMPLETE",
    finalIcon: "✦",
    finalTitle: checkpointTitles[4],
    finalCopy: checkpointCopies[4],
    finalButton: "Reveal Their Face",
    finalChecklist: checks,
    reveals: checkpointTitles.map((title, index) => ({
      badge: checkpointBadges[index],
      icon: index === 4 ? "✦" : "✓",
      title,
      signal: "fixed",
      message: checkpointCopies[index],
    })),
  },
  career: {
    hideJourneyLength: true,
    continuousShell: true,
    showStageResults: false,
    stageResultMode: "completion",
    showResultProgress: true,
    resultProgressLabel: "Portrait match",
    resultProgressComplete: "{value}% complete",
    currentScoreLabel: "MATCH SIGNAL",
    levelLabel: "CHAPTER",
    scoreSuffix: "matched",
    journeyLabel: "PORTRAIT MATCH",
    kitchensCleared: "{value} / {total} clues combined",
    currentRank: "CURRENT MATCH",
    ranks: [{ afterStage: 0, label: "Portrait forming" }, { afterStage: 5, label: "Portrait matched" }],
    unlockEyebrow: "MATCH PROGRESS",
    unlockTitle: "A new clue is ready",
    unlockCopy: "The portrait is still taking shape.",
    finalEyebrow: "THE PERSON YOU’LL MARRY",
    finalCareerTitle: "PORTRAIT MATCHED",
    strongestLabel: "Strongest match signal",
    stages: checkpointTitles.map((title, index) => ({
      difficulty: ["Foundation", "Developing", "Skilled", "Advanced", "Final Match"][index],
      preAdBadge: checkpointBadges[index],
      preAdTitle: title,
      preAdCopy: checkpointCopies[index],
      ...(index === 4 ? { preAdChecks: checks } : {}),
      preAdButton: index === 4 ? "Reveal Their Face" : "Continue",
      resultIcon: index === 4 ? "✦" : "✓",
      resultLabel: checkpointBadges[index],
      resultBands: Object.fromEntries(["high", "medium", "low"].map((band) => [band, { title, insight: checkpointCopies[index] }])),
      ...(index < 4 ? {
        next: {
          eyebrow: nextStages[index][0],
          title: nextStages[index][1],
          difficulty: nextStages[index][2],
          tagline: nextStages[index][3],
          button: "Continue",
        },
      } : {}),
    })),
  },
};

const scoredQuestions = result.stages.flatMap((stage) => stage.questions).filter((question) => question.id !== "marry-r1q1");
if (scoredQuestions.length !== 39) throw new Error(`Expected 39 scored questions, received ${scoredQuestions.length}.`);
const opportunity = Object.fromEntries(profiles.map((profile) => [profile, 0]));
for (const question of scoredQuestions) {
  for (const weights of Object.values(question.answers)) {
    const entries = Object.entries(weights);
    if (entries.length !== 2 || entries.some(([, weight]) => weight !== 0.5)) throw new Error(`${question.id} has an invalid answer vector.`);
    for (const [profile, weight] of entries) opportunity[profile] += weight;
  }
}
for (const [profile, value] of Object.entries(opportunity)) {
  if (Math.abs(value - 19.5) > 1e-9) throw new Error(`${profile} has raw opportunity ${value}, expected 19.5.`);
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${output} with 40 questions and perfectly balanced profile opportunity.`);
