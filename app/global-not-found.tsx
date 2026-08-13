import { GlobalNotFound } from "@/components/GlobalNotFound";
import "./globals.css";

export default function GlobalNotFoundDocument() {
  return (
    <html dir="ltr" lang="en">
      <head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="noindex" name="robots" />
        <title>Page not found - The Rainbow Hub</title>
      </head>
      <body>
        <GlobalNotFound />
      </body>
    </html>
  );
}
