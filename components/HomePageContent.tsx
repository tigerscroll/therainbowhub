import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";

type HomePageContentProps = {
  locale: SupportedLocale;
  translations: Translations;
};

export function HomePageContent({ locale, translations }: HomePageContentProps) {
  const quizzes = getAllQuizzes(locale, { includeFallback: false });

  return (
    <div className="hub-home">
      <div className="hub-main">
        <section className="hub-hero">
          <h1>
            <span className="hub-hero__lead">{translations.home.headlinePrefix}</span>
            <span>{translations.home.headlineHighlight}</span>
          </h1>
          <p>{translations.home.intro}</p>
        </section>
        <section className="hub-quizzes" aria-labelledby="quiz-list-title">
          <div className="hub-quizzes__heading">
            <h2 id="quiz-list-title">{translations.home.stats.quizzes}</h2>
            <span aria-hidden="true" />
          </div>
          <div className="hub-quiz-grid">
            {quizzes.map((quiz) => (
              <LinkCard
                href={getLocalePath(locale, `/${quiz.slug}`)}
                image={quiz.thumbnailUrl}
                imageAlt={quiz.thumbnailAlt}
                key={quiz.slug}
                label={quiz.engine.scoring.type === "weighted-profile" ? translations.home.personality : translations.home.difficulty[quiz.difficulty]}
                summary={quiz.summary}
                title={quiz.title}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function LinkCard({ href, image, imageAlt, label, summary, title }: {
  href: string;
  image?: string;
  imageAlt: string;
  label: string;
  summary: string;
  title: string;
}) {
  return (
    <a className="hub-quiz-card" href={href}>
      {image ? <img alt={imageAlt} src={image} /> : null}
      <div className="hub-quiz-card__body">
        <span className="hub-chip">{label}</span>
        <h2>{title}</h2>
        <p>{summary}</p>
        <span aria-hidden="true" className="hub-quiz-card__arrow">→</span>
      </div>
    </a>
  );
}
