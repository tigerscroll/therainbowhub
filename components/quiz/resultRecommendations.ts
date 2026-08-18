export type ResultRecommendation = {
  slug: "memory" | "chef" | "paramedic" | "years-left" | "vintage" | "vision" | "nursing" | "midwifery" | "grammar" | "idiom" | "iq";
  icon: string;
  title: string;
  shortTitle: string;
  summary: string;
  cta: string;
  thumbnail: string;
};

export const RESULT_RECOMMENDATIONS: ResultRecommendation[] = [
  {
    slug: "memory",
    icon: "🧠",
    title: "Most Adults Can’t Score 80% On This Memory Test",
    shortTitle: "Test Your Memory",
    summary: "Words, pictures, numbers and delayed recall put a different part of your mind under pressure.",
    cta: "Take the Memory Test",
    thumbnail: "/quizzes/memory/assets/thumbnail-480.webp",
  },
  {
    slug: "chef",
    icon: "🧑‍🍳",
    title: "Only 12% Pass This Chef's Entrance Exam",
    shortTitle: "Enter the Chef Exam",
    summary: "Flavour, heat, pastry and service decisions come together in one fast kitchen challenge.",
    cta: "Take the Chef Exam",
    thumbnail: "/quizzes/chef/assets/thumbnail-480.webp",
  },
  {
    slug: "paramedic",
    icon: "🚑",
    title: "Only 8% Pass This Paramedic Entrance Exam",
    shortTitle: "Try the Paramedic Exam",
    summary: "Scene safety, vital signs and rapid-response judgement test how clearly you think under pressure.",
    cta: "Take the Paramedic Exam",
    thumbnail: "/quizzes/paramedic/assets/thumbnail-480.webp",
  },
  {
    slug: "years-left",
    icon: "⚰️",
    title: "How Many Years Do You Have Left?",
    shortTitle: "Reveal Your Prediction",
    summary: "Everyday habits shape a playful AI lifestyle prediction with a completely different kind of result.",
    cta: "Get My Prediction",
    thumbnail: "/quizzes/years-left/assets/thumbnail-480.webp",
  },
  {
    slug: "vintage",
    icon: "📻",
    title: "Only 7% Can Name These Vintage Items",
    shortTitle: "Name the Vintage Items",
    summary: "Cassette tapes, rotary phones and forgotten objects make one quick trip through the past.",
    cta: "Take the Vintage Quiz",
    thumbnail: "/quizzes/vintage/assets/thumbnail-480.webp",
  },
  {
    slug: "vision",
    icon: "👁️",
    title: "Only 7% Can Pass This Vision Test",
    shortTitle: "Test Your Visual Focus",
    summary: "Colours, tiny details, patterns and rotations combine in one fast visual challenge.",
    cta: "Take the Vision Test",
    thumbnail: "/quizzes/vision/assets/thumbnail-480.webp",
  },
  {
    slug: "nursing",
    icon: "🩺",
    title: "Only 7% Pass This Nursing Entrance Exam",
    shortTitle: "Try the Nursing Exam",
    summary: "Anatomy, observations, safety and patient-care judgement test your clinical thinking.",
    cta: "Take the Nursing Exam",
    thumbnail: "/quizzes/nursing/assets/thumbnail-480.webp",
  },
  {
    slug: "midwifery",
    icon: "👶",
    title: "Only 7% Pass This Midwifery Entrance Exam",
    shortTitle: "Try the Midwifery Exam",
    summary: "Pregnancy, labour, newborn care and compassionate judgement come together in one challenge.",
    cta: "Take the Midwifery Exam",
    thumbnail: "/quizzes/midwifery/assets/thumbnail-480.webp",
  },
  {
    slug: "grammar",
    icon: "✍️",
    title: "Only 10% Of The Population Can Pass This Grammar Quiz",
    shortTitle: "Test Your Grammar",
    summary: "Sentence structure, punctuation and almost-correct wording make ten fast editing traps.",
    cta: "Take the Grammar Quiz",
    thumbnail: "/quizzes/grammar/assets/thumbnail-480.webp",
  },
  {
    slug: "idiom",
    icon: "💬",
    title: "Only 5% Of Adults Can Ace This Idiom Quiz",
    shortTitle: "Test Your Idioms",
    summary: "Hidden meanings, emoji clues and almost-right expressions make one fast phrase challenge.",
    cta: "Take the Idiom Quiz",
    thumbnail: "/quizzes/idiom/assets/thumbnail-480.webp",
  },
  {
    slug: "iq",
    icon: "🧠",
    title: "Are You Smarter Than 96% Of The Population?",
    shortTitle: "Test Your Smarts",
    summary: "Patterns, codes, word links and logic traps challenge how quickly you spot the rule.",
    cta: "Take the Smart Test",
    thumbnail: "/quizzes/iq/assets/thumbnail-480.webp",
  },
];

export function supportsResultRecommendation(slug: string) {
  return RESULT_RECOMMENDATIONS.some((quiz) => quiz.slug === slug);
}

export function nextResultRecommendation(currentSlug: string, previousSlug?: string | null) {
  const candidates = RESULT_RECOMMENDATIONS.filter((quiz) => quiz.slug !== currentSlug);
  if (!candidates.length) return undefined;

  const previousIndex = previousSlug
    ? candidates.findIndex((quiz) => quiz.slug === previousSlug)
    : -1;
  if (previousIndex >= 0) return candidates[(previousIndex + 1) % candidates.length];

  const sourceIndex = RESULT_RECOMMENDATIONS.findIndex((quiz) => quiz.slug === currentSlug);
  return candidates[Math.max(0, sourceIndex) % candidates.length];
}

export function otherResultRecommendations(currentSlug: string, stickySlug?: string | null) {
  return RESULT_RECOMMENDATIONS.filter(
    (quiz) => quiz.slug !== currentSlug && quiz.slug !== stickySlug,
  ).slice(0, 4);
}
