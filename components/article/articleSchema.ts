export type ArticleCallout = {
  answer: string;
  question: string;
};

export type ArticlePoint = {
  callouts?: ArticleCallout[];
  numberLabel?: string;
  image?: {
    alt: string;
    caption: string;
    src: string;
  };
  title: string;
  paragraphs: string[];
};

export type ArticleSource = {
  label: string;
  url: string;
};

export type ArticleSection = {
  conclusion?: {
    copy: string;
    eyebrow: string;
  };
  eyebrow?: string;
  intro: string;
  next?: {
    adNote?: string;
    ariaLabel?: string;
    busyNote?: string;
    copy: string;
    cta: string;
    ctaIcon?: string;
    eyebrow: string;
    showCtaIcon?: boolean;
    title: string;
  };
  points: ArticlePoint[];
  title: string;
};

export type ArticleIcon =
  | { kind: "emoji"; value: string }
  | { kind: "preset"; name: string }
  | { alt: string; className?: string; kind: "image"; src: string };

export type ArticleManifest = {
  version: 1;
  slug: string;
  locale: string;
  path: string;
  routeSlug?: string;
  referenceQuizSlug: string;
  metadata: {
    dateModified?: string;
    description: string;
    lastReviewed?: string;
    schemaType: "Article" | "MedicalWebPage";
    title: string;
  };
  theme: {
    colors: Record<string, string>;
    header: {
      background: string;
      border: string;
      shadow: string;
      text: string;
    };
    id: string;
  };
  landing: {
    cta: {
      adNote: string;
      busyLabel?: string;
      icon?: string;
      label: string;
      showIcon: boolean;
    };
    icon: ArticleIcon;
    intro: string;
    socialProofCount: string;
    socialProofLabel: string;
    socialProofVisible?: boolean;
    title: string;
  };
  disclaimer: string;
  gatePlacement: "bottom-only" | "default";
  ui?: {
    defaultGateAdNote?: string;
    gateBusyNote?: string;
    loadingAdLabel?: string;
    preparingArticleLabel?: string;
    restoringCopy?: string;
    restoringTitle?: string;
    sourcesLabel?: string;
  };
  sections: ArticleSection[];
  sources: ArticleSource[];
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return Boolean(value)
    && typeof value === "object"
    && Object.values(value as Record<string, unknown>).every(isString);
}

function isArticleCallout(value: unknown): value is ArticleCallout {
  if (!value || typeof value !== "object") return false;
  const callout = value as Partial<ArticleCallout>;
  return isString(callout.question) && isString(callout.answer);
}

function isArticlePoint(value: unknown): value is ArticlePoint {
  if (!value || typeof value !== "object") return false;
  const point = value as Partial<ArticlePoint>;
  return isString(point.title)
    && (typeof point.numberLabel === "undefined" || isString(point.numberLabel))
    && Array.isArray(point.paragraphs)
    && point.paragraphs.every(isString)
    && (typeof point.callouts === "undefined"
      || (Array.isArray(point.callouts) && point.callouts.every(isArticleCallout)))
    && (typeof point.image === "undefined" || (point.image
      && typeof point.image === "object"
      && isString(point.image.alt)
      && isString(point.image.caption)
      && isString(point.image.src)));
}

export function isArticleSection(value: unknown): value is ArticleSection {
  if (!value || typeof value !== "object") return false;
  const section = value as Partial<ArticleSection>;
  const next = section.next;
  const conclusion = section.conclusion;

  return isString(section.title)
    && (typeof section.eyebrow === "undefined" || isString(section.eyebrow))
    && isString(section.intro)
    && Array.isArray(section.points)
    && section.points.every(isArticlePoint)
    && (typeof next === "undefined" || (next
      && typeof next === "object"
      && isString(next.copy)
      && isString(next.cta)
      && isString(next.eyebrow)
      && isString(next.title)
      && (typeof next.adNote === "undefined" || isString(next.adNote))
      && (typeof next.ariaLabel === "undefined" || isString(next.ariaLabel))
      && (typeof next.busyNote === "undefined" || isString(next.busyNote))
      && (typeof next.ctaIcon === "undefined" || isString(next.ctaIcon))
      && (typeof next.showCtaIcon === "undefined" || isBoolean(next.showCtaIcon))))
    && (typeof conclusion === "undefined" || (conclusion
      && typeof conclusion === "object"
      && isString(conclusion.copy)
      && isString(conclusion.eyebrow)));
}

