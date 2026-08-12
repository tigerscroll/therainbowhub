import { RootDocument } from "@/components/RootDocument";
import { getDefaultLocale, getLocaleDirection, isSupportedLocale } from "@/lib/i18n";
import { rootMetadata } from "@/lib/rootMetadata";
import "../../globals.css";

export const metadata = rootMetadata;

export default async function LocaleRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: segment } = await params;
  const locale = isSupportedLocale(segment) ? segment : getDefaultLocale();

  return <RootDocument direction={getLocaleDirection(locale)} locale={locale}>{children}</RootDocument>;
}
