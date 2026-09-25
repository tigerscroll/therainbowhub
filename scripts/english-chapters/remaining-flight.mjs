import {quiz, sourceBank, calculation, evidence} from './remaining-shared.mjs';
const flight = rows => sourceBank('flight', rows);
const basics = flight([
 ['Which force opposes an aircraft’s motion through the air?', 'Aerodynamic drag', 'Engine thrust', 'Lift alone', 'Cabin pressure'],
 ['What does engine thrust primarily provide?', 'A propulsive force', 'A guarantee of level flight', 'A removal of all weight', 'A replacement for the wings'],
 ['In steady straight-and-level flight at constant speed, how do lift and weight compare?', 'They balance', 'Lift is always twice the weight', 'Weight becomes zero', 'They act in the same direction'],
 ['What does the word airfoil describe?', 'A shape designed to produce an aerodynamic force as air flows around it', 'Only the fuel inside a wing', 'A map of an airport', 'A radio frequency'],
 ['Which part of an aircraft is its fuselage?', 'The main body', 'Only the left wing tip', 'Only the rudder', 'The runway contact surface'],
 ['What is the leading edge of a wing?', 'Its front edge', 'Its rear edge', 'The entire lower surface', 'The centre of the cabin'],
 ['What does aircraft weight include?', 'The aircraft and everything it carries', 'Only the empty structure', 'Only the passengers', 'Only the fuel'],
]);
const controls = flight([
 ['On a conventional airplane, which control surface primarily controls pitch?', 'Elevator', 'Rudder', 'Ailerons', 'Winglets'],
 ['Which control surfaces primarily control roll on a conventional airplane?', 'Ailerons', 'Rudder', 'Elevator', 'Landing gear doors'],
 ['Which control surface primarily controls yaw?', 'Rudder', 'Elevator', 'Ailerons', 'Flaps alone'],
 ['What is pitch motion?', 'The nose rotating up or down', 'The aircraft rotating around its nose-to-tail axis', 'The nose rotating left or right', 'A change in cabin pressure only'],
 ['What is roll motion?', 'Rotation around the nose-to-tail axis', 'Rotation around the vertical axis only', 'Straight upward movement only', 'An increase in fuel flow only'],
 ['What is yaw motion?', 'The nose rotating left or right around the vertical axis', 'The wings banking around the nose-to-tail axis', 'The nose rotating upward only', 'A wheel turning on the ground only'],
 ['What do wing flaps change when extended?', 'The wing’s aerodynamic characteristics', 'The Earth’s magnetic field', 'The aircraft’s registration', 'The length of the runway'],
]);
const instruments = flight([
 ['Which instrument shows pitch and bank relative to the horizon?', 'Attitude indicator', 'Fuel quantity gauge', 'Clock', 'Outside-air thermometer'],
 ['What does a pressure altimeter use to estimate altitude?', 'Atmospheric pressure', 'Fuel temperature', 'Cabin lighting', 'Engine oil quantity'],
 ['Why does the pressure setting on an altimeter matter?', 'It affects the indicated altitude', 'It changes the aircraft’s actual mass', 'It controls the wind speed', 'It replaces all navigation checks'],
 ['What does an airspeed indicator primarily indicate?', 'Speed relative to the surrounding air, subject to instrument and pressure effects', 'Distance above sea level', 'Only speed relative to the ground', 'Only engine rotational speed'],
 ['What does a vertical speed indicator indicate?', 'Rate of climb or descent', 'Total distance flown', 'Fuel remaining', 'The direction of magnetic north'],
 ['Which instrument uses Earth’s magnetic field to indicate direction?', 'Magnetic compass', 'Altimeter', 'Airspeed indicator', 'Fuel flow gauge'],
 ['What does a fuel quantity indication tell a pilot?', 'The indicated amount of fuel remaining', 'The exact time of every future landing', 'The direction of a crosswind', 'The height of nearby mountains'],
]);
const directions = [
 ['A heading of 090° points approximately in which direction?', 'East', 'West', 'North', 'South'],
 ['A heading of 180° points approximately in which direction?', 'South', 'North', 'East', 'West'],
 ['A heading of 270° points approximately in which direction?', 'West', 'East', 'South', 'North'],
 ['A quarter-turn clockwise from north points where?', 'East', 'South', 'West', 'Northwest'],
 ['A half-turn from east points where?', 'West', 'North', 'South', 'Northeast'],
 ['An aircraft points south. Which direction is on its right?', 'West', 'East', 'North', 'Southeast'],
 ['A map is drawn with north at the top. Which direction runs toward its lower left corner?', 'Southwest', 'Northeast', 'Southeast', 'Northwest'],
];
const navigation = flight([
 ['What is groundspeed?', 'Speed relative to the ground', 'Altitude above the runway', 'Rate of engine rotation', 'Pitch angle'],
 ['With true airspeed unchanged, what does a direct headwind do to groundspeed?', 'Reduces it', 'Always doubles it', 'Leaves it unchanged', 'Makes lift impossible'],
 ['With true airspeed unchanged, what does a direct tailwind do to groundspeed?', 'Increases it', 'Always halves it', 'Makes it zero', 'Changes only the altimeter setting'],
 ['What is an aircraft’s ground track?', 'Its path over the ground', 'The direction its nose must always point', 'The shape of a tyre', 'The line of its wing chord'],
 ['Why can heading and ground track differ?', 'Wind can cause drift', 'A compass measures only height', 'Latitude and longitude are identical', 'Aircraft cannot travel sideways relative to their heading'],
 ['What does latitude describe?', 'Position north or south of the equator', 'Position east or west of the prime meridian', 'Height above a runway', 'Distance from a wing tip'],
 ['What does longitude describe?', 'Position east or west of the prime meridian', 'Position north or south of the equator', 'The pressure in a fuel tank', 'The local cloud height'],
]);
const physics = flight([
 ['What is angle of attack?', 'The angle between the wing’s chord line and the relative airflow', 'The angle between two runway markings', 'The direction shown by a magnetic compass', 'The slope of the cabin floor alone'],
 ['An aerodynamic stall occurs when a wing exceeds what?', 'Its critical angle of attack', 'One universal altitude', 'One universal engine speed', 'The speed of sound in every case'],
 ['What is the chord line of an airfoil?', 'A straight line from its leading edge to its trailing edge', 'The route drawn on a map', 'The line between the two engines', 'The height of the tail above the ground'],
 ['What does subsonic mean?', 'Below the local speed of sound', 'Above the local speed of sound', 'Exactly twice the local speed of sound', 'Stationary relative to the ground'],
 ['Why does the centre of gravity matter?', 'It affects aircraft stability and control', 'It eliminates all drag', 'It makes the aircraft weightless', 'It removes the need for fuel'],
 ['At the same true airspeed, what does greater air density do to dynamic pressure?', 'Increases it', 'Decreases it', 'Makes it exactly zero', 'Changes only the compass heading'],
 ['Compared with cooler air at the same pressure, warmer air is generally what?', 'Less dense', 'More dense', 'Always the same density', 'Unable to exert pressure'],
]);
const weather = flight([
 ['What does a weather forecast provide?', 'An informed prediction that must be checked as conditions change', 'A guarantee of exact future conditions', 'Permission to ignore current observations', 'A replacement for flight planning'],
 ['What does reported visibility concern?', 'How far suitable objects can be seen and identified', 'Only the outside temperature', 'Only the runway length', 'Only the rate of fuel use'],
 ['Why can ice on a wing be hazardous?', 'It can change airflow and reduce performance', 'It always increases lift without drag', 'It makes weight irrelevant', 'It improves every control response'],
 ['Which statement about thunderstorms is sound?', 'They can contain several serious aviation hazards', 'They affect aircraft only on the ground', 'They are harmless without visible lightning', 'They guarantee smooth air beneath them'],
 ['What is a crosswind?', 'Wind with a component across the direction of travel', 'Wind blowing only vertically', 'Air that never moves', 'Wind that always matches the aircraft’s heading'],
 ['What is turbulence?', 'Irregular air movement that can disturb an aircraft’s motion', 'A guaranteed engine failure', 'A change in the aircraft registration', 'A steady compass direction'],
 ['What is wind shear?', 'A change in wind speed or direction over a short distance', 'A constant wind everywhere', 'A change in the aircraft’s paint', 'The temperature at which metal melts'],
]);
const planning = [
 ['A route is 180 km and groundspeed is 120 km/h. How long does it take at that constant speed?', '90 minutes', '60 minutes', '120 minutes', '150 minutes'],
 ['A flight leg takes 40 minutes and the next takes 55 minutes. What is the combined time?', '95 minutes', '85 minutes', '105 minutes', '115 minutes'],
 ['For a calculation only, fuel use is 24 L per hour. How much is used in 30 minutes?', '12 L', '6 L', '18 L', '48 L'],
 ['A tank contains 90 L. A calculation predicts 35 L used on a leg. How much remains?', '55 L', '45 L', '65 L', '125 L'],
 ['An aircraft covers 60 km in 20 minutes. What is its average groundspeed?', '180 km/h', '120 km/h', '60 km/h', '30 km/h'],
 ['A schedule uses UTC throughout. Departure is 10:45 and flight time is 2 hours 20 minutes. What is arrival time?', '13:05 UTC', '12:55 UTC', '13:15 UTC', '12:05 UTC'],
 ['A loading example has 300 kg plus 2 loads of 45 kg each. What is the combined mass?', '390 kg', '345 kg', '360 kg', '435 kg'],
];
export const coordination = [
 ['An important instruction is unclear. What is the best response?', 'Request clarification before acting', 'Guess from one familiar word', 'Assume another team’s instruction applies', 'Ignore every later message'],
 ['What is the purpose of reading back a critical instruction?', 'To let the sender check that it was understood correctly', 'To make the message longer for its own sake', 'To transfer all responsibility to the sender', 'To replace carrying out the confirmed instruction'],
 ['Two tasks require the same person at the same time. What should be clarified?', 'Priorities and responsibilities', 'Only the colour of the checklist', 'Which task has the shorter name', 'Nothing; the conflict resolves itself'],
 ['What makes a handover useful?', 'Relevant facts, unresolved concerns and the next required actions', 'Only the person’s first name', 'Only a reassurance that everything is fine', 'A list of unrelated events'],
 ['A colleague reports a new safety concern. What supports effective teamwork?', 'Listen, clarify and address the concern', 'Dismiss it because the colleague is junior', 'Wait until nobody can respond', 'Hide it to protect the schedule'],
 ['A procedure changes. Which document should guide the task?', 'The current authorised procedure', 'Any older copy that looks familiar', 'An unverified social media summary', 'A remembered version from another organisation'],
 ['Why assign a clear owner to a follow-up action?', 'So responsibility and completion can be tracked', 'So nobody else may raise concerns', 'So no record is needed', 'So the action becomes automatically complete'],
];
const decisions = flight([
 ['Why use a checklist rather than memory alone?', 'To support consistent completion of required steps', 'To replace training entirely', 'To guarantee equipment never fails', 'To avoid monitoring conditions'],
 ['What is situational awareness?', 'Understanding relevant conditions and how they may develop', 'Knowing only the destination name', 'Watching one instrument and ignoring everything else', 'Remembering one old forecast'],
 ['A plan relied on conditions that have now changed. What is needed?', 'Reassess the plan using current information', 'Continue only because time has already been spent', 'Ignore the change if arrival is important', 'Use the oldest available information'],
 ['Why is fatigue relevant to aviation decisions?', 'It can impair attention and judgement', 'It guarantees faster reactions', 'It removes the need for rest', 'It affects only passengers'],
 ['A strong desire to arrive is influencing a safety decision. What should take priority?', 'The actual conditions and applicable operating limits', 'The amount already paid for the trip', 'The most optimistic assumption', 'The original promise regardless of conditions'],
 ['A warning conflicts with an apparently normal indication. What is the sound approach?', 'Use the applicable procedure to assess the discrepancy', 'Choose whichever indication is more reassuring', 'Cover the warning to reduce distraction', 'Assume warnings can never be correct'],
 ['Why keep alternatives in a flight plan?', 'Conditions may require a change of plan', 'A planned destination is always unavailable', 'Alternatives remove all uncertainty', 'They make fuel planning unnecessary'],
]);
const cabin = [
 ['Why should cabin baggage be correctly stowed?', 'To reduce obstruction and the risk of moving objects', 'To make every bag lighter', 'To increase the number of exits', 'To replace seat restraints'],
 ['Why must aisles and exit areas stay clear?', 'People may need to move through them promptly', 'It changes the aircraft’s magnetic heading', 'It guarantees a delay-free arrival', 'It removes the need for cabin checks'],
 ['What is the purpose of the passenger safety briefing?', 'To explain important safety information for that aircraft and flight', 'To replace every crew instruction later', 'To advertise only the destination', 'To guarantee there will be no turbulence'],
 ['Why does a passenger’s seat belt remain useful while seated?', 'Unexpected turbulence can occur', 'It controls cabin temperature', 'It guarantees no delays', 'It makes baggage weight irrelevant'],
 ['A loose object is found in the aisle. What is the appropriate response?', 'Have it safely secured according to the crew procedure', 'Leave it because it is small', 'Move it into an exit path', 'Ask passengers to step over it all flight'],
 ['Why should safety equipment locations be familiar to the crew?', 'So the appropriate equipment can be found promptly', 'So equipment checks can be skipped', 'So training becomes unnecessary', 'So all equipment can be used interchangeably'],
 ['A passenger has not understood a safety instruction. What helps?', 'Explain it clearly and check understanding', 'Assume a nod is enough in every case', 'Repeat only unfamiliar abbreviations', 'Ignore the issue if the cabin is busy'],
];
const service = [
 ['A passenger says a meal conflicts with a stated allergy. What is the best response?', 'Check reliable ingredient information and the applicable service procedure', 'Guess from the meal’s appearance', 'Promise it is safe without checking', 'Remove a visible ingredient and guarantee safety'],
 ['Two passengers want the same available item. What supports fair service?', 'Apply the service policy consistently and explain alternatives', 'Choose according to appearance', 'Promise both the same single item', 'Pretend the request was not heard'],
 ['A passenger is upset about a delay. What is a useful opening?', 'Acknowledge the concern and share verified information', 'Invent an arrival time', 'Guarantee compensation without authority', 'Blame another passenger'],
 ['A drink spills into an aisle. What should be addressed first?', 'The immediate slip hazard using the appropriate procedure', 'Only the colour of the carpet', 'The order of the refreshments menu', 'Whether anyone has taken a photograph'],
 ['A passenger requests something you cannot provide. What is helpful?', 'Explain the limit politely and offer a suitable alternative if available', 'Promise it anyway', 'Ignore all further requests', 'Make up a rule to end the conversation'],
 ['Why keep service items secure when they are not being used?', 'They can move and cause injury or obstruction', 'It changes the aircraft’s altitude', 'It makes them permanently sterile', 'It replaces checking the cabin'],
 ['Which message avoids an unsupported promise?', '“I will check what options are available”', '“Nothing can possibly change”', '“Every connection is guaranteed”', '“There is never any risk”'],
];
const cabinSystems = [
 ['What does cabin pressurisation help provide at high altitude?', 'An environment in which people can breathe more comfortably', 'An unlimited oxygen supply in every situation', 'A replacement for the aircraft structure', 'A guarantee against turbulence'],
 ['What is the purpose of emergency lighting in the cabin?', 'To help people find routes and exits when needed', 'To measure fuel remaining', 'To change the outside wind', 'To replace crew training'],
 ['What does a smoke detector do?', 'Detects conditions associated with smoke and gives a warning', 'Automatically proves the source of every smell', 'Removes all smoke instantly', 'Makes fire impossible'],
 ['Why are different fire extinguishers not automatically interchangeable?', 'They may be designed for different hazards and uses', 'Their colour alone determines every use worldwide', 'Every extinguisher contains water', 'Any extinguisher removes all need for training'],
 ['What is a galley on an aircraft?', 'The area used for food and drink preparation', 'The pilot’s instrument panel', 'The cargo door hinge', 'The outside wing surface'],
 ['What is the flight deck?', 'The area where the pilots control the aircraft', 'The passenger baggage shelf', 'The aircraft’s tail cone', 'The airport arrival hall'],
 ['Why follow the specific aircraft’s equipment instructions?', 'Designs and operating procedures can differ', 'Every aircraft uses identical equipment', 'General guesses are always sufficient', 'Equipment labels are decorative only'],
];
const emergencies = [
 ['A passenger reports smoke in the cabin. What is the appropriate initial response?', 'Notify the crew promptly and follow the emergency procedure', 'Wait to see whether another passenger mentions it', 'Assume every smell is harmless', 'Open a random equipment panel'],
 ['During an emergency, which instructions should passengers follow?', 'The crew’s current safety instructions', 'Unverified advice shouted by another passenger', 'Instructions from an unrelated aircraft video', 'Only the original boarding announcement'],
 ['Why should emergency commands be short and clear?', 'Stress and noise can make communication harder', 'Long technical explanations are always faster', 'Passengers already know every procedure', 'Clarity matters only during normal service'],
 ['A passenger becomes suddenly unwell. What should cabin crew use?', 'Their training and the airline’s medical assistance procedure', 'A guessed diagnosis based on appearance alone', 'Another passenger’s medicine without proper authority', 'A promise that no assessment is needed'],
 ['Why report the location of a cabin hazard precisely?', 'So help can reach the correct place', 'So the description sounds longer', 'So other details become unnecessary', 'So every passenger must inspect it'],
 ['A safety instruction is repeated during a noisy event. Why can repetition help?', 'Some people may not have heard or understood it', 'It proves the first instruction was wrong', 'It removes the need for action', 'It changes the aircraft’s design'],
 ['A situation changes while a response is underway. What does the team need?', 'Updated information and coordination', 'Only the original description', 'Silence about the change', 'A new guess from each person independently'],
];
const accessibility = [
 ['A passenger has a communication need. What is the best starting point?', 'Ask which form of support works for them', 'Assume a diagnosis from appearance', 'Address only their companion', 'Give up on explaining the information'],
 ['A passenger with hearing difficulty is speaking with you. What can help?', 'Face them and check their preferred communication method', 'Speak while facing away', 'Cover your mouth and rush', 'Assume they cannot make decisions'],
 ['Before assisting a passenger physically, what is respectful?', 'Ask what assistance is wanted and follow the applicable procedure', 'Move them without explanation', 'Assume everyone needs the same help', 'Ask an unrelated passenger to decide'],
 ['What is the best approach to an unfamiliar name?', 'Ask politely how to pronounce it', 'Replace it with a nickname without asking', 'Avoid addressing the person', 'Make a joke about it'],
 ['A passenger needs more time to respond. What is helpful?', 'Allow time and check understanding without pressure', 'Finish every answer for them', 'Treat a pause as refusal', 'Ask increasingly complex questions rapidly'],
 ['A sensitive personal issue is raised. What should the conversation protect?', 'The person’s privacy as far as practical', 'The curiosity of nearby passengers', 'A public account of the details', 'An opportunity to photograph the discussion'],
 ['Why avoid assumptions about someone’s needs based on age alone?', 'People of the same age can have different abilities and preferences', 'Age tells you every support need', 'Only younger passengers need explanations', 'Only older passengers can ask for assistance'],
];
export const flightQuizzes = {
 airforce: quiz('aviation knowledge', [
  ['Forces of flight','flight_basics',basics], ['Moving an aircraft','flight_controls',controls], ['Reading the instruments','instruments',instruments], ['Finding direction','navigation',directions], ['Air and ground movement','navigation',navigation], ['Flight physics','flight_physics',physics], ['Weather and airflow','flight_physics',weather], ['Navigation calculations','navigation',planning], ['Clear team communication','instruments',coordination], ['Making sound decisions','flight_basics',decisions],
 ], {}, 'This tests civilian aviation principles, not military selection rules. Calculation examples are not flight-planning instructions.'),
 pilot: quiz('pilot knowledge', [
  ['Forces of flight','flight_basics',basics], ['Aircraft controls','flight_basics',controls], ['Reading the instruments','instruments',instruments], ['Reading the weather','weather',weather], ['Finding direction','navigation',directions], ['Heading and ground track','navigation',navigation], ['Planning with numbers','navigation',planning], ['Clear cockpit communication','decision_making',coordination], ['Understanding the evidence','decision_making',evidence], ['Decisions in changing conditions','decision_making',decisions],
 ], {}, 'Calculation examples omit operational reserves and are arithmetic exercises, not flight plans.'),
 flightattendant: quiz('cabin safety and service', [
  ['A safe cabin','service_safety',cabin], ['Thoughtful passenger service','service_safety',service], ['Cabin equipment','cabin_systems',cabinSystems], ['Clear crew communication','crew_coordination',coordination], ['Responding to the unexpected','emergencies',emergencies], ['Support for every passenger','service_safety',accessibility], ['Flight and weather basics','cabin_systems',weather], ['Numbers and timing','crew_coordination',calculation], ['Checking the facts','crew_coordination',evidence], ['Safety judgement','emergencies',decisions],
 ], {}, 'Aircraft equipment and emergency actions follow operator-specific procedures and training.'),
};
