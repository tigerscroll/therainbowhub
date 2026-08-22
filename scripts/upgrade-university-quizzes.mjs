import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const answerOrder = [
  1, 3, 0, 2, 2, 0, 3, 1,
  0, 2, 1, 3, 3, 1, 2, 0,
  1, 0, 3, 2, 2, 3, 0, 1,
  0, 3, 1, 2, 3, 2, 0, 1,
  1, 2, 3, 0, 2, 0, 1, 3,
];

const categoryOrder = (categories) => Array.from({ length: 40 }, (_, index) => categories[index % categories.length]);

function visual(type, items, columns = 1, separator = undefined, ariaLabel = undefined) {
  return {
    presentation: type,
    visual: {
      items,
      columns,
      ...(separator ? { separator } : {}),
      ariaLabel: ariaLabel ?? items.join(separator ? ` ${separator} ` : ", "),
    },
  };
}

function makeQuestions(slug, rows, categories) {
  const orderedCategories = categoryOrder(categories);
  return rows.map((row, index) => {
    const expectedCorrect = answerOrder[index];
    if (row.correct !== expectedCorrect) {
      throw new Error(`${slug} question ${index + 1} must use correct index ${expectedCorrect}, received ${row.correct}`);
    }
    return {
      id: `${slug}-s${Math.floor(index / 8) + 1}q${(index % 8) + 1}`,
      question: row.question,
      ...(row.presentation ?? {}),
      answers: row.answers,
      correct: row.correct,
      category: orderedCategories[index],
      ...(index >= 32 ? { reasoningSteps: 2 } : {}),
      explanation: row.explanation,
    };
  });
}

function q(question, answers, correct, explanation, presentation) {
  return { question, answers, correct, explanation, presentation };
}

