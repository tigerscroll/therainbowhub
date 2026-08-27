import type { Quiz } from "@/lib/quizzes";

type QuizAboutProps = {
  label?: string;
  onRestart?: () => void;
  quiz: Quiz;
  title: string;
};

export function QuizAbout({ label, onRestart, quiz, title }: QuizAboutProps) {
  if (!quiz.footer) return null;
  const topicParagraphs = quiz.footer.topicText?.split(/\n\s*\n/).filter(Boolean) ?? [];
  const aboutParagraphs = quiz.footer.aboutText.split(/\n\s*\n/).filter(Boolean);

  return (
    <aside className="quiz-engine__about">
      <h2>{title}</h2>
      {topicParagraphs.map((paragraph, index) => <p key={`topic-${index}`}>{paragraph}</p>)}
      {quiz.footer.howToPlay ? (
        <section className="quiz-engine__how-to-play">
          <h3>{quiz.footer.howToPlay.title}</h3>
          <ol>
            {quiz.footer.howToPlay.steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true">{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {aboutParagraphs.map((paragraph, index) => <p className="quiz-engine__about-disclaimer" key={`about-${index}`}>{paragraph}</p>)}
      {onRestart && label ? <button className="quiz-engine__secondary quiz-engine__about-restart" onClick={onRestart} type="button">{label}</button> : null}
    </aside>
  );
}
