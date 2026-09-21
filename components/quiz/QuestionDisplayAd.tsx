"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { mountDisplayAd } from "./rewardedAds";

export function QuestionDisplayAd({ id }: { id: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // The engine keys each placement by question ID: new question, fresh request.
    // Answer selection does not change the key or recreate the slots.
    const width = container.current?.clientWidth ?? 0;
    const sizes: Array<[number, number]> = [[336, 280], [300, 250]];
    const fittingSizes = sizes.filter(([w]) => w <= width);
    if (!fittingSizes.length) return;
    const ad = mountDisplayAd({ adUnitPath: siteConfig.displayAdUnitPath, elementId: id, sizes: fittingSizes });
    return () => ad.destroy();
  }, [id]);
  return <aside className="quiz-question-ad" data-display-ad aria-label="Advertisement" ref={container}>
    <div id={id} />
  </aside>;
}
