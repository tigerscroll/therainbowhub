const publicEnv = {
  NEXT_PUBLIC_AD_MODE: process.env.NEXT_PUBLIC_AD_MODE,
  NEXT_PUBLIC_ASSERTIVE_YIELD_MANAGER_URL: process.env.NEXT_PUBLIC_ASSERTIVE_YIELD_MANAGER_URL,
  NEXT_PUBLIC_INTERSTITIAL_AD_UNIT_PATH: process.env.NEXT_PUBLIC_INTERSTITIAL_AD_UNIT_PATH,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

export type AdMode = "interstitial" | "rewarded";

const adMode: AdMode = publicEnv.NEXT_PUBLIC_AD_MODE?.trim().toLowerCase() === "rewarded"
  ? "rewarded"
  : "interstitial";

const rewardedStartInstructionMode = process.env.LANDER
  ?? process.env.NEXT_PUBLIC_LANDER
  ?? "off";

function getPublicEnv(name: keyof typeof publicEnv, fallback: string) {
  return publicEnv[name] || fallback;
}

export const siteConfig = {
  name: "The Rainbow Hub",
  description: "Fast, mobile-friendly IQ and academic-style quiz tests.",
  siteUrl: getPublicEnv("NEXT_PUBLIC_SITE_URL", "https://therainbowhub.com"),
  metaPixelId: getPublicEnv("NEXT_PUBLIC_META_PIXEL_ID", "843363384736830"),
  adMode,
  interstitialAdUnitPath: getPublicEnv("NEXT_PUBLIC_INTERSTITIAL_AD_UNIT_PATH", "/23348925662/display"),
  rewardedAdUnitPath: "/22677279144/rewarded",
  rewardedStartInstructionEnabled: /^(?:1|on|true|yes)$/i.test(rewardedStartInstructionMode.trim()),
  assertiveYieldManagerUrl: getPublicEnv(
    "NEXT_PUBLIC_ASSERTIVE_YIELD_MANAGER_URL",
    "https://j24iGSTy4hDgBLfJR.ay.delivery/manager/j24iGSTy4hDgBLfJR",
  ),
};
