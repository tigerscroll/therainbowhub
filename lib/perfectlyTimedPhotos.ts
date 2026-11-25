export const perfectlyTimedPhotos = {
  path: "/perfectly-timed-photos",
  title: "The Timing Of This Was Just Perfect",
  description: "Funny moments in women’s sports, captured at just the right time.",
  source: "https://jobs.therainbowhub.com/perfectly-timed",
  publishedAt: "2026-11-25",
} as const;

const campaignParameter = /^utm_.+/i;
export const sportsEntryBootAttribute = "data-sports-entry-boot";

export function hasSportsCampaign(search: string) {
  return [...new URLSearchParams(search).keys()].some(key => campaignParameter.test(key));
}

export function getSportsEntryBootstrapScript() {
  return `if (location.pathname.replace(/\\/$/, "") === ${JSON.stringify(perfectlyTimedPhotos.path)} &&
    Array.from(new URLSearchParams(location.search).keys()).some(function(key) { return ${campaignParameter}.test(key); })) {
    document.documentElement.setAttribute("${sportsEntryBootAttribute}", "");
  }`;
}

// Paint only the popup on campaign requests until the React player takes over.
export const sportsEntryBootStyle = `
  html[${sportsEntryBootAttribute}], html[${sportsEntryBootAttribute}] body { background: #000; overflow: hidden; }
  html[${sportsEntryBootAttribute}] .site-shell { visibility: hidden; }
  html[${sportsEntryBootAttribute}] [data-sports-entry-preview] { visibility: visible; }
  html:not([${sportsEntryBootAttribute}]) [data-sports-entry-preview] { display: none; }
`;
