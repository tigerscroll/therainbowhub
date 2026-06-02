"use client";

import { useMemo, useState } from "react";

const INITIAL_VISIBLE_QUIZZES = 6;
const QUIZZES_PER_LOAD = 3;

export type HomeQuizCard = {
  href: string;
  banner: string;
  icon: string;
  thumbnailAlt: string;
  thumbnailUrl?: string;
  difficulty: string;
  publishedAt: string;
  publishedDate: string;
  title: string;
  summary: string;
};

type HomeQuizGridProps = {
  quizzes: HomeQuizCard[];
  loadMoreLabel: string;
};

export function HomeQuizGrid({ quizzes, loadMoreLabel }: HomeQuizGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_QUIZZES);
  const visibleQuizzes = useMemo(() => quizzes.slice(0, visibleCount), [quizzes, visibleCount]);
  const hiddenCount = Math.max(quizzes.length - visibleCount, 0);

  return (
    <>
      <div id="homepage-quiz-grid" className="hub-quiz-grid">
        {visibleQuizzes.map((quiz, index) => (
          <a key={quiz.href} href={quiz.href} className="hub-quiz-card">
            <div className="hub-quiz-card__banner" style={{ background: quiz.banner }}>
              {quiz.thumbnailUrl ? (
                <img
                  src={quiz.thumbnailUrl}
                  alt={quiz.thumbnailAlt}
                  width={640}
                  height={360}
                  loading={index < INITIAL_VISIBLE_QUIZZES ? "eager" : "lazy"}
                  decoding="async"
                />
              ) : (
                <span>{quiz.icon}</span>
              )}
            </div>
            <div className="hub-quiz-card__body">
              <div className="hub-quiz-card__meta">
                <span className="hub-chip">{quiz.difficulty}</span>
                <time dateTime={quiz.publishedAt}>{quiz.publishedDate}</time>
              </div>
              <h3>{quiz.title}</h3>
              <p>{quiz.summary}</p>
            </div>
          </a>
        ))}
      </div>

      {hiddenCount > 0 ? (
        <div className="hub-load-more">
          <button
            type="button"
            className="hub-load-more__button"
            aria-controls="homepage-quiz-grid"
            onClick={() => setVisibleCount((count) => Math.min(count + QUIZZES_PER_LOAD, quizzes.length))}
          >
            {loadMoreLabel}
          </button>
        </div>
      ) : null}
    </>
  );
}
