import {quiz, calculation, evidence} from './remaining-shared.mjs';
const listening = [
 ['Which question invites a person to describe an event in their own words?', '“What happened next?”', '“You were angry, weren’t you?”', '“It happened exactly as I said, correct?”', '“Why did you definitely cause it?”'],
 ['Someone pauses while describing a difficult event. What is a useful response?', 'Allow time and offer a calm opportunity to continue', 'Immediately fill in the missing details', 'Treat the pause as proof of dishonesty', 'Ask several unrelated questions at once'],
 ['What is active listening?', 'Paying attention and checking your understanding', 'Planning your next speech while ignoring the answer', 'Agreeing with every statement automatically', 'Speaking more loudly than the other person'],
 ['A term is unfamiliar to the listener. What helps?', 'Explain it using clear, familiar words', 'Repeat more unexplained jargon', 'Assume silence proves understanding', 'Make the explanation deliberately longer'],
 ['Two people use the same word differently. What should be clarified?', 'What each person means by the word', 'Which person speaks faster', 'Which word is longest', 'Nothing; identical words always mean identical ideas'],
 ['Which response checks understanding without assuming agreement?', '“Have I understood your concern correctly?”', '“You agree because you nodded”', '“There is no need to explain further”', '“I already know what you meant”'],
 ['A language barrier affects an important discussion. What is the strongest support?', 'An appropriate qualified interpreter', 'Guessing from gestures alone', 'Using a child to translate sensitive details', 'Replacing every sentence with abbreviations'],
];
const fairness = [
 ['A decision affects a close friend. What should a professional recognise?', 'A possible conflict of interest', 'A guarantee of impartiality', 'A reason to hide the relationship', 'An automatic exemption from procedure'],
 ['Which approach treats comparable cases fairly?', 'Apply relevant criteria consistently and consider relevant differences', 'Choose according to personal popularity', 'Change criteria after seeing each person’s name', 'Use appearance as the only criterion'],
 ['A private record is useful for a task. What should determine access?', 'Authorised purpose and applicable access rules', 'General curiosity', 'Whether the person is well known', 'Whether the file is easy to open'],
 ['You discover an error in your own report. What supports accountability?', 'Correct it transparently through the appropriate process', 'Quietly blame another person', 'Delete supporting records', 'Leave it because nobody has noticed'],
 ['What does informed agreement require in a meaningful discussion?', 'Relevant information and an opportunity to understand and choose', 'A signature without any explanation', 'A decision made by an unrelated observer', 'A promise that questions are forbidden'],
 ['A gift could influence a professional decision. What is the appropriate response?', 'Follow the conflict-of-interest and gifts policy', 'Accept secretly to avoid awkwardness', 'Promise favourable treatment', 'Hide the gift from the record'],
 ['A rule applies to everyone in a process. A popular person asks for a private exception. What is appropriate?', 'Use the authorised process for any exception', 'Grant it without recording the reason', 'Change the rule only for that person without explanation', 'Destroy evidence of the request'],
];
const documents = [
 ['Two records describe the same event but give different dates. What should be done?', 'Check the discrepancy against reliable original information', 'Choose the later date automatically', 'Delete both dates', 'Average the dates and treat that as verified'],
 ['Which note separates a statement from a verified fact?', '“Lee reports that the door was open; this has not yet been checked”', '“The door was certainly open because Lee said so”', '“Everyone knows what happened”', '“No check is needed because the story is detailed”'],
 ['Why record who supplied information?', 'So its source can be assessed and followed up', 'To make all information automatically true', 'To remove the need for dates', 'To prove every source is independent'],
 ['A document is a draft. What does that mean?', 'It may still change before being finalised', 'Every statement has been legally certified', 'It is necessarily false', 'It cannot contain useful information'],
 ['A file has been revised several times. What helps identify the current version?', 'A clear version and approval record', 'The most attractive font', 'Whichever copy is easiest to find', 'The longest filename alone'],
 ['An entry is missing from a record. What does that establish by itself?', 'The information is not recorded there', 'The event definitely did not happen', 'The event definitely happened', 'Every other entry is unreliable'],
 ['Why preserve an original record when making an authorised correction?', 'To keep the change traceable', 'To guarantee the original was correct', 'To prevent anyone seeing the correction', 'To make the record harder to understand'],
];
const reasoning = [
 ['A rule says: only members may enter. Sam is not a member. What follows under that rule?', 'Sam may not enter', 'Sam must be admitted first', 'Sam may enter if the queue is short', 'The rule says nothing about Sam'],
 ['Every approved application has a signature. This application has no signature. What follows?', 'It is not approved under the stated rule', 'It is automatically approved', 'All applications lack signatures', 'Every signed application is approved'],
 ['A service opens only on Monday, Wednesday and Friday. Which day is definitely excluded?', 'Tuesday', 'Monday', 'Wednesday', 'Friday'],
 ['Either Room A or Room B is booked, but not both. Room A is booked. What follows?', 'Room B is not booked', 'Room B is also booked', 'Neither room is booked', 'The booking must be cancelled'],
 ['A rule requires both a form and proof of identity. Only the form is present. What is missing?', 'Proof of identity', 'Nothing; one requirement is enough', 'A second copy of the form', 'A document not mentioned in the rule'],
 ['A policy says every urgent request is reviewed today. This request was reviewed today. What can you conclude?', 'It may or may not have been urgent', 'It must have been urgent', 'It cannot have been urgent', 'No urgent requests were reviewed'],
 ['Three meetings happen in order: Ana before Bo, and Bo before Cam. Who meets last?', 'Cam', 'Ana', 'Bo', 'The order cannot be determined'],
];
const review = [
 ['A plan sets a goal but no way to check it. What is missing?', 'A suitable measure of progress', 'A longer title', 'A different page colour', 'An unrelated deadline'],
 ['A decision is based on an old assessment, and circumstances have changed. What is needed?', 'A review using current information', 'Automatic repetition of the old decision', 'Deletion of the new information', 'A decision based on memory alone'],
 ['What is a useful purpose of supervision or professional consultation?', 'To reflect on difficult decisions and improve practice', 'To avoid responsibility for every action', 'To replace all relevant evidence', 'To guarantee nobody can make a mistake'],
 ['A task needs expertise you do not have. What is the appropriate response?', 'Seek suitable advice or referral within the process', 'Pretend to have the qualification', 'Guess without disclosing uncertainty', 'Choose the fastest answer regardless of risk'],
 ['Two team members believe the other will make a follow-up call. What needs to be agreed?', 'Who is responsible and when the action is due', 'Only which phone is newer', 'Only the title of the file', 'Nothing; one will eventually guess'],
 ['A solution worked once. Does that guarantee it will fit every future case?', 'No; relevant circumstances may differ', 'Yes; one success establishes a universal rule', 'Yes; if the solution is easy to remember', 'No; successful ideas can never be reused'],
 ['What makes feedback useful for improvement?', 'Specific observations and a clear next step', 'A personal insult with no example', 'Only a vague label', 'A claim that change is impossible'],
];
const courtroom = [
 ['What is the main purpose of presenting evidence in a hearing?', 'To help establish relevant facts', 'To replace the issue being decided', 'To reward the longest speech', 'To prove popularity'],
 ['What is a witness generally asked to describe?', 'Information relevant to the matter being examined', 'Only what the advocate wishes were true', 'A guaranteed final verdict', 'Private guesses presented as direct observation'],
 ['What is cross-examination in an adversarial hearing?', 'Questioning a witness called by another party', 'Writing the judge’s decision', 'Selecting the furniture', 'Automatically rejecting every document'],
 ['What is a leading question?', 'A question that suggests its desired answer', 'Any question asked first', 'A question that has no words', 'Every open invitation to describe an event'],
 ['What is the difference between an allegation and a finding?', 'An allegation is a claim; a finding is a determination after consideration', 'They always mean exactly the same thing', 'An allegation automatically proves a fact', 'A finding is only a rumour'],
 ['What should a closing argument connect?', 'The relevant evidence and the applicable issues or rules', 'Only the speaker’s personal popularity', 'Unrelated stories with no connection', 'Claims deliberately hidden from the record'],
 ['A witness did not see an event but heard about it later. What distinction matters?', 'First-hand observation versus information from someone else', 'Only the witness’s speaking speed', 'Only the colour of the witness’s clothes', 'No distinction can ever matter'],
];
const precedent = [
 ['In a precedent-based exercise, why compare material facts between cases?', 'To assess whether the earlier reasoning applies', 'To ensure the names are identical', 'To choose the oldest document automatically', 'To avoid reading the rule'],
 ['A hypothetical rule prohibits vehicles except emergency vehicles on duty. Which is expressly excepted?', 'An emergency vehicle on duty', 'Every private car', 'Every parked vehicle', 'Any vehicle with bright paint'],
 ['A rule requires written notice at least 5 days before a meeting. Notice is given 2 days before. Does it satisfy the stated timing rule?', 'No, the notice is too late', 'Yes, any notice is sufficient', 'Yes, because 2 is less than 5', 'The rule requires no notice'],
 ['An earlier decision concerns a signed contract. A new case concerns an unsigned draft. What may matter?', 'Whether the signature difference is material to the reasoning', 'Only whether the paper sizes match', 'Only whether the names rhyme', 'Nothing; all documents are legally identical'],
 ['What does distinguishing a precedent involve?', 'Explaining a relevant difference that limits its application', 'Pretending the decision does not exist', 'Changing its recorded facts', 'Using its title without reading it'],
 ['A supplied rule says an appeal must be filed by 16:00. It is filed at 16:20 with no stated exception. What follows in this exercise?', 'It misses the stated deadline', 'It is early', 'It is exactly on time', 'The deadline has no meaning'],
 ['A case summary omits the reason for the decision. What is most useful to examine next?', 'The court’s reasoning in the decision itself', 'Only the font used in the summary', 'Only the number of people who shared it', 'An unrelated opinion with no source'],
];
const advocacy = [
 ['Which argument directly addresses a claim that a delivery was late?', 'A reliable delivery record showing the relevant date and time', 'The courier’s favourite sport', 'A description of an unrelated delivery', 'The number of words in the contract title'],
 ['A strong argument contains a weak assumption. What improves it?', 'Test the assumption and address its limitations', 'Repeat the conclusion more loudly', 'Hide the assumption from the reader', 'Replace the evidence with confidence'],
 ['What is a concession in an argument?', 'Accepting a point while explaining its significance or limits', 'Automatically abandoning every claim', 'Changing a quotation without disclosure', 'Refusing to address an opposing point'],
 ['What is the problem with attacking a speaker’s appearance instead of their evidence?', 'It does not address whether the evidence supports the claim', 'It always proves the claim false', 'It establishes the event’s date', 'It replaces the need for relevant facts'],
 ['A quotation is accurate but omits a sentence that changes its meaning. What should be checked?', 'The surrounding context', 'Only the number of quotation marks', 'Only the speaker’s height', 'Whether the shortened version is more dramatic'],
 ['Which statement expresses a limitation honestly?', '“This record supports the date, but not who attended”', '“This record proves every disputed fact”', '“Missing information can be assumed in our favour”', '“Uncertainty should never be mentioned”'],
 ['A conclusion goes beyond what the evidence shows. What is the best revision?', 'Narrow it to what the evidence can support', 'Add stronger adjectives', 'Remove the evidence entirely', 'Describe the conclusion as certain without explanation'],
];
const policeScenes = [
 ['At a reported incident, why first assess immediate dangers?', 'To protect people and guide a safe response', 'To establish guilt from the scene alone', 'To avoid gathering any information', 'To guarantee no assistance is needed'],
 ['Two witnesses are discussing their memories together. What risk should an investigator recognise?', 'Their accounts may influence one another', 'Their memories automatically become independent', 'Agreement always proves accuracy', 'Only disagreement can affect reliability'],
 ['Why record the condition and location of an item before moving it when appropriate?', 'To preserve relevant context', 'To make the item heavier', 'To avoid identifying who handled it', 'To replace all other evidence'],
 ['What does chain of custody document?', 'The handling and transfer of an item of evidence', 'The order of people in a public queue', 'Only the item’s estimated price', 'Only a witness’s opinion'],
 ['A person is distressed and struggling to follow questions. What can help?', 'Calm, clear communication with suitable support', 'Several rapid questions at once', 'Treating distress as proof of guilt', 'Adding threats to speed up the account'],
 ['Why avoid announcing an unverified claim as an established fact?', 'It can mislead people and prejudice the assessment', 'Unverified claims are always correct', 'Only written claims can cause confusion', 'Confidence turns a claim into proof'],
 ['A report identifies a vehicle only by colour. What is the limitation?', 'Many vehicles may share that colour', 'Colour uniquely identifies every vehicle', 'The report proves who was driving', 'No further detail can ever help'],
];
const policeJudgment = [
 ['A colleague suggests leaving out evidence that contradicts a theory. What supports a fair investigation?', 'Preserve and report relevant evidence, including contradictions', 'Remove it to simplify the account', 'Alter its date', 'Keep only evidence that agrees'],
 ['Why should questions avoid assuming facts that have not been established?', 'The wording can influence the answer', 'All witnesses prefer complicated questions', 'Assumptions are always correct', 'Questions never affect accounts'],
 ['A crowd gives conflicting descriptions. What is a useful next step?', 'Record accounts and check reliable independent details', 'Choose the most repeated story as proven', 'Let the loudest person decide', 'Assume every account is deliberately false'],
 ['Which detail is most useful in a factual incident description?', 'Observed actions, location and time', 'A guessed personality type', 'A conclusion based only on clothing', 'An unrelated rumour'],
 ['Why should a person’s rights remain relevant during an investigation?', 'Investigative aims do not remove the duty to respect human dignity', 'Rights apply only after a case is solved', 'An allegation automatically removes all rights', 'Public curiosity overrides every safeguard', 'rights'],
 ['A decision must follow a specified procedure. What should uncertainty trigger?', 'Clarification through the appropriate authority or guidance', 'An invented rule', 'A guess based on an unrelated case', 'A hidden shortcut'],
 ['What is an important purpose of recording reasons for a decision?', 'To allow the decision to be understood and reviewed', 'To guarantee the decision can never be questioned', 'To replace relevant evidence', 'To make an error impossible'],
];
const policeDetails = [
 ['A log lists arrival at 08:42 and departure at 09:07. How long was the visit?', '25 minutes', '15 minutes', '35 minutes', '65 minutes'],
 ['A note says the person turned left while facing east. Which direction did they then face?', 'North', 'South', 'West', 'Southeast'],
 ['A receipt is timed 14:10; a verified entry record is timed 14:35 on the same clock. Which happened first?', 'The receipt event', 'The entry event', 'They happened simultaneously', 'The times cannot be ordered'],
 ['There are 6 sealed bags, each containing 4 labelled items. How many items are listed?', '24', '10', '18', '30'],
 ['A location is 2 blocks north and then 1 block west of a starting point. In which general direction is it?', 'Northwest', 'Northeast', 'Southwest', 'Southeast'],
 ['A record describes a blue jacket and black bag. Which description changes only the bag?', 'Blue jacket and red bag', 'Red jacket and black bag', 'Red jacket and red bag', 'Blue jacket and black bag'],
 ['A camera clock is known to be 3 minutes slow. It displays 12:27. What is the actual time?', '12:30', '12:24', '12:27', '12:33'],
];
const assessment = [
 ['What does a strengths-based assessment look for alongside difficulties?', 'Abilities, resources and existing support', 'Only mistakes made in the past', 'Only one professional’s preferences', 'A reason to ignore risks'],
 ['Why ask the person what matters most to them?', 'Their goals and priorities help shape meaningful support', 'Their answer replaces every safety consideration', 'All people want the same outcome', 'Professionals never need other information'],
 ['A family’s situation changes after an assessment. What may be needed?', 'A review of needs and support', 'Automatic use of the old plan forever', 'Deletion of the earlier assessment', 'A conclusion based only on the family name'],
 ['What does considering the social environment add to an assessment?', 'Context such as housing, relationships and available resources', 'Only a person’s eye colour', 'Proof that individual preferences never matter', 'A replacement for listening'],
 ['Which goal is specific enough to review?', '“Confirm an appointment with the housing service by Friday”', '“Make everything better someday”', '“Have no difficulties ever again”', '“Improve without any agreed action”'],
 ['A referral is made to another service. What helps continuity?', 'Clear relevant information, consent where required and an agreed follow-up process', 'Assuming the referral guarantees attendance', 'Sharing every private detail regardless of relevance', 'Closing all communication immediately'],
 ['Why distinguish an unmet need from an unwillingness to accept one particular option?', 'A person may need support but prefer a different appropriate approach', 'Refusing one option proves no need exists', 'Everyone must prefer the first option offered', 'Preferences make assessment impossible'],
];
const safeguarding = [
 ['Someone discloses possible harm. What is an appropriate first response?', 'Listen calmly and take the concern seriously', 'Promise absolute secrecy regardless of risk', 'Blame the person for speaking', 'Demand proof before listening'],
 ['Why explain the limits of confidentiality clearly?', 'Some concerns may require appropriate information sharing', 'All private information should be public', 'Confidentiality never matters', 'It removes every need for professional judgement'],
 ['A concern may involve immediate danger. What should guide the response?', 'Urgency, safety and the relevant safeguarding procedure', 'Only the date of the next routine meeting', 'A promise to keep every detail secret', 'Whether the report is convenient'],
 ['What should a record of a disclosure distinguish?', 'The person’s words, observations and professional interpretation', 'Only the writer’s preferred conclusion', 'Only unrelated background information', 'Assumptions presented as direct quotations'],
 ['A professional is unsure how to handle a safeguarding concern. What is appropriate?', 'Seek prompt guidance through the designated process', 'Ignore the concern until certain', 'Discuss identifying details casually in public', 'Invent an unofficial procedure'],
 ['Why avoid repeated leading questions after a disclosure?', 'They may influence the account and cause additional distress', 'The person’s words are never useful', 'More pressure always improves accuracy', 'Leading questions guarantee the truth'],
 ['A person needs protection and also has views about their support. What should the process consider?', 'Both safety needs and the person’s participation as appropriate', 'Only professional convenience', 'Only the quickest available action', 'The assumption that protection removes all voice'],
];
const boundaries = [
 ['What is a professional boundary intended to protect?', 'The purpose and integrity of the helping relationship', 'The professional’s ability to avoid all questions', 'A guarantee that no emotions are involved', 'The right to ignore the person’s goals'],
 ['A client sends a request through a personal social media account. What should guide the response?', 'The service’s communication and boundary policy', 'A private friendship agreement', 'An unrecorded promise of special access', 'A public discussion of the case'],
 ['A practitioner is emotionally affected by a difficult case. What can support sound practice?', 'Appropriate supervision and support', 'Pretending the impact cannot exist', 'Sharing identifying details with strangers', 'Making every decision alone to prove strength'],
 ['Why use the minimum relevant personal information when sharing a case?', 'To support the purpose while limiting unnecessary disclosure', 'To make the case impossible to understand', 'To hide relevant safety concerns', 'To replace authorisation'],
 ['A person asks for help outside the practitioner’s competence. What is appropriate?', 'Explain the limit and seek suitable support or referral', 'Invent expertise', 'Promise a guaranteed outcome', 'Use another client’s plan without assessment'],
 ['What does reflective practice involve?', 'Examining decisions, assumptions and their effects', 'Assuming every past choice was perfect', 'Replacing evidence with self-confidence', 'Avoiding feedback'],
 ['Why agree how and when support will be reviewed?', 'So progress and changing needs can be considered', 'So the plan can never change', 'So the person need not be involved', 'So every goal is automatically achieved'],
];
const learning = [
 ['A learner can repeat a definition but cannot use it in an example. What may need development?', 'Applying the concept', 'The ability to copy the same sentence', 'The length of the lesson title', 'The number of pens on the desk'],
 ['What is scaffolding in teaching?', 'Temporary support that is adjusted as understanding develops', 'Giving the final answer to every task forever', 'Removing all challenge from learning', 'Using only one explanation for every learner'],
 ['Why connect a new idea to relevant prior knowledge?', 'It can help learners make meaningful connections', 'It guarantees everyone already understands it', 'It makes checking understanding unnecessary', 'It replaces all practice'],
 ['A learner makes the same error repeatedly. What is most useful to investigate?', 'The reasoning or misconception behind the error', 'Only the neatness of the page', 'Whether the answer is written in blue', 'The assumption that effort is always absent'],
 ['What does retrieval practice ask learners to do?', 'Recall information from memory', 'Only reread a page without trying to recall', 'Copy a complete answer while looking at it', 'Avoid revisiting earlier learning'],
 ['What is spaced practice?', 'Revisiting learning across separate periods', 'Completing all practice in one continuous session only', 'Leaving larger gaps between written words', 'Practising only once before a test'],
 ['Why use worked examples when introducing a difficult process?', 'They make the steps and reasoning visible', 'They guarantee no further practice is needed', 'They prevent learners from asking questions', 'They remove the need to understand the goal'],
];
const teachingAssessment = [
 ['What is formative assessment used for?', 'To inform teaching and learning while they are developing', 'Only to produce a final certificate', 'To rank every person permanently', 'To replace all feedback'],
 ['What is a rubric?', 'A set of criteria describing how work will be evaluated', 'A list of unrelated names', 'A guarantee that every answer earns full marks', 'A classroom seating diagram'],
 ['A task aims to assess explanation, but marks are based only on handwriting. What is the problem?', 'The assessment does not match the intended learning', 'Handwriting always proves understanding', 'Clear criteria are unnecessary', 'Explanation cannot be assessed'],
 ['Which feedback gives a learner a usable next step?', '“Explain how this example supports your claim”', '“Be better”', '“This is just wrong”', '“You either have ability or you do not”'],
 ['Only the most confident learners answer aloud. What would give broader evidence of understanding?', 'Ask everyone to respond through a suitable method', 'Assume silence means mastery', 'Use one person’s answer for the entire class', 'Stop checking understanding'],
 ['A learner chooses the correct answer by guessing. What can reveal deeper understanding?', 'Ask for the reasoning or a new application', 'Award permanent mastery from that single answer', 'Ignore all later work', 'Count the number of letters in the answer'],
 ['Why compare performance with clear success criteria?', 'To identify what has been achieved and what needs work', 'To make every learner’s work identical', 'To remove the need for explanation', 'To reward only speed'],
];
const lesson = [
 ['Which learning objective is most observable?', '“Compare two sources and explain one relevant difference”', '“Understand everything”', '“Become perfect at the subject”', '“Think good thoughts”'],
 ['A lesson contains a task before learners have the required background. What should be considered?', 'The sequence and support needed for the task', 'Only the colour of the slides', 'Whether the task title is short', 'Removing all future challenge'],
 ['A learner cannot access a printed text because of its format. What is the best response?', 'Provide an appropriate accessible format while preserving the learning goal', 'Assume the learner cannot understand the topic', 'Lower every learning expectation automatically', 'Ignore the barrier'],
 ['Why give clear instructions before a group task?', 'So learners understand the goal, roles and expected outcome', 'So nobody can ask questions later', 'So every group must work at identical speed', 'So collaboration is unnecessary'],
 ['A group finishes early with strong understanding. What is a useful extension?', 'A deeper application of the same learning goal', 'Unrelated busywork with no learning purpose', 'Repeating an already mastered task indefinitely', 'Removing all future feedback'],
 ['A discussion becomes dominated by one voice. What can improve participation?', 'Use a structure that gives others opportunities to contribute', 'Treat silence as agreement', 'Let the loudest speaker assign every opinion', 'End all discussion permanently'],
 ['What is the purpose of reviewing a lesson afterwards?', 'To use evidence of learning to improve the next steps', 'To prove the original plan could not be improved', 'To ignore unexpected difficulties', 'To focus only on how long the slides were'],
];
export const socialQuizzes = {
 barrister: quiz('legal reasoning and advocacy', [
  ['Inside the courtroom','courtroom_basics',courtroom], ['Follow the evidence','evidence_advocacy',evidence], ['Rules and precedents','precedent_reasoning',precedent], ['Asking clear questions','evidence_advocacy',listening], ['Professional judgement','professional_principles',fairness], ['Documents and records','evidence_advocacy',documents], ['Reasoning from rules','precedent_reasoning',reasoning], ['Time and quantities','precedent_reasoning',calculation], ['Building an argument','evidence_advocacy',advocacy], ['Reviewing a decision','professional_principles',review],
 ], {}, 'Legal systems differ. Rule-based scenarios state their own rules and do not describe the law of a particular country.'),
 police: quiz('observation and investigative judgement', [
  ['At the scene','situational_judgment',policeScenes], ['Listen and clarify','communication',listening], ['Follow the evidence','evidence',evidence], ['Integrity in practice','integrity',fairness], ['Accurate records','evidence',documents], ['Details and timelines','evidence',policeDetails], ['Reasoning from rules','situational_judgment',reasoning], ['Numbers and distances','situational_judgment',calculation], ['Investigative judgement','integrity',policeJudgment], ['Review and follow-up','communication',review],
 ], {}, 'Scenarios test observation, fairness and stated rules, not powers or procedures specific to any jurisdiction.'),
 socialworker: quiz('thoughtful social work practice', [
  ['Listening with purpose','communication',listening], ['Understanding needs','assessment',assessment], ['Ethics and fairness','ethics',fairness], ['Safeguarding concerns','safeguarding',safeguarding], ['Reliable information','assessment',evidence], ['Clear records','professional_practice',documents], ['Professional boundaries','professional_practice',boundaries], ['Practical calculations','assessment',calculation], ['Following stated rules','ethics',reasoning], ['Reviewing the support plan','professional_practice',review],
 ], {}, 'Safeguarding actions depend on local law and service procedures; these questions test general professional reasoning.'),
 teacher: quiz('teaching and learning', [
  ['How learning develops','teaching_learning',learning], ['Checking understanding','assessment',teachingAssessment], ['Listening and explaining','communication',listening], ['Planning an inclusive lesson','teaching_learning',lesson], ['Fair professional decisions','communication',fairness.map(row => [...row.slice(0,5), undefined, 'communication'])], ['Safeguarding in practice','safeguarding',safeguarding], ['Evidence and claims','assessment',evidence], ['Practical numeracy','numeracy_literacy',calculation], ['Reading rules carefully','numeracy_literacy',reasoning], ['Reflection and next steps','teaching_learning',review],
 ], {}, 'Examples use general learning principles and stated rules. Safeguarding follows the relevant local procedures.'),
};
