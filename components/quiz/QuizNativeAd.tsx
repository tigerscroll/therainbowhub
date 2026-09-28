"use client";

import { useEffect, useId, useRef, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { mountNativeAd } from "./nativeAds";

export function QuizNativeAd({ label }: { label: string }) {
  const slotId = `quiz-native-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const element = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"pending" | "filled" | "empty">("pending");

  useEffect(() => {
    if (!element.current) return;
    return mountNativeAd(element.current, siteConfig.quizNativeAdUnitPath, (filled) => {
      setState(filled ? "filled" : "empty");
    });
  }, []);

  return (
    <aside aria-label={label} className="quiz-native-card" data-quiz-native-card data-state={state} hidden={state === "empty"}>
      {state === "filled" ? <span className="quiz-native-card__label">{label}</span> : null}
      <div className="quiz-native-card__slot" id={slotId} ref={element} />
    </aside>
  );
}