const packs = {
  oxford: {
    title: "Only 7% Pass This Oxford Entrance Exam",
    eyebrow: "THE TUTORIAL CHALLENGE",
    summary: "Arguments, assumptions, patterns and precise deductions get harder across five tutorial-style sections.",
    intro: "Arguments, patterns, evidence and logic traps collide in five increasingly demanding tutorial-style sections. Can you hold your reasoning together?",
    resultName: "YOUR OXFORD ENTRANCE SCORE",
    challengeLabel: "Oxford entrance exam",
    finalTitle: "OXFORD ENTRANCE EXAM COMPLETE",
    finalCopy: "Your reasoning result is ready to reveal.",
    categories: ["verbal_reasoning", "critical_reasoning", "formal_logic", "quantitative_reasoning", "information_analysis", "spatial_reasoning"],
    dimensions: [
      { label: "Language and argument", categories: ["verbal_reasoning", "critical_reasoning"] },
      { label: "Logic and numbers", categories: ["formal_logic", "quantitative_reasoning"] },
      { label: "Evidence and space", categories: ["information_analysis", "spatial_reasoning"] },
    ],
    stages: [
      ["Tutorial Foundations", "Foundation", "Words. Rules. First deductions."],
      ["Evidence & Argument", "Developing", "Claims. Assumptions. Strong evidence."],
      ["Logic at the Board", "Skilled", "Constraints. Sequences. Precise inference."],
      ["Interview Trapdoors", "Advanced", "Plausible claims. Missing facts. Careful challenges."],
      ["The Final Tutorial", "Final Assessment", "Multi-step reasoning. No unsupported assumptions."],
    ],
    profiles: [
      [0.9, "90–100%", "The Tutorial Standout", "You followed difficult arguments with exceptional precision and rarely claimed more than the evidence allowed."],
      [0.8, "80–89%", "The Oxford Natural", "You crossed the challenge line with disciplined reasoning across language, logic and evidence."],
      [0.7, "70–79%", "The Shortlisted Thinker", "You handled a demanding mix of inference and analysis, with only a few traps resisting you."],
      [0.6, "60–69%", "The Careful Reasoner", "You uncovered many of the deeper rules and built a strong base for a sharper second attempt."],
      [0.5, "50–59%", "The Promising Applicant", "Several reasoning styles clicked, while the review shows where one extra check would help."],
      [0, "Below 50%", "The Curious Challenger", "This attempt exposed some convincing traps, but every missed clue offers a useful route back in."],
    ],
    questions: [
      q("ARCHIVE is to RECORDS as ANTHOLOGY is to…", ["One author", "Selected works", "A bookshop", "Page numbers"], 1, "An archive collects records; an anthology collects selected works."),
      q("Which number comes next?", ["61", "69", "81", "79"], 3, "Each term doubles and adds one: 4, 9, 19, 39, 79.", visual("sequence", ["4", "9", "19", "39", "?"], 5, "→")),
      q("All fellows attend tutorials. Nia is a fellow. What must follow?", ["Nia attends tutorials", "Nia leads tutorials", "Only fellows attend tutorials", "Nia attends every tutorial"], 0, "Being a fellow is enough to conclude that Nia attends tutorials."),
      q("A rule says only badge holders may enter. Omar has a badge. What can you conclude?", ["Omar entered", "Omar was invited", "The rule alone does not show whether Omar entered", "Everyone with a badge entered"], 2, "A badge is necessary for entry, but it does not prove that entry occurred."),
      q("Which word is closest in meaning to CONCISE?", ["Uncertain", "Decorative", "Brief", "Repetitive"], 2, "Concise means brief while still expressing what is needed."),
      q("A book costs £24 after a 20% reduction. What was its original price?", ["£30", "£28", "£29", "£32"], 0, "£24 is 80% of the original price, so the original was £30."),
      q("A marker points northeast. After a 90° clockwise turn, where does it point?", ["Northwest", "Northeast", "Southwest", "Southeast"], 3, "A quarter-turn clockwise moves northeast to southeast.", visual("spatial", ["↗", "90°", "?"], 3, "→")),
      q("Grades rose after optional tutorials began. Which fact most weakens the claim that tutorials caused the rise?", ["Students liked the tutor", "The exam was also made substantially easier", "Tutorials lasted one hour", "The library stayed open later"], 1, "An easier exam is a direct alternative explanation for higher grades."),

      q("Which conclusion follows? No poets are careless editors. Some reviewers are poets.", ["Some reviewers are not careless editors", "All reviewers are poets", "No reviewers are editors", "Some careless editors are reviewers"], 0, "The reviewers who are poets cannot be careless editors."),
      q("A survey records 70 tutorial users and 50 library users among 100 students. Both or neither were allowed. What is the exact overlap?", ["20", "50", "It cannot be determined", "70"], 2, "Twenty is the minimum overlap, but the exact figure depends on how many chose neither."),
      q("Which evidence best tests whether a new reading list improved essay quality?", ["Students say the list looks modern", "Compare essays using the old and new lists under similar marking conditions", "Count the books on each list", "Ask one tutor which list they prefer"], 1, "A controlled comparison of essay outcomes most directly tests the claim."),
      q("If an argument says a longer library day will increase attendance, which assumption does it need?", ["Every student enjoys libraries", "The library is currently full", "Longer days always improve grades", "Some students who cannot attend now would use the added hours"], 3, "The extra hours can only raise attendance if they enable additional visits."),
      q("Which example disproves the claim ‘Every prime number is odd’?", ["9", "15", "21", "2"], 3, "Two is prime and even, so it is a counterexample."),
      q("A seminar has 18 students. Two thirds submit early. How many submit early?", ["9", "12", "14", "16"], 1, "Two thirds of 18 is 12."),
      q("Which statement reports the data without adding a cause?", ["Scores rose because the room was quieter", "The new method made everyone improve", "Average scores rose from 62 to 68", "The class became more motivated"], 2, "Only the numerical comparison stays within the observed data."),
      q("BOOK is to READ as THEORY is to…", ["Test", "Shelf", "Author", "Cover"], 0, "A book is read; a theory is tested."),

      q("A is before B. C is after B. Which order must be correct?", ["B–A–C", "A–B–C", "C–A–B", "A–C–B"], 1, "The two constraints force A before B before C."),
      q("What is the next difference in this pattern?", ["16", "18", "20", "22"], 0, "The gaps are 4, 8 and 12, so the next gap is 16.", visual("sequence", ["3", "7", "15", "27", "?"], 5, "→")),
      q("Exactly one statement is true. A says ‘B is true.’ B says ‘A and C are false.’ C says ‘B is false.’ Who is true?", ["A", "B", "All three", "C"], 3, "If B is false, A's statement is false and C's statement is true. B's own claim is also false, leaving only C truthful."),
      q("A tutorial begins at 14:35 and lasts 1 hour 45 minutes. When does it finish?", ["16:00", "16:10", "16:20", "16:30"], 2, "Adding 1 hour 45 minutes to 14:35 gives 16:20."),
      q("Every submitted essay was marked. This essay was marked. What follows?", ["It was definitely submitted", "It received a high mark", "Nothing proves that it was submitted", "Only submitted essays were marked"], 2, "The rule does not say that marking happens only to submitted essays."),
      q("Three books cost £42 equally. Two more are bought at the same price each. What is the total cost?", ["£56", "£60", "£66", "£70"], 3, "Each book costs £14, so five cost £70."),
      q("A marker starts in the top-left corner of a square. After a 180° rotation, where does it finish?", ["Bottom-right", "Top-right", "Bottom-left", "Top-left"], 0, "A half-turn moves the top-left corner to the bottom-right corner.", visual("spatial", ["TOP-LEFT", "180°", "?"], 3, "→")),
      q("A claim is supported by one anonymous comment. What is the strongest criticism?", ["The comment is too short", "One unverifiable source is weak evidence for a broad claim", "Anonymous comments are always false", "The claim must be correct"], 1, "A broad conclusion needs more reliable and representative evidence."),

      q("A study finds students who sleep more score higher. What can it establish by itself?", ["The variables are associated", "More sleep caused the scores", "High scores cause more sleep", "Every student should sleep the same amount"], 0, "An observational relationship establishes association, not causation."),
      q("The average of 6, 10, 14 and x is 12. What is x?", ["12", "14", "16", "18"], 3, "A mean of 12 across four values requires a total of 48; the known values total 30, so x is 18."),
      q("Which question exposes missing information in ‘Most students prefer tutorials’?", ["How long is a tutorial?", "How many students were asked and how were they selected?", "Who teaches the tutorial?", "Where is the room?"], 1, "Sample size and selection determine whether the claim is representative."),
      q("A candidate must submit a form and a reference. Mei submitted a form only. What follows?", ["Mei meets the requirement", "Mei was rejected", "Mei has not yet met the stated requirement", "The reference is optional"], 2, "Both items are required, and only one is present."),
      q("ARGUMENT is to CONCLUSION as CALCULATION is to…", ["Symbol", "Estimate", "Table", "Result"], 3, "An argument leads to a conclusion; a calculation leads to a result."),
      q("A 240-page book is read at 30 pages per day. After five days, how many pages remain?", ["100", "110", "90", "120"], 2, "Five days covers 150 pages, leaving 90."),
      q("A marker moves one place right, two left, three right. Starting at 4, where does it finish?", ["6", "4", "2", "8"], 0, "Applying the moves in order gives 4 + 1 − 2 + 3 = 6."),
      q("Which revision is most precise?", ["The results were kind of better", "The average rose by six points", "Things improved a lot", "The change was good"], 1, "The numerical statement identifies the exact measured change."),

      q("Every shortlisted candidate passed Logic. Some candidates who passed Logic were not shortlisted. Which statement must be true?", ["Everyone who passed Logic was shortlisted", "At least one Logic passer was not shortlisted", "No shortlisted candidate passed Logic", "Some shortlisted candidates failed Logic"], 1, "The second premise directly guarantees at least one non-shortlisted Logic passer."),
      q("A code adds 2, then doubles. Starting with 7, what result appears after both steps?", ["16", "20", "18", "22"], 2, "Seven plus two is nine; doubling gives 18."),
      q("Three essays—History, Law and Music—are presented Monday to Wednesday. Law is after History. Music is not Wednesday. What is Monday?", ["History", "Law", "Music", "It cannot be determined"], 3, "History–Law–Music and Music–History–Law both satisfy the rules, so Monday is not fixed."),
      q("A report says 80% of 50 respondents agreed. How many agreed, and what limitation remains?", ["40; the sample may not represent everyone", "35; the question wording is unknown", "45; no limitation remains", "50; the result proves causation"], 0, "Forty agreed, but representativeness still depends on how respondents were selected."),
      q("A 90° clockwise turn is followed by a vertical reflection. Where does an upward arrow finish?", ["Up", "Down", "Left", "Right"], 2, "Up turns right; a vertical mirror reverses right to left."),
      q("A library adds evening hours and visits rise. Which comparison best separates the hours effect from a seasonal rise?", ["Compare with a similar library that kept its hours during the same period", "Ask visitors if they like evenings", "Count the new signs", "Compare this month with itself"], 0, "A similar unchanged library provides a contemporaneous comparison."),
      q("A rule admits applicants with Logic ≥ 80 and Writing ≥ 70. Ava scores 84/68; Bo scores 79/90; Cy scores 82/74. Who qualifies?", ["Ava", "Cy", "Bo", "Ava and Cy"], 1, "Only Cy meets both thresholds."),
      q("A conclusion requires P and Q. The evidence establishes P but says nothing about Q. What is the sound verdict?", ["The conclusion is false", "Q must be true", "P is irrelevant", "The conclusion is not yet established"], 3, "A required condition remains unsupported, so the conclusion is not established."),
    ],
  },

  cambridge: {
    title: "Only 7% Pass This Cambridge Entrance Exam",
    eyebrow: "THE SUPERVISION CHALLENGE",
    summary: "Patterns, scientific evidence, data and mechanisms get harder across five supervision-style sections.",
    intro: "Patterns, experiments, data and spatial systems build across five fast supervision-style sections. Can you keep every variable under control?",
    resultName: "YOUR CAMBRIDGE ENTRANCE SCORE",
    challengeLabel: "Cambridge entrance exam",
    finalTitle: "CAMBRIDGE ENTRANCE EXAM COMPLETE",
    finalCopy: "Your systems-reasoning result is ready to reveal.",
    categories: ["numerical_reasoning", "scientific_reasoning", "pattern_analysis", "data_interpretation", "spatial_reasoning", "experimental_design"],
    dimensions: [
      { label: "Numbers and patterns", categories: ["numerical_reasoning", "pattern_analysis"] },
      { label: "Science and experiments", categories: ["scientific_reasoning", "experimental_design"] },
      { label: "Data and space", categories: ["data_interpretation", "spatial_reasoning"] },
    ],
    stages: [
      ["College Foundations", "Foundation", "Patterns. Measures. First mechanisms."],
      ["Patterns & Proof", "Developing", "Sequences. Relationships. Clean deductions."],
      ["Scientific Reasoning", "Skilled", "Controls. Evidence. Cause and effect."],
      ["Supervision Challenge", "Advanced", "Data traps. Calibration. System changes."],
      ["The Final Assessment", "Final Assessment", "Multi-step models. Final scientific judgement."],
    ],
    profiles: [
      [0.9, "90–100%", "The Systems Standout", "You moved confidently between patterns, mechanisms and evidence while keeping the important variables separate."],
      [0.8, "80–89%", "The Cambridge Natural", "You crossed the challenge line with strong quantitative and scientific reasoning."],
      [0.7, "70–79%", "The Supervision Specialist", "You solved most systems accurately and adapted well when the problem changed form."],
      [0.6, "60–69%", "The Methodical Thinker", "You built sound solutions across several technical styles and have a clear base to refine."],
      [0.5, "50–59%", "The Promising Applicant", "Many core patterns clicked, while the review identifies the variables worth checking twice."],
      [0, "Below 50%", "The Curious Investigator", "Some systems resisted this attempt, but every result gives you another clue about how the rule works."],
    ],
    questions: [
      q("Which number comes next?", ["21", "25", "27", "31"], 1, "The gaps are 2, 4, 6 and then 8, giving 25.", visual("sequence", ["5", "7", "11", "17", "?"], 5, "→")),
      q("A sample has a mass of 2.4 kg. What is that in grams?", ["24 g", "240 g", "24,000 g", "2,400 g"], 3, "One kilogram is 1,000 grams, so 2.4 kg is 2,400 g."),
      q("Which value does not follow the same rule?", ["16", "8", "64", "125"], 0, "8, 64 and 125 are cubes; 16 is not a cube."),
      q("A plant grows from 12 cm to 18 cm. What is the percentage increase?", ["33%", "40%", "50%", "60%"], 2, "The increase is 6 on a starting value of 12, which is 50%."),
      q("Gear A turns clockwise and meshes with B, which meshes with C. Which way does C turn?", ["It stops", "It alternates", "Clockwise", "Anticlockwise"], 2, "Each mesh reverses direction; two reversals return C to clockwise."),
      q("Two identical plants receive different fertilisers. What should be kept the same for a fair test?", ["Light, water and soil", "The fertiliser", "The final height", "The hypothesis"], 0, "Other growth conditions should be controlled so fertiliser is the main changed variable."),
      q("A cube has how many edges?", ["6", "8", "10", "12"], 3, "A cube has four edges on top, four below and four connecting them: 12."),
      q("Which observation best supports that heating caused expansion?", ["The rod looked brighter", "The same rod lengthened when heated and shortened when cooled", "A different rod was longer", "The room was warm"], 1, "Reversible change in the same rod tracks the heating condition directly."),

      q("Which term completes the pattern?", ["BBBB", "AABB", "AAAB", "ABBA"], 0, "Each step replaces one A with one B.", visual("sequence", ["AAAA", "AAAB", "AABB", "ABBB", "?"], 5, "→")),
      q("If x + 4 = 11, what is 3x?", ["15", "18", "21", "24"], 2, "Subtracting 4 gives x = 7, and multiplying by 3 gives 21."),
      q("A marker starts in the top-left of a 3×3 grid and moves one right, then one down. Where is it?", ["Top-right", "Centre", "Bottom-left", "Bottom-right"], 1, "One right and one down from top-left reaches the centre."),
      q("Which result is strongest evidence for a repeatable effect?", ["One trial works once", "A prediction sounds plausible", "The researcher expected it", "Independent repetitions produce similar results"], 3, "Independent repeated results provide the strongest evidence of repeatability."),
      q("What is the mean of 6, 8, 10 and 12?", ["8", "8.5", "9.5", "9"], 3, "The total is 36, divided by four gives 9."),
      q("A sequence doubles, then subtracts 1. What follows 19?", ["36", "37", "38", "39"], 1, "Doubling 19 gives 38, then subtracting 1 gives 37."),
      q("A beaker reading rises from 40 mL to 55 mL after an object is submerged. What volume is displaced?", ["10 mL", "12 mL", "15 mL", "95 mL"], 2, "The displaced volume is the rise in level: 55 − 40 = 15 mL."),
      q("Which variable is measured as the outcome of an experiment?", ["Dependent variable", "Control variable", "Independent variable", "Constant"], 0, "The dependent variable is the measured outcome."),

      q("A sensor reads 3 units too high. It displays 18. What is the corrected value?", ["21", "15", "18", "6"], 1, "Subtract the +3 error from the display: 18 − 3 = 15."),
      q("A culture triples every hour. It starts at 4. How many are present after two hours?", ["36", "24", "12", "48"], 0, "Four triples to 12, then to 36."),
      q("Which sequence follows ‘add 2, multiply by 2’ repeatedly?", ["3, 5, 10, 12", "3, 8, 18, 38", "3, 6, 12, 24", "3, 10, 24, 52"], 3, "Starting at 3: add 2 and double gives 10; repeat gives 24, then 52."),
      q("A graph rises steadily, then becomes horizontal. What does the horizontal section show?", ["The value is falling", "The value is increasing faster", "The measured value is constant", "Time stopped"], 2, "A horizontal line shows no change in the measured value."),
      q("Which net could fold into a cube?", ["Five squares in a line", "Four triangles and two squares", "Six squares in a valid cross arrangement", "Six disconnected squares"], 2, "A connected cross of six squares is a standard cube net."),
      q("A test compares warm and cool water but uses different cup sizes. Why is that a problem?", ["Temperature cannot be measured", "Cool water has no volume", "The hypothesis becomes a fact", "Cup size is an uncontrolled variable"], 3, "Different cup sizes may affect the outcome independently of temperature."),
      q("A rate is 120 events in 4 minutes. What is the rate per minute?", ["30", "40", "60", "480"], 0, "120 divided by 4 is 30 per minute."),
      q("A claim predicts X. The experiment observes not-X under valid conditions. What is the best response?", ["Ignore the observation", "Reconsider the claim", "Change the data", "The claim is proven"], 1, "A valid contradictory result is a reason to revise or reject the prediction."),

      q("A calibrated display adds 4 to the raw value. The raw value doubles from 7 to 14. What will display?", ["18", "11", "22", "28"], 0, "The new raw value is 14, then calibration adds 4 to display 18."),
      q("Three readings are 10.2, 10.3 and 15.8. What should be checked first?", ["Whether 10.2 is positive", "Whether three readings are allowed", "Whether the unit has letters", "Whether 15.8 is an error or unusual observation"], 3, "The large outlier should be checked before summarising the readings."),
      q("Which sample satisfies mass > 5 g and temperature < 20°C?", ["5 g, 18°C", "6 g, 18°C", "6 g, 22°C", "4 g, 15°C"], 1, "Only 6 g at 18°C satisfies both strict inequalities."),
      q("A square is rotated 180°. Where does its top-left marker finish?", ["Top-right", "Top-left", "Bottom-right", "Bottom-left"], 2, "A half-turn moves top-left to bottom-right."),
      q("A result differs by 0.2 units across repeated trials. What information is needed before calling that meaningful?", ["The apparatus colour", "The researcher's preference", "The room name", "The expected measurement uncertainty"], 3, "A difference should be judged against the measurement uncertainty."),
      q("A reaction takes 80 seconds at 20°C and 50 seconds at 30°C. How much shorter is it?", ["20 seconds", "40 seconds", "30 seconds", "130 seconds"], 2, "80 − 50 = 30 seconds."),
      q("Which description shows reflection rather than rotation?", ["A left-facing shape flipped to face right across a vertical line", "A shape shifted right", "A shape enlarged", "A shape turned 90°"], 0, "A mirror flip across a line is reflection."),
      q("What makes a control group useful?", ["It guarantees the preferred result", "It provides a comparison without the tested change", "It removes the need to repeat", "It changes every variable"], 1, "A control shows what happens without the tested intervention."),

      q("A machine applies ×3, then −2. What output comes from input 6?", ["14", "16", "18", "20"], 1, "6 × 3 = 18, then 18 − 2 = 16."),
      q("Two samples start at 50 g. A loses 12%; B loses 8%. How much heavier is B afterward?", ["1 g", "4 g", "2 g", "10 g"], 2, "A loses 6 g and becomes 44 g; B loses 4 g and becomes 46 g, so B is 2 g heavier."),
      q("A pattern rotates 90° clockwise, then changes colour. Which operation should be applied first?", ["Change colour", "Reflect", "Either order is always identical", "Rotate 90° clockwise"], 3, "The stated rule explicitly places rotation before the colour change."),
      q("A table reports 24 of 30 trials succeeded. A second set has the same success rate over 50 trials. How many succeed?", ["40", "42", "44", "45"], 0, "24/30 is 80%; 80% of 50 is 40."),
      q("A marker moves north 2, east 3, then south 2. Where is it relative to the start?", ["Three west", "Two north", "Three east", "At the start"], 2, "North and south cancel, leaving three units east."),
      q("Plants under blue light grow taller than those under red light, but blue plants also received more water. What can be concluded?", ["The light effect cannot be separated from water", "Blue light caused the growth", "Red light prevents growth", "Water never matters"], 0, "Because water also changed, the cause cannot be isolated."),
      q("A sensor shows 26 after a +2 calibration offset. The true value then falls by 5. What will the sensor show next?", ["19", "21", "23", "29"], 1, "The original true value is 24; after falling to 19, the +2 offset displays 21."),
      q("A model predicts 12, 18 and 24 for three trials. Actual values are 13, 17 and 24. What is the total absolute error?", ["0", "1", "3", "2"], 3, "The absolute errors are 1, 1 and 0, totalling 2."),
    ],
  },

  harvard: {
    title: "Only 7% Pass This Harvard Entrance Exam",
    eyebrow: "THE CASE ROOM CHALLENGE",
    summary: "Evidence, numbers, priorities and strategic decisions get harder across five case-style sections.",
    intro: "Evidence, trade-offs, data and logic collide in five fast case-style sections. Can you make the strongest decision with the facts available?",
    resultName: "YOUR HARVARD ENTRANCE SCORE",
    challengeLabel: "Harvard entrance exam",
    finalTitle: "HARVARD ENTRANCE EXAM COMPLETE",
    finalCopy: "Your analytical result is ready to reveal.",
    categories: ["analytical_reasoning", "quantitative_reasoning", "evidence_judgement", "decision_making", "verbal_reasoning", "data_interpretation"],
    dimensions: [
      { label: "Analysis and decisions", categories: ["analytical_reasoning", "decision_making"] },
      { label: "Numbers and data", categories: ["quantitative_reasoning", "data_interpretation"] },
      { label: "Evidence and language", categories: ["evidence_judgement", "verbal_reasoning"] },
    ],
    stages: [
      ["Admissions Briefing", "Foundation", "Evidence. Numbers. First decisions."],
      ["Evidence & Analysis", "Developing", "Claims. Comparisons. Strong support."],
      ["Quantitative Decisions", "Skilled", "Rates. Trade-offs. Resource choices."],
      ["The Case Room", "Advanced", "Competing priorities. Hidden assumptions."],
      ["The Final Committee", "Final Assessment", "Multi-step evidence. Final strategic judgement."],
    ],
    profiles: [
      [0.9, "90–100%", "The Case Room Standout", "You balanced evidence, numbers and trade-offs with exceptional consistency."],
      [0.8, "80–89%", "The Harvard Natural", "You crossed the challenge line by making clear, evidence-led decisions across very different cases."],
      [0.7, "70–79%", "The Strategic Analyst", "You handled most data and judgement problems strongly, with only a few close calls."],
      [0.6, "60–69%", "The Deliberate Thinker", "You found sound decisions in many cases and built a strong base for another attempt."],
      [0.5, "50–59%", "The Promising Applicant", "Several analytical styles clicked, while the review highlights where one extra comparison mattered."],
      [0, "Below 50%", "The Curious Decision-Maker", "Some cases proved difficult, but each missed constraint offers a useful lesson for the next decision."],
    ],
    questions: [
      q("A team needs writing, numbers and presentation skills. Which option covers all three with the fewest people?", ["Three writers", "One writer and one analyst who presents", "One presenter", "Two analysts"], 1, "The writer plus the analyst-presenter covers all skills with two people."),
      q("A $250 budget spends 36%. How much remains?", ["$80", "$90", "$150", "$160"], 3, "Thirty-six percent of $250 is $90, leaving $160."),
      q("Which evidence most directly supports a need for later library hours?", ["Entry records show repeated turnaways at closing time", "A poster requests longer hours", "One student likes studying late", "The library has old chairs"], 0, "Repeated turnaways directly measure unmet demand near closing."),
      q("Two projects have equal benefit. One costs less and finishes sooner. Which should be preferred under those criteria?", ["The more expensive project", "Neither can be compared", "The cheaper, faster project", "Choose randomly"], 2, "It dominates on both stated criteria."),
      q("Which sentence is most precise?", ["Engagement was kind of good", "People seemed happier", "Attendance rose from 120 to 156", "The event did better"], 2, "The numerical statement specifies the observed change."),
      q("Applications rise from 400 to 500. What is the percentage increase?", ["25%", "20%", "100%", "125%"], 0, "The increase is 100 on a base of 400, which is 25%."),
      q("A policy benefits 80 people at $4,000. What is its cost per beneficiary?", ["$20", "$40", "$80", "$50"], 3, "$4,000 divided by 80 is $50."),
      q("A proposal promises higher participation but gives no mechanism. What is the best first question?", ["Who designed the logo?", "How is the proposal expected to change participation?", "Is the title memorable?", "Can it start tomorrow?"], 1, "The causal mechanism is needed to assess the promise."),

      q("Which conclusion follows? All funded pilots were reviewed. Project K was funded.", ["Project K was reviewed", "Only Project K was reviewed", "Every reviewed project was funded", "Project K succeeded"], 0, "Funding is enough to infer review under the stated rule."),
      q("A survey of volunteers finds 90% support. What is the biggest limitation?", ["Percentages cannot be used", "Support must be zero", "Volunteers may not represent the whole population", "The survey has answers"], 2, "Self-selected volunteers may differ from the wider population."),
      q("Which comparison best tests whether a new reminder increased attendance?", ["Attendance after the reminder only", "Similar groups with and without the reminder", "The reminder's colour", "One attendee's opinion"], 1, "A comparable no-reminder group helps isolate the reminder effect."),
      q("A plan assumes demand will grow. Which evidence most weakens it?", ["The plan has three pages", "The team likes the idea", "The launch date is Monday", "Demand has fallen steadily for four comparable periods"], 3, "A sustained contrary trend directly challenges the growth assumption."),
      q("A programme serves 60 of 75 applicants. What percentage is served?", ["60%", "70%", "75%", "80%"], 3, "60 divided by 75 is 80%."),
      q("Which option is an observation rather than an interpretation?", ["The queue was badly managed", "Average wait time was 18 minutes", "Visitors were impatient", "The service felt slow"], 1, "The measured wait time is an observation."),
      q("A report uses one success story to claim the programme works for everyone. What is the flaw?", ["The story is too positive", "The programme has a name", "One case cannot establish a universal result", "Success is impossible"], 2, "A single example is insufficient for a universal conclusion."),
      q("IMPARTIAL is closest in meaning to…", ["Unbiased", "Uncertain", "Unprepared", "Unusual"], 0, "Impartial means unbiased."),

      q("A project costs $18,000 and saves $3,000 per month. After how many months are costs recovered?", ["3", "6", "9", "12"], 1, "$18,000 divided by $3,000 is six months."),
      q("Three teams process 24 cases each. How many cases in total?", ["72", "48", "64", "96"], 0, "Three times 24 is 72."),
      q("A score weights impact twice and feasibility once. Proposal X has impact 8, feasibility 6. What is its total?", ["16", "18", "24", "22"], 3, "Twice 8 plus 6 equals 22."),
      q("Project A reaches 120 people for $6,000. Project B reaches 150 for $9,000. Which has lower cost per person?", ["They are equal", "Project B", "Project A", "There is not enough information"], 2, "A costs $50 per person; B costs $60, so A is lower."),
      q("A deadline is fixed. Task X takes 4 days; Y takes 3 and starts after X. Minimum total time?", ["3 days", "4 days", "7 days", "12 days"], 2, "Sequential tasks take 4 + 3 = 7 days."),
      q("A fund of $12,000 is split 2:1 between programmes A and B. How much goes to A?", ["$4,000", "$6,000", "$9,000", "$8,000"], 3, "A receives two of three equal shares: $8,000."),
      q("Which region has the highest success rate?", ["A: 40/50", "B: 45/60", "C: 54/75", "D: 70/100"], 0, "A succeeds in 80%; the others are 75%, 72% and 70%."),
      q("A dashboard shows reach stable, clicks stable, but completed forms fall. Where is the likely problem?", ["Before the ad is shown", "During form completion", "At the reach stage", "The data prove no problem"], 1, "The drop appears after clicking and before completion."),

      q("Two urgent tasks remain: one prevents immediate harm; the other improves next month's report. Which comes first?", ["The harm-prevention task", "The report", "Whichever is easier", "Do neither"], 0, "Immediate harm outranks a routine future improvement."),
      q("A committee must include Finance and Community skills. Ana has Finance; Bo has Community; Cy has both but is unavailable. Smallest available team?", ["Ana only", "Bo only", "No team is possible", "Ana and Bo"], 3, "Ana and Bo together cover both required skills."),
      q("A proposal scores impact 7 and cost 4. Another scores impact 8 and cost 8. If higher impact and lower cost are preferred, what is true?", ["The first wins both", "Neither dominates the other", "They are identical", "The second wins both"], 1, "The second has higher impact, but the first has lower cost; neither dominates."),
      q("A claim says a pilot caused a 10% rise, but the comparison group rose 9%. What is the cautious conclusion?", ["The pilot caused the full 10%", "The pilot had no possible effect", "The net difference is small and needs further evidence", "The comparison is irrelevant"], 2, "The similar rise elsewhere suggests only a small possible incremental effect."),
      q("A project is approved only if value exceeds cost. Value is $45k and cost is $45k. Is it approved?", ["Yes, because they are equal", "Yes, because cost is known", "It depends on the project name", "No, because value does not exceed cost"], 3, "Equal values do not satisfy a strict ‘exceeds’ rule."),
      q("Attendance is 200 Monday and 260 Tuesday. What share of the two-day total occurred Tuesday?", ["50%", "52%", "56.5%", "60%"], 2, "260 of 460 is about 56.5%."),
      q("Which response best acknowledges uncertainty?", ["The evidence suggests an effect, but the sample is small", "The result is useless", "The conclusion is certain", "The evidence proves everything"], 0, "It states what the evidence suggests while naming the limitation."),
      q("A decision rule says choose the highest benefit among options under $10k. Which wins?", ["A: $8k, benefit 6", "C: $9k, benefit 8", "B: $10k, benefit 9", "D: $11k, benefit 10"], 1, "Only costs strictly under $10k qualify; the $9k option has the highest qualifying benefit."),

      q("A programme costs $20k, reaches 500 people and achieves 40% completion. What is cost per completion?", ["$40", "$100", "$80", "$200"], 1, "Forty percent of 500 is 200 completions; $20,000 divided by 200 is $100."),
      q("Every priority project has an owner. Project L has no owner. What follows?", ["L is complete", "L has two owners", "L is not a priority project", "No project has an owner"], 2, "Contraposition: if L lacks an owner, it cannot be a priority project."),
      q("Proposal A: impact 9, feasibility 5. B: impact 7, feasibility 9. Score = impact + feasibility. Which wins?", ["A", "B", "Neither was scored", "They tie"], 3, "Both total 14, so the rule produces a tie."),
      q("A survey reports 72% support with a ±4-point margin. Which range matches that uncertainty?", ["68% to 76%", "72% to 76%", "64% to 72%", "70% to 74%"], 0, "Four points either side of 72 gives 68 to 76."),
      q("A project must be urgent and feasible. X is urgent but not feasible; Y is feasible but not urgent; Z is both. Which qualifies?", ["X", "Y", "Z", "X and Y"], 2, "Only Z satisfies both required conditions."),
      q("Region A has 80 successes from 100; B has 117 from 150. Which has the higher rate, and by how much?", ["A by 2 percentage points", "B by 2 points", "A by 20 points", "They are equal"], 0, "A is 80%; B is 78%, so A leads by 2 percentage points."),
      q("A pilot's reach rises 20%, but conversion falls from 10% to 8%. Starting from 1,000 people, how do completions change?", ["They rise from 100 to 120", "They fall from 100 to 96", "They fall from 100 to 80", "They stay at 100"], 1, "New reach is 1,200; 8% converts to 96, down from 100."),
      q("The final rule selects the lowest-cost proposal scoring at least 15. A: cost 9, score 14. B: cost 12, score 16. C: cost 10, score 15. D: cost 8, score 13. Which is selected?", ["A", "B", "D", "C"], 3, "B and C meet the score threshold; C has the lower cost."),
    ],
  },
};

