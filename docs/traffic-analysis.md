# OddSkies Traffic Analysis

OddSkies tracks product behavior without tracking personal identities, raw source URLs, report bodies, email addresses, or raw submission text. Traffic data is a curiosity and usability signal, not report confirmation.

## Dashboards

- Vercel Web Analytics: review route-level visits, top pages, referrers, countries, and custom events after deployment.
- Vercel Speed Insights: review real-user Core Web Vitals and page performance after deployment.
- Google Search Console: submit `https://oddskies.com/sitemap.xml`, inspect indexing, watch queries, impressions, clicks, and CTR.

## Weekly Review

- Which routes bring visitors in: `/`, `/field-log`, `/es`, category pages, region pages, or report case pages.
- Which filters get used: category and region only.
- Which reports get opened from the homepage versus the full field log.
- How often users ask the Oracle after opening a report.
- How often users click the original source.
- How often visitors start and complete a signal submission.
- Which Search Console queries get impressions but low CTR.

## Privacy Boundaries

- Do not send personal names, emails, IP addresses, exact raw source URLs, report bodies, Oracle responses, screenshots, or submission text to analytics.
- Keep event properties bounded to category, region, source type, locale, mode, mood label, and generic failure reason.
- Do not interpret visits, source clicks, or Oracle reads as verification of any report.

## Launch Checklist

- Confirm Vercel Web Analytics is enabled for the production project.
- Confirm Vercel Speed Insights is enabled for the production project.
- Deploy the app with analytics components mounted in `app/layout.tsx`.
- Submit `https://oddskies.com/sitemap.xml` in Search Console.
- Inspect `/`, `/field-log`, `/es`, `/es/field-log`, and several report case URLs.
- Review data after at least several real visits; dashboards will not be meaningful immediately after deploy.
