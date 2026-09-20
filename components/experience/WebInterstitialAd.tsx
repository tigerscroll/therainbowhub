"use client";

import { useEffect } from "react";

import { mountWebInterstitialAd } from "@/components/quiz/rewardedAds";
import { siteConfig } from "@/lib/siteConfig";

export function WebInterstitialAd() {
  useEffect(() => {
    const mounted = mountWebInterstitialAd({ adUnitPath: siteConfig.interstitialAdUnitPath });
    return () => mounted.destroy();
  }, []);

  return null;
}
