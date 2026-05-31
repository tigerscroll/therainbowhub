import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";

type HomePageContentProps = {
  locale: SupportedLocale;
  translations: Translations;
};

function formatPublishedDate(locale: SupportedLocale, publishedAt: string) {
  const safeLocale = locale === "no" ? "nb" : locale;

  return new Intl.DateTimeFormat(safeLocale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(publishedAt));
}

export function HomePageContent({ locale, translations }: HomePageContentProps) {
  const quizzes = getAllQuizzes(locale, { includeFallback: false });
  const homepageCards = quizzes
    .map((quiz) => ({
      href: getLocalePath(locale, `/${quiz.slug}`),
      banner: quiz.homepage.gradient ?? quiz.cardGradient,
      icon: quiz.homepage.icon ?? quiz.cardIcon,
      thumbnailAlt: quiz.homepage.thumbnailAlt ?? quiz.title,
      thumbnailUrl: quiz.homepage.thumbnailUrl,
      category: quiz.eyebrow,
      difficulty: translations.home.difficulty[quiz.difficulty],
      publishedAt: quiz.publishedAt,
      publishedDate: formatPublishedDate(locale, quiz.publishedAt),
      title: quiz.homepage.title ?? quiz.title,
      summary: quiz.homepage.summary ?? quiz.summary,
    }))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.title.localeCompare(b.title));

  return (
    <div className="hub-home">
      <div className="hub-main">
        <section className="hub-card-3d hub-hero">
          <div>
            <h1>
              {translations.home.headlinePrefix} <span>{translations.home.headlineHighlight}</span>
            </h1>
            <p>{translations.home.intro}</p>
          </div>
          <div className="hub-hero__stats">
            <div className="hub-stat"><div>50+</div><span>{translations.home.stats.quizzes}</span></div>
            <div className="hub-stat"><div>6 min</div><span>{translations.home.stats.averageTime}</span></div>
            <div className="hub-stat"><div>100%</div><span>{translations.home.stats.freeForever}</span></div>
            <div className="hub-stat"><div>🏆</div><span>{translations.home.stats.scoreRank}</span></div>
          </div>
        </section>

        <section id="all">
          <div className="hub-quiz-grid">
            {homepageCards.map((quiz) => (
              <a key={quiz.title} href={quiz.href} className="hub-quiz-card">
                <div className="hub-quiz-card__banner" style={{ background: quiz.banner }}>
                  {quiz.thumbnailUrl ? (
                    <img src={quiz.thumbnailUrl} alt={quiz.thumbnailAlt} />
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
        </section>
      </div>
    </div>
  );
}
