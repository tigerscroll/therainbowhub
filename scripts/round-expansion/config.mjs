// Pin the pre-migration state so replay cannot accidentally treat new rounds as legacy input.
export const baseline='a2e69481c319299abf433fbf6cde0067e3c475ba';
export const requested=['airforce','anatomy','barrister','bible','cambridge','catholic','chef','dentist','flightattendant','doctor','firefighter','grammar','harvard','iq','italian','medical','midwifery','nursing','motorbike','nun','paramedic','oxford','personality','pilot','police','raf','socialworker','teacher','surgeon','word'];
export const historical=Object.fromEntries(['cambridge','chef','grammar','harvard','iq','midwifery','nursing','paramedic','oxford'].map(s=>[s,'eb1a3f5']));
historical.firefighter='42c4d84';
export const titles={
 airforce:['Flight Foundations','Controls and Headings','Aviation Language','Airflow and Navigation','Flight Physics'],
 anatomy:['Body Foundations','Bones and Tissues','Inside the Organs','Working Systems','Anatomy Connections'],
 barrister:['Courtroom Foundations','Cases and Questions','Legal Reasoning','Evidence in Focus','Professional Judgment'],
 bible:['First Stories','People and Promises','Words and Wisdom','The Early Church','Scripture Connections'],
 catholic:['Catholic Foundations','Sacraments and Seasons','Prayer and Scripture','Faith in Practice','Making Connections'],
 dentist:['Teeth and Tissues','Growing and Supporting','Oral Health Basics','Structures and Function','Dental Connections'],
 flightattendant:['Safety First','Cabin Awareness','Working Together','People and Priorities','The Final Briefing'],
 doctor:['Body and Symptoms','Measurements and Clues','Cells and Systems','Safety and Evidence','Clinical Reasoning'],
 italian:['The Classic Table','Ingredients and Regions','Traditions and Flavours','Pasta and Preparation','The Final Menu'],
 medical:['Cells and Blood','Medicines and Microbes','Balance and Control','Structures and Signals','Science in Practice'],
 motorbike:['Ready to Ride','Space and Control','Awareness and Balance','Surface and Visibility','Rider Judgment'],
 nun:['Vows and Formation','Prayer and Purpose','Traditions and Communities','Commitment and Daily Life','A Life of Service'],
 personality:['First Impressions','Your Everyday Rhythm','Comfort and Curiosity','People and Celebrations','Your Ideal Escape'],
 pilot:['Flight Foundations','Weather and Headings','Judgment and Control','Instruments and Conditions','The Final Flight Plan'],
 police:['First Contact','Accounts and Evidence','Principles and Precision','Calm Under Pressure','Professional Judgment'],
 raf:['Origins of the RAF','History and Identity','People and Purpose','Aircraft and Technology','The Historical Briefing'],
 socialworker:['Listening and Choice','Privacy and Perspective','Strengths and Boundaries','Safety and Records','Shared Decisions'],
 teacher:['Understanding Learners','Assessment and Safety','Goals and Numbers','Access and Evidence','The Final Lesson'],
 surgeon:['Anatomy and Safety','Checks and Approaches','Structures and Tools','Monitoring and Recovery','People and Decisions'],
 word:['Natural Connections','Objects and Functions','Science and Meaning','Language Patterns','The Final Word']
};
export const subtitles={airforce:'Know what keeps aircraft flying?\nPut your knowledge to the test.',anatomy:'How well do you know the body?\nLook beneath the surface.',barrister:'Can you follow the evidence?\nMake your strongest case.',bible:'Know the stories and the people?\nPut the pieces together.',catholic:'Explore faith and tradition.\nHow much will you remember?',dentist:'Know the science behind a smile?\nTest what lies beneath.',flightattendant:'Ready for the next challenge?\nThink safety, service and teamwork.',doctor:'Read the clues carefully.\nTest your medical knowledge.',italian:'Know your way around the menu?\nTake a taste of Italy.',medical:'From cells to whole systems.\nHow much can you connect?',motorbike:'Think beyond the handlebars.\nTest your road awareness.',nun:'Explore prayer and purpose.\nDiscover what you know.',personality:'Follow what feels like you.\nDiscover your country-inspired match.',pilot:'Read the skies and the clues.\nKeep your thinking on course.',police:'Listen closely. Think clearly.\nFollow the facts.',raf:'Explore a century of aviation.\nHow much do you remember?',socialworker:'Listen, understand and reflect.\nChoose a thoughtful next step.',teacher:'Think like a thoughtful teacher.\nPut learning at the centre.',surgeon:'Precision starts with knowledge.\nHow well can you connect the clues?',word:'Follow the links between words.\nFind the connection.'};
