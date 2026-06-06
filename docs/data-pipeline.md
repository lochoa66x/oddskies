# OddSkies Data Pipeline

OddSkies treats strange public reports as source-linked artifacts, not confirmed truth.

## Future Flow

```text
Public source or collector
-> raw_sources
-> review, filter, and enrich
-> approved public.reports
-> homepage, atlas, and field log
```

## Rules

- Raw sources are evidence trails, not public reports.
- Never auto-publish `raw_sources`.
- Keep public reports unverified by default.
- Preserve `source_url` whenever a public source trail exists.
- Do not publish private messages, private accounts, leaked material, private addresses, or sensitive personal information.
- AI can summarize, classify, and suggest possible context later, but it cannot verify a report.
- Reviewed items can become rows in `public.reports`; rejected or low-context items should stay internal or be discarded.
- The Bluesky collector prototype stores posts in `raw_sources` only.
- `raw_sources` should never be displayed on the public homepage.

## Table Roles

`public.raw_sources`

Internal staging for future collectors or manual capture. This table can contain raw text, source hints, possible duplicate material, or items that should never appear publicly.

`public.reports`

Public, approved report records used by the OddSkies homepage, atlas, field log, and weirdness signals. These records are still unverified by default.

## Public Signal Intake

The public `/send-signal` page lets visitors submit a source link for human
review. It is a relationship and discovery intake, not a publishing workflow.

```text
/send-signal
-> /api/send-signal
-> public.raw_sources
-> curation scoring / location review
-> human review
-> maybe public.reports
```

Public signal rules:

- `source_url` is required.
- The source must be a public `http` or `https` URL.
- Local, internal, private-message, account-settings, and private-looking URLs
  are rejected server-side.
- Submitters must confirm that the source is public and does not include private
  messages, private accounts, exact private addresses, personal information,
  harassment, or unsafe material.
- Optional context such as category, location, event time, and contact email is
  stored only as internal review context.
- Event time and location hints are stored for review and can feed later scoring
  or normalization, but they are not treated as confirmed facts.
- Contact email is optional, internal-only, and must never be copied into
  `public.reports`.
- Nothing from this flow auto-publishes.
- The current public form uses a honeypot and server validation. Turnstile,
  request throttling, screenshots, OCR, notifications, and submission status
  tracking are future work.

Rows are inserted into `public.raw_sources` with:

```text
platform = user_submission
search_query = user_submission
status = new or needs_review
```

The API route uses `SUPABASE_SERVICE_ROLE_KEY` only on the server. The key must
never be imported into client components or exposed to the browser.

User-submitted signals can become public only after manual review and promotion.
Public reports remain unverified even after promotion.

## Bluesky Collector Prototype

The Bluesky collector is a manual, server-only staging tool. It can run from
the command line or from the protected admin review UI. Both paths use the same
collector core and insert only into `public.raw_sources`.

```bash
npm run collect:bluesky
```

Useful dry run:

```bash
npm run collect:bluesky -- --dry-run --query "ufo sighting" --limit 5
```

Small live staging pull:

```bash
npm run collect:bluesky -- --query "strange lights" --limit 3
```

Required for inserts:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Optional Bluesky auth:

```text
BLUESKY_IDENTIFIER
BLUESKY_APP_PASSWORD
BLUESKY_SERVICE_URL=https://bsky.social
BLUESKY_PUBLIC_API_URL=https://public.api.bsky.app
```

The collector uses Bluesky `app.bsky.feed.searchPosts`, normalizes public post
views, guesses a rough category with keywords only, checks for existing staged
sources, and inserts new rows into `public.raw_sources` with `status = 'new'`.
It tries public AppView search first and can fall back to Bluesky app-password
auth when credentials are configured.

It does not:

- publish anything to `public.reports`
- verify claims
- run automatically
- expose collected posts in the public UI
- use AI classification

## Admin Collector Test

The protected review UI includes a small Bluesky collector test:

```text
/admin/raw-sources
```

Use it when you want to pull a tiny batch into the staging queue without
leaving the review page.

Recommended flow:

1. Keep "Dry run first" enabled.
2. Enter one search query.
3. Keep the limit small, usually 3 to 5.
4. Review the fetched and normalized counts.
5. Turn dry-run off only when you intentionally want new rows in
   `public.raw_sources`.
6. Review each staged row before promotion.

Admin collector safety:

