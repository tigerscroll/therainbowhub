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
          <h1>{translations.home.headlinePrefix} <span>{translations.home.headlineHighlight}</span></h1>
          <p>{translations.home.intro}</p>
        </section>
        <section className="hub-quiz-grid" aria-label={translations.home.stats.quizzes}>
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
      </div>
    </a>
  );
}
