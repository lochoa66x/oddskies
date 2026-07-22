import type { MetadataRoute } from "next";

const siteUrl = "https://oddskies.com";

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteUrl,
    rules: {
      allow: [
        "/",
        "/categories",
        "/categories/",
        "/categories/*",
        "/es",
        "/es/",
        "/es/*",
        "/field-log",
        "/field-log/",
        "/field-log/*",
        "/regions",
        "/regions/",
        "/regions/*",
        "/signal-shelf",
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
