"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";

import type { Quiz, QuizQuestion } from "@/lib/quizzes";

type QuestionRendererProps = {
  answer?: number;
  feedback: Quiz["engine"]["flow"]["feedback"];
  onAnswer: (choiceIndex: number) => void;
  onStudyComplete: () => void;
  question: QuizQuestion;
  studyBusy?: boolean;
  studyBusyLabel?: string;
  studyComplete: boolean;
};

function QuestionVisual({ question }: { question: QuizQuestion }) {
  const visual = question.visual;
  if (!visual) return null;

  const columnCount = visual.columns
    ?? (question.presentation === "code" ? Math.min(visual.items.length, 2) : visual.items.length);
  const isVerboseSequence = question.presentation === "sequence"
    && (
      visual.items.some((item) => item.length > 18)
      || (visual.items.length >= 4 && visual.items.some((item) => item.length > 10))
      || visual.items.join("").length > 42
    );
  const isCompactSequence = question.presentation === "sequence"
    && visual.items.every((item) => item.length <= 7);
  const isWordSequence = question.presentation === "sequence"
    && visual.items.some((item) => /[A-Za-z]{8,}/.test(item));
  const isMathSequence = question.presentation === "sequence" && visual.separator === "+";
  const isDenseSequence = question.presentation === "sequence" && visual.items.length >= 4;
  const isVeryDenseSequence = question.presentation === "sequence" && visual.items.length >= 7;
  const isFourStepSequence = question.presentation === "sequence" && visual.items.length === 4;
  const isSixStepSequence = question.presentation === "sequence" && visual.items.length === 6;
  const isTextualCode = question.presentation === "code"
    && visual.items.some((item) => /[A-Za-z]/.test(item));
  const codeRows = question.presentation === "code"
    ? visual.items.map((item) => item.split("::").map((part) => part.trim()))
    : [];
  const isObservationBoard = codeRows.length > 0 && codeRows.every((parts) => parts.length === 3 && parts.every(Boolean));
  const isKeyValueBoard = codeRows.length > 0 && codeRows.every((parts) => parts.length === 2 && parts.every(Boolean));
  const needsMobileTwoColumns = question.presentation !== "sequence"
    && question.presentation !== "code"
    && columnCount >= 4
    && visual.items.some((item) => item.length > 6);
  const hasUnbalancedLastTile = columnCount === 2 && visual.items.length % 2 === 1;
  const visualStyle = { "--quiz-visual-columns": Math.max(1, columnCount) } as CSSProperties;

  return (
    <div
      aria-label={visual.ariaLabel}
      className={`quiz-engine__visual quiz-engine__visual--${question.presentation}${isVerboseSequence ? " quiz-engine__visual--verbose-sequence" : ""}${isCompactSequence ? " quiz-engine__visual--compact-sequence" : ""}${isWordSequence ? " quiz-engine__visual--word-sequence" : ""}${isMathSequence ? " quiz-engine__visual--math-sequence" : ""}${isDenseSequence ? " quiz-engine__visual--dense-sequence" : ""}${isVeryDenseSequence ? " quiz-engine__visual--very-dense-sequence" : ""}${isFourStepSequence ? " quiz-engine__visual--four-step-sequence" : ""}${isSixStepSequence ? " quiz-engine__visual--six-step-sequence" : ""}${isTextualCode ? " quiz-engine__visual--textual-code" : ""}${needsMobileTwoColumns ? " quiz-engine__visual--mobile-two-columns" : ""}${hasUnbalancedLastTile ? " quiz-engine__visual--balanced-last-tile" : ""}${isObservationBoard ? " quiz-engine__visual--observation-board" : ""}${isKeyValueBoard ? " quiz-engine__visual--key-value-board" : ""}`}
      style={visualStyle}
    >
      {visual.items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {isObservationBoard ? (
            <strong><b>{codeRows[index][0]}</b><em>{codeRows[index][1]}</em><small aria-hidden="true">→</small><em>{codeRows[index][2]}</em></strong>
          ) : isKeyValueBoard ? (
            <strong><b>{codeRows[index][0]}</b><em>{codeRows[index][1]}</em></strong>
          ) : <strong>{item}</strong>}
          {question.presentation === "sequence" && index < visual.items.length - 1 ? <i aria-hidden="true">{visual.separator ?? "→"}</i> : null}
        </span>
      ))}
    </div>
  );
}

function QuestionImage({ question }: { question: QuizQuestion }) {
  if (!question.image) return null;
  return <figure className="quiz-engine__question-image"><img alt={question.image.alt} decoding="async" src={question.image.src} /></figure>;
}

