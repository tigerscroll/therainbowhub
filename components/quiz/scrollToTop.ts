// Refreshes are tied to a completed quiz navigation, never to ordinary scrolling.
export function scrollQuizToTop(onTop?: () => void) {
  let cancelled = false;
  let frame = 0;
  let startedAt: number | undefined;
  let framesAtTop = 0;
  const check = (now: number) => {
    if (cancelled) return;
    startedAt ??= now;
    framesAtTop = window.scrollY <= 1 ? framesAtTop + 1 : 0;
    if (framesAtTop >= 2) {
      onTop?.();
      return;
    }
    // An interrupted scroll must not leave an ad refresh waiting indefinitely.
    if (now - startedAt < 3000) frame = window.requestAnimationFrame(check);
  };
  // React must commit the new question before scrolling. Starting inside the
  // click handler lets the changed layout/focused Next button cancel the scroll.
  frame = window.requestAnimationFrame(() => {
    if (cancelled) return;
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
    frame = window.requestAnimationFrame(check);
  });
  return () => { cancelled = true; window.cancelAnimationFrame(frame); };
}
