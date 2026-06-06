import type { MetadataRoute } from "next";
import {
  categoryDefinitions,
  getReportsForCategory,
  getReportsForRegion,
  regionDefinitions,
} from "@/lib/report-taxonomy";
import { getFieldLogReports, getReportCasePath, getReports } from "@/lib/reports";

const siteUrl = "https://oddskies.com";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reports = getFieldLogReports(await getReports());
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      changeFrequency: "daily",
      priority: 1,
      url: getAbsoluteUrl("/"),
    },
    {
      changeFrequency: "daily",
      priority: 0.8,
      url: getAbsoluteUrl("/field-log"),
    },
    {
      changeFrequency: "weekly",
      priority: 0.65,
      url: getAbsoluteUrl("/signal-shelf"),
    },
    {
      changeFrequency: "weekly",
      priority: 0.7,
      url: getAbsoluteUrl("/categories"),
    },
    {
      changeFrequency: "weekly",
      priority: 0.7,
      url: getAbsoluteUrl("/regions"),
    },
    {
      changeFrequency: "monthly",
      priority: 0.5,
      url: getAbsoluteUrl("/source-guidelines"),
    },
    {
      changeFrequency: "monthly",
      priority: 0.5,
      url: getAbsoluteUrl("/about"),
    },
    {
      changeFrequency: "monthly",
      priority: 0.5,
      url: getAbsoluteUrl("/send-signal"),
    },
  ];

  const reportRoutes = reports.map((report) => ({
    changeFrequency: "weekly" as const,
    lastModified:
      getSitemapDate(report.createdAtRaw) ??
      getSitemapDate(report.eventDateTimeRaw),
    priority: 0.6,
    url: getAbsoluteUrl(getReportCasePath(report)),
  }));
  const categoryRoutes = categoryDefinitions
    .filter((category) => getReportsForCategory(reports, category).length > 0)
    .map((category) => ({
      changeFrequency: "weekly" as const,
      priority: 0.55,
      url: getAbsoluteUrl(`/categories/${category.slug}`),
    }));
  const regionRoutes = regionDefinitions
    .filter((region) => getReportsForRegion(reports, region).length > 0)
    .map((region) => ({
      changeFrequency: "weekly" as const,
      priority: 0.55,
      url: getAbsoluteUrl(`/regions/${region.slug}`),
    }));

  return dedupeSitemapRoutes([
    ...staticRoutes,
    ...categoryRoutes,
    ...regionRoutes,
    ...reportRoutes,
  ]);
}

function getAbsoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function getSitemapDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime()) ? date : undefined;
}

function dedupeSitemapRoutes(routes: MetadataRoute.Sitemap) {
  const seen = new Set<string>();

  return routes.filter((route) => {
    if (seen.has(route.url)) {
      return false;
    }

    seen.add(route.url);
    return true;
  });
}
