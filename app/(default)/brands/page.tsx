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
const path = "/brands";
const landingTitle = "These Old Brands Are Worth Thousands";
const description = "Discover the vintage household brands collectors search for, real price examples, the marks that affect value and how to research an old item before selling it.";

export const sections: ArticleSection[] = [
  {
    title: "20 Old Household Brands: #20–#11",
    intro: "This editorial countdown ranks familiar names by collector demand, rarity potential and the standout prices exceptional versions can reach. Most examples are modestly valued—the exact version matters.",
    points: [
      { numberLabel: "20", title: "Mason Cash mixing bowls", paragraphs: ["Older sizes, discontinued colours and well-preserved patterned bowls can appeal to kitchenware collectors. Check the impressed base mark and compare the exact design rather than relying on the familiar shape alone."] },
      { numberLabel: "19", title: "Anchor Hocking glassware", paragraphs: ["Depression-era colours, unusual moulds and complete serving sets can be more desirable than common clear pieces. Tiny chips and dishwasher haze make a large difference to collector value."] },
      { numberLabel: "18", title: "Kilner, Ball and Mason preserving jars", paragraphs: ["Early closures, unusual embossing, rare colours and original lids are worth researching. Many jars survive, so age alone does not make an ordinary clear example valuable."] },
      { numberLabel: "17", title: "Fiesta tableware", paragraphs: ["Collectors distinguish original production from later reissues using colour, shape, glaze and base marks. Scarcer colours and complete undamaged place settings can attract stronger demand."] },
      { numberLabel: "16", title: "Braun radios and small appliances", paragraphs: ["Mid-century Braun design has a dedicated following. Original parts, unbroken cases and a documented model number matter, while old electrical items should be checked professionally before use."] },
      { numberLabel: "15", title: "Kenwood Chef mixers", paragraphs: ["Early mixers with their bowls, splash guards and complete attachment sets can interest appliance and design collectors. Condition, exact model and local shipping practicality all shape the price."] },
      { numberLabel: "14", title: "Hornsea Pottery", paragraphs: ["Some discontinued patterns, unusual shapes and complete tea or storage sets are increasingly collected. Base marks, decoration quality and freedom from chips help separate the better finds."] },
      { numberLabel: "13", title: "Royal Doulton figures and tableware", paragraphs: ["Discontinued figures, limited issues and less common patterns may have a collector market, but many pieces were produced in large numbers. Record every model name, number and backstamp."] },
      { numberLabel: "12", title: "Vintage LEGO sets", paragraphs: ["Complete retired sets with instructions, boxes and rare minifigures can outperform loose mixed bricks. Match the set number and inventory carefully before comparing sold prices."] },
      { numberLabel: "11", title: "Early Barbie dolls and accessories", paragraphs: ["The earliest dolls, scarce outfits and complete boxed examples can command serious collector attention. Reproduction clothing, replaced parts and identification mistakes are common, so small construction details matter."] },
    ],
    next: {
      eyebrow: "The Top 10 are next",
      title: "The biggest collector surprises are still ahead",
      copy: "Reveal numbers 10 to 1—and see which familiar advertising brand takes the top spot.",
      cta: "Reveal The Top 10",
    },
  },
  {
    title: "10 Old Household Brands: #10–#1",
    intro: "These familiar names have produced the patterns, formats and rare survivors most likely to make collectors look twice. The ranking reflects standout potential, not the value of every item bearing the brand.",
    points: [
      {
        numberLabel: "10",
        title: "Thermos and Stanley lunch gear",
        paragraphs: ["Early vacuum flasks, lunch boxes and matching sets can appeal to collectors of camping, transport and industrial design. Original cups, stoppers, handles and printed decoration are all worth checking."],
      },
      {
        numberLabel: "9",
        title: "Hoover and Electrolux advertising pieces",
        paragraphs: ["The appliance itself may be bulky and common, while a dealer sign, shop display, boxed miniature or beautifully illustrated manual can be the more collectible object. Small branded extras are easy to overlook."],
      },
      {
        numberLabel: "8",
        title: "Tupperware from the early party-plan era",
        paragraphs: ["Unusual colours, discontinued shapes, complete sets and pieces with original paperwork can appeal to collectors of post-war design. Common used tubs are plentiful, so model and condition must be matched carefully."],
      },
      {
        numberLabel: "7",
        title: "Le Creuset in discontinued colours",
        paragraphs: ["Older enamel cookware can be collectible when the colour, shape or production period is sought after. Chips, interior wear and replaced lids usually reduce value, while clean sets in a scarce finish can attract a premium."],
      },
      {
        numberLabel: "6",
        title: "KitchenAid and Hobart mixers",
        paragraphs: ["Heavy early mixers, unusual colours and well-preserved attachments can interest design and appliance collectors. Working order helps, but old electrical equipment should be professionally checked before use."],
      },
      {
        numberLabel: "5",
        title: "Singer sewing machines and cabinets",
        paragraphs: ["Serial numbers help date Singer machines, but many standard treadle and hand-crank models survive. Scarcer variants, ornate decals, accessories and exceptional cabinets tend to matter more than age by itself."],
      },
      {
        numberLabel: "4",
        title: "Cadbury, OXO and other advertising tins",
        paragraphs: ["Old grocery and confectionery tins can be desirable when the graphics are striking, the subject is unusual and the surface remains bright. Rare early packaging can be worth far more than the later mass-produced tins found in many homes."],
      },
      {
        numberLabel: "3",
        title: "CorningWare casserole dishes",
        paragraphs: ["Early marks, uncommon decorations, unusual sizes and complete dishes with matching lids attract the most attention. Blue Cornflower is famous, but familiarity alone does not make every example rare or expensive."],
      },
      {
        numberLabel: "2",
        title: "Pyrex patterned bowls and casseroles",
        paragraphs: ["Collectors search for particular colours, promotional pieces and short-lived patterns rather than every Pyrex dish. Clear backstamps, bright decoration, the correct lid and a complete nesting set can make a major difference."],
      },
      {
        numberLabel: "1",
        title: "Coca-Cola trays, clocks and signs",
        paragraphs: ["Original advertising with vivid graphics, an early date, a desirable subject or a scarce format can command strong prices. Reproductions are widespread, so construction, ageing, maker details and provenance matter."],
      },
    ],
    next: {
      eyebrow: "The prices may surprise you",
      title: "What are the rare versions selling for?",
      copy: "See the standout price examples—and the reality checks—that reveal where the money actually is.",
      cta: "Reveal The Prices",
    },
  },
  {
    title: "What The Rare Versions Can Actually Sell For",
    intro: "A tiny variation can separate an everyday item from a four-figure collector find. These examples show why the exact version matters.",
    points: [
      {
        title: "Rare Pyrex can reach four figures",
        paragraphs: ["Reported online sales show exceptional patterns and prototypes reaching thousands of US dollars, while a recent four-piece rare bowl set was reported around $900. Those results sit far above the value of most common pieces."],
      },
      {
        title: "Pattern and form work together",
        paragraphs: ["A desirable Pyrex pattern on a scarce shape can be dramatically more valuable than the same decoration on a common bowl. Search the exact pattern, colour, model number, size and lid rather than the brand name alone."],
      },
      {
        title: "Coca-Cola trays can be serious collectibles",
        paragraphs: ["A PBS Antiques Roadshow appraisal recorded several circa-1930 trays at about $1,000 to $1,500 each and the selected group at roughly $8,500 in 2014. The date is important: current value may be higher or lower."],
      },
      {
        title: "Discarded packaging can surprise",
        paragraphs: ["A group of late-19th-century tin-can labels was valued by Antiques Roadshow at $12,000 to $16,000 in a 2017 update. Their survival, bright chromolithography and unusual discovery history made them exceptional."],
      },
      {
        title: "Most Singer machines are not fortunes",
        paragraphs: ["In a 2024 Roadshow appraisal, a common Singer machine was discussed around $100 to $150, with an attractive oak cabinet bringing the complete package to roughly $500. Brand recognition does not automatically mean rarity."],
      },
      {
        title: "Complete sets can outperform single pieces",
        paragraphs: ["Matching bowls, lids, inserts, stands and original boxes can turn separate low-value objects into a much stronger collector package. Confirm that every component belongs to the same period and set."],
      },
      {
        title: "Condition can change the price dramatically",
        paragraphs: ["Dishwasher haze, paint loss, chips, cracks, rust, dents and replacement parts can move an item into a different price bracket. Honest condition photographs are essential when comparing sales."],
      },
      {
        title: "Provenance can create a premium",
        paragraphs: ["Receipts, dated photographs, original packaging or a documented connection to a shop, factory or notable owner can strengthen confidence. A family story is useful context, but buyers normally want evidence."],
      },
      {
        title: "Asking prices can be wildly misleading",
        paragraphs: ["An unsold listing only shows what a seller hoped to receive. Use completed transactions, check whether a best offer changed the visible price and compare several genuinely similar examples."],
      },
      {
        title: "The sale venue changes the result",
        paragraphs: ["A local auction, specialist sale, online marketplace and antique shop reach different buyers and charge different fees. Market value, auction estimate, retail price and insurance replacement value are not interchangeable."],
      },
    ],
    next: {
      eyebrow: "Look before you sell",
      title: "Could yours be the valuable version?",
      copy: "Ten tiny clues can expose its age, pattern and scarcity—and some are hiding underneath.",
      cta: "Check The Hidden Clues",
    },
  },
  {
    title: "10 Tiny Clues That Could Reveal A Valuable Find",
    intro: "The detail that changes everything may be underneath, inside or printed on a part most people ignore. Check these before cleaning or selling.",
    points: [
      {
        title: "Record every logo and backstamp",
        paragraphs: ["Photograph the full mark and note whether it is moulded, printed, engraved or attached. Logo styles change over time and can separate an early product from a later reissue."],
      },
      {
        title: "Find the model or stock number",
        paragraphs: ["Numbers beneath bowls, on metal plates, inside cabinets or beside electrical ratings can identify the exact size and version. Search the complete code with the brand name."],
      },
      {
        title: "Identify the precise pattern name",
        paragraphs: ["Use a specialist pattern library rather than relying on colour alone. Pyrex, CorningWare and tableware patterns often have similar-looking variations produced for very different lengths of time."],
      },
      {
        title: "Check the country of manufacture",
        paragraphs: ["Factories and regional licensees sometimes used different glass, marks, colours or moulds. Country wording can narrow the date and prevent comparisons with a visually similar item from another market."],
      },
      {
        title: "Look for date codes and serial numbers",
        paragraphs: ["Singer serial numbers, advertising printer marks and appliance plates can give a production window. Use a reputable archive or collector reference and keep a screenshot of the matching record."],
      },
      {
        title: "Confirm the material and construction",
        paragraphs: ["Porcelain enamel, painted tin, lithographed metal, moulded plastic and modern printed reproductions age differently. Seams, fasteners, weight and the back surface can reveal more than the front."],
      },
      {
        title: "Count every original accessory",
        paragraphs: ["Lids, stands, bowls, beaters, manuals, keys and boxes affect both desirability and shipping risk. Do not assume a replacement part is original because it fits."],
      },
      {
        title: "Grade condition without hiding flaws",
        paragraphs: ["Inspect in daylight for fading, scratches, repairs, flea bites, crazing, rust and odours. Collectors may accept honest wear, but undisclosed damage destroys trust and can trigger returns."],
      },
      {
        title: "Search for reproductions before pricing",
        paragraphs: ["Popular Coca-Cola signs, tins and decorative kitchen pieces have been reproduced for decades. Compare known originals and replicas side by side before treating artificial ageing as proof."],
      },
      {
        title: "Write one exact identification sentence",
        paragraphs: ["Combine brand, item, pattern, model, approximate year, size, material and condition. That sentence becomes the search query needed to find meaningful price comparisons."],
      },
    ],
    next: {
      eyebrow: "Don't guess the price",
      title: "Ready to discover what yours may be worth?",
      copy: "Use the sold-price method collectors rely on, avoid costly traps and choose the right way to sell.",
      cta: "Value My Items",
    },
  },
  {
    title: "How To Find Out What Your Old Items Are Really Worth",
    intro: "Do not accept the first offer or trust the highest listing online. This ten-step check helps uncover a realistic price before you keep, insure or sell.",
    points: [
      {
        title: "Do not clean first",
        paragraphs: ["Harsh polish, soaking, dishwashers and abrasive pads can remove decoration or original finish. Photograph the item as found and research safe conservation before doing more than gently removing loose dust."],
      },
      {
        title: "Take a complete photo set",
        paragraphs: ["Capture the front, back, base, marks, dimensions, accessories and every flaw in even daylight. Clear photographs help experts identify an object and let buyers judge condition confidently."],
      },
      {
        title: "Search sold results, not active listings",
        paragraphs: ["eBay recommends completed listings for pricing, while its Product Research tool can provide up to three years of sales data, actual accepted prices, sold ranges and average shipping costs."],
      },
      {
        title: "Match at least five close comparisons",
        paragraphs: ["Discard results with the wrong pattern, size, date, condition or missing parts. A cluster of comparable sold prices is more useful than one dramatic outlier."],
      },
      {
        title: "Calculate the net amount",
        paragraphs: ["Subtract marketplace fees, payment costs, packing materials, insurance and postage from the headline selling price. A fragile $200 dish may produce a much smaller return after safe shipping."],
      },
      {
        title: "Choose local or specialist selling",
        paragraphs: ["Heavy machines and delicate glass may suit collection-only sales, while rare advertising or a documented collection may deserve a specialist auction with an established buyer base."],
      },
      {
        title: "Ask an expert when the stakes rise",
        paragraphs: ["Seek a qualified appraiser or relevant auction specialist when markings are unclear, authenticity is disputed, comparable sales reach substantial sums or the item may need insurance."],
      },
      {
        title: "Understand the type of valuation",
        paragraphs: ["Auction value estimates a likely competitive sale, retail reflects a dealer's asking environment and insurance value considers replacement. Ask which figure you are being given and the date it applies to."],
      },
      {
        title: "Pack for the item, not the sale price",
        paragraphs: ["Double-box fragile glass, protect protruding machine parts and avoid loose accessories striking the main object. Photograph the packed item and use appropriate tracking and insurance."],
      },
      {
        title: "Pause before accepting a rushed offer",
        paragraphs: ["If several people respond immediately or one buyer pressures you to end research, reassess the identification and sold comparisons. Keep payment and communication on the chosen platform and watch for overpayment or courier scams."],
      },
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

export default function BrandsArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "valuable-brands",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#26342d",
      pageAlt: "#6b5439",
      surface: "#f8efdc",
      surfaceRaised: "#fffaf0",
      text: "#2d241b",
      muted: "#6d5b49",
      primary: "#963f2d",
      primaryText: "#fffaf0",
      border: "#b5935b",
      correct: "#2f7458",
      incorrect: "#963f2d",
    },
    header: {
      background: "linear-gradient(90deg, #243a30, #405744)",
      text: "#fff8e8",
      border: "#d2a845",
      shadow: "0 8px 26px rgba(26, 36, 29, 0.3)",
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
          articleSlug="brands"
          adNote="One short ad, then see the items."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See Valuable Items →"
          disclaimer="The 20-to-1 order is an editorial ranking based on collector demand, rarity potential and exceptional documented examples—not a guarantee that every item from a named brand is valuable. Values and sale examples are illustrative, dated and may change. Confirm authenticity and compare recent completed sales; obtain an independent qualified appraisal for high-value decisions."
          icon={(
            <svg className="article-engine__brands-icon" focusable="false" viewBox="0 0 72 72">
              <path className="article-engine__brands-tag" d="M10 18c0-4 3-7 7-7h24l21 21-29 29L10 38V18Z" />
              <circle className="article-engine__brands-hole" cx="24" cy="24" r="5" />
              <path className="article-engine__brands-string" d="M24 24c5-10 14-14 24-13" />
              <text className="article-engine__brands-pound" x="36" y="48">£</text>
            </svg>
          )}
          intro="Don’t throw these out. One tiny mark, colour or pattern could make an ordinary item worth a surprising amount."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          showCtaIcon={false}
          socialProofCount="168,000+"
          socialProofLabel="read this today"
          sources={[
            { label: "eBay Product Research", url: "https://www.ebay.com/help/selling/selling-tools/product-research?id=4853" },
            { label: "eBay pricing guidance", url: "https://www.ebay.com/help/selling/selling/pricing-items?id=4133" },
            { label: "Corning Museum of Glass Pyrex pattern library", url: "https://pyrex.cmog.org/pattern-library" },
            { label: "Antiques Roadshow: Coca-Cola advertising trays", url: "https://www.pbs.org/wgbh/roadshow/appraisals/coca-cola-advertising-trays-ca-1930/" },
            { label: "Antiques Roadshow: late-19th-century tin-can labels", url: "https://www.pbs.org/wgbh/roadshow/appraisals/late-19th-century-tin-can-labels/" },
            { label: "Antiques Roadshow: Singer sewing machine and table", url: "https://www.pbs.org/video/appraisal-singer-oak-cased-sewing-machine-table-ca-1900-9qcv/" },
            { label: "Recent household collectible sale examples", url: "https://www.kiplinger.com/personal-finance/snag-a-fortune-with-these-in-demand-old-home-items" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