- The browser calls a protected admin API route.
- The service role key is read only on the server.
- The API route writes only to `public.raw_sources`.
- Nothing is inserted into `public.reports`.
- Nothing is shown publicly until manual review and promotion.

## Curation Scoring

V1.6 adds deterministic curation hints for `public.raw_sources`.

Principle:

```text
Curation score is not truth. It is only a review helper.
```

The scorer looks for simple signals such as:

- source URL captured
- enough raw text to review
- location-like hints
- time/date phrases
- media hints
- category guess
- possible duplicate source URL or post id
- possible joke/meme language
- possible AI-generated or edited media language
- private-looking address, contact, or sensitive location details

It does not:

- verify reports
- decide whether a report is true
- publish anything
- change review status
- geocode locations
- use AI
- write to `public.reports`

Run a preview:

```bash
npm run score:raw
npm run score:raw -- --limit 20 --dry-run
npm run score:raw -- --status new
npm run score:raw -- --id <raw_source_id>
```

Write scoring fields only after review:

```bash
npm run score:raw -- --limit 20 --confirm
npm run score:raw -- --id <raw_source_id> --confirm
```

The protected admin review UI can also refresh the score for a selected raw
source. That action updates only curation fields on `public.raw_sources`.

Private/sensitive location flags should be treated seriously. If a raw source
contains an exact private-looking address, contact detail, apartment/unit, or
targeting language, keep it out of public reports unless the sensitive detail
has been removed and reviewed.

Schema fields added by V1.6:

```text
curation_score
curation_label
curation_reasons
has_location_hint
has_time_hint
has_media_hint
possible_private_location
possible_joke
possible_ai_generated
possible_duplicate
extracted_location_text
extracted_region_guess
extracted_country_guess
extracted_event_datetime_text
normalized_title
normalized_summary
last_scored_at
```

## Location Normalization

V1.7 adds deterministic, dictionary-based location normalization for internal
review. This is a safe prep step for mapping; it does not call an external
geocoder, does not use AI, and does not verify reports.

Principle:

```text
Locations are approximate review hints, not confirmed places.
```

The normalizer can fill:

```text
normalized_location_name
normalized_region
normalized_country
normalized_latitude
normalized_longitude
location_confidence
location_resolution
location_warnings
last_location_normalized_at
```

Run a preview:

```bash
npm run normalize:locations
npm run normalize:locations -- --limit 20 --dry-run
npm run normalize:locations -- --status new
npm run normalize:locations -- --id <raw_source_id>
```

Write location fields only after review:

```bash
npm run normalize:locations -- --limit 20 --confirm
npm run normalize:locations -- --id <raw_source_id> --confirm
```

The protected admin review UI can also normalize the selected raw source. That
action updates only location fields on `public.raw_sources`.

Safety notes:

- No status changes happen during location normalization.
- Nothing is inserted into `public.reports`.
- Coordinates are approximate city, region, or public-landmark level.
- Private-looking addresses, contact details, apartment/unit details, or
  sensitive personal-location phrases are flagged as `private_or_sensitive`.
- Rows with private/sensitive location warnings are blocked from promotion by
  default.

Useful SQL after normalization:

```sql
select
  id,
  status,
  raw_title,
  normalized_location_name,
  normalized_region,
  normalized_country,
  location_confidence,
  location_resolution,
  location_warnings
from public.raw_sources
order by last_location_normalized_at desc nulls last
limit 50;
```

## Public Report Enrichment

V1.8 adds deterministic enrichment fields on `public.reports`. These fields
make approved reports easier to read and map without changing the original
source trail.

Principle:

```text
Report enrichment is presentation polish, not verification.
```

The enrichment helper can fill:

```text
display_title
display_summary
short_label
mood_label
source_quality_label
source_quality_reasons
has_source_link
has_location
has_time
has_media_hint
oracle_ready
oracle_prompt_seed
enrichment_notes
last_enriched_at
```

Run a preview:

```bash
npm run enrich:reports
npm run enrich:reports -- --limit 20 --dry-run
npm run enrich:reports -- --id <report_id>
```

Write enrichment fields only after review:

```bash
npm run enrich:reports -- --limit 20 --confirm
npm run enrich:reports -- --id <report_id> --confirm
```

What enrichment does:

- cleans long public titles into `display_title`
- creates compact atlas labels like `Anoka UFO` or `Montreal Orb`
- adds a playful mood label
- labels source context as `Context-rich`, `Linked trail`, `Source-light`,
  `Needs more context`, or `Demo seed`
