const campaignParameter = /^utm_.+/i;
export const yearsLeftCampaignPath = "/years-left";
export const quizCampaignBootAttribute = "data-quiz-campaign-boot";

export function hasQuizCampaign(search: string) {
  return [...new URLSearchParams(search).keys()].some(key => campaignParameter.test(key));
}

export function getQuizCampaignBootstrapScript() {
  return `if (location.pathname.replace(/\\/$/, "") === ${JSON.stringify(yearsLeftCampaignPath)} &&
    Array.from(new URLSearchParams(location.search).keys()).some(function(key) { return ${campaignParameter}.test(key); })) {
    document.documentElement.setAttribute("${quizCampaignBootAttribute}", "");
  }`;
}

export const quizCampaignBootStyle = `
  html[${quizCampaignBootAttribute}], html[${quizCampaignBootAttribute}] body { background: #000 !important; overflow: hidden; }
  html[${quizCampaignBootAttribute}] .site-shell { visibility: hidden; }
  html[${quizCampaignBootAttribute}]:not(.quiz-resuming) [data-quiz-campaign-preview] { visibility: visible; }
  html:not([${quizCampaignBootAttribute}]) [data-quiz-campaign-preview] { display: none; }
`;
