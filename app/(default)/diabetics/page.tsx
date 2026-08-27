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
const path = "/diabetics";
const landingTitle = "20 Worst Foods For Diabetes";
const description = "See twenty foods and drinks ranked by common concerns for people with diabetes, then discover practical swaps and food-label checks.";

export const sections: ArticleSection[] = [
  {
    title: "The 20 Unhealthiest Foods For Diabetics, Ranked In Order",
    intro: "This editorial ranking starts at #20 and works towards #1. It weighs typical portions, refined carbohydrate, added sugar, saturated fat, sodium and fibre—not a single food's name. Products and individual glucose responses vary.",
    points: [
      {
        numberLabel: "20",
        title: "Sweetened flavoured yogurt",
        paragraphs: ["Yogurt can provide protein and calcium, but flavoured pots can contain substantially more carbohydrate and added sugar than expected. Compare total carbohydrate per pot, not only the low-fat claim on the front."],
      },
      {
        numberLabel: "19",
        title: "Sugary granola",
        paragraphs: ["Granola sounds wholesome, yet many varieties combine sweeteners, refined cereal and oil in a small recommended serving. A large bowl can deliver far more carbohydrate and calories than the label's portion suggests."],
      },
      {
        numberLabel: "18",
        title: "Flavoured instant oatmeal",
        paragraphs: ["Plain oats can fit a diabetes meal plan, but sweetened instant sachets may add sugar and are easy to double up. Look for plain oats and add your own cinnamon, nuts or modest portion of fruit."],
      },
      {
        numberLabel: "17",
        title: "Large portions of white rice",
        paragraphs: ["White rice is a refined grain with little fibre, and takeaway portions can be several times larger than a planned carbohydrate serving. The quantity and what accompanies it can matter more than the rice alone."],
      },
      {
        numberLabel: "16",
        title: "Instant noodles",
        paragraphs: ["Instant noodle meals commonly combine refined carbohydrate with high sodium and relatively little fibre or protein. Adding non-starchy vegetables and lean protein can improve the balance, but the full seasoning sachet may still be salty."],
      },
      {
        numberLabel: "15",
        title: "Creamy white-pasta dishes",
        paragraphs: ["A large bowl can combine refined pasta with a sauce high in saturated fat and sodium. Pasta does not have to disappear, but a smaller portion, more vegetables and a lighter sauce can change the overall meal."],
      },
      {
        numberLabel: "14",
        title: "Bacon, sausages and processed meats",
        paragraphs: ["These foods may contain little carbohydrate, but that does not automatically make them a strong everyday choice. Many are high in sodium and saturated fat—important considerations because diabetes increases cardiovascular risk."],
      },
      {
        numberLabel: "13",
        title: "Takeaway pizza",
        paragraphs: ["Refined crust, large portions, processed meat, cheese and salty sauces can stack carbohydrate, saturated fat and sodium in one meal. Thin crust, vegetable toppings and fewer slices can substantially change the numbers."],
      },
      {
        numberLabel: "12",
        title: "Breaded fried chicken",
        paragraphs: ["The coating contributes refined carbohydrate while deep frying adds fat, and sauces can add sugar and salt. Grilled or baked chicken with vegetables usually makes the carbohydrate content easier to plan."],
      },
      {
        numberLabel: "11",
        title: "Chips and loaded fries",
        paragraphs: ["A medium serving of fries can represent a substantial carbohydrate portion before cheese, sauces or a sugary drink are added. The combination of starch, fat, sodium and easy-to-overeat portions pushes fries higher in this ranking."],
      },
    ],
    next: {
      eyebrow: "The Top 10 are next",
      title: "The worst offenders are still ahead",
      copy: "See which everyday cereals, snacks and drinks rank closest to #1—and why liquid sugar dominates the list.",
      cta: "Reveal The Top 10",
    },
  },
  {
    title: "The 10 Unhealthiest Foods And Drinks For Diabetics",
    intro: "The top ten concentrates on products that commonly deliver refined carbohydrate or added sugar quickly, often with little fibre and in portions that are easy to underestimate.",
    points: [
      {
        numberLabel: "10",
        title: "Sugar-coated breakfast cereal",
        paragraphs: ["Many sweet cereals combine refined grain and added sugar with little fibre. The bowl poured at home is often much larger than the serving used on the nutrition label, and sweetened milk adds more carbohydrate."],
      },
      {
        numberLabel: "9",
        title: "White bread, oversized bagels and refined rolls",
        paragraphs: ["Refined breads generally contain less fibre than wholegrain alternatives and can raise blood glucose quickly. Bagels and large rolls may contain several bread servings before fillings or sides are counted."],
      },
      {
        numberLabel: "8",
        title: "Biscuits, cookies and packaged cakes",
        paragraphs: ["These products often combine refined flour, added sugar and saturated fat while offering limited fibre. Small pieces can make it easy to lose track of how many portions have been eaten."],
      },
      {
        numberLabel: "7",
        title: "Pastries and iced cakes",
        paragraphs: ["Pastry, icing and sweet fillings can create a dense mix of carbohydrate, sugar and saturated fat. An occasional planned portion is different from treating a large bakery item as a routine breakfast."],
      },
      {
        numberLabel: "6",
        title: "Doughnuts",
        paragraphs: ["Doughnuts combine refined flour, added sugar and frying fat in a compact serving that is not especially filling. Filled, iced or oversized versions can increase the carbohydrate further."],
      },
      {
        numberLabel: "5",
        title: "Milkshakes and frozen dessert drinks",
        paragraphs: ["A large milkshake can contain carbohydrate from milk, ice cream, syrup, whipped topping and mix-ins. Because it is a drink, it may be consumed quickly alongside an entire meal."],
      },
      {
        numberLabel: "4",
        title: "Sweetened coffee-shop drinks",
        paragraphs: ["Flavoured syrups, sweetened milk, whipped cream and toppings can turn coffee into a dessert-sized carbohydrate load. Order size and customisations can make two similar-sounding drinks very different."],
      },
      {
        numberLabel: "3",
        title: "Fruit juice",
        paragraphs: ["Even 100% fruit juice contains carbohydrate without the intact fibre of whole fruit and can be consumed rapidly. CDC guidance notes that juice raises blood sugar faster than eating whole fruit."],
      },
      {
        numberLabel: "2",
        title: "Full-sugar energy drinks",
        paragraphs: ["Some energy drinks deliver a large amount of added sugar in a single can, while caffeine can complicate how some people feel or respond. Check the whole container because the label may show more than one serving."],
      },
      {
        numberLabel: "1",
        title: "Full-sugar fizzy drinks",
        paragraphs: ["Regular soda ranks #1 because it can deliver a concentrated dose of added sugar with virtually no fibre, protein or chewing to slow consumption. Water, sparkling water or an unsweetened drink avoids that carbohydrate load."],
      },
    ],
    next: {
      eyebrow: "Do not just remove food",
      title: "Use these ten smarter swaps instead",
      copy: "Simple replacements can lower added sugar and refined carbohydrate without turning every meal into a restriction.",
      cta: "See Better Swaps",
    },
  },
  {
    title: "10 Better Food Swaps For Diabetes",
    intro: "A useful swap should fit your preferences, medication, culture and budget. These examples follow the general principles of more fibre, fewer added sugars and more balanced portions.",
    points: [
      { title: "Swap sugary soda for an unsweetened drink", paragraphs: ["Water, sparkling water, unsweetened tea or coffee removes the added-sugar load. A sugar-free drink may also be useful for some people, depending on individual preferences and advice. "] },
      { title: "Swap juice for whole fruit", paragraphs: ["Whole fruit retains fibre and takes longer to eat than juice. Portion and carbohydrate still matter, but CDC guidance specifically recommends whole fruit as the more fibre-rich option."] },
      { title: "Swap sugary cereal for plain oats", paragraphs: ["Plain rolled or steel-cut oats avoid the added sugar in many sweet cereals. Add flavour with cinnamon, nuts, seeds or an amount of fruit that fits the meal plan."] },
      { title: "Swap refined bread for a true wholegrain option", paragraphs: ["Check that whole wheat or another whole grain appears first in the ingredients. Brown colour, seeds on top or the word “multigrain” do not necessarily prove the product is wholegrain."] },
      { title: "Swap a giant rice portion for a balanced plate", paragraphs: ["Keep the rice to roughly one quarter of the plate, add non-starchy vegetables to half and use the remaining quarter for lean protein, following the diabetes plate method."] },
      { title: "Swap loaded fries for vegetables and a smaller starch", paragraphs: ["Choose roasted non-starchy vegetables, salad or another vegetable side and keep any potato portion deliberate. Preparation and portion are as important as the ingredient."] },
      { title: "Swap breaded meat for grilled or baked protein", paragraphs: ["Removing the refined coating and heavy sauce can make carbohydrate easier to count. Pair the protein with vegetables and a measured carbohydrate choice."] },
      { title: "Swap sweetened yogurt for plain yogurt", paragraphs: ["Plain unsweetened yogurt lets you control what is added. Compare total carbohydrate and choose a portion and fat level suited to the individual's nutrition plan."] },
      { title: "Swap a large dessert for a planned small portion", paragraphs: ["People with diabetes can still include dessert. CDC guidance suggests planning ahead, monitoring total carbohydrate and using a modest portion rather than treating sweets as forbidden."] },
      { title: "Swap the takeaway combo for individual choices", paragraphs: ["Order water, choose grilled protein, add vegetables and select one carbohydrate side instead of automatically combining bread, fries, dessert and a sugary drink."] },
    ],
    next: {
      eyebrow: "The label can hide the truth",
      title: "Ten checks most shoppers miss",
      copy: "“No added sugar,” “low fat” and tiny serving sizes can make a product look safer than it is.",
      cta: "Read Labels Properly",
    },
  },
  {
    title: "10 Food-Label Checks For People With Diabetes",
    intro: "Packaging claims are designed to catch attention. The nutrition panel, ingredient list and realistic portion provide the information needed to compare products.",
    points: [
      { title: "Start with the stated serving size", paragraphs: ["Check whether the pack contains one serving or several. Recalculate the numbers when the amount you normally eat is larger than the manufacturer's serving."] },
      { title: "Look at total carbohydrate", paragraphs: ["Total carbohydrate includes starches and sugars that may affect blood glucose. Front-of-pack sugar alone does not show the entire carbohydrate content of a food."] },
      { title: "Check sugars without stopping there", paragraphs: ["The sugars figure includes different sources and does not replace total carbohydrate. Compare similar products and use the ingredient list to see whether sugar or syrup is prominent."] },
      { title: "Read ingredients in order", paragraphs: ["Ingredients are listed from greatest to smallest amount. Sugar, syrup, glucose, dextrose, fructose and other sweeteners near the top suggest they form a substantial part of the product."] },
      { title: "Compare fibre between similar products", paragraphs: ["When two breads, cereals or grains have similar carbohydrate, the higher-fibre choice may be more filling and less refined. Check the actual figure rather than relying on wholegrain imagery."] },
      { title: "Check saturated fat", paragraphs: ["Diabetes is linked with greater cardiovascular risk, so saturated fat remains relevant even when a product is low in carbohydrate. Fried food, pastries, processed meat and creamy sauces can be significant sources."] },
      { title: "Check salt or sodium", paragraphs: ["High salt intake matters for blood pressure and cardiovascular health. Compare like-for-like products per 100g and be cautious with instant meals, processed meats, sauces and savoury snacks."] },
      { title: "Use traffic lights as a shortcut—not the whole answer", paragraphs: ["UK front-of-pack colours help compare fat, saturated fat, sugar and salt at a glance. They do not usually include total carbohydrate, so read the back panel too."] },
      { title: "Do not confuse ‘no added sugar’ with carbohydrate-free", paragraphs: ["A product can contain naturally occurring sugars or starch while carrying a no-added-sugar claim. It may still affect blood glucose and still needs to fit the meal plan."] },
      { title: "Compare the label with your own glucose plan", paragraphs: ["Medication, insulin, activity, timing and individual response affect what works. A registered dietitian or diabetes educator can help set carbohydrate goals and interpret recurring glucose patterns."] },
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

export default function DiabeticsArticlePage() {
  const referenceQuiz = getQuizBySlug("nursing", locale);
  if (!referenceQuiz) notFound();

  const articleTheme = {
    ...referenceQuiz.theme,
    id: "diabetes-food-ranking",
    colors: {
      ...referenceQuiz.theme.colors,
      page: "#102e3b",
      pageAlt: "#286b78",
      surface: "#fffaf1",
      surfaceRaised: "#e8f3ef",
      text: "#231b1b",
      muted: "#6e5e5d",
      primary: "#bd2439",
      primaryText: "#ffffff",
      border: "#d18b7e",
      correct: "#18815e",
      incorrect: "#bd2439",
    },
    header: {
      background: "linear-gradient(90deg, #123746, #27747c)",
      text: "#ffffff",
      border: "#f2c544",
      shadow: "0 8px 26px rgba(12, 46, 58, 0.3)",
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: landingTitle,
    description,
    inLanguage: "en",
    url: absoluteUrl(path),
    lastReviewed: "2026-08-27",
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
          articleSlug="diabetics"
          adNote="One short ad, then see the ranked list."
          avatars={referenceQuiz.landing.socialAvatars}
          ctaLabel="See The 20 Foods →"
          disclaimer="General educational nutrition information only. This editorial ranking is not a clinical scale and no single food is automatically forbidden for everyone with diabetes. Carbohydrate amount, portion, timing, medication, activity and individual glucose response all matter. Do not change insulin, diabetes medicine or a prescribed eating plan without advice from a qualified healthcare professional. Sugary drinks or glucose may be required to treat hypoglycaemia according to an individual's treatment plan."
          icon="🍟"
          intro="Some of the worst offenders look surprisingly harmless. See all 20 ranked from bad to worst — and discover which drink takes the #1 spot."
          landingTitle={landingTitle}
          sectionCount={sections.length}
          showCtaIcon={false}
          socialProofCount="318,000+"
          socialProofLabel="viewed this today"
          sources={[
            { label: "CDC diabetes meal planning", url: "https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html" },
            { label: "CDC choosing healthy carbohydrates", url: "https://www.cdc.gov/diabetes/healthy-eating/choosing-healthy-carbs.html" },
            { label: "American Diabetes Association: carbohydrates", url: "https://diabetes.org/food-nutrition/understanding-carbs" },
            { label: "Diabetes UK: sugar and diabetes", url: "https://www.diabetes.org.uk/living-with-diabetes/eating/sugar-and-diabetes" },
            { label: "Diabetes UK: understanding food labels", url: "https://www.diabetes.org.uk/living-with-diabetes/eating/food-shopping-for-diabetes/understanding-food-labels" },
            { label: "NHS type 2 diabetes treatment and food guidance", url: "https://www.nhs.uk/conditions/type-2-diabetes/treatment/" },
          ]}
        />
      </ExperienceThemeBoundary>
    </SiteShell>
  );
}