function ChoiceQuestion({ answer, feedback, onAnswer, question }: QuestionRendererProps) {
  const hasAnswerIcons = question.icons?.length === question.choices.length;
  const usesCompactMobileGrid = question.choices.length === 4 && question.choices.every((choice) => choice.length <= 22);
  const hasLongUnbrokenChoice = question.choices.some((choice) => choice.split(/\s+/).some((word) => word.length > 8));

  return (
    <>
      <QuestionImage question={question} />
      <QuestionVisual question={question} />
      <div className={`quiz-engine__answers quiz-engine__answers--${question.presentation}${hasAnswerIcons ? " quiz-engine__answers--icons" : ""}${usesCompactMobileGrid ? " quiz-engine__answers--compact-grid" : ""}${hasLongUnbrokenChoice ? " quiz-engine__answers--long-word" : ""}`} role={question.presentation === "scale" ? "radiogroup" : undefined}>
        {question.choices.map((choice, index) => {
          const selected = answer === index;
          const icon = question.icons?.[index];
          const revealCorrectness = feedback === "instant" && answer !== undefined && question.answerIndex !== undefined;
          const correct = revealCorrectness && index === question.answerIndex;
          const incorrect = revealCorrectness && selected && index !== question.answerIndex;

          return (
            <button
              aria-checked={question.presentation === "scale" ? selected : undefined}
              className="quiz-engine__answer"
              data-correct={correct || undefined}
              data-incorrect={incorrect || undefined}
              data-selected={selected || undefined}
              disabled={answer !== undefined}
              key={`${question.id}-${index}`}
              onClick={(event) => {
                event.currentTarget.blur();
                onAnswer(index);
              }}
              role={question.presentation === "scale" ? "radio" : undefined}
              type="button"
            >
              {hasAnswerIcons ? (
                <span className="quiz-engine__answer-icon" aria-hidden="true">
                  {typeof icon === "string" && icon.startsWith("/quizzes/")
                    ? <img alt="" decoding="async" src={icon} />
                    : icon}
                </span>
              ) : null}
              {!hasAnswerIcons && question.presentation !== "scale" ? <span>{String.fromCharCode(65 + index)}</span> : null}
              {question.presentation === "scale" ? <span className="quiz-engine__scale-dot" aria-hidden="true" /> : null}
              <strong>{choice}</strong>
            </button>
          );
        })}
      </div>
    </>
  );
}

function StudyCue({ onStudyComplete, question, studyBusy = false, studyBusyLabel }: QuestionRendererProps) {
  const study = question.study!;
  const [ready, setReady] = useState(() => study.mode === "manual");

  useLayoutEffect(() => {
    if (study.mode === "manual") {
      setReady(true);
      return;
    }
    setReady(false);
    const timer = window.setTimeout(() => {
      setReady(true);
      onStudyComplete();
    }, study.durationMs);
    return () => window.clearTimeout(timer);
    // The cue is restarted only when its content changes, not when the parent rerenders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, study.durationMs, study.mode]);

  return (
    <div className={`quiz-engine__study quiz-engine__study--${study.presentation}`}>
      {study.mode === "automatic" ? <div aria-hidden="true" className="quiz-engine__study-progress"><i style={{ animationDuration: `${study.durationMs}ms` }} /></div> : null}
      {study.instruction ? <p>{study.instruction}</p> : null}
      <div className="quiz-engine__study-items" aria-label={study.ariaLabel ?? study.items.join(", ")}>
        {study.items.map((item, index) => <strong key={`${item}-${index}`}>{item}</strong>)}
      </div>
      {study.mode === "manual" ? (
        <>
          <button className="quiz-engine__primary" disabled={!ready || studyBusy} onClick={onStudyComplete} type="button">
            {studyBusy ? studyBusyLabel : study.continueLabel}
          </button>
          {study.rewarded && study.adNote ? (
            <p className="quiz-engine__ad-note quiz-engine__study-ad-note">
              <span aria-hidden="true">✓</span>
              {study.adNote}
            </p>
          ) : null}
        </>
      ) : <span className="quiz-engine__study-timer" aria-live="polite">{ready ? "" : "•••"}</span>}
    </div>
  );
}

function MemoryCueQuestion({ answer, onAnswer, question }: QuestionRendererProps) {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 2000);
    return () => window.clearTimeout(timer);
  }, [question.id]);

  return (
    <div className="quiz-engine__memory">
      <div className="quiz-engine__memory-items" aria-label={question.memoryItems?.join(", ")}>
        {question.memoryItems?.map((item) => <strong key={item}>{item}</strong>)}
      </div>
      <button className="quiz-engine__primary" disabled={!ready || answer !== undefined} onClick={() => onAnswer(0)} type="button">
        {question.continueLabel}
      </button>
    </div>
  );
}

export function QuestionRenderer(props: QuestionRendererProps) {
  if (props.question.study && !props.studyComplete) return <StudyCue {...props} />;
  return props.question.presentation === "memory-cue" ? <MemoryCueQuestion {...props} /> : <ChoiceQuestion {...props} />;
}
