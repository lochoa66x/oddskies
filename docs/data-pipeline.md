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
5. Reject unsafe, junk, private, sensitive, harassing, doxxing, exact personal-location, duplicate, joke-like, AI-generated, or low-context items.
6. Dry-run promotion and inspect the public report draft.
7. Promote only good candidates.
8. Confirm the promoted item appears in `public.reports`.
9. The public site displays it as unverified report data.

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

## Source Promise

Counts are real. Conclusions are not.

OddSkies is here for curiosity, patterns, folklore, and weird little signals - not fear, harassment, or fake certainty.