- prepares a safe `oracle_prompt_seed` only when enough public context exists

What enrichment does not do:

- verify sightings
- decide whether a report is true
- read `public.raw_sources`
- publish raw sources
- use AI
- expose the service role key

## Public Report Lifecycle

Public reports can stay in `public.reports` without always appearing in the
homepage Field Log. This is display control only, not verification.

Public display surfaces:

```text
homepage -> curated preview
/field-log -> full approved public archive
/field-log/[slug-or-id] -> public case file for one approved report
```

Report pages improve browsing and SEO, but they do not imply verification.
They read from `public.reports` only. `public.raw_sources` remains internal
staging and must never appear on public case-file pages.

Lifecycle fields:

```text
public_status: published, featured, archived, hidden
is_featured
display_priority
slug text unique -- optional, for permanent readable case-file URLs
archived_at
hidden_at
```

Rules:

- `published` reports can appear normally.
- `featured` reports remain eligible for public surfaces, but the homepage
  Field Log still favors latest approved reports over subjective strength.
- `archived` reports stay in the database for history but leave the homepage.
- `hidden` reports are kept out of public display.
- `display_priority` only changes ordering; it does not imply truth or quality.

Useful SQL:

```sql
-- Feature a reviewed public report without claiming it is verified.
update public.reports
set
  public_status = 'featured',
  is_featured = true,
  display_priority = 25
where id = '<report_id>';

-- Move an older report out of the homepage preview.
update public.reports
set
  public_status = 'archived',
  archived_at = now()
where id = '<report_id>';

-- Hide a public report that should not display.
update public.reports
set
  public_status = 'hidden',
  hidden_at = now()
where id = '<report_id>';

-- Return a report to normal public display.
update public.reports
set
  public_status = 'published',
  is_featured = false,
  display_priority = 0,
  archived_at = null,
  hidden_at = null
where id = '<report_id>';
```

## Manual Promotion Helper

Step 1: collect or insert a raw source into `public.raw_sources`.

Step 2: review pending raw sources. Reject unsafe, duplicate, private,
low-context, joke-like, or synthetic-looking rows before anything reaches the
public map.

Step 3: refresh curation score and normalize location when useful.

Step 4: dry-run a public report draft:

```bash
npm run promote:raw -- --id <raw_source_id> --dry-run
```

List recent staged rows:

```bash
npm run promote:raw -- --list
```

Step 5: publish only after review by adding `--confirm`:

```bash
npm run promote:raw -- --id <raw_source_id> --confirm
```

Useful overrides:

```bash
npm run promote:raw -- --id <raw_source_id> \
  --title "Short public title" \
  --summary "Reviewed public summary" \
  --category "Strange Lights" \
  --location "Montreal, Quebec" \
  --region "Quebec" \
  --country "Canada" \
  --confidence "Suspiciously Interesting"
```

The helper defaults to preview mode. It creates a `public.reports` row only
with `--confirm`, then marks the staged `raw_sources` row as `approved` and
stores the new report id in `approved_report_id`.

Promotion now runs the deterministic public report enrichment helper before
insert, so new public rows receive display title, display summary, source
quality, atlas label, mood label, and Oracle-readiness fields immediately.
Those fields are still presentation hints only.

Step 6: confirm the new row appears in `public.reports`. The public site can
display it as unverified, source-linked report data.

Promotion requires server-only credentials:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Do not use the service role key in frontend code, client components, or public
browser routes.

## Manual Review Helper

Use `review:raw` to mark raw staged material without publishing anything:

```bash
npm run review:raw -- <raw_source_id> rejected "unsafe or not useful"
npm run review:raw -- <raw_source_id> duplicate "already staged"
npm run review:raw -- <raw_source_id> low_context "not enough detail"
npm run review:raw -- <raw_source_id> private_or_sensitive "contains personal info"
npm run review:raw -- <raw_source_id> possible_joke "satire or joke context"
npm run review:raw -- <raw_source_id> possible_ai_generated "synthetic-looking media"
npm run review:raw -- <raw_source_id> needs_review
```

Preview a review update first:

```bash
npm run review:raw -- <raw_source_id> rejected "unsafe or not useful" --dry-run
```

The helper updates only `public.raw_sources`. It refuses to change already
approved rows.

## Internal Review UI

V1.4 adds a protected internal review page:

```text
/admin/raw-sources
```

Manual review flow:

