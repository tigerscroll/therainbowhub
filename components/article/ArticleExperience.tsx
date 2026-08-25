"use client";

import { useEffect, useRef, useState } from "react";

import { mountDisplayAd, requestRewardedAd } from "@/components/quiz/rewardedAds";
import { siteConfig } from "@/lib/siteConfig";

export type ArticlePoint = {
  title: string;
  paragraphs: string[];
};

export type ArticleSource = {
  label: string;
  url: string;
};

type ArticleExperienceProps = {
  articleTitle: string;
  avatars: string[];
  ctaLabel: string;
  icon: string;
  intro: string;
  landingTitle: string;
  points: ArticlePoint[];
  sources: ArticleSource[];
};

const riskPoints: ArticlePoint[] = [
  {
    title: "Getting older",
    paragraphs: ["Age is the clearest established risk factor. Prostate cancer is uncommon in younger adults and becomes increasingly common with age, particularly after 50."],
  },
  {
    title: "A close relative with prostate cancer",
    paragraphs: ["Risk can be higher when a father, brother or son has been diagnosed. Most people who develop prostate cancer still have no known family history."],
  },
  {
    title: "Several affected relatives",
    paragraphs: ["A pattern involving several relatives can be more significant than one isolated diagnosis, especially when cases occur on the same side of a family."],
  },
  {
    title: "A relative diagnosed at a younger age",
    paragraphs: ["Family history can carry more weight when prostate cancer was found relatively early. A clinician may ask how old relatives were when they were diagnosed."],
  },
  {
    title: "Inherited BRCA gene changes",
    paragraphs: ["Harmful inherited changes in BRCA1 or BRCA2 can raise prostate cancer risk. BRCA2 changes have the stronger established association."],
  },
  {
    title: "Other inherited cancer syndromes",
    paragraphs: ["Lynch syndrome and changes in certain DNA-repair genes can also increase risk. These inherited causes account for only a minority of prostate cancers."],
  },
  {
    title: "A wider pattern of cancers in the family",
    paragraphs: ["A family history that includes prostate cancer alongside breast, ovarian, pancreatic or colorectal cancer may sometimes suggest an inherited cancer pattern worth discussing."],
  },
  {
    title: "Black or African ancestry",
    paragraphs: ["Prostate cancer occurs more often among Black men and may be diagnosed at a younger age. The reasons are complex and can involve genetic, environmental and healthcare factors."],
  },
  {
    title: "Benign prostate problems are different",
    paragraphs: ["Benign prostate enlargement and prostatitis can cause symptoms, but they are not themselves prostate cancer risk factors. Similar symptoms still need proper assessment."],
  },
  {
    title: "Risk is not a diagnosis",
    paragraphs: ["Having one or several risk factors does not mean cancer will develop, and prostate cancer can occur without obvious risk factors. Personal screening decisions should be discussed with a healthcare professional."],
  },
];

const checkPoints: ArticlePoint[] = [
  {
    title: "Describe what has changed",
    paragraphs: ["A clinician will usually ask when symptoms began, how often they happen, whether they are worsening and how they affect sleep or daily life."],
  },
  {
    title: "Review medical and family history",
    paragraphs: ["Medicines, previous urinary problems, infections and relevant cancers in close relatives can all help place symptoms and risk in context."],
  },
  {
    title: "Check for other possible causes",
    paragraphs: ["Urinary symptoms are often caused by conditions other than cancer. A urine test may be used to look for infection, blood or other clues."],
  },
  {
    title: "Carry out a physical examination",
    paragraphs: ["Depending on the situation, a clinician may examine the abdomen and discuss or perform a rectal examination to assess the prostate."],
  },
  {
    title: "Discuss a PSA blood test",
    paragraphs: ["A prostate-specific antigen test measures PSA in the blood. It can support an assessment, but it is not a stand-alone cancer test."],
  },
  {
    title: "Interpret PSA carefully",
    paragraphs: ["PSA can rise because of benign enlargement, inflammation, infection and other factors. A lower result does not completely rule out cancer either."],
  },
  {
    title: "Repeat or review initial tests",
    paragraphs: ["A clinician may repeat a PSA test or review results over time before deciding whether specialist assessment is needed."],
  },
  {
    title: "Use MRI when appropriate",
    paragraphs: ["An MRI can provide detailed images of the prostate and help identify areas that may need closer investigation. Not everyone follows exactly the same testing pathway."],
  },
  {
    title: "Consider a biopsy if needed",
    paragraphs: ["A biopsy takes small tissue samples for examination under a microscope. It may be recommended when the overall assessment suggests that cancer needs to be confirmed or excluded."],
  },
  {
    title: "Discuss the result and next steps",
    paragraphs: ["Results are considered together rather than in isolation. The next step might be reassurance, monitoring, additional testing or a discussion of treatment options if cancer is found."],
  },
];

function ArticleDisplayAd({ page, position }: { page: number; position: number }) {
  const elementId = `prostate-article-${page}-ad-${position}`;

  useEffect(() => {
    const controller = mountDisplayAd({
      adUnitPath: "/22677279144/display",
      elementId,
      sizes: [[336, 280], [300, 250]],
    });
    return () => controller.destroy();
  }, [elementId]);

  return (
    <aside aria-label="Advertisement" className="article-engine__ad" data-display-ad>
      <div id={elementId} />
    </aside>
  );
}

