import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleExperience, type ArticleSection } from "@/components/article/ArticleExperience";
import { ExperienceThemeBoundary } from "@/components/experience/ExperienceThemeBoundary";
import { SiteShell } from "@/components/SiteShell";
import { getDefaultLocale, getTranslations } from "@/lib/i18n";
import { getQuizBySlug } from "@/lib/quizzes";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

const locale = getDefaultLocale();
const translations = getTranslations(locale);
const path = "/funeral";
const landingTitle = "The Most Requested Funeral Songs Of All Time";
const description = "Discover the funeral songs families request most often, more modern and personal choices, and practical guidance for choosing music for a service.";

export const sections: ArticleSection[] = [
  {
    title: "20 Most Requested Funeral Songs",
    intro: "This countdown follows the National Association of Funeral Directors' 2026 UK ranking. We begin at number 20 and work towards the songs families request most often.",
    points: [
      {
        numberLabel: "20",
        title: "The Lord Is My Shepherd — Traditional hymn",
        paragraphs: ["A familiar religious choice centred on comfort, guidance and peace. It remains especially meaningful where faith and congregational singing are important to the service."],
      },
      {
        numberLabel: "19",
        title: "Abide With Me — Traditional hymn",
        paragraphs: ["One of the best-known funeral hymns, often chosen for its sense of reassurance, tradition and shared remembrance."],
      },
      {
        numberLabel: "18",
        title: "We'll Meet Again — Vera Lynn",
        paragraphs: ["Its themes of separation and reunion carry strong associations with wartime memory, family history and hope beyond a final goodbye."],
      },
      {
        numberLabel: "17",
        title: "In My Life — The Beatles",
        paragraphs: ["A concise reflection on people, places and memories, making it a personal choice for a photographic tribute or quiet moment in the service."],
      },
      {
        numberLabel: "16",
        title: "Always Look on the Bright Side of Life — Monty Python",
        paragraphs: ["Some families deliberately choose humour. This irreverent send-off can feel entirely right for someone remembered for optimism and refusing to take life too seriously."],
      },
      {
        numberLabel: "15",
        title: "Over the Rainbow — Eva Cassidy",
        paragraphs: ["Cassidy's restrained recording brings warmth and reflection without feeling overly formal, which makes it a popular choice for a calm tribute."],
      },
      {
        numberLabel: "14",
        title: "What a Wonderful World — Louis Armstrong",
        paragraphs: ["Warm and life-affirming, this song helps families focus on gratitude, beauty and the life that was lived."],
      },
      {
        numberLabel: "13",
        title: "Hallelujah — Leonard Cohen",
        paragraphs: ["Its emotional melody has made many recordings popular at funerals, although families should listen to the complete lyrics and choose the exact version carefully."],
      },
      {
        numberLabel: "12",
        title: "Fix You — Coldplay",
        paragraphs: ["The gradual build from vulnerability to support gives this modern favourite a strong emotional arc during reflection or a photo montage."],
      },
      {
        numberLabel: "11",
        title: "Danny Boy — Traditional song",
        paragraphs: ["A long-established farewell with powerful cultural and family associations. The chosen singer and arrangement can make it intimate or ceremonial."],
      },
    ],
    next: {
      eyebrow: "The Top 10 are next",
      title: "The most requested songs are still ahead",
      copy: "Reveal numbers 10 to 1—and see which enduring farewell reaches the top spot.",
      cta: "Reveal The Top 10",
    },
  },
  {
    title: "The 10 Most Requested Funeral Songs",
    intro: "These are the top ten songs in the NAFD's 2026 ranking, counting down to the most requested funeral song.",
    points: [
      { numberLabel: "10", title: "Pie Jesu — Andrew Lloyd Webber", paragraphs: ["This sacred solo combines ceremony with tenderness and is often chosen for a formal service or quiet moment of reflection."] },
      { numberLabel: "9", title: "Simply the Best — Tina Turner", paragraphs: ["Celebratory and affectionate, this choice honours someone remembered for their energy, confidence and impact on others."] },
      { numberLabel: "8", title: "The Long and Winding Road — The Beatles", paragraphs: ["Its themes of distance, longing and an unfinished journey give it a reflective weight suited to remembrance."] },
      { numberLabel: "7", title: "Unforgettable — Nat King Cole", paragraphs: ["Elegant and direct, this classic expresses enduring affection without needing an explicitly religious message."] },
      { numberLabel: "6", title: "You Raise Me Up — Westlife", paragraphs: ["Its emotional build and message of encouragement make it a tribute to someone remembered for guidance, strength or belief in others."] },
      { numberLabel: "5", title: "Somewhere Over the Rainbow — Israel Kamakawiwoʻole", paragraphs: ["The gentle ukulele recording feels hopeful and personal, creating a softer alternative to a formal farewell song."] },
      { numberLabel: "4", title: "Time to Say Goodbye — Andrea Bocelli and Sarah Brightman", paragraphs: ["The soaring duet combines farewell with grandeur, making it a natural choice for an entrance or closing moment."] },
      { numberLabel: "3", title: "Angels — Robbie Williams", paragraphs: ["A familiar modern classic associated with protection, comfort and continuing connection. Its chorus can make a service feel communal."] },
      { numberLabel: "2", title: "Wind Beneath My Wings — Bette Midler", paragraphs: ["This enduring tribute is often chosen for a parent, partner, mentor or friend whose quiet support shaped other people's lives."] },
      { numberLabel: "1", title: "My Way — Frank Sinatra", paragraphs: ["The chart's number-one choice celebrates independence, resilience and a life lived on the person's own terms—one reason it has endured across generations."] },
    ],
    next: {
      eyebrow: "Beyond the chart",
      title: "Want to see more personal choices?",
      copy: "Discover ten modern, uplifting and unexpected songs families also choose.",
      cta: "See Modern Favourites",
    },
  },
  {
    title: "10 Modern and Personal Funeral Songs",
    intro: "The most meaningful choice is not always the highest-ranked song. These contemporary, uplifting and personal selections regularly appear in funeral music guides and family requests.",
    points: [
      { title: "Angels — Robbie Williams", paragraphs: ["A familiar modern classic that many families associate with protection, comfort and continuing connection. Its recognisable chorus can feel communal even when guests are not singing along."] },
      { title: "Always Look on the Bright Side of Life — Eric Idle", paragraphs: ["Some families deliberately end on humour. This irreverent choice can fit someone known for optimism, comedy or refusing to take themselves too seriously."] },
      { title: "Dancing in the Sky — Dani and Lizzy", paragraphs: ["Written around questions people ask after a death, this song has become a contemporary memorial choice for families seeking something direct and emotionally open."] },
      { title: "See You Again — Wiz Khalifa featuring Charlie Puth", paragraphs: ["Its focus on friendship, separation and reunion has made it a common tribute for younger generations and services celebrating close bonds."] },
      { title: "Hallelujah — Leonard Cohen", paragraphs: ["Families choose many different recordings of this song, and each version carries a different tone. Listening to the exact performance matters before deciding whether it fits the service."] },
      { title: "Fields of Gold — Eva Cassidy", paragraphs: ["The gentle imagery and intimate performance can evoke shared places, seasons and memories. It often suits a quiet period of reflection or a photographic tribute."] },
      { title: "Tears in Heaven — Eric Clapton", paragraphs: ["This deeply personal song about loss is sometimes chosen when a family wants the music to acknowledge grief directly rather than move quickly toward celebration."] },
      { title: "What a Wonderful World — Louis Armstrong", paragraphs: ["Warm and life-affirming, this can accompany photographs or an exit when the family wants to focus on gratitude, beauty and the life that was lived."] },
      { title: "Spirit in the Sky — Norman Greenbaum", paragraphs: ["Its unmistakable sound makes it a bolder, more upbeat send-off. It can work for someone whose taste or personality would make a conventional closing song feel wrong."] },
      { title: "Danny Boy — Traditional song", paragraphs: ["A long-established farewell song with strong cultural and family associations. The chosen singer and arrangement can shift it from intimate and restrained to ceremonial and powerful."] },
    ],
    next: {
      eyebrow: "Final section",
      title: "How do you choose the right song?",
      copy: "See ten practical ways to make the music feel personal and appropriate.",
      cta: "See The Music Guide",
    },
  },
  {
    title: "How to Choose Meaningful Funeral Music",
    intro: "There is no universally correct funeral song. The best choices reflect the person, the family and the role each piece of music needs to play in the service.",
    points: [
      { title: "Start with the person's own music", paragraphs: ["Think about favourite artists, records they returned to, concerts they attended and songs associated with important moments. A personal connection usually matters more than a national chart position."] },
      { title: "Decide where the song will appear", paragraphs: ["Entrance music often needs time and dignity, a reflection song should support quiet attention, and exit music can be warmer, brighter or more surprising."] },
      { title: "Listen to the complete lyrics", paragraphs: ["A familiar title or chorus can hide verses that feel different in context. Play the whole recording before making a final decision, especially when the service has a religious or formal setting."] },
      { title: "Match the tone to the person", paragraphs: ["Sombre music is not compulsory. A funny, energetic or unconventional song may feel more respectful when it genuinely reflects the person's humour and character."] },
      { title: "Choose the exact artist and version", paragraphs: ["Live, orchestral, acoustic and original recordings of the same song can create completely different moods. Give the organiser the precise version rather than only the title."] },
      { title: "Check the available service time", paragraphs: ["Recorded pieces often last several minutes, while a short service may have limited space for music. Ask how much time is available and whether a track will be played in full or faded."] },
      { title: "Confirm the venue's arrangements", paragraphs: ["Churches, crematoria and other venues may use different music systems or have particular restrictions. Confirm availability early rather than assuming any recording can be played."] },
      { title: "Supply choices well in advance", paragraphs: ["Send the exact song details to the funeral director, celebrant or venue before the service. This leaves time to source the recording and resolve any technical or suitability questions."] },
      { title: "Test sound and pronunciation", paragraphs: ["Check that the recording is clear and that names, foreign-language titles and live-performance instructions are understood. Small details can prevent avoidable stress on the day."] },
      { title: "Record wishes before they are needed", paragraphs: ["People can make their own music preferences known as part of funeral wishes. A short written list can remove uncertainty and help family members create a service that feels recognisably personal."] },
    ],
  },
];

