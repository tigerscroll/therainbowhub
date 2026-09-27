"use client";

import { useEffect, useId, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { mountArticleDisplayAd } from "./articleAds";

export function ArticleDisplayAd() {
  const id = `article-display-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [empty, setEmpty] = useState(false);
  useEffect(() => mountArticleDisplayAd(id, siteConfig.articleDisplayAdUnitPath, () => setEmpty(true)), [id]);
  return (
    <aside aria-label="Advertisement" className="article-display" hidden={empty}>
      <div className="article-display__slot" id={id} />
    </aside>
  );
}
