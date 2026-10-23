
import type { MetadataRoute } from "next";

const siteUrl = (
  process.env.SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
