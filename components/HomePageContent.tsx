import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";
import { HomeQuizGrid, type HomeQuizCard } from "./HomeQuizGrid";

type HomePageContentProps = {
  locale: SupportedLocale;
  translations: Translations;
};

type HeroStatIcon = "quizzes" | "clock" | "players" | "results";

function HeroStatIcon({ type }: { type: HeroStatIcon }) {
  if (type === "quizzes") {
    return (
      <svg aria-hidden="true" className="hub-stat__svg" viewBox="0 0 24 24">
        <path d="M7 4.75h10a1.5 1.5 0 0 1 1.5 1.5v11.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5V6.25A1.5 1.5 0 0 1 7 4.75Z" />
        <path d="M8.5 8.25h7" />
        <path d="M8.5 12h7" />
        <path d="M8.5 15.75h5" />
      </svg>
    );
  }

  if (type === "clock") {
    return (
      <svg aria-hidden="true" className="hub-stat__svg" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="7.25" />
        <path d="M12 8.25v4.25l3 1.75" />
      </svg>
    );
  }

  if (type === "players") {
    return (
      <svg aria-hidden="true" className="hub-stat__svg" viewBox="0 0 24 24">
        <circle cx="9" cy="9" r="3" />
        <circle cx="16.5" cy="10" r="2.4" />
        <path d="M4.75 18.5c.55-3 2.25-4.5 4.25-4.5s3.7 1.5 4.25 4.5" />
        <path d="M13.5 15.1c1.9.15 3.25 1.3 3.75 3.4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="hub-stat__svg" viewBox="0 0 24 24">
      <path d="m12 4.75 2.12 4.3 4.74.69-3.43 3.35.81 4.72L12 15.58l-4.24 2.23.81-4.72-3.43-3.35 4.74-.69L12 4.75Z" />
    </svg>
  );
}

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
      icon: "quizzes" as const,
      label: translations.home.stats.quizzes,
      tone: "mint",
      value: "50+",
    },
    {
      icon: "clock" as const,
      label: translations.home.stats.averageTime,
      tone: "blue",
      value: translations.home.stats.averageTimeValue,
    },
    {
      icon: "players" as const,
      label: translations.home.stats.players,
      tone: "violet",
      value: "85,000+",
    },
    {
      icon: "results" as const,
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
        <section className="hub-hero">
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
                  <HeroStatIcon type={stat.icon} />
                </span>
                <div>
                  <strong>
                    <span className="hub-stat__desktop-text">{stat.value}</span>
                    <span className="hub-stat__mobile-text">{stat.value}</span>
                  </strong>
                  <span className="hub-stat__label">
                    <span className="hub-stat__desktop-text">{stat.label}</span>
                    <span className="hub-stat__mobile-text">{stat.label}</span>
                  </span>
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
