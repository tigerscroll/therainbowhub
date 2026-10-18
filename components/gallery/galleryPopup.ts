export function shouldShowArticlePopup(search: string): boolean {
  return new URLSearchParams(search).has("fbclid");
}