function careerFor(pack) {
  const stageCopy = [
    ["First exam section complete", "Good start. The next section is ready."],
    ["Entrance exam progressing", "The next section raises the difficulty."],
    ["More than halfway through", "The advanced section is next."],
    ["Final assessment next", "Only the final section remains."],
    [pack.finalTitle, pack.finalCopy],
  ];
  return {
    hideJourneyLength: true,
    continuousShell: true,
    showStageResults: false,
    showCurrentScore: false,
    showResultProgress: true,
    resultProgressLabel: pack.challengeLabel,
    resultProgressComplete: "{value}% complete",
    currentScoreLabel: "CURRENT ENTRANCE SCORE",
    levelLabel: "SECTION",
    scoreSuffix: "correct",
    journeyLabel: pack.challengeLabel.toUpperCase(),
    kitchensCleared: "{value} sections complete",
    currentRank: "CURRENT LEVEL",
    ranks: [{ afterStage: 0, label: "Exam Started" }, { afterStage: 5, label: "Entrance Exam Complete" }],
    unlockEyebrow: "ENTRANCE EXAM",
    unlockTitle: "The next section is ready",
    unlockCopy: "Continue when you are ready.",
    finalEyebrow: "YOUR ENTRANCE RESULT",
    finalCareerTitle: pack.finalTitle,
    strongestLabel: "Strongest entrance area",
    stages: pack.stages.map(([title, difficulty, tagline], index) => ({
      difficulty,
      preAdBadge: `${title.toUpperCase()} COMPLETE`,
      preAdTitle: stageCopy[index][0],
      preAdCopy: stageCopy[index][1],
      ...(index === 4 ? { preAdChecks: ["40 answers checked", "Six reasoning areas compared", "Final score calculated"] } : {}),
      preAdButton: index === 4 ? "See My Result" : "Continue",
      resultIcon: index === 4 ? "🎓" : "✓",
      resultLabel: `${title.toUpperCase()} COMPLETE`,
      resultBands: {
        high: { title: stageCopy[index][0], insight: stageCopy[index][1] },
        medium: { title: stageCopy[index][0], insight: stageCopy[index][1] },
        low: { title: stageCopy[index][0], insight: stageCopy[index][1] },
      },
      ...(index < 4 ? {
        next: {
          eyebrow: `NEXT SECTION · ${pack.stages[index + 1][1].toUpperCase()}`,
          title: pack.stages[index + 1][0],
          difficulty: pack.stages[index + 1][1],
          tagline: pack.stages[index + 1][2],
          button: "Continue",
        },
      } : {}),
    })),
  };
}