function ArticlePointList({ page, points }: { page: number; points: ArticlePoint[] }) {
  return (
    <>
      <ArticleDisplayAd page={page} position={1} />
      <div className="article-engine__points">
        {points.map((point, index) => (
          <section className="article-engine__point" key={point.title}>
            <span aria-hidden="true" className="article-engine__number">{index + 1}</span>
            <div>
              <h2>{point.title}</h2>
              {point.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {(index + 1) % 2 === 0 ? <ArticleDisplayAd page={page} position={(index + 1) / 2 + 1} /> : null}
          </section>
        ))}
      </div>
    </>
  );
}

export function ArticleExperience({
  articleTitle,
  avatars,
  ctaLabel,
  icon,
  intro,
  landingTitle,
  points,
  sources,
}: ArticleExperienceProps) {
  const adRequestActive = useRef(false);
  const adRequestController = useRef<AbortController | null>(null);
  const [adBusy, setAdBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [unlockedSection, setUnlockedSection] = useState(1);

  useEffect(() => () => adRequestController.current?.abort(), []);

  function openArticle() {
    setStarted(true);
    window.requestAnimationFrame(() => window.scrollTo({ behavior: "smooth", top: 0 }));
  }

  async function runRewardedUnlock(onComplete: () => void) {
    if (adRequestActive.current) return;
    const controller = new AbortController();
    adRequestController.current = controller;
    adRequestActive.current = true;
    setAdBusy(true);

    try {
      const outcome = await requestRewardedAd({
        adUnitPath: siteConfig.rewardedAdUnitPath,
        attempts: 3,
        signal: controller.signal,
      });
      if (outcome !== "closed") onComplete();
    } finally {
      adRequestController.current = null;
      adRequestActive.current = false;
      setAdBusy(false);
    }
  }

  function showArticle() {
    void runRewardedUnlock(openArticle);
  }

  function unlockSection(section: number) {
    void runRewardedUnlock(() => {
      setUnlockedSection(section);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => window.scrollTo({ behavior: "smooth", top: 0 }));
      });
    });
  }

  if (!started) {
    return (
      <section className="article-engine__landing quiz-engine__landing">
        <div className="quiz-engine__landing-copy">
          <div aria-hidden="true" className="quiz-engine__landing-badge"><span>{icon}</span></div>
          <h1>{landingTitle}</h1>
          <p className="quiz-engine__quick-start">{intro}</p>
          <div className="quiz-engine__social">
            <div aria-hidden="true" className="quiz-engine__avatars">
              {avatars.map((avatar, index) => (
                <span key={index} style={{ backgroundImage: `url(${avatar})` }} />
              ))}
            </div>
            <div className="quiz-engine__social-text"><strong>125,000+</strong><span> read this today</span></div>
          </div>
          <button className="quiz-engine__primary" disabled={adBusy} onClick={showArticle} type="button">
            <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
            {adBusy ? "Loading ad…" : ctaLabel}
          </button>
          <p className="quiz-engine__ad-note"><span>✓</span>One short ad, then see the warning signs.</p>
        </div>
      </section>
    );
  }

  const currentTitle = unlockedSection === 1
    ? articleTitle
    : unlockedSection === 2
      ? "Prostate Cancer Risk Factors"
      : "What Happens at a Prostate Check?";
  const currentIntro = unlockedSection === 1
    ? "Early prostate cancer often causes no symptoms. When changes do appear, they can overlap with common non-cancerous conditions, so symptoms alone cannot tell you the cause."
    : unlockedSection === 2
      ? "Some risk factors are well established, but none can predict an individual diagnosis. Here are the factors a healthcare professional may consider."
      : "There is no single test that answers every question. A prostate assessment usually combines symptoms, history and test results before deciding what should happen next.";
  const currentPoints = unlockedSection === 1 ? points : unlockedSection === 2 ? riskPoints : checkPoints;

  return (
    <article className="article-engine__article quiz-engine__continuous-shell" key={unlockedSection}>
      <header className="article-engine__header">
        <h1>{currentTitle}</h1>
        <p>{currentIntro}</p>
      </header>

      <ArticlePointList page={unlockedSection} points={currentPoints} />

      {unlockedSection === 1 ? (
        <section className="article-engine__unlock">
          <span>Next section</span>
          <h2>Could you be at higher risk?</h2>
          <p>See the established factors linked with a higher chance of prostate cancer.</p>
          <button className="quiz-engine__primary" disabled={adBusy} onClick={() => unlockSection(2)} type="button">
            <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
            {adBusy ? "Loading ad…" : "See Risk Factors"}
          </button>
          <small>One short ad, then continue.</small>
        </section>
      ) : null}

      {unlockedSection === 2 ? (
        <section className="article-engine__unlock">
          <span>Final section</span>
          <h2>What happens next?</h2>
          <p>See how prostate symptoms and test results may be checked.</p>
          <button className="quiz-engine__primary" disabled={adBusy} onClick={() => unlockSection(3)} type="button">
            <span aria-hidden="true" className="quiz-engine__primary-icon">▶</span>
            {adBusy ? "Loading ad…" : "See How A Check Works"}
          </button>
          <small>One short ad, then continue.</small>
        </section>
      ) : null}

      {unlockedSection === 3 ? (
        <footer className="article-engine__sources">
          <p>Sources: {sources.map((source, index) => (
            <span key={source.url}>{index ? " · " : ""}<a href={source.url} rel="noreferrer" target="_blank">{source.label}</a></span>
          ))}</p>
          <p className="article-engine__disclaimer">
            General information only. This article is not a diagnosis, medical assessment or substitute for advice from a qualified healthcare professional.
          </p>
        </footer>
      ) : null}
    </article>
  );
}
