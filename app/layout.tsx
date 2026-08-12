import { RootDocument } from "@/components/RootDocument";
import { getDefaultLocale, getLocaleDirection } from "@/lib/i18n";
import { rootMetadata } from "@/lib/rootMetadata";
import "./globals.css";

export const metadata = rootMetadata;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = getDefaultLocale();
  return <RootDocument direction={getLocaleDirection(locale)} locale={locale}>{children}</RootDocument>;
}
