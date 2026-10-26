"use client";

import { useLayoutEffect, useRef } from "react";

import { ExperienceLanding } from "@/components/experience/ExperienceLanding";
import { getCurrentPopupQuestion, type ArticlePopupQuestions, type PopupQuestionProgress } from "@/components/gallery/popupQuestions";

export function PopupQuestionPanel({ config, progress, busy, loadingLabel, className, statusMessage, onAnswer, onContinue }: {
  config: ArticlePopupQuestions;
  progress: PopupQuestionProgress;
  busy: boolean;
  loadingLabel: string;
  className: string;
  statusMessage?: string;
  onAnswer: (questionId: string, answerId: string) => void;
  onContinue: () => void;
}) {
  const question = getCurrentPopupQuestion(config, progress);
  const heading = useRef<HTMLHeadingElement>(null);
  const ready = useRef<HTMLElement>(null);
  const answered = Object.keys(progress.answers).length;

  useLayoutEffect(() => {
    const target = question ? heading.current : ready.current?.querySelector("h1");
    target?.setAttribute("tabindex", "-1");
    target?.focus({ preventScroll: true });
  }, [question?.id]);

  if (!question) {
    return (
      <ExperienceLanding
        ref={ready}
        adNote={config.adNote} avatars={[]} busy={busy} busyLabel={loadingLabel}
        className={className} ctaIcon="→" ctaIconPosition="end" ctaLabel={config.cta}
        icon={null} intro={config.readyCopy} onStart={onContinue} showSocialProof={false}
        socialProofText="" title={config.readyTitle}
        statusMessage={statusMessage}
      />
    );
  }

  const label = config.progressLabel.replace("{current}", String(answered + 1)).replace("{total}", String(config.questionCount));
  return (
    <section aria-label={config.title} className={`${className} gallery-article__landing--questions`} data-popup-question-id={question.id}>
      <div className="quiz-engine__landing-copy">
        <p aria-live="polite" className="gallery-article__question-progress">{label}</p>
        <div aria-label={label} aria-valuemax={config.questionCount} aria-valuemin={0} aria-valuenow={answered}
          className="gallery-article__question-track" role="progressbar">
          <span style={{ width: `${answered / config.questionCount * 100}%` }} />
        </div>
        <h1 ref={heading} tabIndex={-1}>{question.prompt}</h1>
        <p className="gallery-article__question-instruction">{config.instruction}</p>
        <div className="gallery-article__question-answers">
          {question.choices.map(choice => (
            <button className="quiz-engine__primary gallery-article__question-answer" data-google-interstitial="false" disabled={busy}
              key={`${question.id}:${choice.id}`} onClick={() => onAnswer(question.id, choice.id)} type="button">
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
