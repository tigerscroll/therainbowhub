import { perfectlyTimedPhotos } from "./perfectlyTimedPhotos";

export const dentalGuide = {
  path: "/dental",
  title: "How to Find Affordable Dental Care in Retirement",
  description: "A short guide to lower-cost dental care, local support and questions to ask before agreeing to treatment.",
  intro: "If the cost of dental work feels out of reach, start with these steps. What’s available depends on where you live, your income and the treatment you need.",
  campaignIntro: "That dental quote might not be your only option. Before you pay it or put treatment off, find out who to call first, where to look for lower-cost care, and what to ask so the final bill doesn’t catch you by surprise.",
  popupTitle: "Need Dental Work?",
  publishedAt: "2026-11-25",
} as const;

export const mobilityGuide = {
  path: "/mobility",
  title: "A Fully Funded Mobility Scooter",
  description: "Find out where to check for mobility scooter funding, what approval may require and which costs you might still need to pay.",
  intro: "Can you get a mobility scooter with no out-of-pocket cost? It depends on where you live, your mobility needs and the rules of the programme. Here’s what to check before you pay or apply.",
  campaignIntro: "Before you pay for a mobility scooter, check who might cover it. The order matters: find out where to ask about funding, what approval you may need before buying, and which costs could still come out of your pocket.",
  popupTitle: "Want A Mobility Scooter?",
  publishedAt: "2026-11-25",
} as const;

export const retiredGuide = {
  path: "/retired",
  title: "Everything You Need To Know About Jobs For Retirees",
  description: "Explore flexible work after retirement, where to find genuine openings and what to check before accepting an offer.",
  intro: "Looking for extra income or a reason to get out of the house? Start with the hours and type of work you actually want, then look for roles that fit your life now.",
  campaignIntro: "You don’t have to go back to full-time work to earn again. See which jobs fit the hours you actually want, where to find genuine openings, and what to check before saying yes to an offer.",
  popupTitle: "Retired? Looking For A Job?",
  publishedAt: "2026-11-25",
} as const;

export const retreatsGuide = {
  path: "/retreats",
  title: "Adults-Only Business Retreats: What to Know Before You Book",
  description: "A short guide to planning an adults-only business retreat, from choosing a venue to building an agenda and comparing quotes.",
  intro: "A good business retreat gives the team time to work together and room to switch off. If you’re considering an adults-only venue, here’s what to check before you book.",
  campaignIntro: "An adults-only venue can look perfect online and still be wrong for your team. Before you put down a deposit, see which questions can save you a bad booking, what to leave out of the agenda, and which charges to check.",
  popupTitle: "Business Retreats Adults Only",
  publishedAt: "2026-11-26",
} as const;

// The existing beaches gallery owns its title, article text and sitemap entry.
export const beachesCampaign = {
  path: "/beaches",
  popupTitle: "Adults Only Beaches",
  campaignIntro: "An adults-only resort doesn’t always mean the beach is adults-only. Before you book, see what’s actually private, what a day pass might not include, and how to tell a quiet escape from a beach party.",
} as const;

export const campaignGuides = [dentalGuide, mobilityGuide, retiredGuide, retreatsGuide] as const;
export const campaignGuideBootAttribute = "data-campaign-guide-boot";
const campaignParameter = /^utm_.+/i;

export function hasGuideCampaign(search: string) {
  return [...new URLSearchParams(search).keys()].some(key => campaignParameter.test(key));
}

const campaignEntryPaths = [...campaignGuides.map(guide => guide.path), beachesCampaign.path, perfectlyTimedPhotos.path];

export const campaignGuideBootScript = `if (${JSON.stringify(campaignEntryPaths)}.includes(location.pathname.replace(/\\/$/, "")) &&
  Array.from(new URLSearchParams(location.search).keys()).some(function(key) { return ${campaignParameter}.test(key); })) {
  document.documentElement.setAttribute("${campaignGuideBootAttribute}", "");
}`;

export const campaignGuideBootStyle = `
  html[${campaignGuideBootAttribute}], html[${campaignGuideBootAttribute}] body { background: #edf6f0; overflow: hidden; }
  html[${campaignGuideBootAttribute}] .site-shell { visibility: hidden; }
  html[${campaignGuideBootAttribute}] [data-campaign-guide-preview] { visibility: visible; }
  html:not([${campaignGuideBootAttribute}]) [data-campaign-guide-preview] { display: none; }
`;
