-- OddSkies V1.6 raw source curation hints.
--
-- These fields are internal review helpers only. They do not verify reports,
-- and they must not be exposed on the public site.

alter table public.raw_sources
  add column if not exists curation_score integer not null default 0,
  add column if not exists curation_label text,
  add column if not exists curation_reasons text[] not null default '{}',
  add column if not exists has_location_hint boolean not null default false,
  add column if not exists has_time_hint boolean not null default false,
  add column if not exists has_media_hint boolean not null default false,
  add column if not exists possible_private_location boolean not null default false,
  add column if not exists possible_joke boolean not null default false,
  add column if not exists possible_ai_generated boolean not null default false,
  add column if not exists possible_duplicate boolean not null default false,
  add column if not exists extracted_location_text text,
  add column if not exists extracted_region_guess text,
  add column if not exists extracted_country_guess text,
  add column if not exists extracted_event_datetime_text text,
  add column if not exists normalized_title text,
  add column if not exists normalized_summary text,
  add column if not exists last_scored_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'raw_sources_curation_score_check'
  ) then
    alter table public.raw_sources
      add constraint raw_sources_curation_score_check
      check (curation_score >= 0 and curation_score <= 100);
  end if;
end $$;

create index if not exists raw_sources_curation_score_idx
  on public.raw_sources (curation_score desc);

create index if not exists raw_sources_curation_label_idx
  on public.raw_sources (curation_label);

create index if not exists raw_sources_curation_flags_idx
  on public.raw_sources (
    has_location_hint,
    has_time_hint,
    possible_private_location,
    possible_joke,
    possible_ai_generated
  );

alter table public.raw_sources enable row level security;

revoke all on table public.raw_sources from public;
revoke all on table public.raw_sources from anon;
revoke all on table public.raw_sources from authenticated;

comment on column public.raw_sources.curation_score is
  'Internal review helper score from deterministic heuristics. Not verification.';
comment on column public.raw_sources.curation_label is
  'Internal review helper label. Does not mean a report is true.';
comment on column public.raw_sources.curation_reasons is
  'Internal explanation of deterministic curation hints.';
comment on column public.raw_sources.possible_private_location is
  'Internal warning for private-looking exact address, contact, or sensitive location details.';
comment on column public.raw_sources.normalized_summary is
  'Deterministic cleaned excerpt for review only. Not AI-generated verification.';
