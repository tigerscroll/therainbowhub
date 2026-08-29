import { GlobalNotFound } from "@/components/GlobalNotFound";
import { RootDocument } from "@/components/RootDocument";
import { getDefaultLocale, getLocaleDirection } from "@/lib/i18n";
import "./globals.css";

export default function GlobalNotFoundDocument() {
  const locale = getDefaultLocale();
  return (
    <RootDocument
      direction={getLocaleDirection(locale)}
      head={(
        <>
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <meta content="noindex" name="robots" />
          <title>Page not found - The Rainbow Hub</title>
        </>
      )}
      locale={locale}
    >
      <GlobalNotFound />
    </RootDocument>
  );
}
