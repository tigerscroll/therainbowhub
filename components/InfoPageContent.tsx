import {
  getInfoPage,
  getInfoPageMetadata,
  infoPageMetadata,
  infoPageSlugs,
  isInfoPageSlug,
  type InfoPageSlug,
} from "@/lib/infoPages";
import type { SupportedLocale } from "@/lib/i18n";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";

export { getInfoPageMetadata, infoPageMetadata, infoPageSlugs, isInfoPageSlug };

type InfoPageContentProps = {
  locale: SupportedLocale;
  slug: InfoPageSlug;
};

export function InfoPageContent({ locale, slug }: InfoPageContentProps) {
  const page = getInfoPage(locale, slug);

  return (
    <article className={`legal-page ${slug === "about" ? "about-page" : ""}`}>
      <h1>{page.title}</h1>
      <p className="legal-updated">{page.updated}</p>

      {page.sections.map((section, index) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {slug === "contact" && index === 0 ? <ObfuscatedEmail /> : null}
          {section.list ? (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.after?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
