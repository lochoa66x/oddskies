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

## Bluesky Collector Prototype

The V1.2 Bluesky collector is a manual, server-only script:

```bash
npm run collect:bluesky
```

Useful dry run:

```bash
npm run collect:bluesky -- --dry-run --query "ufo sighting" --limit 5
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

The collector uses Bluesky `app.bsky.feed.searchPosts`, normalizes public post views, guesses a rough category with keywords only, checks for existing staged sources, and inserts new rows into `public.raw_sources` with `status = 'new'`.

It does not:

- publish anything to `public.reports`
- verify claims
- run automatically
- expose collected posts in the public UI
- use AI classification

## Manual Promotion Helper

Step 1: collect or insert a raw source into `public.raw_sources`.

Step 2: review pending raw sources. Reject unsafe, duplicate, private,
low-context, joke-like, or synthetic-looking rows before anything reaches the
public map.

Step 3: dry-run a public report draft:

```bash
npm run promote:raw -- --id <raw_source_id> --dry-run
```

List recent staged rows:

```bash
npm run promote:raw -- --list
```

Step 4: publish only after review by adding `--confirm`:

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

Step 5: confirm the new row appears in `public.reports`. The public site can
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

Mark a row manually if you are working directly in SQL:

```sql
update public.raw_sources
set
  status = 'rejected',
  rejection_reason = 'unsafe or not useful',
  review_notes = concat_ws(E'\n', review_notes, 'Reviewed manually.')
where id = '<raw_source_id>';
```

## Source Promise

Counts are real. Conclusions are not.

OddSkies is here for curiosity, patterns, folklore, and weird little signals - not fear, harassment, or fake certainty.
