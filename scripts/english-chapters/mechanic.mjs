import fs from 'node:fs';
const bank = JSON.parse(fs.readFileSync(new URL('./mechanic-bank.json', import.meta.url), 'utf8'));
const old = id => bank[id];
export default {
  slug: 'mechanic',
  summary: 'Read the dashboard, connect vehicle systems and put your workshop reasoning to the test.',
  about: 'Explore vehicle systems, warning signs, measurement and fault-finding through a mix of practical questions. Each set focuses on a new part of the car or a new kind of clue.\n\nChoose the answer supported by the information shown. See your topic profile at each checkpoint, then reveal your overall result and optionally review missed answers.\n\nQuestions avoid national road rules, inspection standards and assumptions about one make or model. Diagnostic clues suggest areas to investigate; they do not prove a fault without testing. Vehicles differ, so manufacturer guidance matters.',
  references: 'The retained question bank comes from the project’s reviewed worldwide Mechanic edition. See [its manufacturer and safety references](SOURCES.md). Added questions use broad component functions and self-contained measurements; no DIY high-voltage procedures are included.',
  rounds: [
    { title: 'Dashboard Detective', category: 'diagnosis_safety', checkpoint: 'Your dashboard snapshot', feedback: 'Dashboard clues: {profile}. Look beneath the warning lights.', teaser: 'Match engine parts with the jobs they do.', questions: [
      old('r1q1'),old('r1q2'),old('r1q3'),old('r1q4'),old('r1q5'),old('r1q6'),
      ['Where should you check the meaning of an unfamiliar dashboard symbol?', 'The vehicle’s owner manual', 'The symbol’s colour alone', 'A different model’s dashboard', 'The age of the key'],
    ] },
    { title: 'Inside the Engine', category: 'engine_fuel', checkpoint: 'The engine comes into focus', feedback: 'Engine knowledge: {profile}. Follow the force down to the wheels.', teaser: 'Explore braking, grip and the contact with the road.', questions: [
      old('r2q1'),
      ['In a petrol (gasoline) engine, what normally ignites the air-fuel mixture?', 'A spark plug', 'An oil filter', 'A radiator', 'A wheel sensor'],
      ['What is the main job of a fuel injector?', 'Deliver a controlled amount of fuel', 'Cool the brake pads', 'Measure wheel alignment', 'Filter cabin air'],
      ['Which moving part travels up and down inside an engine cylinder?', 'Piston', 'Alternator', 'Radiator cap', 'Brake caliper'],
      ['What does the crankshaft convert piston movement into?', 'Rotating movement', 'Cabin airflow', 'Brake-fluid pressure', 'Battery voltage'],
      ['What does a camshaft typically control?', 'The opening and closing of engine valves', 'Wheel balance', 'Cabin temperature selection', 'The parking brake lever'],
      ['What does a turbocharger use to drive its turbine?', 'Exhaust-gas energy', 'Washer-fluid pressure', 'Brake-pad movement', 'Steering-wheel rotation'],
    ] },
    { title: 'Brakes and Grip', category: 'brakes_grip', checkpoint: 'Grip and stopping power', feedback: 'Brakes and grip: {profile}. Follow the electrical connections.', teaser: 'Find out what powers the car’s electrical systems.', questions: [
      old('r2q2'),old('r4q2'),old('r3q2'),
      ['Which component squeezes the pads against a brake disc (rotor)?', 'Brake caliper', 'Fuel injector', 'Alternator', 'Timing pulley'],
      ['What does friction braking mainly turn the car’s motion energy into?', 'Heat', 'Stored fuel', 'Engine coolant', 'Compressed air in the cabin'],
      ['What helps a road tire’s tread move water away from its contact area?', 'Grooves in the tread', 'The valve cap', 'The wheel’s centre badge', 'The brake-fluid reservoir'],
      ['For a particular vehicle, which source gives the recommended tire pressures?', 'Its pressure placard or owner manual', 'The maximum pressure marking alone', 'The wheel colour', 'The fuel gauge'],
    ] },
    { title: 'Electrical Connections', category: 'electrical', checkpoint: 'The circuit is clearer', feedback: 'Electrical systems: {profile}. Next, follow the fluids.', teaser: 'Keep lubrication and temperature control straight.', questions: [
      old('r2q3'),old('r4q3'),
      ['What is the starter motor’s main job in a conventional combustion car?', 'Turn the engine to begin starting it', 'Keep the cabin cold', 'Filter the fuel', 'Apply the parking brake'],
      ['What is the purpose of a fuse in an electrical circuit?', 'Interrupt excessive current', 'Increase fuel pressure', 'Store engine oil', 'Measure tire wear'],
      ['Which quantity is measured in volts?', 'Electrical potential difference', 'Fluid volume', 'Rotational speed', 'Fastener torque'],
      ['Which quantity is measured in amperes?', 'Electrical current', 'Distance travelled', 'Engine capacity', 'Coolant temperature'],
      ['What does an open circuit prevent along the broken path?', 'Electrical current from flowing', 'The car from containing fuel', 'The tires from holding air', 'The brakes from producing friction'],
    ] },
    { title: 'Fluids and Cooling', category: 'cooling_fluids', checkpoint: 'The fluids make sense', feedback: 'Fluids and cooling: {profile}. Follow the power through the drivetrain.', teaser: 'Connect steering, suspension and driven wheels.', questions: [
      old('r2q4'),old('r4q1'),old('r4q4'),
      ['What is the main purpose of engine oil?', 'Lubricate moving engine parts', 'Inflate the tires', 'Replace the air filter', 'Cool the passenger cabin alone'],
      ['What does the radiator help transfer from coolant to surrounding air?', 'Heat', 'Electrical charge', 'Fuel', 'Brake pressure'],
      ['What typically circulates coolant through a liquid-cooled engine?', 'Coolant pump', 'Fuel injector', 'Starter solenoid', 'Brake master cylinder'],
      ['Why should a hot pressurised cooling-system cap stay closed?', 'Hot liquid and steam can escape and burn', 'The cap controls wheel alignment', 'The coolant becomes harmless when hot', 'Removing it switches off all pressure instantly'],
    ] },
    { title: 'Power and Steering', category: 'drivetrain_steering', checkpoint: 'The power path connects', feedback: 'Drivetrain and steering: {profile}. Put the workshop numbers to work.', teaser: 'Use the stated measurements to find the answer.', questions: [
      old('r2q5'),old('r4q5'),
      ['In a manual transmission, what does the clutch allow you to disconnect?', 'The engine from the transmission input', 'The radiator from the coolant', 'The tires from their wheels', 'The brake pads from their material'],
      ['What is the main purpose of a gearbox?', 'Provide different speed and torque ratios', 'Store cooling water', 'Clean intake air', 'Generate sparks directly'],
      ['What do suspension dampers mainly control?', 'Spring and wheel oscillation', 'Fuel octane', 'Battery chemistry', 'Exhaust composition'],
      ['What does a wheel bearing allow?', 'The wheel to rotate while supporting load', 'The engine to inject fuel', 'The coolant to freeze safely', 'The brake fluid to become compressible'],
      ['What allows a driven front wheel to receive power while steering?', 'A constant-velocity joint', 'An oil filter', 'A radiator thermostat', 'A starter relay'],
    ] },
    { title: 'Workshop Numbers', category: 'diagnosis_safety', checkpoint: 'The measurements add up', feedback: 'Workshop calculations: {profile}. Use evidence to guide the next step.', teaser: 'Separate a useful clue from a proven cause.', questions: [
      old('r3q1'),old('r3q4'),old('r3q5'),old('r3q6'),
      ['A test component measures 8.0 mm, then 7.6 mm. What is the decrease?', '0.4 mm', '0.2 mm', '1.4 mm', '4.0 mm'],
      ['A training diagram has 4 wheels with 5 fasteners each. How many fasteners?', '20', '9', '16', '25'],
      ['A supplied test range is 10–14 units. Which reading is inside the range?', '12', '8', '15', '18'],
    ] },
    { title: 'Diagnostic Thinking', category: 'diagnosis_safety', checkpoint: 'The clues narrow down', feedback: 'Diagnostic reasoning: {profile}. Keep the workshop safe as you investigate.', teaser: 'Spot the decisions that protect people and equipment.', questions: [
      old('r3q3'),old('r4q6'),
      ['A noise started just after a repair. What is a useful first piece of information?', 'What work and parts changed', 'The driver’s favourite music', 'The vehicle’s resale colour', 'The weather a year ago'],
      ['A fault occurs only when a connector is moved during a controlled test. What deserves checking?', 'That connector and its wiring', 'Only the seat fabric', 'Only the fuel grade', 'Only the paint finish'],
      ['Why compare a test reading with the specification for that vehicle?', 'A normal value can depend on the design', 'Every vehicle has identical limits', 'A reading never needs units', 'The specification replaces all measurements'],
      ['What does clearing a fault code establish by itself?', 'The stored code was cleared', 'The cause was permanently repaired', 'Every sensor passed testing', 'All wiring is undamaged'],
      ['A symptom disappears once and later returns. What is the careful conclusion?', 'The fault may be intermittent', 'The repair is certainly complete', 'The symptom never happened', 'All parts must be replaced'],
    ] },
    { title: 'Workshop Safety', category: 'diagnosis_safety', checkpoint: 'Safe decisions matter', feedback: 'Workshop safety: {profile}. Bring the evidence together.', teaser: 'Combine symptoms, measurements and sound reasoning.', questions: [
      old('r5q6'),old('r5q2'),old('r2q6'),
      ['An unfamiliar electric-vehicle high-voltage system needs work. Who should handle it?', 'A qualified technician using the correct procedures', 'Anyone wearing ordinary gloves', 'Anyone who has switched off the radio', 'An untrained person with a household screwdriver'],
      ['Why can running a combustion engine in an enclosed space be dangerous?', 'Exhaust can contain poisonous carbon monoxide', 'The tires absorb all the oxygen', 'The battery creates drinking water', 'The steering uses up the room’s light'],
      ['A tool is visibly damaged before use. What is the safe choice?', 'Take it out of use and arrange a suitable replacement', 'Use it harder to test it', 'Hide the damage with paint', 'Assume a short job makes it safe'],
      ['Why follow the specified tightening torque?', 'Too little or too much can cause problems', 'Every fastener needs maximum force', 'Torque is only a colour code', 'Tighter always means safer'],
    ] },
    { title: 'The Final Diagnosis', category: 'diagnosis_safety', checkpoint: 'Your mechanic result is ready', questions: [
      old('r5q1'),old('r5q3'),old('r5q4'),old('r5q5'),
      ['A device works with a tested power supply but not its original supply. Which area is implicated?', 'The original supply path', 'The vehicle’s paint', 'The wheel alignment', 'The exhaust silencer'],
      ['A service sheet specifies 5.0 L total. A training record shows 4.2 L. What is the difference?', '0.8 L', '0.2 L', '1.2 L', '9.2 L'],
      ['Several parts could explain a symptom. Which approach best avoids replacing parts by guesswork?', 'Use targeted tests to compare the possible causes', 'Replace the most expensive part first', 'Treat the first suggestion as proof', 'Ignore the symptom if the paint looks good'],
    ] },
  ],
};
