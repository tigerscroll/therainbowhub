import type { ArticleManifest } from "./articleSchema";

export function PlainArticle({ article }: { article: ArticleManifest }) {
  return (
    <article className="plain-article" id="article-content">
      <header>
        <h1>{article.metadata.title}</h1>
        <p className="plain-article__intro">{article.landing.intro}</p>
      </header>
      {article.sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {article.sections.length > 1 ? <h2>{section.title}</h2> : null}
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
      ))}
      <footer className="plain-article__references">
        <p>{article.ui?.sourcesLabel ?? "Further reading"}: {article.sources.map((source, index) => (
          <span key={source.url}>{index ? " · " : ""}<a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></span>
        ))}</p>
        {article.disclaimer ? <p>{article.disclaimer}</p> : null}
      </footer>
    </article>
  );
}
