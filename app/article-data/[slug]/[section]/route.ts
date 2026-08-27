import { sections as celluliteSections } from "@/app/(default)/cellulite/page";
import { sections as colonSections } from "@/app/(default)/colon/page";
import { sections as funeralSections } from "@/app/(default)/funeral/page";
import { sections as kidneySections } from "@/app/(default)/kidney/page";
import { sections as prostateSections } from "@/app/(default)/prostate/page";

const ARTICLE_SECTIONS = {
  cellulite: celluliteSections,
  colon: colonSections,
  funeral: funeralSections,
  kidney: kidneySections,
  prostate: prostateSections,
} as const;

type ArticleSlug = keyof typeof ARTICLE_SECTIONS;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.entries(ARTICLE_SECTIONS).flatMap(([slug, sections]) =>
    sections.map((_, index) => ({ section: String(index + 1), slug })),
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ section: string; slug: string }> },
) {
  const { section, slug } = await params;
  const index = Number(section) - 1;
  const articleSections = ARTICLE_SECTIONS[slug as ArticleSlug];
  const articleSection = articleSections?.[index];

  if (!articleSection) return Response.json({ error: "Article section not found." }, { status: 404 });

  return Response.json(articleSection, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