1. Run a collector or insert a raw source.
2. Open `/admin/raw-sources`.
3. Filter pending sources.
4. Review source text, URL, metadata, notes, and reason fields.
5. Refresh curation score and normalize approximate location when useful.
6. Reject unsafe, junk, private, sensitive, harassing, doxxing, exact personal-location, duplicate, joke-like, AI-generated, or low-context items.
7. Dry-run promotion and inspect the public report draft.
8. Promote only good candidates.
9. Confirm the promoted item appears in `public.reports`.
10. The public site displays it as unverified report data.

Protection model:

- `ODDSKIES_ADMIN_TOKEN` unlocks the admin page.
- The token is checked by the server, then stored as an HttpOnly admin session cookie.
- Admin API routes verify the session cookie before listing, updating, dry-running, or promoting raw sources.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in server-side code.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or prefix it with `NEXT_PUBLIC`.

The review UI never adds `raw_sources` to the homepage or any public route.

## Review Helper SQL

View newest raw sources:

```sql
select
  platform,
  search_query,
  category_guess,
  status,
  posted_at,
  author_handle,
  left(raw_text, 180) as preview,
  source_url
from public.raw_sources
order by collected_at desc
limit 50;
```

View recent Bluesky collector rows:

```sql
select
  id,
  platform,
  search_query,
  category_guess,
  status,
  posted_at,
  author_handle,
  left(raw_text, 180) as preview,
  source_url
from public.raw_sources
where platform = 'bluesky'
order by collected_at desc
limit 50;
```

View pending review:

```sql
select
  id,
  platform,
  category_guess,
  posted_at,
  author_handle,
  left(raw_text, 220) as preview,
  source_url
from public.raw_sources
where status in ('new', 'needs_review')
order by collected_at desc;
```

View approved raw sources:

```sql
select
  id,
  platform,
  approved_report_id,
  source_url,
  collected_at
from public.raw_sources
where status = 'approved'
order by collected_at desc;
```

Find possible duplicates:

```sql
select
  source_url,
  count(*)
from public.raw_sources
where source_url is not null
group by source_url
having count(*) > 1;
```

View rejected or filtered rows:

```sql
select
  id,
  platform,
  status,
  rejection_reason,
  left(raw_text, 200) as preview
from public.raw_sources
where status in (
  'rejected',
  'duplicate',
  'low_context',
  'private_or_sensitive',
  'possible_joke',
  'possible_ai_generated'
)
order by collected_at desc
limit 50;
```

Mark a row manually if you are working directly in SQL:

```sql
update public.raw_sources
set
  status = 'rejected',
  rejection_reason = 'unsafe or not useful',
  review_notes = concat_ws(E'\n', review_notes, 'Reviewed manually.')
where id = '<raw_source_id>';
```

## Controlled Recurring Collector

V1.9 adds a small controlled collector layer for recurring Bluesky searches.

The rule stays simple:

```text
collector -> raw_sources -> scoring/location hints -> admin review -> manual promotion -> public reports
```

Recurring collection writes only to `public.raw_sources`. It never writes
directly to `public.reports`, never displays raw sources publicly, and never
verifies whether a post is true.

### Collector Run Log

Every server-side admin or scheduled collector run writes an internal row to
`public.collector_runs` when the V1.9 migration has been applied.

The table tracks:

- collector name and platform
- run mode: `manual`, `admin`, or `scheduled`
- status: `started`, `completed`, `completed_with_errors`, or `failed`
- query/fetch/insert/duplicate/error counts
- dry-run mode
- per-query summary JSON

`collector_runs` has RLS enabled and no public read policy. Treat it as an
internal operations log, not public product data.

Recent collector runs:

```sql
select
  collector_name,
  platform,
  mode,
  status,
  started_at,
  finished_at,
  fetched_count,
  inserted_count,
  duplicate_count,
  error_count
from public.collector_runs
order by started_at desc
limit 20;
```

Recent Bluesky raw sources:

```sql
select
  id,
  platform,
  search_query,
  category_guess,
  status,
  curation_score,
  curation_label,
  normalized_location_name,
  posted_at,
  author_handle,
  left(raw_text, 180) as preview,
  source_url
from public.raw_sources
where platform = 'bluesky'
order by collected_at desc
limit 50;
```

### Safety Limits

Collector defaults are intentionally small:

- max 10 results per query
- max 10 queries per run
- max 100 fetched posts per run
- duplicate `source_post_id` or `source_url` rows are skipped
- replies are skipped for now
- empty text posts are skipped

