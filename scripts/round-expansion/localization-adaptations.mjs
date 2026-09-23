// Equivalent editing/meaning tasks where English-only morphology would not survive translation.
// All options are grammatical: machine translation must not repair an intentionally wrong option.
// Existing native-language questions and the six full native grammar banks take precedence.
export const grammarMeaning = {
 'grammar-r2q3': ['Which sentence expresses a contrast?', ['The path dried because the sun came out.','The sun came out, so the path dried.','The path dried after the rain stopped.','The rain stopped, but the path was still slippery.']],
 'grammar-r10q1': ['Which sentence describes one item rather than several?', ['The folders are on the counter.','The list is on the counter.','The notebooks are on the counter.','The reports are on the counter.']],
 'grammar-r1q4': ['Which sentence explicitly says who corrected the caption?', ['Nora thanked someone for the correction.','The caption was corrected, and Nora was grateful.','Nora thanked Priya for correcting the caption.','Nora was pleased that the caption had been corrected.'], 'Nora thanked Priya after Priya corrected the caption.'],
 'grammar-r1q5': ['Which sentence means that the report is both short and easy to understand?', ['The report is brief but confusing.','The report is concise and clear.','The report is detailed but confusing.','The report is clear but very long.']],
 'grammar-r3q2': ['Which sentence matches the situation?', ['Asha left the library on Monday.','Asha began working at the library on Monday and still works there.','Asha will start at the library next Monday.','Asha worked at the library only on Monday.'], 'Asha started at the library on Monday and still works there now.'],
 'grammar-r3q5': ['Which sentence gives the award to the documentary rather than the director?', ['The award-winning director introduced a documentary.','The director received an award for introducing the documentary.','The director won an award before introducing the documentary.','The director introduced the award-winning documentary.'], 'The documentary won an award. The director introduced it.'],
 'grammar-r3q6': ['Which sentence says that the technicians had no outside help?', ['The technicians asked an expert to complete the review.','The technicians completed the review without help from anyone else.','The technicians completed the review with help from an expert.','The technicians gave the unfinished review to another team.']],
 'grammar-r4q1': ['Which instruction clearly requires all three items?', ['Bring a notebook, a pen and identification.','Bring a notebook or a pen instead of identification.','Bring identification, but leave the notebook and pen at home.','Bring a notebook; a pen and identification are optional.']],
 'grammar-r10q4': ['Which label says that the lockers belong to several chefs?', ['Lockers for one chef','Lockers for visitors','Lockers shared by the chefs','Lockers for kitchen equipment']],
 'grammar-r5q1': ['Which sentence locates the deadline precisely?', ['The deadline is somewhere in the policy.','The deadline is in the first section.','The deadline appears in the second section of the policy.','The deadline is not included in the policy.'], 'The policy has two sections. The second section contains the deadline.'],
 'grammar-r5q5': ['Which sentence says that missing labels caused the delay?', ['The labels went missing after the boxes were delayed.','The boxes arrived on time despite the missing labels.','The boxes were delayed because the labels were missing.','The boxes were delayed, but the labels had nothing to do with it.']],
 'grammar-r6q1': ['Which sentence preserves the restriction?', ['All folders were archived.','No folders were archived.','All folders except the blue ones were archived.','Only the blue folders were archived.'], 'The blue folders were archived. Every other folder remained active.'],
 'grammar-r10q5': ['Which instruction clearly requires every visitor to do all three things?', ['Sign in or wear a badge; returning it is optional.','Sign in, wear a badge and return it before leaving.','Sign in and wear a badge only if you want to.','Wear a badge, but do not sign in or return it.']],
 'grammar-r9q5': ['Only the first report was revised. Which sentence states this exactly?', ['Only the editor revised the reports.','The editor revised the first report and the second report.','The editor revised every report except the first.','The editor revised only the first report.']],
 'grammar-r7q3': ['Which sentence combines the facts without changing their meaning?', ['The room was ready except for the missing chairs; the guests arrived at noon.','The room was completely ready, including every chair, before noon.','The guests arrived before noon and brought all the missing chairs.','The chairs were ready, but the room was not.'], 'The room was ready apart from the missing chairs. The guests arrived at noon.'],
 'grammar-r7q4': ['Which sentence preserves the intended meaning?', ['The speaker answered none of the questions.','The speaker answered exactly half of the questions.','The speaker answered every question without exception.','The speaker answered almost all of the questions.'], 'The speaker answered nearly every question, but left a few unanswered.'],
 'grammar-r8q1': ['Which sentence contrasts two facts without claiming that one caused the other?', ['The doors opened, but nobody entered.','Nobody entered because the doors opened.','The doors opened so that nobody could enter.','Nobody entered, causing the doors to open.']],
 'grammar-r8q3': ['Which description makes the ownership clear?', ['A handle that belongs to a window','A handle kept beside the door','The handle belonging to the door','A handle that does not belong to the door'], 'The handle belongs to one door.'],
 'grammar-r8q4': ['Which sentence says that the designers did the work personally?', ['The designers hired another team to prepare the display.','The designers prepared the display themselves.','The designers asked the visitors to prepare the display.','The designers left the display for someone else to prepare.']],
 'grammar-r8q5': ['Which sentence matches the change?', ['The number nearly doubled.','The number exactly doubled.','The number more than doubled.','The number fell to half its original size.'], 'The number increased to almost twice its original size, but did not quite double.'],
};

