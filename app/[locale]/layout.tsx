import { RootDocument } from "@/components/RootDocument";
import {
  getDefaultLocale,
  getLocaleDirection,
  isSupportedLocale,
  type SupportedLocale,
} from "@/lib/i18n";
import { rootMetadata } from "@/lib/rootMetadata";
import "../globals.css";

export const metadata = rootMetadata;

type LocaleRootLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export default async function LocaleRootLayout({ children, params }: LocaleRootLayoutProps) {
  const { locale: segment } = await params;
  const locale: SupportedLocale = isSupportedLocale(segment) ? segment : getDefaultLocale();

  return <RootDocument direction={getLocaleDirection(locale)} locale={locale}>{children}</RootDocument>;
}
