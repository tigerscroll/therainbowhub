import { getAllArticleManifests, getArticleBySlug } from "@/lib/articles";
import { getDefaultLocale } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticleManifests().flatMap((article) =>
    article.sections.map((_, index) => ({
      section: String(index + 1),
      slug: article.locale === getDefaultLocale() ? article.slug : `${article.locale}--${article.slug}`,
    })),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ section: string; slug: string }> },
) {
  const { section, slug } = await params;
  const separator = slug.indexOf("--");
  const locale = separator === -1 ? getDefaultLocale() : slug.slice(0, separator);
  const stableSlug = separator === -1 ? slug : slug.slice(separator + 2);
  const index = Number(section) - 1;
  const articleSection = getArticleBySlug(stableSlug, locale)?.sections[index];

  if (!articleSection) return Response.json({ error: "Article section not found." }, { status: 404 });

  return Response.json(articleSection, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
