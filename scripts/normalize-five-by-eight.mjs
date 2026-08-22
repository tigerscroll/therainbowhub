import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROOT = "data/quizzes";

function read(slug) {
  return JSON.parse(fs.readFileSync(`${ROOT}/${slug}/en.json`, "utf8"));
}

function write(slug, value) {
  fs.writeFileSync(`${ROOT}/${slug}/en.json`, `${JSON.stringify(value, null, 2)}\n`);
}

function historical(slug, sha) {
  return JSON.parse(execFileSync("git", ["show", `${sha}:${ROOT}/${slug}/en.json`], { encoding: "utf8" }));
}

function cleanQuestion(question) {
  const copy = structuredClone(question);
  delete copy.explanation;
  return copy;
}

function combinations(items, choose, start = 0, prefix = [], output = []) {
  if (prefix.length === choose) {
    output.push(prefix);
    return output;
  }
  for (let index = start; index <= items.length - (choose - prefix.length); index += 1) {
    combinations(items, choose, index + 1, [...prefix, items[index]], output);
  }
  return output;
}

function counts(questions) {
  const result = [0, 0, 0, 0];
  for (const question of questions) result[question.correct] += 1;
  return result;
}

function addCounts(a, b) {
  return a.map((value, index) => value + b[index]);
}

function within(actual, target) {
  return actual.every((value, index) => value <= target[index]);
}

function selectAdditions(currentStages, sourceStages, stageMap) {
  const currentQuestions = currentStages.flatMap((stage) => stage.questions);
  const usedIds = new Set(currentQuestions.map((question) => question.id));
  const usedPrompts = new Set(currentQuestions.map((question) => question.question));
  const required = currentStages.map((stage) => 8 - stage.questions.length);
  const targetAdditions = counts(currentQuestions).map((value) => 10 - value);
  const pools = stageMap.map((indices) => {
    const preferred = indices.flatMap((index) => sourceStages[index].questions);
    const unique = [];
    const seen = new Set();
    for (const question of preferred) {
      if (usedIds.has(question.id) || usedPrompts.has(question.question) || seen.has(question.id)) continue;
      seen.add(question.id);
      unique.push(cleanQuestion(question));
    }
    return unique;
  });

  const options = pools.map((pool, stageIndex) => combinations(pool, required[stageIndex])
    .map((questions) => ({ questions, answerCounts: counts(questions) }))
    .filter((option) => within(option.answerCounts, targetAdditions))
    .sort((a, b) => {
      const diversityA = new Set(a.questions.map((question) => question.category)).size;
      const diversityB = new Set(b.questions.map((question) => question.category)).size;
      return diversityB - diversityA;
    })
    .slice(0, 5000));

  function search(stageIndex, accumulated, selected) {
    if (stageIndex === options.length) {
      return accumulated.every((value, index) => value === targetAdditions[index]) ? selected : undefined;
    }
    for (const option of options[stageIndex]) {
      const next = addCounts(accumulated, option.answerCounts);
      if (!within(next, targetAdditions)) continue;
      const result = search(stageIndex + 1, next, [...selected, option.questions]);
      if (result) return result;
    }
    return undefined;
  }

  const selected = search(0, [0, 0, 0, 0], []);
  if (!selected) throw new Error("Could not create a balanced five-by-eight selection.");
  return selected;
}

function expandFromHistory(slug, sha, stageMap) {
  const current = read(slug);
  const source = historical(slug, sha);
  const additions = selectAdditions(current.stages, source.stages, stageMap);
  current.stages.forEach((stage, index) => {
    stage.questions = [...stage.questions.map(cleanQuestion), ...additions[index]];
  });
  write(slug, current);
}

