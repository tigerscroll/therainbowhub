export function shouldShowArticlePopup(search: string): boolean {
  return new URLSearchParams(search).has("fbclid");
}

export function getArticlePopupBootstrapScript(unlockKey: string, followUpUnlockKey?: string, articleUnlockKey?: string,
  ageGuard?: {progressKey: string; rejectedAnswers: Record<string, string[]>}): string {
  const key = JSON.stringify(unlockKey).replace(/</g, "\\u003c");
  const followUp = followUpUnlockKey && articleUnlockKey
    ? `|| (window.sessionStorage.getItem(${JSON.stringify(followUpUnlockKey).replace(/</g, "\\u003c")})!=="1"&&window.sessionStorage.getItem(${JSON.stringify(articleUnlockKey).replace(/</g, "\\u003c")})!=="1")`
    : "";
  const guard = ageGuard ? `try{var g=${JSON.stringify(ageGuard).replace(/</g, "\\u003c")};var p=JSON.parse(window.sessionStorage.getItem(g.progressKey)||"null");if(p&&p.answers&&Object.keys(g.rejectedAnswers).some(function(id){return g.rejectedAnswers[id].indexOf(p.answers[id])!==-1;}))popup=true;}catch(e){}` : "";
  return `(function(){var root=document.currentScript&&document.currentScript.parentElement;if(!root)return;var popup=new URLSearchParams(window.location.search).has("fbclid");if(popup){try{popup=window.sessionStorage.getItem(${key})!=="1"${followUp};}catch(e){}}${guard}root.setAttribute("data-gallery-entry",popup?"popup":"intro");})()`;
}
