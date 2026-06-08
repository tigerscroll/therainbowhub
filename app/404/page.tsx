import type { Metadata } from "next";

import { NotFoundContent } from "@/app/not-found";

export const metadata: Metadata = {
  title: {
    absolute: "Page not found",
  },
};

export default function NotFoundPreviewPage() {
  return <NotFoundContent />;
}
