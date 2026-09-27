import { ArticleDisplayAd } from "./ArticleDisplayAd";
import { ArticleUnlock } from "./ArticleUnlock";
import { splitArticlePreview } from "./articlePreview";
import type { ArticleManifest, ArticleSection } from "./articleSchema";

function ArticleSections({ sections, showTitles }: { sections: ArticleSection[]; showTitles: boolean }) {
  return (
    <>{sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {showTitles ? <h2>{section.title}</h2> : null}
          {section.points.map((point, index) => (
            <section key={index}>
              <h2>{point.title}</h2>
              {point.image ? <figure>
                <img alt={point.image.alt} loading="lazy" src={point.image.src} />
                <figcaption>{point.image.caption}</figcaption>
              </figure> : null}
              {point.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
              {point.sources?.length ? <p className="plain-article__references">
                {point.sources.map((source, sourceIndex) => <span key={source.url}>
                  {sourceIndex ? " · " : ""}<a href={source.url} rel="noreferrer" target="_blank">{source.label}</a>
                </span>)}
              </p> : null}
            </section>
          ))}
          {section.conclusion ? <p>{section.conclusion.copy}</p> : null}
        </div>
      ))}</>
  );
}

export function PlainArticle({ article }: { article: ArticleManifest }) {
  const settings = article.monetization;
  const { preview, remaining } = splitArticlePreview(article.sections, settings?.previewPoints ?? Infinity);
  return (
    <article className={`plain-article${settings ? " plain-article--monetized" : ""}`} id="article-content">
      <header>
        <h1>{article.metadata.title}</h1>
        {settings ? <ArticleDisplayAd /> : null}
        <p className="plain-article__intro">{article.landing.intro}</p>
      </header>
      <ArticleSections sections={preview} showTitles={article.sections.length > 1} />
      {settings ? <ArticleUnlock locale={article.locale} settings={settings} slug={article.slug}
        teaser={<><h2>{remaining[0]?.points[0]?.title}</h2><p>{remaining[0]?.points[0]?.paragraphs[0]}</p></>}>
        <ArticleSections sections={remaining} showTitles={article.sections.length > 1} />
      </ArticleUnlock> : null}
      <footer className="plain-article__references">
        <p>{article.ui?.sourcesLabel ?? "Further reading"}: {article.sources.map((source, index) => (
          <span key={source.url}>{index ? " · " : ""}<a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></span>
        ))}</p>
        {article.disclaimer ? <p>{article.disclaimer}</p> : null}
      </footer>
    </article>
  );
}
