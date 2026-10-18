export function shouldShowArticlePopup(search: string): boolean {
  return new URLSearchParams(search).has("fbclid");
}

export function getArticlePopupBootstrapScript(unlockKey: string): string {
  const key = JSON.stringify(unlockKey).replace(/</g, "\\u003c");
  return `(function(){var root=document.currentScript&&document.currentScript.parentElement;if(!root)return;var popup=new URLSearchParams(window.location.search).has("fbclid");if(popup){try{popup=window.sessionStorage.getItem(${key})!=="1";}catch(e){}}root.setAttribute("data-gallery-entry",popup?"popup":"intro");})()`;
}
