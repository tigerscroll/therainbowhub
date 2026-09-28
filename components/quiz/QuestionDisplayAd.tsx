"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { mountDisplayAd, type DisplayAdController } from "./displayAds";

export type QuestionDisplayAdHandle = Pick<DisplayAdController, "refresh">;

export function QuestionDisplayAd({ label, placement, ref }: { label: string; placement: "below-question" | "below-answers"; ref?: Ref<QuestionDisplayAdHandle> }) {
  const native = placement === "below-answers";
  const slotId = `quiz-display-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const container = useRef<HTMLElement>(null);
  const element = useRef<HTMLDivElement>(null);
  const ad = useRef<DisplayAdController | null>(null);
  const [fits, setFits] = useState(false);
  const [state, setState] = useState<"pending" | "filled" | "empty">("pending");
  useImperativeHandle(ref, () => ({ refresh: () => ad.current?.refresh() }), []);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const measure = () => setFits(node.getBoundingClientRect().width >= (native ? 1 : 336));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [native]);

  useEffect(() => {
    if (!fits || !element.current) return;
    setState("pending");
    const mounted = mountDisplayAd(element.current, native ? siteConfig.quizNativeAdUnitPath : siteConfig.displayAdUnitPath, (filled) => {
      setState(filled ? "filled" : "empty");
    }, native ? ["fluid"] : [[336, 280]]);
    ad.current = mounted;
    return () => { ad.current = null; mounted.destroy(); };
  }, [fits, native]);

  return (
    <aside aria-label={label} className="quiz-display-ad" data-display-ad={placement} data-ad-format={native ? "native" : "display"} data-state={state} data-fits={fits} ref={container}>
      <div className="quiz-display-ad__slot" id={slotId} ref={element} />
    </aside>
  );
}