Environment variables:

```text
ODDSKIES_COLLECTOR_ENABLED=false
ODDSKIES_COLLECTOR_MAX_RESULTS_PER_QUERY=10
ODDSKIES_COLLECTOR_MAX_QUERIES=10
ODDSKIES_COLLECTOR_MAX_FETCHED_PER_RUN=100
ODDSKIES_CRON_SECRET=<server-only secret>
```

`ODDSKIES_COLLECTOR_ENABLED` only gates scheduled cron collection. Manual admin
and command-line tests can still run when explicitly invoked.

### Manual Commands

Dry-run a small collector pass:

```bash
npm run collect:bluesky -- --limit 3 --dry-run
```

Run one explicit query:

```bash
npm run collect:bluesky -- --limit 3 --query "strange lights"
```

Run one explicit query inside a date window:

```bash
npm run collect:bluesky -- --limit 5 --query "strange lights" --since 2026-06-01 --until 2026-06-03
```

`--since` and `--until` accept `YYYY-MM-DD` or ISO date strings. Date-only
values are expanded to the start/end of that UTC day before being sent to
Bluesky search. The date window narrows collection by post/search time; it does
not verify event timing, and it does not promote anything.

The admin page also has a compact Bluesky collector test panel:

```text
/admin/raw-sources
```

The admin collector panel includes optional `From date` and `To date` fields.
Use them for one-off manual pulls such as “only posts from this week.” Leave
them blank for the normal small recent pull.

Admin-triggered non-dry-runs insert only into `raw_sources`, then attempt to run
curation scoring and approximate location normalization on newly inserted rows.
Helper failures are logged as warnings/errors; nothing is promoted.

Date-window collection keeps the same safety model:

- all matching posts are staged in `public.raw_sources`
- duplicate `source_post_id` or `source_url` rows are skipped
- public reports are created only through manual review and promotion
- the original source timestamp remains `posted_at`
- any inferred event time remains a review hint, not verification

### Cron Route

Scheduled route:

```text
GET /api/cron/collect/bluesky
```

Requirements:

- `ODDSKIES_COLLECTOR_ENABLED=true`
- `ODDSKIES_CRON_SECRET` configured
- either `Authorization: Bearer <ODDSKIES_CRON_SECRET>` or `?secret=<ODDSKIES_CRON_SECRET>`

Example:

```bash
curl -H "Authorization: Bearer $ODDSKIES_CRON_SECRET" \
  https://oddskies.com/api/cron/collect/bluesky
```

Local dry-run test:

```bash
curl "http://localhost:3000/api/cron/collect/bluesky?dryRun=true&secret=$ODDSKIES_CRON_SECRET"
```

Local date-window dry-run test:

```bash
curl "http://localhost:3000/api/cron/collect/bluesky?dryRun=true&since=2026-06-01&until=2026-06-03&secret=$ODDSKIES_CRON_SECRET"
```

Recommended early cadence: daily. Configure the Vercel cron schedule manually
after confirming the route works and the run log looks clean.

### Production Enablement Checklist

Keep scheduled collection off until the manual/admin path looks boring and
predictable.

Before enabling the Vercel schedule:

- confirm `SUPABASE_SERVICE_ROLE_KEY` is configured only as a server-side secret
- confirm `BLUESKY_IDENTIFIER` and `BLUESKY_APP_PASSWORD` are configured only as server-side secrets
- set `ODDSKIES_CRON_SECRET` to a long server-only secret
- leave `ODDSKIES_COLLECTOR_ENABLED=false` until ready for scheduled runs
- run the admin collector in dry-run mode and confirm `collector_runs` logs it
- run one staged admin pull with a small limit and confirm rows land only in `raw_sources`
- review the staging queue before promoting anything

When ready, set:

```text
ODDSKIES_COLLECTOR_ENABLED=true
```

Then test the production cron route with a dry run first:

```bash
curl -H "Authorization: Bearer $ODDSKIES_CRON_SECRET" \
  "https://oddskies.com/api/cron/collect/bluesky?dryRun=true"
```

If that looks clean, configure a daily Vercel cron schedule for the same route.
Do not schedule aggressive intervals while the review workflow is still manual.

Raw sources are evidence trails, not public reports.

## Source Promise

Counts are real. Conclusions are not.

OddSkies is here for curiosity, patterns, folklore, and weird little signals - not fear, harassment, or fake certainty.
