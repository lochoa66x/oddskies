# OddSkies Field Log

The homepage is a curated preview. The Full Field Log is where older public
reports stay browsable without crowding the atlas.

## Current Shape

- `/field-log` lists public, displayable reports as unverified field notes.
- Monthly Sweeps group older reports by event month.
- Search, category, region, source type, source quality, location confidence,
  and date filters help keep the room navigable.
- Sort controls support newest, oldest, source-rich, and maybe-weird archive
  reads.
- `/field-log/[slug-or-id]` gives each public case file a shareable URL.
- Case-file links prefer a stored `slug` when one exists. Without a stored
  slug, OddSkies generates a readable fallback from the short label/title plus
  an id fragment, while old id-based links still resolve.
- Case files expose report timing, source quality notes, and location confidence
  when available while keeping the report clearly unverified.
- Report pages improve browsing and SEO, but they do not imply verification.
- Raw sources stay private and must not be exposed publicly.
- Homepage Field Log preview shows the latest approved non-demo field reports.
  Culture/link-style items stay out of the top preview unless intentionally
  featured.
- Signal Shelf (`/signal-shelf`) is a separate curated-link shelf for source
  context and OddSkies navigation. It is not a report archive and does not imply
  verification.
- Raw sources that are useful links but not reports can be converted to Signal
  Shelf instead of promoted into the Field Log.

## Future Improvements

- URL-synced filters for every Field Log control.
- Richer Monthly Sweeps with short summaries.
- Optional `public.reports.slug text unique` migration for fully stored public
  slugs instead of generated fallbacks.
- Optional database-backed `display_type` values for Field Report and Culture
  Note. Signal Shelf now has a separate `public.curated_links` table and route.
- Better public/private/RLS verification checks.
- No public `raw_sources` exposure.
