export function usesQuestionAds(slug: string) {
  return slug === "memory" || slug === "years-left";
}

export function allowsQuestionInterstitial(index: number, total: number) {
  return Number.isInteger(index) && index >= 2 && index < total - 2;
}
