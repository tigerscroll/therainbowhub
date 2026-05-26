import Link from "next/link";
import { getLocalePath, type SupportedLocale, type Translations } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes";

type QuizLandingProps = {
  locale: SupportedLocale;
  quiz: Quiz;
  showStartLink?: boolean;
  translations: Translations;
};

export function QuizLanding({ locale, quiz, showStartLink = true, translations }: QuizLandingProps) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
      <div>
        <p className="mb-3 text-sm font-black uppercase tracking-[0.18em]" style={{ color: quiz.accent }}>
          {quiz.eyebrow}
        </p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight text-ink sm:text-5xl">
          {quiz.pageTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          {quiz.summary}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <strong className="block text-xl text-ink">{quiz.questionCount}</strong>
            <span className="text-xs font-semibold text-slate-500">{translations.home.questions}</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <strong className="block text-xl text-ink">{quiz.duration}</strong>
            <span className="text-xs font-semibold text-slate-500">{translations.home.stats.averageTime}</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <strong className="block text-xl text-ink">{quiz.passRate}</strong>
            <span className="text-xs font-semibold text-slate-500">{translations.home.passRate}</span>
          </div>
        </div>
        {showStartLink ? (
          <Link
            href={getLocalePath(locale, `/quiz/${quiz.slug}`)}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-ink px-6 text-base font-black text-white shadow-soft transition hover:-translate-y-0.5"
            style={{ backgroundColor: quiz.accent }}
          >
            {translations.quiz.startTest}
          </Link>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="grid h-52 place-items-center" style={{ background: quiz.homepage.gradient ?? quiz.cardGradient }}>
          {quiz.homepage.thumbnailUrl ? (
            <img
              src={quiz.homepage.thumbnailUrl}
              alt={quiz.homepage.thumbnailAlt ?? quiz.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-7xl drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]">{quiz.homepage.icon ?? quiz.cardIcon}</span>
          )}
        </div>
        <div className="bg-white p-5">
          <div className="mb-4 h-2 rounded-full bg-slate-200">
            <div className="h-2 w-2/3 rounded-full" style={{ backgroundColor: quiz.accent }} />
          </div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
            {translations.home.whatYouGet}
          </p>
          <ul className="mt-4 space-y-3">
            {quiz.heroPoints.map((point) => (
              <li key={point} className="flex gap-3 text-sm font-semibold text-ink">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-saffron" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
