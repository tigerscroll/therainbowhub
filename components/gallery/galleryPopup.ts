export function shouldShowArticlePopup(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.has("fbclid") || params.get("utm_source") === "google";
}

export function getArticlePopupBootstrapScript(unlockKey: string, followUpUnlockKey?: string, articleUnlockKey?: string): string {
  const key = JSON.stringify(unlockKey).replace(/</g, "\\u003c");
  const followUp = followUpUnlockKey && articleUnlockKey
    ? `|| (window.sessionStorage.getItem(${JSON.stringify(followUpUnlockKey).replace(/</g, "\\u003c")})!=="1"&&window.sessionStorage.getItem(${JSON.stringify(articleUnlockKey).replace(/</g, "\\u003c")})!=="1")`
    : "";
  return `(function(){var root=document.currentScript&&document.currentScript.parentElement;if(!root)return;var params=new URLSearchParams(window.location.search);var popup=params.has("fbclid")||params.get("utm_source")==="google";if(popup){try{popup=window.sessionStorage.getItem(${key})!=="1"${followUp};}catch(e){}}root.setAttribute("data-gallery-entry",popup?"popup":"intro");})()`;
}
