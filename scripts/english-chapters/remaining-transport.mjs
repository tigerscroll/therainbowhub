import {quiz, calculation, evidence, sourceBank} from './remaining-shared.mjs';
import {coordination} from './remaining-flight.mjs';
const mechanics = [
 ['What is friction?', 'A force that opposes relative motion between contacting surfaces', 'The mass of an object', 'The distance travelled each hour', 'The temperature at which water freezes'],
 ['What does a lever turn around?', 'A pivot or fulcrum', 'A fuel injector', 'An electrical insulator', 'A pressure gauge'],
 ['Two meshed external gears turn together. If one turns clockwise, how does the other turn?', 'Anticlockwise', 'Clockwise', 'It must remain still', 'Its direction cannot change'],
 ['What does a pulley change in a simple fixed-pulley system?', 'The direction of the applied force', 'The mass of the load', 'The material of the rope', 'The force of gravity itself'],
 ['What does pressure describe?', 'Force acting over an area', 'Distance divided by time', 'Mass multiplied by volume', 'Temperature divided by length'],
 ['What does a spring generally do when compressed within its elastic range?', 'Stores energy and tends to return to its original shape', 'Permanently loses all elasticity', 'Creates fuel', 'Becomes weightless'],
 ['Why can lubrication reduce wear between moving parts?', 'It reduces direct frictional contact', 'It makes all parts the same size', 'It removes every load', 'It prevents all possible failures'],
];
const spatial = [
 ['A plan shows north at the top. A room is directly right of the entrance. In which direction is it?', 'East', 'West', 'North', 'South'],
 ['A person faces west and turns 90° to the right. Which direction do they face?', 'North', 'South', 'East', 'Southwest'],
 ['A rectangular floor is 6 m long and 4 m wide. What is its area?', '24 square metres', '10 square metres', '20 square metres', '28 square metres'],
 ['Three sections of hose are 15 m, 20 m and 25 m long. What is their combined length?', '60 m', '50 m', '55 m', '65 m'],
 ['A corridor has doors at 5 m intervals. The first door is at 5 m. Where is the fourth door?', '20 m', '15 m', '25 m', '30 m'],
 ['A team travels 30 m north, then 10 m south. Where is it relative to the start?', '20 m north', '40 m north', '20 m south', 'At the start'],
 ['On a diagram, a valve is between a tank and a pump. What is the order from the tank?', 'Tank, valve, pump', 'Tank, pump, valve', 'Valve, tank, pump', 'Pump, tank, valve'],
];
const fireScience = sourceBank('fire', [
 ['Which three elements are commonly represented by the fire triangle?', 'Heat, fuel and oxygen', 'Water, salt and sand', 'Smoke, ash and sunlight', 'Metal, glass and pressure'],
 ['What is fuel in the context of a fire?', 'Material that can burn', 'Only petrol or gasoline', 'Only a liquid', 'Only visible flames'],
 ['What can removing a necessary element of the fire triangle do?', 'Interrupt combustion', 'Always increase the fire', 'Create unlimited oxygen', 'Make every material fireproof'],
 ['Why is smoke a serious hazard?', 'It can contain toxic gases and particles and reduce visibility', 'It is always harmless when pale', 'It contains only water vapour', 'It is dangerous only outdoors'],
 ['What is heat conduction?', 'Heat transfer through direct contact within or between materials', 'Heat carried only by sunlight', 'Heat transfer only by moving air', 'The absence of heat transfer'],
 ['What is convection?', 'Heat transfer through the movement of a fluid such as air', 'Heat transfer only through solid metal', 'The freezing of all gases', 'A change in magnetic direction'],
 ['What is radiant heat?', 'Heat transferred by electromagnetic radiation', 'Heat carried only by a water hose', 'Heat that needs direct contact at all times', 'The weight of smoke'],
]);
const smoke = [
 ['Why can poor visibility make movement through a smoke-filled area dangerous?', 'Obstacles, exits and changes in layout may be difficult to identify', 'Smoke makes every floor level', 'Every exit becomes easier to see', 'Visibility has no effect on orientation'],
 ['A room has no visible flames but contains smoke. What is the sound conclusion?', 'The absence of visible flames does not establish safety', 'The room is definitely safe', 'There can be no toxic gases', 'Protective procedures are unnecessary'],
 ['Why can hot gases collect near a ceiling?', 'Heated gases tend to rise relative to cooler surrounding air', 'Gravity stops acting inside buildings', 'Ceilings create oxygen', 'Smoke has no mass'],
 ['What does a smoke alarm primarily provide?', 'An early warning that smoke may be present', 'A guarantee that every person has escaped', 'Automatic removal of all fuel', 'Proof of the exact fire location'],
 ['Why should a closed door not be assumed to make a nearby fire irrelevant?', 'Heat and smoke conditions can still change and spread', 'Doors eliminate all heat transfer', 'A closed door proves the fire is out', 'Smoke cannot move through any gap'],
 ['What makes carbon monoxide particularly difficult for people to notice without detection equipment?', 'It is colourless and odourless', 'It always has a bright red colour', 'It always smells strongly of smoke', 'It can exist only underwater'],
 ['Why do firefighters use appropriate respiratory protection in hazardous atmospheres?', 'Ordinary air may contain dangerous contaminants or insufficient oxygen', 'Cloth masks provide the same protection in every atmosphere', 'Smoke is visible oxygen', 'Breathing hazards occur only after flames disappear'],
];
const scene = [
 ['At an unfamiliar incident, what is the purpose of an initial scene assessment?', 'Identify hazards and guide a coordinated response', 'Prove the cause immediately', 'Replace all later reassessment', 'Choose actions from appearance alone'],
 ['A damaged electrical cable is near water. What should responders recognise?', 'A potential electrical hazard requiring the appropriate procedure', 'Proof that the cable is safe', 'A reason to touch it to test for current', 'A guarantee that water removes the hazard'],
 ['Why keep an escape route under consideration during an operation?', 'Conditions may change and require withdrawal', 'It replaces every protective measure', 'A route can never become obstructed', 'It proves the structure is stable'],
 ['A container holds an unknown chemical. What is the appropriate approach?', 'Use identification and hazardous-material procedures rather than guessing', 'Identify it by touching it', 'Mix it with another substance to see what happens', 'Assume every clear liquid is water'],
 ['Why can a visibly damaged structure require specialist assessment?', 'Its stability may be uncertain', 'Damage always makes it stronger', 'A photograph proves it cannot collapse', 'Only paint colour affects stability'],
 ['At a road incident, what additional hazard may need control?', 'Moving traffic', 'Only the age of the vehicles', 'Only the number of photographs taken', 'Only the colour of road signs'],
 ['Why should an operational plan change when hazards change?', 'The original assumptions may no longer be valid', 'Plans are never allowed to use new information', 'New hazards automatically solve old ones', 'Reassessment is only administrative'],
];
const equipment = [
 ['What is the purpose of inspecting equipment before use?', 'To identify defects and confirm suitability', 'To guarantee it can never fail', 'To replace all training', 'To make every tool interchangeable'],
 ['A hose has visible damage. What should happen?', 'Follow the inspection and removal-from-service procedure', 'Hide the damage under tape and assume it is sound', 'Use it at higher pressure to test it informally', 'Ignore it if the colour is unchanged'],
 ['Why must a ladder be used according to its rated capacity and instructions?', 'Its stability and strength have limits', 'Ratings are decorative only', 'Every ladder supports any load', 'Instructions apply only to new ladders'],
 ['What is a pump’s basic purpose?', 'To move a fluid by supplying energy', 'To create water from nothing', 'To remove gravity', 'To turn every liquid into fuel'],
 ['Why can a pressurised line create a movement hazard?', 'Forces can act on the line and its connections', 'Pressure has no mechanical effect', 'Only an empty line can move', 'A connection’s condition never matters'],
 ['A tool has a guard. What is the guard generally intended to do?', 'Reduce contact with a hazard during intended use', 'Increase exposure to moving parts', 'Replace all operator training', 'Make inspection unnecessary'],
 ['Why should damaged protective clothing be reported?', 'Its protective performance may be compromised', 'Damage always improves ventilation safely', 'Only appearance can be affected', 'Protection cannot change with condition'],
];
const fireJudgment = [
 ['A team member has not acknowledged an important message. What needs to be confirmed?', 'Whether the message was received and understood', 'Only whether the sender spoke loudly', 'That silence means agreement', 'That the action is already complete'],
 ['A crew notices a new hazard outside its immediate task. What supports safety?', 'Communicate it promptly through the incident structure', 'Ignore it because another crew may notice', 'Keep it private until the operation ends', 'Assume the original plan covers every change'],
 ['Why account for personnel during an incident?', 'To know who is deployed and whether anyone is missing', 'To replace every radio message', 'To determine the cause of the fire', 'To make protective equipment unnecessary'],
 ['A task exceeds a tool’s stated capability. What is appropriate?', 'Use a suitable authorised method or equipment', 'Assume extra effort removes the limit', 'Alter the rating label', 'Let the schedule decide the capacity'],
 ['Two instructions conflict. What should be resolved?', 'The intended priority and authorised direction', 'Which instruction has more words', 'Which person spoke last regardless of role', 'Nothing; both can always happen simultaneously'],
 ['Why is a post-incident review useful?', 'It identifies lessons and improvements from what happened', 'It guarantees the next incident will be identical', 'It replaces factual records', 'It proves every initial assumption was right'],
 ['Which report is most useful to an incident coordinator?', 'A clear location, observed hazard and relevant change', '“Something is somewhere”', 'An unverified cause presented as certain', 'Only the reporter’s opinion of another team'],
];
const bikeParts = [
 ['What connects the engine’s drive to the rear wheel on a chain-driven motorcycle?', 'The drive chain', 'The front brake hose', 'The exhaust pipe', 'The headlight wiring'],
 ['What does the clutch do on a conventional manual motorcycle?', 'Connects and disconnects engine drive from the transmission', 'Changes the tyre tread pattern', 'Measures fuel level', 'Controls only the headlight'],
 ['What is the throttle used to control?', 'Engine power output', 'Tyre inflation directly', 'The rear brake light only', 'The width of the handlebars'],
 ['What do suspension springs and dampers help manage?', 'Wheel movement and the motorcycle’s response to the road', 'The fuel’s chemical composition', 'The number of gears', 'The shape of the licence plate'],
 ['What is the main job of the front and rear brakes?', 'Reduce speed through controlled braking force', 'Increase engine displacement', 'Change the tyre compound', 'Replace steering control'],
 ['What does a motorcycle’s transmission provide?', 'Different gear ratios between engine and driven wheel', 'An unlimited fuel supply', 'Automatic protection from all road hazards', 'A replacement for tyres'],
 ['Why does a motorcycle need functioning lights?', 'To help the rider see and be seen as required', 'To guarantee every other road user notices it', 'To make braking unnecessary', 'To replace observation'],
];
const bikeChecks = [
 ['Where should a rider find the correct tyre pressure for a motorcycle and load?', 'The manufacturer’s guidance for that motorcycle', 'A pressure chosen from the tyre’s colour', 'The number on an unrelated bicycle', 'A guess based only on the weather'],
 ['A tyre has visible damage. What is appropriate before riding?', 'Have its safety assessed and address the defect', 'Ignore it if the engine starts', 'Cover the damage with paint', 'Reduce the fuel level instead'],
 ['A brake control feels unexpectedly different. What should the rider do?', 'Investigate and resolve the issue before relying on it', 'Assume all changes are harmless', 'Ride faster to test it in traffic', 'Use the horn instead'],
 ['Why check the drive chain according to the manufacturer’s instructions?', 'Its condition and adjustment affect safe operation', 'Every chain has the same adjustment', 'A chain never wears', 'Only its colour matters'],
 ['What should be checked about a mirror before setting off?', 'It is secure and adjusted for useful rearward visibility', 'It shows only the rider’s face', 'It reflects the fuel cap', 'Its frame matches the helmet'],
 ['A warning symbol appears and its meaning is unfamiliar. Where should it be checked?', 'The motorcycle’s owner manual or qualified support', 'Only an unrelated vehicle’s dashboard', 'A guess from the symbol’s colour alone', 'The length of the journey'],
 ['Why check for fluid leaks before a ride?', 'They may indicate a fault and can affect safety', 'Every leak is a normal way to reduce weight', 'Leaks improve tyre grip', 'Only the smell of fuel matters'],
];
const grip = [
 ['Why can loose gravel reduce a motorcycle tyre’s grip?', 'It can move between the tyre and road surface', 'It permanently increases tyre width', 'It eliminates the need to brake', 'It makes every surface identical'],
 ['What can painted road markings become when wet?', 'More slippery than surrounding surfaces', 'Guaranteed high-grip surfaces', 'Invisible to every rider', 'A replacement for road signs'],
 ['Why can abrupt control inputs be risky when grip is limited?', 'They can demand more traction than is available', 'They always increase traction', 'They remove the motorcycle’s mass', 'They prevent any weight transfer'],
 ['What happens to the available grip when tyres are also providing cornering force?', 'Braking and turning share the available traction', 'Turning requires no traction', 'Unlimited braking force becomes available', 'Road condition no longer matters'],
 ['Why should tyre condition matter in wet weather?', 'Tread and condition influence water clearance and grip', 'Water makes tyre condition irrelevant', 'All worn tyres grip better in rain', 'Only the motorcycle’s colour matters'],
 ['A shaded section of road may be icy. What is the sound response?', 'Recognise the reduced-grip risk and adapt the plan', 'Assume shade guarantees dry pavement', 'Use sudden steering to test the surface', 'Ignore the surface if the sky is clear'],
 ['Why should a rider allow more margin on an unfamiliar surface?', 'The available grip and hazards may be uncertain', 'Unfamiliar roads always have more grip', 'Uncertainty improves braking performance', 'A familiar speed is safe on every surface'],
];
const braking = [
 ['What is stopping distance made up of?', 'Distance travelled while reacting plus distance travelled while braking', 'Only the length of the motorcycle', 'Only the distance after reaching a stop', 'Only the gap to the nearest junction'],
 ['At a higher speed with the same reaction time, what happens to reaction distance?', 'It increases', 'It decreases', 'It stays zero', 'It depends only on helmet colour'],
 ['Why leave a suitable following gap?', 'To allow time and space to respond', 'To guarantee the vehicle ahead never brakes', 'To prevent all wind', 'To replace checking the road ahead'],
 ['What does an anti-lock braking system help prevent during braking?', 'Wheel lock under conditions within its operating capability', 'Every possible skid in every situation', 'All collisions regardless of speed', 'The need for tyre maintenance'],
 ['Why does an anti-lock braking system not justify riding too close?', 'It cannot remove reaction time or the need for space', 'It makes stopping distance always zero', 'It guarantees the road is dry', 'It controls all other vehicles'],
 ['A downhill gradient can affect stopping. What should a rider do?', 'Allow for the conditions and the motorcycle’s limitations', 'Assume downhill stopping is always shorter', 'Ignore the gradient if travelling in a straight line', 'Use a fixed gap in every situation'],
 ['Why should braking technique follow motorcycle-specific training?', 'Design, loading and conditions affect the response', 'All motorcycles behave identically', 'Training matters only at walking speed', 'One technique removes every hazard'],
];
const corners = [
 ['Why assess a bend before entering it?', 'To judge the visible path, conditions and appropriate speed', 'To guarantee there are no unseen hazards', 'To avoid looking through the bend', 'To choose speed from the road’s name'],
 ['A bend tightens beyond the visible section. What was uncertain?', 'The full path and required turning demand', 'Only the colour of the road', 'The number of letters on a sign', 'Whether gravity exists'],
 ['Why should a rider avoid fixing their gaze only on one nearby obstacle?', 'It can reduce awareness of the intended path and other hazards', 'It makes steering automatically precise', 'It removes the need to choose a path', 'It makes all obstacles disappear'],
 ['What can an unexpected patch of gravel inside a bend change?', 'The available grip', 'The engine’s number of cylinders', 'The legal identity of the motorcycle', 'The compass directions'],
 ['Why is available sight distance relevant to speed selection?', 'The rider needs space to respond within what can be seen', 'A hidden road is always clear', 'Sight distance matters only when stationary', 'Higher speed always increases visible distance'],
 ['What is a useful general principle for control inputs through a bend?', 'They should be smooth and appropriate to the available grip', 'They should always be abrupt', 'They should ignore the surface', 'They should be copied from a different vehicle without training'],
 ['Why must a planned path through a bend stay adaptable?', 'Other road users or surface conditions may change the situation', 'A plan guarantees nobody else appears', 'Road surfaces never change', 'The initial view contains every future detail'],
];
const hazards = [
 ['A parked vehicle has a person inside near traffic. What possible hazard should a rider anticipate?', 'A door opening or the vehicle moving', 'The vehicle becoming weightless', 'The road becoming wider automatically', 'The absence of any need to observe'],
 ['Why can a motorcycle be difficult for another driver to notice?', 'Its smaller visual profile can be less conspicuous', 'Motorcycles are invisible by definition', 'Drivers always see every light', 'A bright jacket guarantees detection'],
 ['A large vehicle blocks the view of a junction. What should that suggest?', 'There may be hazards hidden beyond it', 'Nothing can approach behind it', 'The junction has disappeared', 'Visibility no longer affects decisions'],
 ['Why check blind spots using the appropriate trained observation method?', 'Mirrors may not show every relevant area', 'Mirrors always show the complete surroundings', 'A signal creates a guaranteed gap', 'Only the road behind can matter'],
 ['A pedestrian looks away from traffic near the road edge. What is the safer assumption?', 'They may not have noticed the motorcycle', 'They have definitely granted priority', 'They cannot move', 'They have seen every approaching vehicle'],
 ['Why should a rider be cautious about assuming eye contact proves they were seen?', 'Another road user may look in that direction without recognising the hazard', 'Eye contact changes braking force', 'Looking guarantees a safe gap', 'Recognition never matters'],
 ['A gap is closing as another vehicle approaches. What should guide the decision?', 'Current speed, distance and a safe margin', 'Only the size of the original gap', 'A wish to avoid waiting', 'The assumption the other vehicle will stop'],
];
const passenger = [
 ['Why does carrying a passenger affect motorcycle handling?', 'It changes mass and weight distribution', 'It removes the effect of gravity', 'It always halves braking distance', 'It makes tyre pressure irrelevant'],
 ['What should determine whether a motorcycle can carry a passenger?', 'Its design, equipment, manufacturer guidance and applicable rules', 'Only whether there is room on the fuel tank', 'The passenger’s preference alone', 'The length of the journey alone'],
 ['Why should a passenger receive a clear briefing before the ride?', 'Their movements and actions can affect the ride', 'It replaces suitable protective equipment', 'It makes the rider’s training unnecessary', 'It guarantees no unexpected events'],
 ['How should luggage be carried?', 'Securely and within the motorcycle’s loading guidance', 'Loosely across moving parts', 'Where it blocks controls', 'According only to the largest available bag'],
 ['Why does a helmet need to fit properly?', 'Fit is important to its protective function', 'Any size gives identical protection', 'A loose fit guarantees ventilation without risk', 'Only its colour affects protection'],
 ['A rider feels very tired before a journey. What is appropriate?', 'Address the fatigue before riding', 'Use confidence as a substitute for rest', 'Assume fatigue affects only car drivers', 'Ride faster to finish sooner'],
 ['A medicine may cause drowsiness. What should the rider check?', 'The medicine’s advice and appropriate professional guidance before riding', 'Only the package colour', 'Whether another rider ignores it', 'Whether the journey is familiar'],
];
const railwayBasics = [
 ['What guides the wheels of a conventional railway vehicle?', 'The rails and wheel-rail geometry', 'Only the destination sign', 'Only the interior lighting', 'The seat arrangement'],
 ['What is a railway point or switch used for?', 'Guiding a vehicle from one track route to another', 'Changing the vehicle’s name', 'Measuring passenger height', 'Replacing every signal'],
 ['What is a railway platform?', 'An area beside the track used for boarding and leaving services', 'The inside of the engine', 'A type of wheel bearing', 'The vehicle’s braking pipe'],
 ['Why do railway vehicles generally need substantial stopping distance?', 'Their speed, mass and wheel-rail adhesion limit how quickly they can stop', 'Brakes never apply force', 'Rails remove all friction', 'Stopping distance is always the same'],
 ['What is a coupling used for?', 'Connecting railway vehicles', 'Measuring outside temperature', 'Controlling platform lighting', 'Printing tickets'],
 ['What does traction refer to in railway operation?', 'The force used to propel the vehicle', 'Only the number of seats', 'Only the station roof', 'The timetable’s typeface'],
 ['What is a gradient?', 'The slope of a route', 'The colour of a signal', 'The number of doors', 'The age of a wheel'],
];
const railObservation = [
 ['A display changes from 45 to 35. What change does it show?', 'A decrease of 10', 'An increase of 10', 'A decrease of 5', 'No change'],
 ['A log records a warning at 07:18 and an acknowledgement at 07:20. Which came first?', 'The warning', 'The acknowledgement', 'They were simultaneous', 'The order cannot be determined'],
 ['A notice says “Platform 4 closed”. Which detail needs checking before directing passengers?', 'The current authorised boarding platform', 'Only the notice’s colour', 'The number of windows in the station', 'The nearest advertisement'],
 ['An indicator is unreadable. What is the sound response?', 'Use the applicable procedure to resolve the missing information', 'Assume it shows the usual value', 'Choose the most convenient interpretation', 'Cover it so it is no longer distracting'],
 ['Two reports give different locations for the same obstruction. What needs clarification?', 'The exact location before relying on the reports', 'Only which report is longer', 'Only the reporter’s favourite route', 'Nothing if both sound confident'],
 ['A vehicle number is recorded as 4826 in one place and 4862 in another. What differs?', 'The last two digits are reversed', 'The first two digits are reversed', 'All digits are different', 'The numbers are identical'],
 ['A new vibration appears that was not present earlier. What should be recognised?', 'A change that may need reporting and assessment', 'Proof of one specific fault without checking', 'A guarantee that the vehicle is safe', 'A reason to delete the earlier observation'],
];
const railSafety = [
 ['Why must railway signals be interpreted using the relevant railway’s rules?', 'Signal meanings and operating systems can differ', 'Every colour has an identical meaning worldwide', 'A guess is sufficient on familiar routes', 'Signals are only decorative'],
 ['An instruction to move is unclear. What should happen?', 'Clarify it through the authorised communication procedure', 'Guess from one word', 'Copy another vehicle’s movement', 'Treat silence as permission'],
 ['Why are people kept away from restricted track areas?', 'Moving vehicles and railway equipment can create serious hazards', 'Rails are safe whenever no vehicle is visible', 'Only passengers face hazards', 'Restrictions apply only at night'],
 ['What should a report of an obstruction on the line trigger?', 'The applicable safety and reporting procedure', 'An assumption that someone else removed it', 'A decision based only on the timetable', 'A guess about whether it is small enough'],
 ['Why must a departure check confirm that it is safe to move?', 'Boarding activity and other conditions may create a hazard', 'The timetable alone proves safety', 'Closed doors guarantee every condition is safe', 'A familiar station cannot have a new hazard'],
 ['A safety-critical procedure has changed. Which version should be used?', 'The current authorised version', 'Any old copy remembered by the driver', 'A summary without a source', 'Whichever version is shortest'],
 ['Why should unusual equipment behaviour be reported accurately?', 'The information can support a safe assessment and response', 'Reporting automatically fixes every fault', 'A guess about the cause is always better than observations', 'Only permanent faults are relevant'],
];
const railBrakes = [
 ['What does wheel-rail adhesion describe?', 'The available grip between wheels and rails', 'The colour of the track', 'The number of carriages', 'The height of the station roof'],
 ['Why can wet or contaminated rails affect braking?', 'They can reduce available adhesion', 'They always increase grip', 'They remove vehicle mass', 'They make all stopping distances zero'],
 ['With other conditions equal, what does higher speed generally mean for stopping distance?', 'More distance is needed', 'Less distance is always needed', 'Exactly the same distance is needed', 'Brakes are no longer relevant'],
 ['A heavier moving vehicle at the same speed has more of which quantity?', 'Momentum', 'Route length', 'Signal visibility', 'Clock accuracy'],
 ['Why does a downhill gradient matter during braking?', 'Gravity contributes a force along the direction of descent', 'Gravity disappears downhill', 'The rails stop guiding the wheels', 'The vehicle’s mass becomes zero'],
 ['What is the purpose of a brake test required by the operating procedure?', 'To confirm specified aspects of brake function', 'To replace every later observation', 'To guarantee no future fault', 'To set the station timetable'],
 ['Why should braking be planned with a margin for conditions?', 'Actual adhesion and response may vary', 'Every rail surface behaves identically', 'A timetable determines friction', 'The shortest possible stop is always guaranteed'],
];
const railTimings = [
 ['A service departs at 08:35 and arrives at 09:20. What is the journey time?', '45 minutes', '35 minutes', '55 minutes', '85 minutes'],
 ['A service is due at 16:48 and is 12 minutes late. What is the revised arrival time?', '17:00', '16:54', '17:12', '16:36'],
 ['A route is 90 km long. At an average speed of 60 km/h, what is the travel time?', '90 minutes', '60 minutes', '120 minutes', '150 minutes'],
 ['A schedule allows 4 minutes at each of 3 stops. What is the total stopping time?', '12 minutes', '7 minutes', '8 minutes', '16 minutes'],
 ['A vehicle travels 24 km in 20 minutes. What is its average speed?', '72 km/h', '48 km/h', '24 km/h', '120 km/h'],
 ['A working period starts at 11:15 and ends at 13:45. How long is it?', '2 hours 30 minutes', '2 hours 15 minutes', '3 hours', '1 hour 30 minutes'],
 ['Five carriages each have 64 seats. How many seats are there in total?', '320', '256', '300', '384'],
];
export const transportQuizzes = {
 firefighter: quiz('fire science and incident reasoning', [
  ['How fire behaves','fire_smoke_science',fireScience], ['Smoke and visibility','fire_smoke_science',smoke], ['Reading the scene','scene_hazard_awareness',scene], ['Equipment and checks','equipment_mechanical_reasoning',equipment], ['Mechanical principles','equipment_mechanical_reasoning',mechanics], ['Space and direction','numeracy_spatial_awareness',spatial], ['Numbers under pressure','numeracy_spatial_awareness',calculation], ['Clear team communication','communication_incident_judgement',coordination], ['Checking the evidence','scene_hazard_awareness',evidence], ['Incident judgement','communication_incident_judgement',fireJudgment],
 ], {}, 'Scenarios do not replace fire-service training, protective equipment or incident procedures.'),
 motorbike: quiz('motorcycle awareness', [
  ['Know the motorcycle','machine_checks',bikeParts], ['Checks before riding','machine_checks',bikeChecks], ['Grip and road surfaces','hazard_awareness',grip], ['Space to stop','braking_control',braking], ['Reading a bend','cornering_control',corners], ['Anticipating hazards','hazard_awareness',hazards], ['Passenger and rider readiness','passenger_safety',passenger.map((row,i)=>[...row.slice(0,5),undefined,i>=5?'rider_readiness':'passenger_safety'])], ['Mechanical connections','machine_checks',mechanics], ['Distances and quantities','rider_readiness',calculation], ['Check before concluding','hazard_awareness',evidence],
 ], {}, 'No country-specific speed limits or road priority rules are assumed. These questions do not replace practical rider training.'),
 train: quiz('railway observation and reasoning', [
  ['Railway essentials','mechanical',railwayBasics], ['Notice the change','observation',railObservation], ['Safety and instructions','safety',railSafety], ['Grip and braking','mechanical',railBrakes], ['Mechanical principles','mechanical',mechanics], ['Clear railway communication','communication',coordination], ['Routes and directions','observation',spatial], ['Timetables and travel','observation',railTimings], ['Quantities and distances','mechanical',calculation], ['Judging the information','safety',evidence],
 ], {}, 'Signal meanings, permissions and operating procedures differ by railway. Arithmetic examples are not operational instructions.'),
};
