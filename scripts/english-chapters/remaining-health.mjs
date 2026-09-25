import {quiz, sourceBank} from './remaining-shared.mjs';
import {body, infection, communication, records, numbers, observation, sources, healthNote} from './health-shared.mjs';
const anatomy = rows => sourceBank('anatomy', rows);
const dental = rows => sourceBank('dental', rows);
const physiology = anatomy([
 ['What is the main function of haemoglobin in red blood cells?', 'Transporting oxygen', 'Producing bile', 'Digesting starch', 'Building tooth enamel'],
 ['Which hormone helps lower blood glucose by promoting uptake and storage?', 'Insulin', 'Adrenaline', 'Glucagon', 'Melatonin'],
 ['Which process moves water across a selectively permeable membrane?', 'Osmosis', 'Blood clotting', 'Bone remodelling', 'Ventilation'],
 ['What prevents blood from flowing backwards through the heart?', 'Heart valves', 'Alveoli', 'Tendons', 'Nephrons'],
 ['Which organ produces bile?', 'Liver', 'Gallbladder', 'Spleen', 'Urinary bladder'],
 ['When body temperature rises, sweating helps cooling mainly through what?', 'Evaporation', 'Bone growth', 'Blood clot formation', 'Increased tooth mineralisation'],
 ['What is negative feedback in body regulation?', 'A response that opposes a change from the regulated range', 'A response that always amplifies a change', 'The complete absence of a response', 'A conscious criticism of an action'],
]);
const cells = anatomy([
 ['Which structure contains most of the DNA in a typical human cell?', 'Nucleus', 'Cell membrane', 'Ribosome', 'Lysosome'],
 ['Which structures make proteins?', 'Ribosomes', 'Chromosomes alone', 'Centrioles', 'Lipid droplets'],
 ['What is a major role of mitochondria?', 'Producing usable cellular energy', 'Storing urine', 'Making tooth enamel outside cells', 'Carrying air into the lungs'],
 ['What forms the main boundary of a human cell?', 'Cell membrane', 'Cellulose wall', 'Bone capsule', 'Keratin shell'],
 ['What is diffusion?', 'Net movement of particles from higher to lower concentration', 'Movement that always requires a heart', 'The copying of all chromosomes', 'The conversion of every liquid into a gas'],
 ['What happens during mitosis in a typical human body cell?', 'Duplicated chromosomes are separated into two nuclei', 'All genetic material is destroyed', 'Two eggs fuse', 'Only the cell membrane is copied'],
 ['Which molecule carries inherited genetic instructions?', 'DNA', 'Glucose', 'Cholesterol', 'Water'],
]);
const tissues = anatomy([
 ['Which tissue covers surfaces and lines many body cavities?', 'Epithelial tissue', 'Skeletal muscle tissue', 'Nervous tissue', 'Bone tissue'],
 ['Which tissue is specialised for contraction?', 'Muscle tissue', 'Adipose tissue', 'Cartilage', 'Enamel'],
 ['What connects a muscle to a bone?', 'Tendon', 'Ligament', 'Artery', 'Nerve cell body'],
 ['What connects one bone to another at a joint?', 'Ligament', 'Tendon', 'Vein', 'Salivary duct'],
 ['Which tissue stores much of the body’s energy as fat?', 'Adipose tissue', 'Enamel', 'Nervous tissue', 'Epidermis'],
 ['What is a neuron specialised to do?', 'Receive and transmit signals', 'Filter urine in the bladder', 'Produce bile in the stomach', 'Store air in bone'],
 ['Which description places structures in order from smaller to larger?', 'Cell, tissue, organ, organ system', 'Organ, cell, tissue, organ system', 'Tissue, organ system, cell, organ', 'Organ system, tissue, organ, cell'],
]);
const microbes = sourceBank('microbiology', [
 ['Which infectious agents need host cells to reproduce?', 'Viruses', 'All fungi', 'All free-living bacteria', 'All protozoa'],
 ['Which group includes yeasts and moulds?', 'Fungi', 'Viruses', 'Worms only', 'Human blood cells'],
 ['What does a culture test attempt to grow from a sample?', 'Microorganisms', 'Antibodies alone', 'Bone fragments', 'Electrical signals'],
 ['What is antibiotic resistance?', 'Bacteria can survive medicines that would normally inhibit or kill them', 'The body becomes immune to every medicine', 'A virus becomes a bacterium', 'Every infection becomes an allergy'],
 ['Which organisms normally live on and in a healthy human body?', 'A varied microbiota', 'Only disease-causing viruses', 'No microorganisms at all', 'Only organisms found in soil'],
 ['Which process destroys all forms of microbial life, including bacterial spores, when correctly performed?', 'Sterilisation', 'Rinsing with water alone', 'Wiping with a dry cloth', 'Refrigeration'],
 ['What can contaminated hands do in the chain of infection?', 'Transfer microorganisms between surfaces and people', 'Make every microorganism visible', 'Prevent all indirect transmission', 'Change every virus into a fungus'],
]);
const medicines = [
 ['An analgesic is intended primarily to reduce what?', 'Pain', 'Bone length', 'Tooth number', 'Hearing frequency'],
 ['An antipyretic is used primarily to reduce what?', 'Fever', 'Height', 'Blood group', 'Joint number'],
 ['What does a medicine’s route of administration describe?', 'How it enters the body', 'The road to the pharmacy', 'Only its brand name', 'Only its colour'],
 ['What is a medicine interaction?', 'One substance changes the effect of another', 'Two packages have the same colour', 'A label has two languages', 'A tablet is moved to a shelf'],
 ['What is an adverse effect?', 'An unwanted harmful effect associated with a treatment', 'The intended benefit only', 'The cost printed on a receipt', 'The name of a manufacturer'],
 ['Why distinguish a medicine’s generic name from its brand name?', 'Different brands may contain the same active ingredient', 'Every brand always contains a different ingredient', 'Generic names describe only package size', 'Brand names identify blood groups'],
 ['A medicine label is unclear. What should happen before administration?', 'Clarify it through the appropriate qualified professional', 'Guess from the tablet colour', 'Use another person’s prescription', 'Assume all similar packages are identical', 'rights'],
];
const tests = [
 ['What does an electrocardiogram record?', 'The heart’s electrical activity', 'Bone mineral density', 'Kidney size', 'Lung volume alone'],
 ['What does a biopsy remove for examination?', 'A tissue sample', 'A recorded heartbeat', 'Only air from a room', 'A printed symptom score'],
 ['Which imaging method uses sound waves?', 'Ultrasound', 'X-ray imaging', 'Computed tomography', 'Standard photography'],
 ['What does a blood glucose test measure?', 'Glucose concentration in blood', 'The number of bones', 'The volume of the lungs', 'The length of a nerve'],
 ['A test has a false positive result. What does that mean?', 'It indicates a condition that is not actually present', 'It misses a condition that is present', 'It has no result recorded', 'It measures only positive numbers'],
 ['Why check the patient identifier on a specimen?', 'To connect the result to the correct person', 'To predict the result from the name', 'To replace the sample collection time', 'To make every result identical', 'rights'],
 ['A result differs sharply from earlier results and the sample label is uncertain. What needs attention?', 'The sample identity and the result need verification', 'The newest number must be correct without checking', 'The earlier record should be deleted', 'The patient’s symptoms can now be ignored', 'rights'],
];
const reasoning = [
 ['Two people have a headache. Does that alone establish the same cause?', 'No; the same symptom can have different causes', 'Yes; each symptom has exactly one cause', 'Yes; if they use the same word', 'No; symptoms can never help assessment'],
 ['Which is a symptom reported by a person?', 'Feeling nauseated', 'A measured temperature of 38 °C', 'A recorded pulse of 90 per minute', 'A visible wound described by an examiner'],
 ['Which is an objective measurement?', 'A measured mass of 68 kg', 'Feeling unusually tired', 'Reporting a bitter taste', 'Describing a throbbing pain'],
 ['A study finds an association between two variables. What additional claim does that alone not establish?', 'That one variable causes the other', 'That the variables were compared', 'That an association was observed in the study', 'That more investigation may be useful'],
 ['A person reports an allergy that is absent from the chart. What is the appropriate response?', 'Clarify and record the information through the care process', 'Assume the blank chart disproves the report', 'Ignore it unless another patient agrees', 'Treat all allergies as identical', 'rights'],
 ['A patient’s new symptoms conflict with a reassuring earlier note. Which information matters?', 'Both the earlier context and the new change', 'Only the earlier note', 'Only the spelling in the note', 'Neither; disagreement proves nothing happened'],
 ['Which explanation communicates uncertainty honestly?', '“This finding has several possible causes and needs assessment”', '“One symptom proves the diagnosis”', '“No test can ever be wrong”', '“Questions are unnecessary because a number is available”', 'rights'],
];
const operativeAnatomy = anatomy([
 ['In anatomical position, what does medial mean?', 'Toward the body’s midline', 'Away from the midline', 'Toward the skin surface only', 'Toward the feet only'],
 ['What does proximal mean when describing a limb?', 'Closer to its attachment to the body', 'Farther from its attachment', 'Always behind the body', 'Always below the knee'],
 ['Which cavity contains the lungs?', 'Thoracic cavity', 'Pelvic cavity', 'Cranial cavity', 'Spinal canal'],
 ['Which membrane lines much of the abdominal cavity?', 'Peritoneum', 'Pleura', 'Meninges', 'Eardrum'],
 ['What carries blood away from the heart?', 'Arteries', 'Veins', 'Lymphatic vessels only', 'Tendons'],
 ['What is the mesentery associated with?', 'Supporting parts of the intestine and carrying vessels and nerves', 'Covering the outside of the skull', 'Making tooth enamel', 'Separating the chambers of the heart'],
 ['Which term means closer to the body’s surface?', 'Superficial', 'Deep', 'Distal', 'Inferior'],
]);
const surgicalTerms = [
 ['What is an incision?', 'A surgical cut', 'A blood test result', 'A naturally occurring hormone', 'A type of bone joint'],
 ['What is the purpose of a suture?', 'To hold tissues together', 'To measure blood pressure', 'To record heart rhythm', 'To generate ultrasound images'],
 ['What does a surgical retractor do?', 'Holds tissue aside to improve access or visibility', 'Measures blood glucose', 'Makes every instrument sterile', 'Replaces a patient identity check'],
 ['What is haemostasis?', 'Control of bleeding', 'Removal of all body heat', 'Formation of tooth enamel', 'Measurement of hearing'],
 ['What does laparoscopic surgery typically use?', 'Small incisions and a camera to view the operative area', 'Sound waves as the only cutting instrument', 'No instruments of any kind', 'Only a blood sample'],
 ['What is a graft?', 'Tissue moved to another site', 'An electrical heart tracing', 'A spoken consent form', 'A unit of blood pressure'],
 ['What does excision mean?', 'Removal by cutting out', 'Joining two structures without removal', 'Measuring temperature', 'Giving oxygen through a mask'],
];
const checklist = sourceBank('surgery', [
 ['Before surgery, why confirm the patient, procedure and intended site together?', 'To prevent wrong-patient, wrong-procedure or wrong-site errors', 'To replace every other safety check', 'To decide the patient’s favourite colour', 'To make consent unnecessary'],
 ['What is the purpose of a surgical team pause before an incision?', 'To confirm critical information together', 'To stop communication during the operation', 'To let one person guess the whole plan', 'To skip reviewing anticipated difficulties'],
 ['Why should team members know one another’s names and roles?', 'To support clear coordination', 'To replace instrument checks', 'To avoid speaking during concerns', 'To make documentation optional'],
 ['An instrument count does not match the expected count. What should happen?', 'The discrepancy must be resolved using the safety procedure', 'Assume the missing item was never present', 'Change the expected count without checking', 'Ignore the count if everyone is busy'],
 ['Why label a tissue specimen with verified identifying details?', 'To connect the specimen with the correct patient and site', 'To predict the diagnosis from the handwriting', 'To remove the need for laboratory examination', 'To make all specimens interchangeable'],
 ['A team member notices a possible safety problem. What supports safer teamwork?', 'Speaking up promptly and clearly', 'Waiting until everyone has left', 'Assuming rank makes mistakes impossible', 'Hiding uncertainty to sound confident'],
 ['What belongs in a postoperative handover?', 'Relevant procedure details, concerns and the agreed recovery plan', 'Only the room number', 'Only the length of the operation', 'An assurance that monitoring is never needed'],
]);
const healing = anatomy([
 ['What is a main early role of a blood clot at a wound?', 'Limiting blood loss and forming a temporary seal', 'Replacing all future skin growth', 'Removing every microorganism instantly', 'Preventing any immune response'],
 ['Which protein is important in the structural strength of healing tissue?', 'Collagen', 'Haemoglobin', 'Insulin', 'Melatonin'],
 ['What does inflammation bring to an injured area?', 'Immune cells and changes in local blood flow', 'Only new bone cells in every tissue', 'A guarantee that infection is present', 'Permanent loss of every blood vessel'],
 ['Why can inadequate blood supply impair healing?', 'Tissues need oxygen and nutrients', 'Blood prevents all cell growth', 'Wounds heal only when completely dry internally', 'Oxygen always destroys new tissue'],
 ['What is scar tissue?', 'Repair tissue rich in fibrous connective material', 'A new internal organ', 'A pocket of air in every wound', 'An unchanged piece of original tooth enamel'],
 ['What does wound dehiscence mean?', 'Separation of a previously closed wound', 'Normal growth of a fingernail', 'A fall in room temperature', 'A routine pulse measurement'],
 ['Why does wound healing take more than one moment?', 'Several overlapping biological processes must occur', 'Cells can repair tissue only once a year', 'Every wound follows an identical clock', 'Healing is only a change in skin colour'],
]);
const perioperative = [
 ['What does preoperative mean?', 'Before an operation', 'During an operation', 'After an operation', 'Unrelated to an operation'],
 ['What does postoperative mean?', 'After an operation', 'Before an operation', 'Only while making an incision', 'Only during medical school'],
 ['A fasting instruction conflicts with another instruction in the record. What is the safest response?', 'Clarify the instructions with the responsible team', 'Invent a universal fasting time', 'Follow the shorter instruction without checking', 'Let another patient decide'],
 ['Why assess pain during recovery?', 'To understand the person’s needs and guide the care plan', 'To prove everyone heals at the same rate', 'To replace all other observations', 'To assume silence always means no pain'],
 ['A recovering patient develops new breathing difficulty. What is needed?', 'Prompt assessment by the appropriate clinical team', 'Waiting for a routine appointment without reporting it', 'Assuming it is always normal', 'Relying only on yesterday’s observations', 'emergency'],
 ['Why include mobility and activity instructions in discharge information?', 'Recovery needs vary with the person and procedure', 'Every operation has the same recovery plan', 'The instructions replace all follow-up', 'Activity has no relationship to recovery'],
 ['Which discharge explanation best checks understanding?', 'Ask the person to explain the plan and when to seek help', 'Hand over unexplained abbreviations only', 'Assume a signature proves understanding', 'Ask them not to ask questions', 'rights'],
];
const teeth = dental([
 ['Which teeth are shaped mainly for cutting food?', 'Incisors', 'Molars', 'Premolars', 'Wisdom teeth only'],
 ['Which teeth have pointed crowns suited to tearing food?', 'Canines', 'Central incisors', 'Second molars', 'Third molars'],
 ['Which teeth have broad chewing surfaces for grinding?', 'Molars', 'Canines', 'Incisors', 'All teeth have a single sharp point'],
 ['How many teeth are in a complete primary dentition?', '20', '16', '28', '32'],
 ['How many teeth are in a complete adult dentition including all third molars?', '32', '20', '24', '36'],
 ['What is another name for third molars?', 'Wisdom teeth', 'Milk incisors', 'First premolars', 'Central canines'],
 ['What is mixed dentition?', 'Primary and permanent teeth are both present', 'Only permanent molars are present', 'No teeth are present', 'All teeth have identical shapes'],
]);
const toothStructure = dental([
 ['What covers the visible crown of a healthy tooth?', 'Enamel', 'Cementum', 'Pulp', 'Gum tissue only'],
 ['Which layer lies beneath enamel?', 'Dentine', 'Pleura', 'Cartilage', 'Epidermis'],
 ['What is inside the dental pulp?', 'Blood vessels and nerves', 'Only air', 'Only enamel crystals', 'A layer of skin'],
 ['What normally covers the root surface?', 'Cementum', 'Enamel', 'Saliva alone', 'Tongue tissue'],
 ['What helps attach a tooth to the surrounding socket?', 'Periodontal ligament', 'Achilles tendon', 'Optic nerve', 'Vocal cord'],
 ['What is the gingiva?', 'The gums around the teeth', 'The centre of the tongue', 'The floor of the stomach', 'The enamel at a cusp'],
 ['What is the alveolar bone’s role around teeth?', 'Supporting their sockets', 'Making saliva', 'Moving the tongue directly', 'Producing taste signals'],
]);
const mouth = dental([
 ['What helps lubricate food and begin digestion in the mouth?', 'Saliva', 'Bile', 'Urine', 'Cerebrospinal fluid'],
 ['Which enzyme in saliva begins starch digestion?', 'Amylase', 'Pepsin', 'Lactase only', 'Lipase only'],
 ['What is the hard palate?', 'The bony front portion of the roof of the mouth', 'The tip of the tongue', 'The lower border of the jaw', 'The centre of a tooth'],
 ['Which bone forms the lower jaw?', 'Mandible', 'Maxilla', 'Clavicle', 'Scapula'],
 ['Which bones form the upper jaw?', 'Maxillae', 'Mandible', 'Ribs', 'Vertebrae'],
 ['Which muscle is strongly involved in closing the jaw?', 'Masseter', 'Biceps', 'Diaphragm', 'Deltoid'],
 ['What does the temporomandibular joint connect?', 'The mandible with the temporal bone of the skull', 'The tongue with the teeth', 'The two upper incisors', 'The palate with the spine'],
]);
const oralHealth = dental([
 ['What is dental plaque?', 'A biofilm of microorganisms on tooth surfaces', 'A type of healthy enamel', 'The inside of a salivary gland', 'A permanent metal tooth'],
 ['How can plaque bacteria contribute to tooth decay?', 'They produce acids from fermentable carbohydrates', 'They turn enamel into muscle', 'They remove every nutrient from blood', 'They generate new tooth roots'],
 ['What is dental calculus?', 'Mineralised plaque', 'Fresh saliva', 'A nerve inside the tooth', 'A type of gum muscle'],
 ['What does gingivitis describe?', 'Inflammation of the gums', 'A fracture of the jaw', 'Loss of all tooth enamel at birth', 'Inflammation of the lungs'],
 ['What distinguishes periodontitis from gingivitis?', 'Damage to the tissues supporting the teeth', 'A change in hair colour', 'The presence of any permanent tooth', 'A different number of salivary glands'],
 ['Why is dry mouth relevant to oral health?', 'Saliva helps protect and clean the mouth', 'Teeth need no moisture at any time', 'Dryness creates new enamel immediately', 'Dry mouth always proves one specific disease'],
 ['What is the purpose of cleaning between teeth?', 'To remove plaque and debris from spaces a brush may miss', 'To shorten the roots of healthy teeth', 'To replace all professional assessment', 'To change permanent teeth into primary teeth'],
]);
const dentalPosition = dental([
 ['On a tooth, what does the occlusal surface refer to?', 'The chewing surface of a back tooth', 'The inner pulp only', 'The root tip', 'The gum attachment only'],
 ['What does buccal mean when describing a tooth surface?', 'Facing the cheek', 'Facing the tongue', 'Inside the pulp', 'At the root tip'],
 ['What does lingual mean when describing a tooth surface?', 'Facing the tongue', 'Facing the cheek', 'Facing the lips only', 'Inside the root canal'],
 ['What does a mesial tooth surface face?', 'Toward the midline of the dental arch', 'Away from the midline of the dental arch', 'Only toward the root tip', 'Only toward the cheek'],
 ['What is occlusion in dentistry?', 'How the upper and lower teeth meet', 'The production of saliva', 'The colour of tooth enamel', 'The growth of taste buds'],
 ['What is an impacted tooth?', 'A tooth prevented from erupting normally', 'A tooth with a newly polished surface', 'Any tooth with a filling', 'Every primary tooth'],
 ['What is the apex of a tooth root?', 'Its tip', 'Its chewing surface', 'Its widest enamel cusp', 'The centre of the upper lip'],
]);
const dentalTools = [
 ['What does a dental mirror help the clinician do?', 'View areas that are difficult to see directly', 'Measure blood glucose', 'Replace every radiograph', 'Make instruments sterile'],
 ['What is a dental radiograph used to visualise?', 'Teeth and surrounding structures using X-rays', 'Only the sound of chewing', 'Only the colour of the tongue', 'Heart rhythm'],
 ['What does a periodontal probe help measure?', 'The depth of the space between tooth and gum', 'The length of the entire arm', 'Blood oxygen saturation', 'The volume of the stomach'],
 ['What is the purpose of dental suction?', 'Remove saliva and fluid from the working area', 'Grow new enamel', 'Measure bite force automatically', 'Replace protective eyewear'],
 ['What is a dental impression or digital scan used to capture?', 'The shape of teeth and oral structures', 'The electrical rhythm of the heart', 'The exact age of every tooth', 'A guaranteed future diagnosis'],
 ['What does a dental restoration aim to do?', 'Repair damaged or missing tooth structure', 'Remove all saliva permanently', 'Change the jaw into cartilage', 'Replace oral hygiene forever'],
 ['What does a dental crown cover?', 'The prepared or damaged crown portion of a tooth', 'Only the inside of a blood vessel', 'The entire tongue', 'Only the back of the throat'],
];
const dentalReasoning = [
 ['A tooth is sensitive, but the cause has not been assessed. What is the sound conclusion?', 'Several causes are possible and assessment is needed', 'Sensitivity always proves a cavity', 'Sensitivity always proves a cracked jaw', 'Sensitivity can never matter'],
 ['Why distinguish pain reported by a patient from findings on examination?', 'They provide different kinds of information', 'Only reported pain can ever matter', 'Examination makes listening unnecessary', 'Both must always use identical words'],
 ['A dental record names the left side, but a referral names the right. What needs clarification?', 'The intended side before proceeding', 'Only the page colour', 'The patient’s preferred music', 'Nothing if the handwriting is clear'],
 ['A child has both primary and permanent teeth. What should a chart distinguish?', 'Which teeth belong to each dentition', 'Only which teeth look whitest', 'Only the size of the toothbrush', 'No distinction is needed'],
 ['Why ask about relevant medicines and allergies before dental treatment?', 'They may affect safe planning', 'They determine the colour of every tooth', 'They make a dental history unnecessary', 'They prove no examination is needed', 'rights'],
 ['A patient does not understand a proposed procedure. What is the best next step?', 'Explain it clearly and invite questions before seeking consent', 'Treat a blank form as understanding', 'Proceed because another patient agreed', 'Avoid discussing alternatives', 'rights'],
 ['A record has no entry about gum bleeding. What can be concluded from the missing entry alone?', 'That information was not recorded', 'Bleeding definitely never occurred', 'All supporting tissues are healthy', 'The person refused every examination'],
];
const make = (subject, rows) => quiz(subject, rows, sources, healthNote);
export const healthQuizzes = {
 doctor: make('medical knowledge', [
  ['Body systems','anatomy',body], ['How the body works','physiology',physiology], ['Inside the cell','anatomy',cells], ['Medicines and effects','pharmacology',medicines], ['Infection prevention','clinical_reasoning',infection], ['Reading clinical tests','diagnostics',tests], ['Noticing changes','emergencies',observation], ['Patient conversations','clinical_reasoning',communication], ['Clinical calculations','diagnostics',numbers(2)], ['Connecting the clues','clinical_reasoning',reasoning],
 ]),
 medical: make('the science of medicine', [
  ['Body systems','anatomy',body], ['Inside the cell','cell_biology',cells], ['Tissues and structures','anatomy',tissues], ['Balance in the body','physiology',physiology], ['Microbes and infection','microbiology',microbes], ['Medicines and effects','pharmacology',medicines], ['Safer clinical practice','clinical_safety',infection], ['Numbers and units','physiology',numbers(3)], ['Reading the record','clinical_safety',records], ['Scientific reasoning','clinical_safety',reasoning],
 ]),
 surgeon: make('surgical knowledge', [
  ['Body systems','anatomy',body], ['Anatomical directions','anatomy',operativeAnatomy], ['Tools and techniques','surgical_techniques',surgicalTerms], ['Protecting the sterile field','surgical_safety',infection], ['The surgical checklist','surgical_safety',checklist], ['How wounds heal','complications',healing], ['Consent and communication','perioperative_care',communication], ['Measurements and records','perioperative_care',numbers(4)], ['Changes during recovery','complications',observation], ['Before and after surgery','perioperative_care',perioperative],
 ]),
 dentist: make('dental knowledge', [
  ['Meet the teeth','dentition',teeth], ['Inside a tooth','tooth_anatomy',toothStructure], ['Around the mouth','head_neck_anatomy',mouth], ['Plaque and gum health','oral_health',oralHealth], ['Tooth surfaces and bite','tooth_anatomy',dentalPosition], ['Infection prevention','oral_health',infection], ['Dental tools and images','oral_health',dentalTools], ['Patient conversations','oral_health',communication], ['Measurements and timing','oral_health',numbers(5)], ['Connecting dental clues','oral_health',dentalReasoning],
 ]),
};
