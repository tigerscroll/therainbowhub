// The first five chapters retain the recovered 40-question edition.
// New questions alternate between two profile sets, giving all eight equal
// scoring opportunities without treating a personal preference as correct.
export const profileSets = [
  ['warm_anchor', 'playful_spark', 'quiet_creative', 'grounded_builder'],
  ['magnetic_connector', 'curious_explorer', 'thoughtful_dreamer', 'ambitious_teammate'],
];

// Strip the decorative trailing emoji, not apostrophes, hyphens or diacritics.
export function marryChapterLabel(title) {
  return title.replace(/\s+[\p{Extended_Pictographic}\p{Emoji_Modifier}\uFE0F\u200D]+$/u, '').trim();
}

export const chapters = [
  {
    title: 'Your Attraction Code ✨',
    checkpoint: 'The first lines are in',
    feedback: 'Your first impressions have set the direction. Next, go beyond the look and discover the personality you are drawn to.',
    teaser: 'A look catches your eye. What makes someone stay on your mind?',
  },
  {
    title: 'The Personality Match ❤️',
    checkpoint: 'Now there is personality behind the portrait',
    feedback: 'Humour, trust and support have added another layer. Now picture the everyday life you would want to share.',
    teaser: 'Picture a Saturday, a shared home and the life between big moments.',
  },
  {
    title: 'Your Life Together 🏡',
    checkpoint: 'You have pictured a life together',
    feedback: 'Your choices say more than a dream date could. Next, explore the kind of connection that makes ordinary moments matter.',
    teaser: 'What turns a good match into a connection you can feel?',
  },
  {
    title: 'The Chemistry Test 🔥',
    checkpoint: 'Your connection has a clearer shape',
    feedback: 'You have explored affection and how you reconnect. Change the pace now: choose the places, colours and little clues that call to you.',
    teaser: 'No perfect answers here. Follow the places and details that pull you in.',
  },
  {
    title: 'Your Future Clues 🔮',
    checkpoint: 'Your instincts have joined the picture',
    feedback: 'The dreamy details are in. Now bring the portrait down to earth with the tiny gestures that make you feel chosen.',
    teaser: 'A message, a small favour, a shared laugh. Which little things matter?',
  },
  {
    title: 'The Little Things 💌',
    checkpoint: 'The small details say a lot',
    feedback: 'You have shown what makes care feel personal. Next, explore the space a relationship needs for both people to grow.',
    teaser: 'Two people, two lives. What helps you grow without losing yourself?',
    questions: [
      ['Which message would make an ordinary day better?', 'I saved you a seat beside me', 'This ridiculous photo is so us', 'This song made me think of you', 'I took care of that errand for you'],
      ['You walk into a room together. What do they do?', 'Bring you into the conversation', 'Suggest exploring somewhere new', 'Notice if you need a quiet moment', 'Introduce you with genuine pride'],
      ['Which tiny habit would you secretly love?', 'Checking that you got home safely', 'Making up silly names for things', 'Leaving little sketches on notes', 'Always putting your favourite mug out'],
      ['What would you love to find inside a gift?', 'An invitation to a shared celebration', 'Tickets for an unfamiliar place', 'A letter full of remembered moments', 'Something that supports your next goal'],
      ['A long day has left you drained. Pick your evening.', 'A warm meal and someone who listens', 'A comedy and completely silly commentary', 'Music, soft light and quiet company', 'The chores handled so you can rest'],
      ['Which compliment would stay with you?', 'You make people feel welcome', 'You make me want to explore more', 'You notice what really matters', 'I admire how you keep going'],
      ['You have a few spare minutes together. Choose.', 'Sit close and catch up properly', 'Invent a tiny, ridiculous game', 'Share something beautiful you found', 'Make tomorrow a little easier'],
      ['Which photo would you keep from a day together?', 'A joyful group hug', 'A windblown moment somewhere new', 'An unposed, tender glance', 'The moment you achieved something together'],
    ],
  },
  {
    title: 'Room to Grow 🌱',
    checkpoint: 'Your match needs room to be real',
    feedback: 'You have explored independence, encouragement and being yourself. Now see what happens when the plan changes.',
    teaser: 'Missed trains and changed plans can reveal an unexpected side of a match.',
    questions: [
      ['You try a hobby they do not share. What feels good?', 'They ask about it because it matters to you', 'They cheer on your delightfully awkward first try', 'They enjoy their own creative project nearby', 'They help you make time for it'],
      ['Which new skill would be fun to learn together?', 'Hosting a brilliant gathering', 'Finding your way on a new trail', 'Writing a story from your memories', 'Building a small project from scratch'],
      ['What makes time apart feel healthy?', 'A caring check-in without pressure', 'Funny updates when something happens', 'Freedom to get absorbed in your own interests', 'Clear plans you can both rely on'],
      ['A dream of yours starts to feel possible. What do they say?', 'Let us bring your people together', 'What is the first adventure it takes you on?', 'Tell me what it means to you', 'Let us turn it into a plan'],
      ['Which difference between you could be a strength?', 'One worries; the other offers reassurance', 'One gets serious; the other brings lightness', 'You see the same thing in different ways', 'One imagines; the other organises'],
      ['Choose the kind of confidence you find attractive.', 'Making others comfortable without taking over', 'Being willing to try something unfamiliar', 'Being honest about a tender feeling', 'Working toward a goal without showing off'],
      ['You need an evening to yourself. What response feels right?', 'Of course. I am here if you need me', 'Enjoy it. Save your best story for later', 'Take your time. I need creative space too', 'No problem. We can plan another evening'],
      ['What would you most like to bring out in each other?', 'Openness with the people around you', 'Courage to explore unfamiliar things', 'A deeper understanding of yourselves', 'Belief in what you can accomplish'],
    ],
  },
  {
    title: 'The Unexpected Detour 🌦️',
    checkpoint: 'You have seen beyond the perfect date',
    feedback: 'The way you handle a detour adds another side to your match. Next, choose the moments you would want to turn into traditions.',
    teaser: 'Which ordinary moments would you want to repeat for years?',
    questions: [
      ['Rain ruins your outdoor date. What is their best response?', 'Make somewhere indoors feel cosy', 'Turn the dash for shelter into a comedy', 'Find a little gallery neither of you knows', 'Arrange a comfortable backup plan'],
      ['Your table booking has vanished. What happens next?', 'They charm the evening back into shape', 'You try the intriguing place next door', 'You take a quiet walk and talk instead', 'They find another option and book it'],
      ['Something you cooked together goes wrong. Pick the moment.', 'It is fine. We still have each other', 'You give the disaster a ridiculous name', 'You reinvent it as something unexpected', 'You work out what can still be saved'],
      ['Your train is delayed. How would you pass the time?', 'Swap stories with the people around you', 'Explore the streets near the station', 'Share a conversation you never had time for', 'Sort out the next part of the journey'],
      ['You have different opinions on a film. What is fun about that?', 'You can disagree and still feel close', 'The debate turns into affectionate teasing', 'You discover a detail you had both missed', 'You take turns choosing the next one'],
      ['An unfamiliar situation makes you nervous. What helps?', 'They make it easy to join in', 'They offer to try it alongside you', 'They ask what is worrying you', 'They break it into manageable steps'],
      ['A weekend suddenly becomes free. What would you choose?', 'Unhurried time with no demands', 'A playful plan made on the spot', 'A day following your creative curiosity', 'Finish something together, then relax'],
      ['You get lost on a walk. Which response wins you over?', 'Ask someone and enjoy the conversation', 'Treat it as a chance to discover somewhere', 'Pause and enjoy the unexpected view', 'Check the route and find the way back'],
    ],
  },
  {
    title: 'Your Shared Story 📖',
    checkpoint: 'Your shared story has its own feel',
    feedback: 'Your everyday rituals and favourite memories have added the finishing touches. One final set of instinctive choices leads to the portrait reveal.',
    teaser: 'The final clues: choose what feels right, then meet your fictional match.',
    questions: [
      ['Which small tradition would you start?', 'A quiet meal with no phones', 'A weekly challenge that makes you laugh', 'A notebook full of ideas and little drawings', 'A regular morning to plan and cook together'],
      ['Pick an anniversary you would remember fondly.', 'A celebration with your favourite people', 'A trip with an unexpected destination', 'Revisiting the place of a meaningful conversation', 'Celebrating something you built together'],
      ['Which keepsake feels most like your relationship?', 'A handwritten note kept in a pocket', 'A photograph with a ridiculous story', 'A small artwork you made together', 'An object you repaired and still use'],
      ['Your friends describe you as a couple. What sounds best?', 'They make everyone feel included', 'They are always curious about somewhere new', 'They really understand each other', 'They help each other make things happen'],
      ['What should a shared home always have room for?', 'A comfortable place to talk', 'Something that makes you both laugh', 'An unfinished creative project', 'The tools to make everyday life work'],
      ['Which story would you enjoy retelling?', 'The night everyone became friends', 'The trip that went gloriously off-plan', 'The conversation that changed your perspective', 'The challenge you finally overcame together'],
      ['What would you want to stay the same as years pass?', 'The feeling of being cared for', 'The way you still make each other laugh', 'The curiosity about each other’s inner world', 'The habit of showing up and doing your part'],
      ['Choose a promise that feels meaningful to you.', 'Keep making room for the people we love', 'Keep discovering things together', 'Keep listening, even when words are difficult', 'Keep supporting each other’s next step'],
    ],
  },
  {
    title: 'The Final Instinct ✏️',
    checkpoint: 'Your portrait is ready',
    feedback: 'Your attraction, everyday-life choices and final instincts are all in. Reveal your fictional portrait, their relationship style and the details behind your match.',
    questions: [
      ['Imagine their expression when they see you. Choose.', 'A gentle look that makes you feel safe', 'A grin that says an inside joke is coming', 'A thoughtful look full of quiet curiosity', 'A calm smile that makes everything feel steady'],
      ['What would you notice in their posture?', 'An open, welcoming ease', 'Restless energy ready for an adventure', 'A quiet, unhurried presence', 'A purposeful, self-assured stance'],
      ['Pick the setting for a moment you would remember.', 'A warm kitchen late in the evening', 'A photo booth full of laughter', 'A sunlit room with paint on the table', 'A garden you have grown together'],
      ['What kind of story might their eyes tell?', 'I love getting to know people', 'There is always more to discover', 'I notice the things you do not say', 'I know what I want to work toward'],
      ['Which first conversation would you want to continue?', 'One that makes you feel immediately at ease', 'One full of quick, playful exchanges', 'One about an idea you have never considered', 'One where their honesty feels refreshing'],
      ['Which quality would make their appearance more attractive?', 'The way they include someone left out', 'Their delight in discovering something new', 'The care they take with your feelings', 'Their quiet determination when things get difficult'],
      ['Choose the feeling you would want after a day together.', 'I can relax and be myself', 'Life feels lighter with this person', 'I have found someone wonderfully original', 'We make a good team in everyday life'],
      ['Your final clue: what would make you look twice?', 'A presence that draws people together', 'A spark of adventure in their expression', 'A gentle look with unexpected depth', 'A confidence that makes you want to move forward'],
    ],
  },
];
