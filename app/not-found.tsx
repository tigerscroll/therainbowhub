import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getLocalePath, getTranslations, type SupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, type Quiz } from "@/lib/quizzes";

function formatPublishedDate(locale: SupportedLocale, publishedAt: string) {
  const safeLocale = locale === "no" ? "nb" : locale;

  return new Intl.DateTimeFormat(safeLocale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(publishedAt));
}

function getQuizTitle(quiz: Quiz) {
  return quiz.homepage.title ?? quiz.title;
}

export default function NotFound() {
  const locale = getDefaultLocale();
  const translations = getTranslations(locale);
  const suggestedQuizzes = getAllQuizzes(locale, { includeFallback: false })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || getQuizTitle(a).localeCompare(getQuizTitle(b)))
    .slice(0, 3);

  return (
    <SiteShell currentPath="/" locale={locale} translations={translations}>
      <article className="not-found-page" aria-labelledby="not-found-title">
        <section className="not-found-hero">
          <div className="not-found-hero__mark" aria-hidden="true">
            <span>?</span>
          </div>
          <p className="not-found-hero__kicker">404</p>
          <h1 id="not-found-title">{translations.error.notFoundTitle}</h1>
          <p>{translations.error.notFoundBody} Pick a fresh quiz below, or head back to the homepage.</p>
          <div className="not-found-hero__actions">
            <Link className="hub-btn-3d" href="/">
              {translations.error.backHome}
            </Link>
            <Link className="hub-btn-3d hub-btn-3d--alt" href="/#all">
              {translations.home.browseAll}
            </Link>
          </div>
        </section>

        {suggestedQuizzes.length > 0 ? (
          <section className="not-found-suggestions" aria-labelledby="not-found-suggestions-title">
            <h2 id="not-found-suggestions-title">Try one of these instead</h2>
            <div className="not-found-suggestions__grid">
              {suggestedQuizzes.map((quiz) => {
                const title = getQuizTitle(quiz);

                return (
                  <Link className="hub-quiz-card" href={getLocalePath(locale, `/${quiz.slug}`)} key={quiz.slug}>
                    <div className="hub-quiz-card__banner" style={{ background: quiz.homepage.gradient ?? quiz.cardGradient }}>
                      {quiz.homepage.thumbnailUrl ? (
                        <img
                          src={quiz.homepage.thumbnailUrl}
                          alt={quiz.homepage.thumbnailAlt ?? title}
                          width={640}
                          height={360}
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <span>{quiz.homepage.icon ?? quiz.cardIcon}</span>
                      )}
                    </div>
                    <div className="hub-quiz-card__body">
                      <div className="hub-quiz-card__meta">
                        <span className="hub-chip">
                          {quiz.mode === "personality" ? translations.home.personality : translations.home.difficulty[quiz.difficulty]}
                        </span>
                        <time dateTime={quiz.publishedAt}>{formatPublishedDate(locale, quiz.publishedAt)}</time>
                      </div>
                      <h3>{title}</h3>
                      <p>{quiz.homepage.summary ?? quiz.summary}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </article>
    </SiteShell>
  );
}
