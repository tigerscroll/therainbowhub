import Link from "next/link";

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
          <div className="hub-hero__top">
            <div className="hub-hero__copy">
              <div className="hub-hero__proof">
                <span aria-hidden="true" className="hub-hero__proof-icon"><i /><i /><i /></span>
                <strong>{translations.home.socialProof}</strong>
              </div>
              <h1>
                <span className="hub-hero__lead">{translations.home.headlinePrefix}</span>
                <span>{translations.home.headlineHighlight}</span>
              </h1>
              <p>{translations.home.intro}</p>
            </div>
            <div className="hub-hero__features" aria-label={translations.home.features.label}>
              <HeroFeature icon="bolt" title={translations.home.features.fastTitle} copy={translations.home.features.fastCopy} />
              <HeroFeature icon="target" title={translations.home.features.resultsTitle} copy={translations.home.features.resultsCopy} />
              <HeroFeature icon="spark" title={translations.home.features.challengeTitle} copy={translations.home.features.challengeCopy} />
            </div>
          </div>
        </section>
        {quizzes.length ? (
          <section className="hub-quizzes" aria-labelledby="quiz-list-title">
            <div className="hub-quizzes__heading">
              <h2 id="quiz-list-title">{translations.home.moreQuizzes}</h2>
              <span aria-hidden="true" />
            </div>
            <div className="hub-quiz-grid" data-single={quizzes.length === 1 ? "" : undefined}>
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
        ) : null}
      </div>
    </div>
  );
}

function HeroFeature({ copy, icon, title }: { copy: string; icon: "bolt" | "spark" | "target"; title: string }) {
  return (
    <div className="hub-hero__feature">
      <span aria-hidden="true">
        <FeatureIcon icon={icon} />
      </span>
      <div>
        <strong>{title}</strong>
        <small>{copy}</small>
      </div>
    </div>
  );
}

function FeatureIcon({ icon }: { icon: "bolt" | "spark" | "target" }) {
  if (icon === "bolt") {
    return <svg viewBox="0 0 24 24"><path d="M13.2 2.8 5.8 13h5.1l-.2 8.2L18.2 11h-5.1l.1-8.2Z" /></svg>;
  }

  if (icon === "target") {
    return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>;
  }

  return <svg viewBox="0 0 24 24"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m18.5 15 .8 2.7 2.7.8-2.7.8-.8 2.7-.8-2.7-2.7-.8 2.7-.8.8-2.7Z" /></svg>;
}

function LinkCard({ href, image, imageAlt, label, summary, title }: {
  href: string;
  image?: string;
  imageAlt: string;
  label: string;
  summary: string;
  title: string;
}) {
  const compactImage = image?.endsWith("-960.webp")
    ? image.replace(/-960\.webp$/, "-480.webp")
    : undefined;

  return (
    <Link className="hub-quiz-card" href={href} prefetch={false}>
      {image ? (
        <img
          alt={imageAlt}
          decoding="async"
          height={540}
          loading="lazy"
          sizes="(max-width: 760px) calc(100vw - 24px), (max-width: 940px) calc((100vw - 66px) / 2), (max-width: 1208px) calc((100vw - 84px) / 3), 375px"
          src={image}
          srcSet={compactImage ? `${compactImage} 480w, ${image} 960w` : undefined}
          width={960}
        />
      ) : null}
      <div className="hub-quiz-card__body">
        <span className="hub-chip">{label}</span>
        <h2>{title}</h2>
        <p>{summary}</p>
        <span aria-hidden="true" className="hub-quiz-card__arrow">→</span>
      </div>
    </Link>
  );
}
