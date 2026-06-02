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

## Table Roles

`public.raw_sources`

Internal staging for future collectors or manual capture. This table can contain raw text, source hints, possible duplicate material, or items that should never appear publicly.

`public.reports`

Public, approved report records used by the OddSkies homepage, atlas, field log, and weirdness signals. These records are still unverified by default.

## Source Promise

Counts are real. Conclusions are not.

OddSkies is here for curiosity, patterns, folklore, and weird little signals - not fear, harassment, or fake certainty.
