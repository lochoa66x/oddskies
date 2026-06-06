import type { MetadataRoute } from "next";

const siteUrl = "https://oddskies.com";

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteUrl,
    rules: {
      allow: [
        "/",
        "/field-log",
        "/field-log/",
        "/field-log/*",
        "/source-guidelines",
        "/about",
        "/send-signal",
      ],
      disallow: [
        "/admin",
        "/admin/",
        "/api/admin",
        "/api/admin/",
        "/api/cron",
        "/api/cron/",
      ],
      userAgent: "*",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
