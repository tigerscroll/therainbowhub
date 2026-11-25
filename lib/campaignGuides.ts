export const dentalGuide = {
  path: "/dental",
  title: "How to Find Affordable Dental Care in Retirement",
  description: "A short guide to lower-cost dental care, local support and questions to ask before agreeing to treatment.",
  intro: "If the cost of dental work feels out of reach, start with these steps. What’s available depends on where you live, your income and the treatment you need.",
  popupTitle: "Need Dental Work?",
  publishedAt: "2026-11-25",
} as const;

export const mobilityGuide = {
  path: "/mobility",
  title: "A Fully Funded Mobility Scooter",
  description: "Find out where to check for mobility scooter funding, what approval may require and which costs you might still need to pay.",
  intro: "Can you get a mobility scooter with no out-of-pocket cost? It depends on where you live, your mobility needs and the rules of the programme. Here’s what to check before you pay or apply.",
  popupTitle: "Want A Mobility Scooter?",
  publishedAt: "2026-11-25",
} as const;

export const campaignGuideBootAttribute = "data-campaign-guide-boot";
const campaignParameter = /^utm_.+/i;

export function hasGuideCampaign(search: string) {
  return [...new URLSearchParams(search).keys()].some(key => campaignParameter.test(key));
}

export const campaignGuideBootScript = `if (${JSON.stringify([dentalGuide.path, mobilityGuide.path])}.includes(location.pathname.replace(/\\/$/, "")) &&
  Array.from(new URLSearchParams(location.search).keys()).some(function(key) { return ${campaignParameter}.test(key); })) {
  document.documentElement.setAttribute("${campaignGuideBootAttribute}", "");
}`;

export const campaignGuideBootStyle = `
  html[${campaignGuideBootAttribute}], html[${campaignGuideBootAttribute}] body { background: #edf6f0; overflow: hidden; }
  html[${campaignGuideBootAttribute}] .site-shell { visibility: hidden; }
  html[${campaignGuideBootAttribute}] [data-campaign-guide-preview] { visibility: visible; }
  html:not([${campaignGuideBootAttribute}]) [data-campaign-guide-preview] { display: none; }
`;
