import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";
import { HomeQuizGrid, type HomeQuizCard } from "./HomeQuizGrid";

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
  const heroStats = [
    {
      icon: "▤",
      label: translations.home.stats.quizzes,
      tone: "mint",
      value: "50+",
    },
    {
      icon: "◷",
      label: translations.home.stats.averageTime,
      tone: "blue",
      value: translations.home.stats.averageTimeValue,
    },
    {
      icon: "✓",
      label: translations.home.stats.players,
      tone: "violet",
      value: "250,000+",
    },
    {
      icon: "★",
      label: translations.home.stats.results,
      tone: "gold",
      value: translations.home.stats.instant,
    },
  ];
  const homepageCards: HomeQuizCard[] = quizzes
    .map((quiz) => ({
      href: getLocalePath(locale, `/${quiz.slug}`),
      banner: quiz.homepage.gradient ?? quiz.cardGradient,
      icon: quiz.homepage.icon ?? quiz.cardIcon,
      thumbnailAlt: quiz.homepage.thumbnailAlt ?? quiz.title,
      thumbnailUrl: quiz.homepage.thumbnailUrl,
      chipLabel: quiz.mode === "personality" ? translations.home.personality : translations.home.difficulty[quiz.difficulty],
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
          <div className="hub-hero__art" aria-hidden="true">
            <span className="hub-hero__spark hub-hero__spark--bulb">💡</span>
            <span className="hub-hero__spark hub-hero__spark--puzzle">🧩</span>
            <span className="hub-hero__spark hub-hero__spark--check">✓</span>
            <span className="hub-hero__brain">🧠</span>
          </div>
          <div className="hub-hero__copy">
            <h1>
              {translations.home.headlinePrefix} <span>{translations.home.headlineHighlight}</span>
            </h1>
            <p>{translations.home.intro}</p>
          </div>
          <div className="hub-hero__stats">
            {heroStats.map((stat) => (
              <div className="hub-stat" key={stat.label}>
                <span className={`hub-stat__icon hub-stat__icon--${stat.tone}`} aria-hidden="true">
                  {stat.icon}
                </span>
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="all">
          <HomeQuizGrid quizzes={homepageCards} loadMoreLabel={translations.home.loadMore} />
        </section>
      </div>
    </div>
  );
}