function trimMechanic() {
  const quiz = read("mechanic");
  const target = [10, 10, 10, 10];
  const stageOptions = quiz.stages.map((stage) => combinations(stage.questions, 8)
    .map((questions) => ({ questions, answerCounts: counts(questions) }))
    .sort((a, b) => new Set(b.questions.map((question) => question.category)).size - new Set(a.questions.map((question) => question.category)).size));

  function search(stageIndex, accumulated, selected) {
    if (stageIndex === stageOptions.length) return accumulated.every((value, index) => value === target[index]) ? selected : undefined;
    for (const option of stageOptions[stageIndex]) {
      const next = addCounts(accumulated, option.answerCounts);
      if (!within(next, target)) continue;
      const result = search(stageIndex + 1, next, [...selected, option.questions]);
      if (result) return result;
    }
    return undefined;
  }

  const selected = search(0, [0, 0, 0, 0], []);
  if (!selected) throw new Error("Could not trim Mechanic to a balanced five-by-eight selection.");
  quiz.stages.forEach((stage, index) => { stage.questions = selected[index].map(cleanQuestion); });
  write("mechanic", quiz);
}

const medicalAdditions = [
  [
    ["Which adjustable item lets a patient rest upright or lie flat?", ["Hospital bed", "IV pole", "Privacy screen", "Overbed table"], 0, "bedside_equipment"],
    ["Which wheeled stand is designed to hold fluid bags above a patient?", ["Commode chair", "IV pole", "Walking frame", "Instrument trolley"], 1, "bedside_equipment"],
    ["Which rigid container is made for the safe disposal of used needles?", ["Specimen jar", "Linen hamper", "Sharps container", "Kidney dish"], 2, "specialist_equipment"],
    ["Which shallow curved bowl is commonly used to catch fluids beside a patient?", ["Bedpan", "Medicine cup", "Wash bowl", "Kidney dish"], 3, "bedside_equipment"],
    ["Which portable chair includes a toilet opening for someone who cannot reach a bathroom?", ["Commode chair", "Wheelchair", "Shower stool", "Examination chair"], 0, "patient_mobility"],
    ["Which small basin is shaped to collect vomit or rinse fluid?", ["Instrument tray", "Emesis basin", "Specimen cup", "Sterile bowl"], 1, "bedside_equipment"]
  ],
  [
    ["Which handheld instrument is used to look inside an ear?", ["Ophthalmoscope", "Penlight", "Otoscope", "Reflex hammer"], 2, "examination_tools"],
    ["Which handheld instrument lets a clinician examine the back of the eye?", ["Otoscope", "Dermatoscope", "Tongue depressor", "Ophthalmoscope"], 3, "examination_tools"],
    ["Which small tool is tapped gently to test tendon reflexes?", ["Reflex hammer", "Tuning fork", "Penlight", "Caliper"], 0, "examination_tools"],
    ["Which flat disposable stick is used to hold the tongue down during a mouth check?", ["Swab", "Tongue depressor", "Splint", "Tourniquet"], 1, "examination_tools"],
    ["Which fingertip device displays pulse rate and blood oxygen saturation?", ["Thermometer", "Blood glucose meter", "Pulse oximeter", "Peak flow meter"], 2, "monitoring_devices"],
    ["Which slim light is commonly used to check pupils?", ["Otoscope", "Laryngoscope", "Torch stand", "Penlight"], 3, "examination_tools"]
  ],
  [
    ["Which pair of supports transfers body weight through the arms while walking?", ["Crutches", "Walking frame", "Transfer board", "Grab rails"], 0, "patient_mobility"],
    ["Which four-legged frame gives a broad, stable support while walking?", ["Wheelchair", "Walking frame", "Commode chair", "Stretcher"], 1, "patient_mobility"],
    ["Which wheeled chair is designed for seated mobility?", ["Examination couch", "Shower chair", "Wheelchair", "Bedside chair"], 2, "patient_mobility"],
    ["Which rigid support is fitted around the neck to restrict movement?", ["Arm sling", "Back brace", "Compression sleeve", "Cervical collar"], 3, "patient_mobility"],
    ["Which smooth board helps bridge a short gap during a seated transfer?", ["Transfer board", "Bed board", "Foot plate", "Slide sheet"], 0, "patient_mobility"],
    ["Which close-fitting garment applies graduated pressure to the lower leg?", ["Tubular bandage", "Compression stocking", "Plaster cast", "Knee brace"], 1, "patient_mobility"]
  ],
  [
    ["Which machine records the heart's electrical activity through skin electrodes?", ["Ultrasound scanner", "Infusion pump", "ECG machine", "Nebuliser"], 2, "monitoring_devices"],
    ["Which device is designed to deliver a controlled electrical shock in a cardiac emergency?", ["ECG machine", "Suction machine", "Ventilator", "Defibrillator"], 3, "specialist_equipment"],
    ["Which device turns liquid medicine into a fine mist for breathing?", ["Nebuliser", "Humidifier", "Suction unit", "Flow meter"], 0, "specialist_equipment"],
    ["Which soft face covering can deliver an oxygen-enriched gas mixture?", ["Surgical mask", "Oxygen mask", "Face shield", "Nebuliser cup"], 1, "specialist_equipment"],
    ["Which lightweight tubing rests beneath the nose to deliver oxygen?", ["Feeding tube", "Suction catheter", "Nasal cannula", "Drainage tube"], 2, "specialist_equipment"],
    ["Which machine removes fluid or secretions through negative pressure?", ["Infusion pump", "Oxygen concentrator", "Air mattress pump", "Suction machine"], 3, "specialist_equipment"]
  ],
  [
    ["Which scanner uses sound waves to create images inside the body?", ["Ultrasound scanner", "X-ray machine", "CT scanner", "MRI scanner"], 0, "specialist_equipment"],
    ["Which machine uses ionising radiation to produce a projection image?", ["MRI scanner", "X-ray machine", "Ultrasound scanner", "ECG machine"], 1, "specialist_equipment"],
    ["Which large scanner uses a powerful magnet rather than X-rays?", ["CT scanner", "PET scanner", "MRI scanner", "Fluoroscopy unit"], 2, "specialist_equipment"],
    ["Which ring-shaped scanner creates cross-sectional images using X-rays?", ["MRI scanner", "Ultrasound scanner", "X-ray plate", "CT scanner"], 3, "specialist_equipment"],
    ["Which sealed machine sterilises instruments using pressurised steam?", ["Autoclave", "Incubator", "Centrifuge", "Drying cabinet"], 0, "specialist_equipment"],
    ["Which programmable device controls fluid delivery through intravenous tubing?", ["Suction pump", "Infusion pump", "Nebuliser", "Dialysis monitor"], 1, "specialist_equipment"]
  ]
];

