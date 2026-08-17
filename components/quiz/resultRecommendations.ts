export type ResultRecommendation = {
  slug: "memory" | "chef" | "paramedic" | "years-left" | "vintage";
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
