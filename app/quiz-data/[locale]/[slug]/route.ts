import { getSupportedLocales, isSupportedLocale } from "@/lib/i18n";
import { getAllQuizzes, getQuizBySlug } from "@/lib/quizzes";

export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() {
  return getSupportedLocales().flatMap(locale => getAllQuizzes(locale).map(quiz => ({ locale, slug: `${quiz.slug}.json` })));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const quiz = isSupportedLocale(locale) && slug.endsWith(".json") ? getQuizBySlug(slug.slice(0, -5), locale) : undefined;
  return quiz ? Response.json(quiz, { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } })
    : Response.json({ error: "Quiz not found" }, { status: 404 });
}