export const portablePuzzles = {
 chef: {
  'chef-r1q3': {question:'Which method cooks food in vapour above simmering water?',answers:{a1:'Steaming above hot water',a2:'Roasting with hot air in an oven',a3:'Grilling over direct heat',a4:'Sautéing in a little hot fat'}},
 },
 raf: {
  'raf-round4-new1': {question:'Which aircraft type is associated with vertical lift using a main rotor?',answers:{a1:'Helicopter',a2:'Glider',a3:'Conventional jet fighter',a4:'Hot-air balloon'}},
 },
 airforce: {
  'airforce-round1-new3': {question:'Which flight instrument shows how far the aircraft nose is tilted up or down and how far its wings are tilted sideways?',answers:{a1:'Artificial-horizon instrument',a2:'Fuel gauge',a3:'Clock',a4:'Outside-air thermometer'}},
  'airforce-round2-new1': {question:'In aviation, what motion does the term yaw describe?',answers:{a1:'Turning about the vertical axis, with the nose moving left or right',a2:'Rolling about the axis running from nose to tail',a3:'Moving straight upward without turning',a4:'Changing the engine speed without turning'}},
  'airforce-round2-new2': {question:'On a conventional airplane, which control surface mainly raises or lowers the nose?',answers:{a1:'Horizontal tail control surface (elevator)',a2:'Wing roll-control surface (aileron)',a3:'Vertical tail control surface (rudder)',a4:'Upright extension at the wing tip (winglet)'}},
 },
 pilot: {
  'pilot-round1-new2': {question:'Which flight instrument shows how far the aircraft nose is tilted up or down and how far its wings are tilted sideways?',answers:{a1:'Artificial-horizon instrument',a2:'Fuel gauge',a3:'Clock',a4:'Compass alone'}},
  'pilot-round1-new4': {question:'Which control surface mainly turns the nose left or right about the vertical axis?',answers:{a1:'Vertical tail control surface (rudder)',a2:'Horizontal tail control surface (elevator)',a3:'Wing roll-control surface (aileron)',a4:'Wing flap alone'}},
  'pilot-round3-new3': {question:'What movement does the horizontal tail control surface called the elevator mainly control?',answers:{a1:'Tilting the nose upward or downward',a2:'Turning the nose left or right about the vertical axis',a3:'Changing fuel pressure',a4:'Changing cabin temperature'}},
  'pilot-round3-new4': {question:'An aerodynamic stall is a loss of lift caused primarily by what?',answers:{a1:'The wing exceeding its critical angle relative to the oncoming airflow',a2:'The engine always stopping',a3:'Flying below one speed that applies to every aircraft',a4:'A compass failure'}},
 },
 word: {
  'word-round4-new3': {question:'Which pair of words describes opposite movements?',answers:{a1:'Ascend and descend',a2:'Read and write',a3:'Watch and listen',a4:'Build and repair'}},
  'word-round4-new4': {question:'A prefix is added to the beginning of a word. Where is a suffix added?',answers:{a1:'At the end of the word',a2:'Before the first letter',a3:'In place of every vowel',a4:'Between every pair of letters'}},
  'word-round5-new3': {question:'Which completes the relationship: trunk is to tree as stem is to ...?',answers:{a1:'Flower',a2:'Engine',a3:'Harbour',a4:'Lens'}},
  'word-round5-new4': {question:'Which word completes the relationship: question is to answer as problem is to ...?',answers:{a1:'Solution',a2:'Carpet',a3:'Ladder',a4:'Pencil'}},
 },
 iq: {
  'iq-s1q3': {question:'The first pair contains opposites. Which word completes the second pair?',visual:{items:['START → FINISH','DAY → ?'],ariaLabel:'Start is the opposite of finish. What is the opposite of day?'},answers:{a1:'Night',a2:'Morning',a3:'Noon',a4:'Afternoon'}},
  'iq-s4q5': {question:'Three words name parts of a tree. Which word does not belong?',answers:{a1:'Roots',a2:'Trunk',a3:'Branches',a4:'River'}},
 },
};

