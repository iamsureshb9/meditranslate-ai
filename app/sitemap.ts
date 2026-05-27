import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

const routes = ["", "/upload", "/results?demo=cbc", "/results?demo=vitamin-d", "/results?demo=cholesterol"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    changeFrequency: route === "" ? "weekly" : "monthly",
    lastModified: new Date(),
    priority: route === "" ? 1 : 0.7,
    url: `${siteConfig.url}${route}`
  }));
}
