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
- `/field-log/[id]` gives each public case file a shareable URL.
- Case files expose report timing, source quality notes, and location confidence
  when available while keeping the report clearly unverified.
- Raw sources stay private and must not be exposed publicly.
- Homepage Field Log preview uses local display classification to prefer strong
  field reports and keep culture/link-style items out of the top preview unless
  intentionally featured.

## Future Improvements

- URL-synced filters for every Field Log control.
- Richer Monthly Sweeps with short summaries.
- Optional database-backed `display_type` values for Field Report, Culture Note,
  and Signal Shelf. Today this separation is handled by helper logic only.
- Better public/private/RLS verification checks.
- No public `raw_sources` exposure.
