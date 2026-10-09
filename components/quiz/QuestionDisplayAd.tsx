"use client";

import { useEffect, useId, useRef, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { createDisplayAd } from "./displayAds";

export function QuestionDisplayAd({ contentKey, placement }: { contentKey: string; placement: string }) {
  const id = `display-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const element = useRef<HTMLDivElement>(null);
  const ad = useRef<ReturnType<typeof createDisplayAd> | null>(null);
  const [empty, setEmpty] = useState(false);
  const latestContent = useRef(contentKey);
  latestContent.current = contentKey;

  useEffect(() => {
    if (!element.current) return;
    const tag = window.googletag ??= { cmd: [] };
    ad.current = createDisplayAd(tag, element.current, siteConfig.displayAdUnitPath, latestContent.current, setEmpty);
    return () => { ad.current?.destroy(); ad.current = null; };
  }, []);

  useEffect(() => { ad.current?.update(contentKey); }, [contentKey]);

  return (
    <div className="quiz-engine__display" data-display-placement={placement} data-empty={empty || undefined}>
      <div className="quiz-engine__display-slot" id={id} ref={element} />
    </div>
  );
}
