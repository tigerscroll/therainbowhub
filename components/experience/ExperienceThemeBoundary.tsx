import type { CSSProperties, ReactNode } from "react";

import type { QuizTheme } from "@/lib/quizzes";

type ExperienceThemeBoundaryProps = {
  children: ReactNode;
  shellCssHref: string;
  themeCssHref?: string;
  theme: QuizTheme;
};

export function ExperienceThemeBoundary({ children, shellCssHref, themeCssHref, theme }: ExperienceThemeBoundaryProps) {
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
    "--quiz-header-background": theme.header?.background ?? theme.colors.primary,
    "--quiz-header-text": theme.header?.text ?? theme.colors.primaryText,
    "--quiz-header-border": theme.header?.border ?? theme.colors.border,
    "--quiz-header-shadow": theme.header?.shadow ?? "none",
  } as CSSProperties;

  return (
    <>
      {themeCssHref ? <link data-quiz-css={theme.id} href={themeCssHref} rel="stylesheet" /> : null}
      <link data-quiz-shell-contract href={shellCssHref} rel="stylesheet" />
      <div
        className="quiz-theme"
        data-heading={theme.typography.heading}
        data-landing-layout={theme.layout.landing}
        data-question-layout={theme.layout.questions}
        data-quiz-flow="continuous"
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