function isArticleSource(value: unknown): value is ArticleSource {
  if (!value || typeof value !== "object") return false;
  const source = value as Partial<ArticleSource>;
  return isString(source.label) && isString(source.url);
}

function isArticleIcon(value: unknown): value is ArticleIcon {
  if (!value || typeof value !== "object") return false;
  const icon = value as Partial<ArticleIcon> & Record<string, unknown>;
  if (icon.kind === "emoji") return isString(icon.value);
  if (icon.kind === "preset") return isString(icon.name);
  if (icon.kind === "image") {
    return isString(icon.alt)
      && isString(icon.src)
      && (typeof icon.className === "undefined" || isString(icon.className));
  }
  return false;
}

export function isArticleManifest(value: unknown): value is ArticleManifest {
  if (!value || typeof value !== "object") return false;
  const manifest = value as Partial<ArticleManifest>;
  const metadata = manifest.metadata;
  const theme = manifest.theme;
  const landing = manifest.landing;
  const cta = landing?.cta;
  const ui = manifest.ui;

  return manifest.version === 1
    && isString(manifest.slug)
    && isString(manifest.locale)
    && isString(manifest.path)
    && (typeof manifest.routeSlug === "undefined"
      || (isString(manifest.routeSlug) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.routeSlug)))
    && manifest.path === `/${manifest.routeSlug ?? manifest.slug}`
    && isString(manifest.referenceQuizSlug)
    && Boolean(metadata)
    && typeof metadata === "object"
    && isString(metadata.description)
    && isString(metadata.title)
    && (metadata.schemaType === "Article" || metadata.schemaType === "MedicalWebPage")
    && (typeof metadata.dateModified === "undefined" || isString(metadata.dateModified))
    && (typeof metadata.lastReviewed === "undefined" || isString(metadata.lastReviewed))
    && Boolean(theme)
    && typeof theme === "object"
    && isString(theme.id)
    && isStringRecord(theme.colors)
    && Boolean(theme.header)
    && typeof theme.header === "object"
    && isString(theme.header.background)
    && isString(theme.header.border)
    && isString(theme.header.shadow)
    && isString(theme.header.text)
    && Boolean(landing)
    && typeof landing === "object"
    && isString(landing.title)
    && isString(landing.intro)
    && isArticleIcon(landing.icon)
    && isString(landing.socialProofCount)
    && isString(landing.socialProofLabel)
    && (typeof landing.socialProofVisible === "undefined" || isBoolean(landing.socialProofVisible))
    && Boolean(cta)
    && typeof cta === "object"
    && isString(cta.label)
    && isString(cta.adNote)
    && isBoolean(cta.showIcon)
    && (typeof cta.busyLabel === "undefined" || isString(cta.busyLabel))
    && (typeof cta.icon === "undefined" || isString(cta.icon))
    && isString(manifest.disclaimer)
    && (manifest.gatePlacement === "bottom-only" || manifest.gatePlacement === "default")
    && (typeof ui === "undefined" || (ui
      && typeof ui === "object"
      && (typeof ui.defaultGateAdNote === "undefined" || isString(ui.defaultGateAdNote))
      && (typeof ui.gateBusyNote === "undefined" || isString(ui.gateBusyNote))
      && (typeof ui.loadingAdLabel === "undefined" || isString(ui.loadingAdLabel))
      && (typeof ui.preparingArticleLabel === "undefined" || isString(ui.preparingArticleLabel))
      && (typeof ui.restoringCopy === "undefined" || isString(ui.restoringCopy))
      && (typeof ui.restoringTitle === "undefined" || isString(ui.restoringTitle))
      && (typeof ui.sourcesLabel === "undefined" || isString(ui.sourcesLabel))))
    && Array.isArray(manifest.sources)
    && manifest.sources.every(isArticleSource)
    && Array.isArray(manifest.sections)
    && manifest.sections.length > 0
    && manifest.sections.every(isArticleSection);
}
