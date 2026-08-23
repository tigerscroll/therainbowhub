export function localizeInternalPath(
  locale: string,
  href: string,
  supportedLocales: readonly string[],
  defaultLocale: string,
) {
  const normalizedHref = href.startsWith("/") ? href : `/${href}`;
  const suffixIndex = normalizedHref.search(/[?#]/);
  const pathname = suffixIndex === -1 ? normalizedHref : normalizedHref.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : normalizedHref.slice(suffixIndex);
  const segments = pathname.split("/").filter(Boolean);

  // Language switching replaces an existing locale instead of nesting it.
  // Removing every leading locale also repairs previously malformed paths such
  // as /fr/it/cambridge without affecting a locale-looking segment later on.
  while (segments[0] && supportedLocales.includes(segments[0])) {
    segments.shift();
  }

  const localeFreePath = segments.length > 0 ? `/${segments.join("/")}` : "/";
  const localizedPath = locale === defaultLocale
    ? localeFreePath
    : `/${locale}${localeFreePath === "/" ? "" : localeFreePath}`;

  return `${localizedPath}${suffix}`;
}
