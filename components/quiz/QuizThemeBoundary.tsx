import type { CSSProperties, ReactNode } from "react";

import type { QuizTheme } from "@/lib/quizzes";

type QuizThemeBoundaryProps = {
  children: ReactNode;
  customCss?: string;
  theme: QuizTheme;
};

export function QuizThemeBoundary({ children, customCss, theme }: QuizThemeBoundaryProps) {
  const variables = {
    "--quiz-page": theme.colors.page,
    "--quiz-page-alt": theme.colors.pageAlt,
    "--quiz-surface": theme.colors.surface,
    "--quiz-surface-raised": theme.colors.surfaceRaised,
    "--quiz-text": theme.colors.text,
    "--quiz-muted": theme.colors.muted,
    "--quiz-primary": theme.colors.primary,
    "--quiz-primary-text": theme.colors.primaryText,
    "--quiz-border": theme.colors.border,
    "--quiz-correct": theme.colors.correct,
    "--quiz-incorrect": theme.colors.incorrect,
    "--quiz-card-radius": theme.shape.cardRadius,
    "--quiz-button-radius": theme.shape.buttonRadius,
  } as CSSProperties;

  return (
    <>
      {customCss ? <style data-quiz-css={theme.id}>{customCss}</style> : null}
      <div
        className="quiz-theme"
        data-heading={theme.typography.heading}
        data-landing-layout={theme.layout.landing}
        data-question-layout={theme.layout.questions}
        data-quiz-theme={theme.id}
        data-result-layout={theme.layout.results}
        data-shadow={theme.effects.shadow}
        data-texture={theme.effects.texture}
        style={variables}
      >
        {children}
      </div>
    </>
  );
}
