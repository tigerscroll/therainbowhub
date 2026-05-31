const rewardedAdUnitPath = "/22639388115/rewarded_web_example";
const publicEnv = {
  NEXT_PUBLIC_ALLOW_TEST_REWARDED_AD: process.env.NEXT_PUBLIC_ALLOW_TEST_REWARDED_AD,
  NEXT_PUBLIC_ASSERTIVE_YIELD_MANAGER_URL: process.env.NEXT_PUBLIC_ASSERTIVE_YIELD_MANAGER_URL,
  NEXT_PUBLIC_GAM_REWARDED_AD_UNIT: process.env.NEXT_PUBLIC_GAM_REWARDED_AD_UNIT,
  NEXT_PUBLIC_GOOGLE_TAG_ID: process.env.NEXT_PUBLIC_GOOGLE_TAG_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

function getPublicEnv(name: keyof typeof publicEnv, fallback: string) {
  return publicEnv[name] || fallback;
}

function getRewardedAdUnitPath() {
  return getPublicEnv("NEXT_PUBLIC_GAM_REWARDED_AD_UNIT", rewardedAdUnitPath);
}

export const siteConfig = {
  name: "The Rainbow Hub",
  description: "Fast, mobile-friendly IQ and academic-style quiz tests.",
  siteUrl: getPublicEnv("NEXT_PUBLIC_SITE_URL", "https://therainbowhub.com"),
  metaPixelId: getPublicEnv("NEXT_PUBLIC_META_PIXEL_ID", "843363384736830"),
  googleTagId: getPublicEnv("NEXT_PUBLIC_GOOGLE_TAG_ID", "AW-18146485081"),
  googleAdManagerRewardedAdUnitPath: getRewardedAdUnitPath(),
  assertiveYieldManagerUrl: getPublicEnv(
    "NEXT_PUBLIC_ASSERTIVE_YIELD_MANAGER_URL",
    "https://j24iGSTy4hDgBLfJR.ay.delivery/manager/j24iGSTy4hDgBLfJR",
  ),
};

export const companyLinks = [
  { href: "/info/about", label: "About" },
  { href: "/info/contact", label: "Contact" },
  { href: "/info/accessibility", label: "Accessibility" },
];

export const legalLinks = [
  { href: "/info/privacy-policy", label: "Privacy Policy" },
  { href: "/info/cookie-policy", label: "Cookie Policy" },
  { href: "/info/terms-of-use", label: "Terms of Use" },
  { href: "/info/disclaimer", label: "Disclaimer" },
];
