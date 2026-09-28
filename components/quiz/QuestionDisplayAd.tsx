"use client";

import { useEffect, useId, useRef, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { mountDisplayAd } from "./displayAds";

export function QuestionDisplayAd({ label, placement }: { label: string; placement: "below-question" | "below-answers" }) {
  const slotId = `quiz-display-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const container = useRef<HTMLElement>(null);
  const element = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(false);
  const [state, setState] = useState<"pending" | "filled" | "empty">("pending");

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const measure = () => setFits(node.getBoundingClientRect().width >= 336);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!fits || !element.current) return;
    setState("pending");
    return mountDisplayAd(element.current, siteConfig.displayAdUnitPath, (filled) => {
      setState(filled ? "filled" : "empty");
    });
  }, [fits]);

  return (
    <aside aria-label={label} className="quiz-display-ad" data-display-ad={placement} data-state={state} data-fits={fits} ref={container}>
      <div className="quiz-display-ad__slot" id={slotId} ref={element} />
    </aside>
  );
}
