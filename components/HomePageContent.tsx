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
  const homepageCards: HomeQuizCard[] = quizzes
    .map((quiz) => ({
      href: getLocalePath(locale, `/${quiz.slug}`),
      banner: quiz.homepage.gradient ?? quiz.cardGradient,
      icon: quiz.homepage.icon ?? quiz.cardIcon,
      thumbnailAlt: quiz.homepage.thumbnailAlt ?? quiz.title,
      thumbnailUrl: quiz.homepage.thumbnailUrl,
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
          <HomeQuizGrid quizzes={homepageCards} loadMoreLabel={translations.home.loadMore} />
        </section>
      </div>
    </div>
  );
}
