"use client";

const NAVIGATION_BACKGROUND_KEY = "rainbowhub:navigation-background";

export function prepareFullPageNavigation(element: HTMLElement) {
  element.setAttribute("data-departing", "true");
  element.setAttribute("aria-busy", "true");
  try {
    const theme = document.querySelector<HTMLElement>(".quiz-theme");
    const themeBackground = theme
      ? window.getComputedStyle(theme).getPropertyValue("--quiz-page").trim()
      : "";
    const background = themeBackground || window.getComputedStyle(document.body).backgroundColor;
    if (background) {
      window.sessionStorage.setItem(NAVIGATION_BACKGROUND_KEY, background);
      document.documentElement.style.setProperty("--navigation-background", background);
    }
  } catch {
    // Navigation must still proceed when storage or computed styles are unavailable.
  }
}

export function cancelFullPageNavigation(element: HTMLElement) {
  element.removeAttribute("data-departing");
  element.removeAttribute("aria-busy");
  try {
    window.sessionStorage.removeItem(NAVIGATION_BACKGROUND_KEY);
    document.documentElement.style.removeProperty("--navigation-background");
  } catch {
    // A cancelled action should still return to its normal visual state.
  }
}
