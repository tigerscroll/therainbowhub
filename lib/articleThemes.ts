import type { QuizTheme } from "@/lib/quizzes";

// Shared article styling is independent of any quiz's content or artwork.
export const editorialArticleTheme: QuizTheme = {
  id: "editorial-article",
  preset: "editorial",
  layout: { landing: "split", questions: "card", results: "immersive" },
  colors: {
    page: "#d8c9bd",
    pageAlt: "#b99a8b",
    surface: "#f8f0e3",
    surfaceRaised: "#fffaf2",
    text: "#26201e",
    muted: "#756761",
    primary: "#7f3446",
    primaryText: "#fffaf2",
    border: "#4b403b",
    correct: "#55725f",
    incorrect: "#9a4050",
  },
  typography: { heading: "serif", body: "sans" },
  shape: { cardRadius: "20px", buttonRadius: "999px" },
  effects: { shadow: "soft", texture: "paper" },
};

export const editorialArticleAvatars = ["09", "03", "12", "08"]
  .map((id) => `/social-proof/avatars/${id}.webp`);
