// Retain the legacy names so existing attributed sessions stay consistent.
export const TRAFFIC_HEADER_CLASS = "fbclid-traffic";
export const TRAFFIC_HEADER_STORAGE_KEY = "rainbowhub:fbclid-traffic";
const CLICK_ID_PARAMETERS = ["fbclid", "gclid", "gbraid", "wbraid"];

export function hasAdClickId(params: Pick<URLSearchParams, "keys">): boolean {
  return Array.from(params.keys()).some(key => CLICK_ID_PARAMETERS.includes(key.toLowerCase()));
}

// This runs in <head>, before the header can paint or React can hydrate.
export function getTrafficHeaderBootstrapScript(): string {
  return `(function(){var params=new URLSearchParams(location.search);var hasClickId=Array.from(params.keys()).some(function(key){return ${JSON.stringify(CLICK_ID_PARAMETERS)}.includes(key.toLowerCase());});if(hasClickId)document.documentElement.classList.add(${JSON.stringify(TRAFFIC_HEADER_CLASS)});try{var key=${JSON.stringify(TRAFFIC_HEADER_STORAGE_KEY)};if(hasClickId)sessionStorage.setItem(key,"1");if(sessionStorage.getItem(key)==="1")document.documentElement.classList.add(${JSON.stringify(TRAFFIC_HEADER_CLASS)});var backgroundKey="rainbowhub:navigation-background";var navigationBackground=sessionStorage.getItem(backgroundKey);if(navigationBackground){document.documentElement.style.setProperty("--navigation-background",navigationBackground);sessionStorage.removeItem(backgroundKey)}}catch(e){}})()`;
}