function expandMedical() {
  const quiz = read("medical");
  quiz.stages.forEach((stage, stageIndex) => {
    const additions = medicalAdditions[stageIndex].map(([question, answers, correct, category], questionIndex) => ({
      id: `medical-r${stageIndex + 1}q${questionIndex + 3}`,
      question,
      presentation: "text",
      answers,
      correct,
      category
    }));
    stage.questions = [...stage.questions.slice(0, 2).map(cleanQuestion), ...additions];
  });
  const infusion = quiz.stages[4].questions.find((question) => question.id === "medical-r5q8");
  if (infusion) {
    [infusion.answers[1], infusion.answers[2]] = [infusion.answers[2], infusion.answers[1]];
    infusion.correct = 2;
  }
  write("medical", quiz);
}

function repairChefDuplicates() {
  const quiz = read("chef");
  const source = historical("chef", "ab55081f6b56774c9176b4843939be009df49288");
  const sourceQuestions = new Map(source.stages.flatMap((stage) => stage.questions).map((question) => [question.id, cleanQuestion(question)]));
  const replacements = [
    [1, 6, "chef-r5q4"],
    [2, 6, "chef-r4q1"],
    [4, 7, "chef-r9q3"]
  ];
  for (const [stageIndex, questionIndex, sourceId] of replacements) {
    const replacement = sourceQuestions.get(sourceId);
    if (!replacement) throw new Error(`Missing Chef replacement ${sourceId}.`);
    quiz.stages[stageIndex].questions[questionIndex] = replacement;
  }
  write("chef", quiz);
}

