import Link from "next/link";
import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import { getAllQuizzes } from "@/lib/quizzes";

type HomePageContentProps = {
  locale: SupportedLocale;
  translations: Translations;
};

const quizzes = getAllQuizzes();
const categories = Array.from(new Set(quizzes.map((quiz) => quiz.eyebrow))).sort();
const averageDuration = Math.round(
  quizzes.reduce((total, quiz) => total + Number(quiz.duration.match(/\d+/)?.[0] ?? 0), 0) /
    Math.max(quizzes.length, 1),
);
const featuredQuiz = quizzes.find((quiz) => quiz.homepage.featured) ?? quizzes.find((quiz) => quiz.slug === "oxford") ?? quizzes[0];

export function HomePageContent({ locale, translations }: HomePageContentProps) {
  const homepageCards = quizzes.map((quiz) => ({
    href: getLocalePath(locale, `/quiz/${quiz.slug}`),
    banner: quiz.homepage.gradient ?? quiz.cardGradient,
    icon: quiz.homepage.icon ?? quiz.cardIcon,
    thumbnailAlt: quiz.homepage.thumbnailAlt ?? quiz.title,
    thumbnailUrl: quiz.homepage.thumbnailUrl,
    category: quiz.eyebrow,
    difficulty: quiz.difficulty,
    title: quiz.homepage.title ?? quiz.title,
    summary: quiz.homepage.summary ?? quiz.summary,
    stats: quiz.duration,
    passRate: quiz.passRate,
  }));

  return (
    <div className="hub-home">
      <div className="hub-main">
        <section className="hub-card-3d hub-hero">
          <div>
            <h1>
              {translations.home.headlinePrefix} <span>{translations.home.headlineHighlight}</span>
            </h1>
            <p>{translations.home.intro}</p>
            <div className="hub-hero__cta">
              {featuredQuiz ? (
                <Link className="hub-btn-3d" href={getLocalePath(locale, `/quiz/${featuredQuiz.slug}`)}>
                  ▶ {translations.home.startPrefix} {featuredQuiz.title}
                </Link>
              ) : null}
              <a className="hub-btn-3d hub-btn-3d--alt" href="#all">
                {translations.home.browseAll}
              </a>
            </div>
          </div>
          <div className="hub-hero__stats">
            <div className="hub-stat"><div>{quizzes.length}</div><span>{translations.home.stats.quizzes}</span></div>
            <div className="hub-stat"><div>{averageDuration || 3} min</div><span>{translations.home.stats.averageTime}</span></div>
            <div className="hub-stat"><div>97%</div><span>{translations.home.stats.freeForever}</span></div>
            <div className="hub-stat"><div>🏆</div><span>{translations.home.stats.scoreRank}</span></div>
          </div>
        </section>

        <section id="categories" className="hub-categories">
          {categories.map((category) => (
            <span className="hub-pill" key={category}>{category}</span>
          ))}
        </section>

        <section id="all">
          <h2 className="hub-section-title">{translations.home.allQuizzes}</h2>
          <div className="hub-quiz-grid">
            {homepageCards.map((quiz) => (
              <Link key={quiz.title} href={quiz.href} className="hub-quiz-card">
                <div className="hub-quiz-card__banner" style={{ background: quiz.banner }}>
                  {quiz.thumbnailUrl ? (
                    <img src={quiz.thumbnailUrl} alt={quiz.thumbnailAlt} />
                  ) : (
                    <span>{quiz.icon}</span>
                  )}
                </div>
                <div className="hub-quiz-card__body">
                  <div className="hub-quiz-card__meta">
                    <span>{quiz.category}</span>
                    <span className="hub-chip">{quiz.difficulty}</span>
                  </div>
                  <h3>{quiz.title}</h3>
                  <p>{quiz.summary}</p>
                  <div className="hub-quiz-card__foot">
                    <span>{quiz.stats}</span>
                    <span>{translations.home.passRate} {quiz.passRate}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
