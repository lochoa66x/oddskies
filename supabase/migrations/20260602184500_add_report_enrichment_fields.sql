alter table public.reports
  add column if not exists display_title text,
  add column if not exists display_summary text,
  add column if not exists short_label text,
  add column if not exists mood_label text,
  add column if not exists source_quality_label text,
  add column if not exists source_quality_reasons text[] not null default '{}',
  add column if not exists has_source_link boolean not null default false,
  add column if not exists has_location boolean not null default false,
  add column if not exists has_time boolean not null default false,
  add column if not exists has_media_hint boolean not null default false,
  add column if not exists oracle_ready boolean not null default false,
  add column if not exists oracle_prompt_seed text,
  add column if not exists enrichment_notes text[] not null default '{}',
  add column if not exists last_enriched_at timestamp with time zone;

alter table public.reports
  alter column verification_status set default 'Unverified';

create index if not exists reports_short_label_idx
  on public.reports (short_label);

create index if not exists reports_oracle_ready_idx
  on public.reports (oracle_ready);

create index if not exists reports_last_enriched_at_idx
  on public.reports (last_enriched_at desc);

comment on column public.reports.display_title is
  'Clean public title for display. Presentation enrichment only; not verification.';
comment on column public.reports.display_summary is
  'Clean public summary for display. Presentation enrichment only; not verification.';
comment on column public.reports.short_label is
  'Compact atlas/map label for public display.';
comment on column public.reports.mood_label is
  'Playful OddSkies mood label. Does not imply confidence or verification.';
comment on column public.reports.source_quality_label is
  'Source context label for readers. Not a truth or authenticity score.';
comment on column public.reports.source_quality_reasons is
  'Short reasons behind source context label.';
comment on column public.reports.has_source_link is
  'Whether the public report has a source URL or source placeholder.';
comment on column public.reports.has_location is
  'Whether the public report includes usable public location context.';
comment on column public.reports.has_time is
  'Whether the public report includes usable event or reported time context.';
comment on column public.reports.has_media_hint is
  'Whether the public report or staged source mentioned media.';
comment on column public.reports.oracle_ready is
  'Whether the report has enough public context for a future playful Oracle reading.';
comment on column public.reports.oracle_prompt_seed is
  'Safe deterministic prompt seed for future Oracle previews. Not an AI response.';
comment on column public.reports.enrichment_notes is
  'Internal notes from deterministic enrichment. Not public verification.';
comment on column public.reports.last_enriched_at is
  'Timestamp for the last deterministic report enrichment pass.';
