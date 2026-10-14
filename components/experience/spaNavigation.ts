export const SPA_NAVIGATION_EVENT = "rainbowhub:spa-navigation";

export function signalSpaNavigation() {
  window.dispatchEvent(new Event(SPA_NAVIGATION_EVENT));
}
