import type { Quiz } from "@/lib/quizzes";
import type { QuizAnswers } from "./scoring";
import { QuestionDisplayAd } from "./QuestionDisplayAd";

export function QuizOptionsResult({ quiz, profileId, answers }: { quiz: Quiz; profileId?: string; answers: QuizAnswers }) {
  const copy = quiz.result.options!;
  const profiles = [...quiz.result.profiles].sort((a, b) => Number(b.id === profileId) - Number(a.id === profileId));
  return (
    <div className="quiz-engine__options-result">
      <div aria-hidden="true" className="quiz-engine__result-icon">{quiz.cardIcon}</div>
      <span className="quiz-engine__eyebrow">{quiz.result.profileName}</span>
      <h2>{copy.heading}</h2>
      <p className="quiz-engine__result-copy">{copy.intro}</p>
      <p className="quiz-engine__disclaimer">{copy.disclaimer}</p>
      {quiz.engine.displayAds ? <QuestionDisplayAd contentKey="results" placement="result-summary" /> : null}
      <div className="quiz-engine__options-cards">
        {profiles.map(profile => (
          <article key={profile.id} data-priority={profile.id === profileId || undefined}>
            {profile.id === profileId ? <span className="quiz-engine__options-priority">{copy.priorityLabel}</span> : null}
            <h3>{profile.title}</h3>
            <p>{profile.copy}</p>
          </article>
        ))}
      </div>
      <section className="quiz-engine__options-steps">
        <h3>{copy.stepsHeading}</h3>
        <ol>{copy.steps.map(step => <li key={step}>{step}</li>)}</ol>
      </section>
      <details className="quiz-engine__options-answers">
        <summary>{copy.answersHeading}</summary>
        <dl>{quiz.questions.map(question => (
          <div key={question.id}><dt>{question.prompt}</dt><dd>{question.choices[answers[question.id]] ?? "—"}</dd></div>
        ))}</dl>
      </details>
      <section className="quiz-engine__options-sources">
        <h3>{copy.sourcesHeading}</h3>
        <ul>{copy.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul>
      </section>
    </div>
  );
}
