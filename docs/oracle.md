# OddSkies Oracle Alpha

The OddSkies Oracle is a playful report reader for public case files. It gives
possible normal explanations, weird clues, missing context, and a maybe-weird
verdict.

It does not verify reports, sightings, source authenticity, AI media, staged
posts, satire, jokes, UFOs, hauntings, portals, ghosts, aliens, invasions, or
timeline shifts.

## Current Alpha Flow

1. A visitor opens a public Field Log report.
2. The selected report shows an `Ask the Oracle` panel.
3. The browser sends only the public `report_id` to `/api/oracle/report`.
4. The server refetches public reports and builds a sanitized case-file prompt.
5. The server calls OpenAI if `OPENAI_API_KEY` exists.
6. The response is validated against a strict JSON shape and screened for
   overconfident wording.
7. If the key is missing, the model fails, or the response is unsafe, OddSkies
   returns a cautious fallback reading.

## Environment

Required for live AI:

```bash
OPENAI_API_KEY="..."
```

Optional:

```bash
OPENAI_MODEL="gpt-4.1-mini"
```

Never prefix the OpenAI key with `NEXT_PUBLIC_`. The key must stay server-side
and must never be imported into client components.

## Output Shape

The Oracle returns:

- headline
- verdict
- maybe-weird score
- possible normal explanations
- weird clues
- missing context
- field note
- next step
- safety note

Every reading must preserve the OddSkies trust posture:

> Verified? No. Interesting? Maybe. Source-linked? Always.

## Not Built Yet

- No public free-text prompt box.
- No raw source Oracle reads.
- No saved Oracle history.
- No database cache for readings.
- No user accounts or rate-limit dashboard.
- No claim that an Oracle response is verification.

Future versions can add caching, admin review, and a more interactive Oracle
room after the report pipeline is stable.
