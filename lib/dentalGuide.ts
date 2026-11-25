export const dentalGuide = {
  path: "/dental",
  title: "How to Find Affordable Dental Care in Retirement",
  description: "A short guide to lower-cost dental care, local support and questions to ask before agreeing to treatment.",
  publishedAt: "2026-11-25",
} as const;

export const dentalEntryBootAttribute = "data-dental-entry-boot";
const campaignParameter = /^utm_.+/i;

export function hasDentalCampaign(search: string) {
  return [...new URLSearchParams(search).keys()].some(key => campaignParameter.test(key));
}

export const dentalEntryBootScript = `if (location.pathname.replace(/\\/$/, "") === ${JSON.stringify(dentalGuide.path)} &&
  Array.from(new URLSearchParams(location.search).keys()).some(function(key) { return ${campaignParameter}.test(key); })) {
  document.documentElement.setAttribute("${dentalEntryBootAttribute}", "");
}`;

export const dentalEntryBootStyle = `
  html[${dentalEntryBootAttribute}], html[${dentalEntryBootAttribute}] body { background: #edf6f0; overflow: hidden; }
  html[${dentalEntryBootAttribute}] .site-shell { visibility: hidden; }
  html[${dentalEntryBootAttribute}] [data-dental-entry-preview] { visibility: visible; }
  html:not([${dentalEntryBootAttribute}]) [data-dental-entry-preview] { display: none; }
`;