function normalizeCopy(slug) {
  const quiz = read(slug);
  const total = quiz.stages.reduce((sum, stage) => sum + stage.questions.length, 0);
  if (quiz.career) {
    quiz.career.showStageResults = false;
    quiz.career.showResultProgress = true;
    delete quiz.career.compactGate;
    quiz.career.stages.forEach((stage, index) => {
      stage.preAdButton = index === quiz.stages.length - 1 ? (stage.preAdButton || "See My Result") : "Continue";
      if (index < quiz.stages.length - 1) {
        delete stage.preAdChecks;
        if (stage.next) stage.next.button = "Continue";
      }
      else stage.preAdChecks = [`${total} answers checked`, "Final result calculated", "Personal result ready"];
    });
  }
  if (quiz.checkpoint?.finalChecklist) quiz.checkpoint.finalChecklist = [`${total} answers checked`, "Final result calculated", "Personal result ready"];
  const replaceCountCopy = (value) => typeof value === "string"
    ? value
      .replace(/\b30 decisions\b/gi, `${total} answers`)
      .replace(/\b60 questions\b/gi, `${total} questions`)
      .replace(/\bforty interactions\b/gi, `${total} interactions`)
      .replace(/\bten-picture\b/gi, `${total}-item`)
      .replace(/\bten pictures\b/gi, `${total} items`)
      .replace(/\bten points\b/gi, "2.5 points")
      .replace(/\beight correct identifications out of ten\b/gi, "32 correct identifications out of 40")
      .replace(/\bAll six ([^.]+) decisions have been checked\./g, `All eight $1 decisions have been checked.`)
      .replace(/\bexplanations?\b/gi, "answer review")
    : value;
  function walk(value) {
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) value[key] = walk(child);
      return value;
    }
    return replaceCountCopy(value);
  }
  walk(quiz);

  if (slug === "chef") {
    const checkpointCopy = [
      ["Kitchen induction complete", "First kitchen section complete", "Good start. The next kitchen is ready."],
      ["Prep progress captured", "Kitchen challenge progressing", "The next kitchen raises the difficulty."],
      ["Kitchen craft mapped", "More than halfway through", "Advanced service decisions are next."],
      ["Service rush complete", "Final assessment next", "Only the Chef’s Table remains."],
      ["CHEF CHALLENGE COMPLETE", "CHEF CHALLENGE COMPLETE", "Your final Chef result is ready to reveal."]
    ];
    quiz.career.showCurrentScore = false;
    quiz.career.stages.forEach((stage, index) => {
      const [eyebrow, title, copy] = checkpointCopy[index];
      stage.preAdEyebrow = eyebrow.toUpperCase();
      stage.preAdTitle = title;
      stage.preAdCopy = copy;
      for (const band of ["high", "medium", "low"]) {
        if (!stage.resultBands?.[band]) continue;
        stage.resultBands[band].title = title;
        stage.resultBands[band].insight = copy;
      }
      if (index < 4 && stage.next) stage.next.button = "Continue";
    });
    quiz.career.stages[4].preAdButton = "See My Result";
    if (quiz.checkpoint) {
      quiz.checkpoint.adNote = "Short ad first — then continue.";
      quiz.checkpoint.finalAdNote = "Short ad first — then see your result.";
    }
  }
  write(slug, quiz);
}

expandFromHistory("chef", "ab55081f6b56774c9176b4843939be009df49288", [[0, 1], [1, 2], [2, 3, 4], [5, 6, 7], [8, 9]]);
expandFromHistory("grammar", "5283c84fd4e2d75d9b9e7bb21c108ab46d1c237e", [[0, 1], [2, 3], [4, 5], [6, 8], [7, 9]]);
expandFromHistory("vision", "07842adb1dc4aea40d1b235f956799d2576664a6", [[0, 1], [2, 4], [3, 5], [6, 8], [7, 9]]);
trimMechanic();
repairChefDuplicates();

for (const slug of fs.readdirSync(ROOT).filter((name) => fs.existsSync(`${ROOT}/${name}/en.json`))) normalizeCopy(slug);

console.log("Normalised all active quizzes to the shared five-by-eight content contract.");
