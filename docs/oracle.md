# OddSkies Oracle Alpha

The OddSkies Oracle is a playful report reader for public case files. It gives
a main field read, possible boring explanations, weird little clues, missing
pieces, source checks, and a maybe-weird verdict.

It does not verify reports, sightings, source authenticity, AI media, staged
posts, satire, jokes, UFOs, hauntings, portals, ghosts, aliens, invasions, or
timeline shifts.

## Current Alpha Flow

1. A visitor opens a public Field Log report.
2. The selected report shows an `Ask the Oracle` panel.
3. The browser sends only the public `report_id` to `/api/oracle/report`.
4. The server refetches public reports and checks for a cached Oracle reading.
5. If no cache exists, the server builds a sanitized case-file prompt.
6. The server calls OpenAI if `OPENAI_API_KEY` exists.
7. The response is validated against a strict JSON shape and screened for
   overconfident wording.
8. A safe reading is cached server-side for the same report, model, and prompt version.
9. If the key is missing, the model fails, or the response is unsafe, OddSkies
   returns a cautious fallback reading.

Cached readings are shown as latest cached reads. They should feel stable, not
like the Oracle invents a different story on every click.

## Environment

Required for live AI:

```bash
OPENAI_API_KEY="..."
```

Optional:

```bash
OPENAI_MODEL="gpt-4.1-mini"
SUPABASE_SERVICE_ROLE_KEY="..."
```

Never prefix the OpenAI key or service role key with `NEXT_PUBLIC_`. These keys
must stay server-side and must never be imported into client components.

`SUPABASE_SERVICE_ROLE_KEY` is used only to read/write the private
`oracle_readings` cache. If it is missing, the Oracle still works, but readings
are not cached.

## Output Shape

The Oracle returns:

- headline
- verdict
- maybe-weird score, used internally only
- main field note
- possible normal explanations
- weird clues
- missing context
- source check
- next step
- shareable summary
- Oracle note
- safety note

The public UI may show the numeric maybe-weird score only as a curiosity meter.
It must be labeled as not evidence and never presented as verification.

The main field note should be the “Oracle says” moment: complete, playful,
skeptical, and large enough to feel like the point of the feature. Supporting
cards stay compact.

The shareable summary is a copy-ready line for sending around, but it must still
say or imply that the report is unverified.

Every reading must preserve the OddSkies trust posture:

> Verified? No. Interesting? Maybe. Source-linked? Always.

## Not Built Yet

- No public free-text prompt box.
- No raw source Oracle reads.
- No public Oracle history.
- No user accounts or rate-limit dashboard.
- No claim that an Oracle response is verification.

Future versions can add admin review, user-facing rate limits, and a more
interactive Oracle room after the report pipeline is stable.
