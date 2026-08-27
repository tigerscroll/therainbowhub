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
const path = "/historical";
const landingTitle = "20 Disturbing Historical Photos";
const description = "See 20 haunting historical photographs, discover the stories behind them and learn how to identify misleading captions, altered images and AI-generated history.";

const photo = (name: string) => `/article-images/historical/${name}`;

export const sections: ArticleSection[] = [
  {
    title: "20 Disturbing Historical Photos",
    intro: "This editorial countdown ranks authentic, non-graphic photographs by historical consequence, emotional impact and what the frame reveals. It begins at number 20.",
    points: [
      {
        numberLabel: "20",
        title: "The streets swallowed by the Ohio River",
        image: { alt: "Coast Guard boats moving through flooded streets during the Ohio River flood of 1937", caption: "Ohio River flood, Huntington, West Virginia, 1937 — U.S. Coast Guard / public domain.", src: photo("ohio-flood.jpg") },
        paragraphs: ["Coast Guard crews navigated streets that had become waterways during the 1937 flood. The disaster spread across several states and displaced hundreds of thousands of people."],
      },
      {
        numberLabel: "19",
        title: "A city flattened by the Galveston hurricane",
        image: { alt: "Ruins in Galveston after the hurricane of 1900", caption: "Galveston hurricane aftermath, 1900 — Library of Congress / no known publication restrictions.", src: photo("galveston.jpg") },
        paragraphs: ["The wreckage records the aftermath of the deadliest natural disaster in United States history. The ordinary street grid is almost unrecognisable beneath collapsed homes and debris."],
      },
      {
        numberLabel: "18",
        title: "The influenza ward filled with beds",
        image: { alt: "Rows of patients in the influenza ward at Walter Reed Hospital during the 1918 pandemic", caption: "Influenza ward, Walter Reed Hospital, 1918–1919 — Library of Congress / no known restrictions.", src: photo("influenza.jpg") },
        paragraphs: ["Rows of separated beds and a masked nurse make the scale of the 1918 influenza pandemic visible inside one hospital. The calm arrangement hides the enormous global death toll beyond the frame."],
      },
      {
        numberLabel: "17",
        title: "The crowd waiting outside the Triangle fire morgue",
        image: { alt: "Crowds gathered outside a pier morgue after the Triangle Shirtwaist Factory fire", caption: "Crowds outside the pier morgue after the Triangle fire, New York, 1911 — Library of Congress / public domain.", src: photo("triangle-fire.jpg") },
        paragraphs: ["Families gathered after 146 garment workers died in the Triangle Shirtwaist Factory fire. Locked or unusable exits turned an industrial workplace into a trap and intensified demands for safety reform."],
      },
      {
        numberLabel: "16",
        title: "A shop closed before forced removal",
        image: { alt: "A Japanese American man boarding up a shop before forced wartime removal in San Francisco", caption: "Japanese American shopkeeper before forced removal, San Francisco, 1942 — Dorothea Lange / U.S. government collection.", src: photo("internment.jpg") },
        paragraphs: ["Dorothea Lange photographed a Japanese American shopkeeper boarding up his business before forced removal. The quiet scene records the loss of home, work and civil liberty without showing a camp."],
      },
      {
        numberLabel: "15",
        title: "The USS Arizona burning at Pearl Harbor",
        image: { alt: "The battleship USS Arizona burning after the attack on Pearl Harbor", caption: "USS Arizona burning, Pearl Harbor, 7 December 1941 — U.S. Navy / public domain.", src: photo("pearl-harbor.jpg") },
        paragraphs: ["The Arizona burns after its forward magazines exploded during the attack on Pearl Harbor. The ship sank with 1,177 crew members, turning the photograph into an enduring record of sudden wartime loss."],
      },
      {
        numberLabel: "14",
        title: "Soldiers walking into the surf on D-Day",
        image: { alt: "United States troops leaving a landing craft and wading towards Omaha Beach on D-Day", caption: "Into the Jaws of Death, Omaha Beach, 6 June 1944 — Robert F. Sargent, U.S. Coast Guard / public domain.", src: photo("d-day.jpg") },
        paragraphs: ["Robert F. Sargent photographed troops leaving a landing craft and moving towards Omaha Beach under fire. The camera follows from behind, so the danger ahead remains unseen but unmistakable."],
      },
      {
        numberLabel: "13",
        title: "The cabin after the Apollo 1 fire",
        image: { alt: "Fire-damaged interior of the Apollo 1 command module", caption: "Apollo 1 command module after the fire, 1967 — NASA / public domain.", src: photo("apollo-1.jpg") },
        paragraphs: ["The charred command-module interior shows the aftermath of the ground-test fire that killed astronauts Gus Grissom, Ed White and Roger Chaffee. The tragedy forced major spacecraft safety changes."],
      },
      {
        numberLabel: "12",
        title: "Mount St Helens tears itself apart",
        image: { alt: "Mount St Helens erupting in a towering cloud of ash in May 1980", caption: "Mount St Helens eruption, 18 May 1980 — Austin Post, USGS / public domain.", src: photo("mount-st-helens.jpg") },
        paragraphs: ["The mountain's north flank collapsed before a lateral blast devastated hundreds of square miles. The dramatic ash cloud gives little sense of how quickly the landscape below was transformed."],
      },
      {
        numberLabel: "11",
        title: "Challenger breaking apart on live television",
        image: { alt: "Space Shuttle Challenger breaking apart shortly after launch in 1986", caption: "Space Shuttle Challenger disaster, 28 January 1986 — NASA / public domain.", src: photo("challenger.jpg") },
        paragraphs: ["Challenger broke apart 73 seconds after launch as people watched in person and on television. Seven crew members died, and the familiar branching smoke trail became inseparable from the disaster."],
      },
    ],
    next: {
      eyebrow: "The Top 10 are next",
      title: "The most haunting photographs are still ahead",
      copy: "Reveal numbers 10 to 1 and the quiet image that became our most unsettling frame.",
      cta: "Reveal The Top 10",
    },
  },
  {
    title: "10 Disturbing Historical Photos",
    intro: "The editorial countdown continues with ten images whose meaning grows more disturbing once their context is known.",
    points: [
      {
        numberLabel: "10",
        title: "The face of the Great Depression",
        image: {
          alt: "Florence Owens Thompson with three of her children in Dorothea Lange's Migrant Mother photograph",
          caption: "Migrant Mother, Dorothea Lange, California, 1936 — Library of Congress / public domain.",
          src: photo("migrant-mother.jpg"),
        },
        paragraphs: ["Dorothea Lange photographed Florence Owens Thompson and her children at a pea-pickers camp in California. The worry visible in Thompson's face became one of the defining images of Depression-era poverty."],
      },
      {
        numberLabel: "9",
        title: "Children working the night shift",
        image: {
          alt: "Young child labourers standing outside a cotton mill at night in North Carolina in 1908",
          caption: "Child Labor—Night Shift, Lewis Hine, North Carolina, 1908 — Library of Congress / public domain.",
          src: photo("child-labor.jpg"),
        },
        paragraphs: ["Lewis Hine documented children employed at the Whitnel cotton mill in North Carolina. His photographs helped expose how ordinary child labour still looked in early twentieth-century America."],
      },
      {
        numberLabel: "8",
        title: "The boy in the Warsaw Ghetto",
        image: {
          alt: "A frightened boy with raised hands during the destruction of the Warsaw Ghetto in 1943",
          caption: "Warsaw Ghetto boy, 1943 — image from the Stroop Report / public domain.",
          src: photo("warsaw-ghetto-boy.jpg"),
        },
        paragraphs: ["The frightened child appears in a photograph included in the Stroop Report, which documented the German suppression of the Warsaw Ghetto Uprising. The boy's identity has never been established conclusively."],
      },
      {
        numberLabel: "7",
        title: "The Hindenburg caught in flames",
        image: {
          alt: "The Hindenburg airship burning during the Lakehurst disaster in 1937",
          caption: "Hindenburg disaster, Lakehurst, 1937 — U.S. Navy / public domain.",
          src: photo("hindenburg.jpg"),
        },
        paragraphs: ["The airship caught fire while attempting to land in New Jersey on 6 May 1937. Thirty-five of the 97 people aboard and one person on the ground died as cameras recorded the disaster."],
      },
      {
        numberLabel: "6",
        title: "A wall of dust approaching a town",
        image: {
          alt: "A vast dust storm approaching Stratford, Texas, during the Dust Bowl in 1935",
          caption: "Dust storm approaching Stratford, Texas, 1935 — NOAA / public domain.",
          src: photo("dust-storm.jpg"),
        },
        paragraphs: ["The dark front is not a mountain or storm cloud. It is airborne soil advancing on Stratford during the Dust Bowl, when drought and severe erosion damaged farms and displaced families across the Great Plains."],
      },
      {
        numberLabel: "5",
        title: "One of the last photographs of Titanic afloat",
        image: {
          alt: "Titanic leaving the Irish coast on its maiden voyage in April 1912",
          caption: "Titanic leaving the Irish coast, 11 April 1912 — public-domain image via Wikimedia Commons.",
          src: photo("titanic-last.jpg"),
        },
        paragraphs: ["The ship was photographed leaving the Irish coast for New York on 11 April 1912. Less than four days later, Titanic struck an iceberg and sank in the North Atlantic."],
      },
      {
        numberLabel: "4",
        title: "The cloud above Nagasaki",
        image: {
          alt: "Mushroom cloud rising above Nagasaki after the atomic bombing on 9 August 1945",
          caption: "Atomic cloud over Nagasaki, 9 August 1945 — U.S. government film still / public domain.",
          src: photo("nagasaki.jpg"),
        },
        paragraphs: ["A crew member aboard one of the mission aircraft filmed the cloud rising over Nagasaki. The image records only the distant shape, concealing the catastrophic human destruction below."],
      },
      {
        numberLabel: "3",
        title: "San Francisco still burning",
        image: {
          alt: "Ruins of San Francisco still smouldering after the earthquake and fires of April 1906",
          caption: "San Francisco after the 1906 earthquake and fires — U.S. National Archives / public domain.",
          src: photo("san-francisco.jpg"),
        },
        paragraphs: ["The earthquake on 18 April 1906 ruptured streets and water mains, but the fires that followed destroyed much of the city. This view shows the ruins still smoking from the Ferry Building tower."],
      },
      {
        numberLabel: "2",
        title: "A nuclear test swallows a fleet",
        image: {
          alt: "The Baker underwater nuclear explosion during Operation Crossroads at Bikini Atoll in 1946",
          caption: "Operation Crossroads, Baker test, Bikini Atoll, 1946 — U.S. military / public domain.",
          src: photo("operation-crossroads.jpg"),
        },
        paragraphs: ["The underwater Baker test drove a vast column of radioactive water above target ships at Bikini Atoll. The image's scale hides the contamination that made many vessels difficult or impossible to clean."],
      },
      {
        numberLabel: "1",
        title: "The man facing away from the breadline",
        image: {
          alt: "A man facing a railing while a crowd waits in the White Angel Breadline in San Francisco in 1932",
          caption: "White Angel Breadline, Dorothea Lange, San Francisco, 1932 — public domain.",
          src: photo("breadline.jpg"),
        },
        paragraphs: ["Dorothea Lange isolated one man from the crowd gathered at a San Francisco breadline. His turned back and empty cup made mass unemployment feel intensely personal."],
      },
    ],
    next: {
      eyebrow: "The photos hide more",
      title: "The real stories are even darker",
      copy: "See the details the camera missed—and what happened immediately before and after these famous frames.",
      cta: "Reveal The Stories",
    },
  },
  {
    title: "The Dark Stories Behind These Famous Photos",
    intro: "A single frame can become more famous than the event it records. These details explain what each photograph leaves outside its borders.",
    points: [
      { title: "Migrant Mother was one frame in a longer sequence", paragraphs: ["Lange made several exposures as she moved closer to Thompson and her children. The final tight composition became iconic, but it detached the family from the camp and the wider crisis around them."] },
      { title: "Hine used photography as evidence", paragraphs: ["Lewis Hine recorded names, ages, workplaces and conditions for the National Child Labor Committee. Mill managers sometimes resisted him, so he used different explanations to gain access and document what employers preferred unseen."] },
      { title: "The Warsaw image came from the perpetrators' report", paragraphs: ["The photograph was not originally created as a memorial. It appeared in a report celebrating the destruction of the Warsaw Ghetto, giving the surviving image a chilling purpose beyond the scene itself."] },
      { title: "Most people aboard Hindenburg survived", paragraphs: ["The scale of the fire makes survival look impossible, yet 62 of the 97 people aboard escaped. The disaster still killed 36 people in total and ended public confidence in passenger airships."] },
      { title: "The Dust Bowl was not caused by drought alone", paragraphs: ["Severe drought combined with extensive ploughing that removed protective grasses. When winds arrived, exposed topsoil could become the enormous moving walls seen in photographs."] },
      { title: "Titanic's final route looked completely ordinary", paragraphs: ["Nothing visible in the last photographs announces the catastrophe ahead. That contrast—an intact ship continuing a routine departure—gives the image its unsettling power."] },
      { title: "The Nagasaki image creates emotional distance", paragraphs: ["Photographed from the air, the cloud becomes an abstract shape. Ground-level destruction, burns, radiation exposure and the people beneath it are absent from the frame."] },
      { title: "Fire caused much of San Francisco's destruction", paragraphs: ["Broken water mains made firefighting exceptionally difficult after the earthquake. Fires burned for days, turning damaged neighbourhoods into the broad fields of ruins seen from above."] },
      { title: "Baker contaminated what the blast did not sink", paragraphs: ["The underwater explosion coated ships in radioactive spray. Some remained physically afloat but could not be safely decontaminated, revealing a danger less visible than the spectacular blast."] },
      { title: "The breadline's crowd is hidden in plain sight", paragraphs: ["The foreground man dominates the image, but hats and shoulders packed behind the railing show how many people were waiting. Lange turned a mass crisis into one isolated human gesture without erasing the crowd."] },
    ],
    next: {
      eyebrow: "Don't trust every caption",
      title: "Could you spot a fake historical photo?",
      copy: "Old photographs are cropped, colourised, staged, misdated and now AI-generated. See the checks that expose them.",
      cta: "See The Red Flags",
    },
  },
  {
    title: "10 Ways To Tell If A Historical Photo Is Real",
    intro: "A convincing image can still carry a false caption. Verification means tracing the photograph, its earliest record and what credible archives say—not judging it by appearance alone.",
    points: [
      { title: "Reverse-search the image", paragraphs: ["Use more than one reverse-image search tool. Earlier copies may reveal a different date, location or event from the viral caption attached today."] },
      { title: "Look for an archive record", paragraphs: ["National archives, libraries, museums and established collections often provide catalogue numbers, photographer names, dates and original captions that can be cross-checked."] },
      { title: "Find the earliest traceable version", paragraphs: ["A reposted crop may remove writing, people or landmarks. Compare it with the oldest high-resolution version you can locate before interpreting what it shows."] },
      { title: "Separate the photo from its caption", paragraphs: ["Ask two questions: is the image authentic, and is the description accurate? A genuine photograph paired with the wrong event is one of the most common forms of visual misinformation."] },
      { title: "Check whether it was staged", paragraphs: ["A staged photograph is not automatically fake, but it should not be presented as an unplanned moment. Research the photographer, assignment and circumstances around the frame."] },
      { title: "Treat colour as a later interpretation", paragraphs: ["Colourised historical photographs can be powerful, but chosen colours may be estimated rather than documented. Find the original monochrome image and the colourist's methodology."] },
      { title: "Inspect hands, lettering and repeated details", paragraphs: ["AI-generated images may show malformed fingers, inconsistent text, repeated faces, impossible reflections or objects that blend into each other. These clues help, but newer models may avoid obvious errors."] },
      { title: "Check clothing and technology against the claimed date", paragraphs: ["Uniforms, road markings, vehicles, telephones and building details can expose a date that does not fit. Use specialist museum or archive references rather than guesswork."] },
      { title: "Read the full source page", paragraphs: ["A thumbnail alone may hide whether an image is cropped, restored, retouched or derived from another file. Archive notes and Wikimedia file histories often document those changes."] },
      { title: "Stay uncertain when the evidence is uncertain", paragraphs: ["Not every person, place or date in an old photograph can be identified conclusively. Responsible captions distinguish documented fact from a plausible theory or later claim."] },
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

export default function HistoricalArticlePage() {
  const referenceQuiz = getQuizBySlug("oxford", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "disturbing-history",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#201b18",
      pageAlt: "#51453b",
      surface: "#f7efdf",
      surfaceRaised: "#e7d7bd",
      text: "#2a211c",
      muted: "#6c5d52",
      primary: "#8d2c2c",
      primaryText: "#fff9ed",
      border: "#927a5e",
      correct: "#4d7058",
      incorrect: "#8d2c2c",
    },
    header: {
      background: "linear-gradient(90deg, #241f1b, #514136)",
      text: "#fff4de",
      border: "#b68b4f",
      shadow: "0 8px 26px rgba(24, 19, 16, 0.34)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: landingTitle,
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
          articleSlug="historical"
          adNote="One short ad, then reveal the photos."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See The Photos →"
          disclaimer="This educational article includes authentic, non-graphic images connected with poverty, child labour, war, disaster and nuclear weapons. The 20-to-1 order is an editorial ranking, not an objective historical measure. Details reflect the cited archive records; some identities and circumstances remain uncertain."
          icon={(
            <img
              alt=""
              className="article-engine__historical-icon"
              height="1664"
              src="/article-images/historical/migrant-mother.jpg"
              width="1280"
            />
          )}
          intro="Some captured disaster. Others became disturbing only after the truth emerged. See all 20—then reveal the stories the frames leave out."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          showCtaIcon={false}
          socialProofCount="288,000+"
          socialProofLabel="viewed this today"
          sources={[
            { label: "Library of Congress: Galveston 1900", url: "https://www.loc.gov/pictures/item/2014699678/" },
            { label: "Library of Congress: 1918 influenza ward", url: "https://www.loc.gov/item/2016648028/" },
            { label: "Library of Congress: Triangle fire crowd", url: "https://www.loc.gov/pictures/item/96513964/" },
            { label: "National Archives: Japanese American internment photographs", url: "https://www.archives.gov/news/articles/japanese-internment-75th-anniversary" },
            { label: "National Archives: USS Arizona burning", url: "https://www.archives.gov/research/still-pictures/highlights/uss-arizona-burning" },
            { label: "National Archives: Into the Jaws of Death", url: "https://www.archives.gov/files/education/lessons/d-day-message/" },
            { label: "NASA: Apollo 1 fire and aftermath", url: "https://www.nasa.gov/history/55-years-ago-the-apollo-1-fire-and-its-aftermath/" },
            { label: "USGS: Mount St Helens eruption", url: "https://www.usgs.gov/media/images/mount-saint-helens-eruption" },
            { label: "Library of Congress: Migrant Mother", url: "https://commons.wikimedia.org/wiki/File:Lange-MigrantMother02.jpg" },
            { label: "Library of Congress: Child Labor—Night Shift", url: "https://commons.wikimedia.org/wiki/File:Child_Labor_on_Mill.jpg" },
            { label: "Stroop Report: Warsaw Ghetto boy", url: "https://commons.wikimedia.org/wiki/File:Warsaw_Ghetto_Boy.jpg" },
            { label: "U.S. Navy: Hindenburg disaster", url: "https://commons.wikimedia.org/wiki/File:Hindenburg_burning,_1937.jpg" },
            { label: "NOAA: Dust storm approaching Stratford", url: "https://commons.wikimedia.org/wiki/File:Dust_storm_approaching_Stratford,_Texas.jpg" },
            { label: "Titanic's last photograph", url: "https://commons.wikimedia.org/wiki/File:Titanic_last_Photo.png" },
            { label: "Atomic cloud over Nagasaki", url: "https://commons.wikimedia.org/wiki/File:Nagasaki_mushroom_cloud.jpg" },
            { label: "National Archives: San Francisco earthquake", url: "https://commons.wikimedia.org/wiki/File:San_francisco_1906_earthquake.jpg" },
            { label: "U.S. military: Operation Crossroads", url: "https://commons.wikimedia.org/wiki/File:Operation_Crossroads_Baker_Edit.jpg" },
            { label: "Dorothea Lange: White Angel Breadline", url: "https://commons.wikimedia.org/wiki/File:White_Angel_Breadline,_San_Francisco,_1932,_by_Dorothea_Lange.jpg" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