function checkpointFor(pack) {
  const titles = ["First exam section complete", "Entrance exam progressing", "More than halfway through", "Final assessment next", pack.finalTitle];
  const messages = ["Good start. The next section is ready.", "The next section raises the difficulty.", "The advanced section is next.", "Only the final section remains.", pack.finalCopy];
  return {
    nextPrefix: "NEXT SECTION",
    adNote: "Short ad first — then continue.",
    finalAdNote: "Short ad first — then see your result.",
    finalBadge: pack.finalTitle,
    finalIcon: "🎓",
    finalTitle: "Your Entrance Result Is Ready",
    finalCopy: pack.finalCopy,
    finalButton: "See My Result",
    finalChecklist: ["40 answers checked", "Six reasoning areas compared", "Final score calculated"],
    reveals: pack.stages.map(([title], index) => ({
      badge: `${title.toUpperCase()} COMPLETE`,
      icon: index === 4 ? "🎓" : "✓",
      title: titles[index],
      signal: "fixed",
      message: messages[index],
    })),
  };
}

for (const [slug, pack] of Object.entries(packs)) {
  const directory = path.join(root, "data", "quizzes", slug);
  const quizPath = path.join(directory, "quiz.json");
  const contentPath = path.join(directory, "en.json");
  const quiz = JSON.parse(fs.readFileSync(quizPath, "utf8"));
  const old = JSON.parse(fs.readFileSync(contentPath, "utf8"));
  quiz.engine = {
    ...quiz.engine,
    flow: "staged",
    advance: "automatic",
    feedback: "selection-only",
    scoring: "correct-answer",
    checkpoint: "ai",
    startOnLoad: false,
    rewarded: { start: true, stages: true, attempts: 3, confirmStart: false },
    advanceDelayMs: 450,
    targetRatio: 0.8,
  };
  quiz.listing = { ...quiz.listing, duration: "5 min", difficulty: "Expert" };

  const questions = makeQuestions(slug, pack.questions, pack.categories);
  const content = {
    title: pack.title,
    eyebrow: pack.eyebrow,
    summary: pack.summary,
    progressLabel: "COMPLETE",
    landing: {
      intro: pack.intro,
      socialProof: "81,000+ people played this",
      cta: "Start Test",
      startNote: "Short ad first - then it begins.",
    },
    about: {
      body: `This independent worldwide-English entertainment challenge uses five increasingly demanding sections to explore reasoning styles associated with university entrance puzzles. It does not reproduce a real ${slug[0].toUpperCase() + slug.slice(1)} admissions test and requires no university-specific knowledge.\n\nEvery question has one answer supported by the information shown. Work at your own pace: speed never affects the score, and the challenge becomes harder through additional reasoning rather than obscure facts.\n\nYour final percentage is the share of 40 puzzles solved correctly. It describes this attempt only and is not an admissions prediction, academic qualification or aptitude assessment.`,
      howToPlay: {
        title: "How to Play",
        steps: [
          "Use only the information supplied in each question.",
          "Choose one answer per puzzle; correctness remains hidden until the final reveal.",
          "Continue through all five sections, then reveal your entrance score and answer review.",
        ],
      },
      disclaimer: `Independent entertainment challenge. Not an official ${slug[0].toUpperCase() + slug.slice(1)} admissions test and not affiliated with any university.`,
    },
    results: {
      name: pack.resultName,
      profiles: pack.profiles.map(([min, tier, title, copy]) => ({ min, tier, title, copy })),
      dimensions: pack.dimensions,
      score: {
        passed: `You passed the ${slug[0].toUpperCase() + slug.slice(1)} entrance challenge!`,
        finished: `${slug[0].toUpperCase() + slug.slice(1)} entrance challenge complete`,
        correctLabel: "correct",
        strongest: "Strongest entrance area",
        trickiest: "Trickiest entrance area",
        bestRound: "Best section",
        showPercentage: true,
        showBestRound: true,
        disclaimer: `Independent entertainment challenge. Not an official ${slug[0].toUpperCase() + slug.slice(1)} admissions test and not affiliated with any university.`,
      },
    },
    career: careerFor(pack),
    checkpoint: checkpointFor(pack),
    stages: pack.stages.map(([title], stageIndex) => ({ title, questions: questions.slice(stageIndex * 8, stageIndex * 8 + 8) })),
  };

  fs.writeFileSync(quizPath, `${JSON.stringify(quiz, null, 2)}\n`);
  fs.writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\n`);
  console.log(`Updated ${slug}: ${questions.length} questions`);
}
