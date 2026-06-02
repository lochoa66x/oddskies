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

## Review Helper SQL

```sql
select
  platform,
  search_query,
  category_guess,
  status,
  posted_at,
  author_handle,
  left(raw_text, 160) as preview,
  source_url
from public.raw_sources
order by collected_at desc
limit 50;
```

## Source Promise

Counts are real. Conclusions are not.

OddSkies is here for curiosity, patterns, folklore, and weird little signals - not fear, harassment, or fake certainty.