export const metadata: Metadata = buildMetadata({
  alternates: {
    canonical: absoluteUrl(path),
    languages: { en: absoluteUrl(path), "x-default": absoluteUrl(path) },
  },
  description,
  locale,
  path,
  title: landingTitle,
});

export default function FuneralArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "funeral-songs",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#17161c",
      pageAlt: "#34303c",
      surface: "#fbf8f0",
      surfaceRaised: "#eee8dc",
      text: "#242128",
      muted: "#6c666c",
      primary: "#65526f",
      primaryText: "#ffffff",
      border: "#b8ad9d",
      correct: "#aa8748",
      incorrect: "#744458",
    },
    header: {
      background: "linear-gradient(90deg, #1c1a22, #403849)",
      text: "#ffffff",
      border: "#c3a15f",
      shadow: "0 8px 26px rgba(13, 12, 17, 0.32)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: landingTitle,
    description,
    inLanguage: "en",
    url: absoluteUrl(path),
    dateModified: "2026-08-27",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.siteUrl,
    },
  };

  return (
    <SiteShell
      availableLocales={[locale]}
      currentPath={path}
      locale={locale}
      quizTheme={articleTheme}
      translations={translations}
    >
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        type="application/ld+json"
      />
      <style dangerouslySetInnerHTML={{ __html: `html,body{background:${articleTheme.colors.page}}` }} />
      <ExperienceThemeBoundary
        shellCssHref={referenceQuiz.shellCssHref}
        theme={articleTheme}
        themeCssHref={referenceQuiz.themeCssHref}
      >
        <ArticleExperience
          articleSlug="funeral"
          adNote="One short ad, then reveal the songs."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="Reveal The Songs"
          disclaimer="Funeral music charts vary by year, region and provider. The 20-song countdown follows the cited NAFD 2026 UK ranking; other charts may differ. Personal wishes, cultural traditions, venue requirements and the needs of those arranging the service should guide the final choice."
          icon={(
            <img
              alt=""
              className="article-engine__funeral-icon"
              height="256"
              src="/article-icons/funeral-pianist.png"
              width="256"
            />
          )}
          intro="The number one choice surprises many families. Reveal the songs requested most often."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          socialProofCount="147,000+"
          socialProofLabel="read this today"
          sources={[
            { label: "National Association of Funeral Directors: Top 20 funeral songs for 2026", url: "https://www.funeral-directory.co.uk/guides/funeral-music-and-songs/" },
            { label: "Co-op Funeralcare 2025 music chart", url: "https://assets.digital.coop.co.uk/funeralcare/music" },
            { label: "Co-op Funeralcare music guidance", url: "https://www.coop.co.uk/funeralcare/music" },
            { label: "Co-op funeral music charts", url: "https://www.coop.co.uk/funeralcare/music/charts" },
            { label: "Co-op 2025 chart announcement", url: "https://www.co-operative.coop/media/news-releases/from-vera-lynn-to-vengaboys-the-uks-top-funeral-songs-from-the-last-12" },
            { label: "SunLife Cost of Dying report", url: "https://hospiceuk-files-prod.s3.eu-west-2.amazonaws.com/s3fs-public/2024-03/Sunlife_Cost%20of%20Dying%20Report_2024.pdf" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