export const contextualSource = {
 'Fish → School':'Fish → Group of fish',
 'NEXT ROUND':'NEXT QUIZ ROUND',
 'Final Proof':'Final Proofreading',
 'FINAL PROOF':'FINAL PROOFREADING',
 'Grammar Trapdoors':'Tricky Grammar',
 'GRAMMAR TRAPDOORS':'TRICKY GRAMMAR',
 'Precision Pass':'Precise Wording',
 'REASONING TRAPDOORS':'TRICKY REASONING',
 'The Intelligence Vault':'The Final Reasoning Challenge',
 'THE INTELLIGENCE VAULT':'THE FINAL REASONING CHALLENGE',
 'The Natural Grammarian':'A Talent for Grammar',
 'The Grammar Detective':'A Curious Grammar Learner',
};

export function clearSource(input){
 let s=contextualSource[input]??input;
 s=s.replace(/\bbreakdown\b/gi,'answer review')
  .replace(/\bControls and Headings\b/gi,'Aircraft Controls and Directions')
  .replace(/\bWeather and Headings\b/gi,'Weather and Flight Directions')
  .replace(/\bheadings\b/gi,'compass directions')
  .replace(/\bGrammar Trapdoors\b/gi,'Tricky Grammar')
  .replace(/\bInterview Trapdoors\b/gi,'Tricky Interview Questions')
  .replace(/\bReasoning Trapdoors\b/gi,'Tricky Reasoning')
  .replace(/\bFinal Proof\b/gi,'Final Proofreading');
 if(/^Explore .* across five six-question rounds\.$/.test(s))s='Explore this topic in five rounds, with six questions in each round.';
 s=s.replace(/^Five rounds offer different angles on this challenge: [^.]+\. Each round contains six distinct questions\./,'This quiz has five rounds, with six different questions in each round.');
 s=s.replace(/The target is 24 correct answers out of 30\./,'Try to answer at least 24 of the 30 questions correctly.');
 if(s.endsWith(' complete')&&!s.startsWith('Round '))s=`Round completed: ${s.slice(0,-9)}`;
 if(s==='Take on the next six questions.')s='Continue with six more questions.';
 return s;
}

export const finalReasoningTitles={ar:'تحدي الاستدلال الأخير',bg:'Финално логическо предизвикателство',cs:'Závěrečná logická výzva',da:'Den sidste logiske udfordring',de:'Die letzte Denkaufgabe',el:'Η τελική πρόκληση λογικής',es:'El reto final de razonamiento',fi:'Viimeinen päättelyhaaste',fil:'Huling Hamon sa Pangangatwiran',fr:'Le défi final de raisonnement',he:'אתגר החשיבה האחרון',hr:'Završni izazov zaključivanja',hu:'Az utolsó logikai kihívás',id:'Tantangan Penalaran Terakhir',it:'La sfida finale di ragionamento',ja:'最後の推理チャレンジ',ms:'Cabaran Penaakulan Terakhir',nb:'Den siste logikkutfordringen',nl:'De laatste denkuitdaging',pl:'Ostatnie wyzwanie logiczne',pt:'O desafio final de raciocínio',ro:'Provocarea finală de logică',sk:'Záverečná logická výzva',sr:'Завршни логички изазов',sv:'Den sista logikutmaningen',th:'บททดสอบตรรกะรอบสุดท้าย',tr:'Son Mantık Mücadelesi',uk:'Останній логічний виклик',vi:'Thử thách suy luận cuối cùng'};
