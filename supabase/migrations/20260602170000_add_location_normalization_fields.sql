-- OddSkies V1.7 location normalization helpers.
--
-- These fields are heuristic review aids. Coordinates should stay approximate
-- city/region/public-landmark level and must never publish private addresses.

alter table public.raw_sources
  add column if not exists normalized_location_name text,
  add column if not exists normalized_region text,
  add column if not exists normalized_country text,
  add column if not exists normalized_latitude double precision,
  add column if not exists normalized_longitude double precision,
  add column if not exists location_confidence text not null default 'none',
  add column if not exists location_resolution text not null default 'none',
  add column if not exists location_warnings text[] not null default '{}',
  add column if not exists last_location_normalized_at timestamptz;

alter table public.reports
  add column if not exists location_confidence text,
  add column if not exists location_resolution text,
  add column if not exists location_warnings text[] not null default '{}';

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'raw_sources_location_confidence_check'
  ) then
    alter table public.raw_sources
      add constraint raw_sources_location_confidence_check
      check (location_confidence in ('none', 'low', 'medium', 'high'));
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'raw_sources_location_resolution_check'
  ) then
    alter table public.raw_sources
      add constraint raw_sources_location_resolution_check
      check (
        location_resolution in (
          'none',
          'city',
          'region',
          'country',
          'landmark',
          'approximate',
          'private_or_sensitive'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'reports_location_confidence_check'
  ) then
    alter table public.reports
      add constraint reports_location_confidence_check
      check (
        location_confidence is null
        or location_confidence in ('none', 'low', 'medium', 'high')
      );
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'reports_location_resolution_check'
  ) then
    alter table public.reports
      add constraint reports_location_resolution_check
      check (
        location_resolution is null
        or location_resolution in (
          'none',
          'city',
          'region',
          'country',
          'landmark',
          'approximate',
          'private_or_sensitive'
        )
      );
  end if;
end $$;

create index if not exists raw_sources_normalized_location_idx
  on public.raw_sources (normalized_country, normalized_region, normalized_location_name);

create index if not exists raw_sources_location_confidence_idx
  on public.raw_sources (location_confidence);

create index if not exists raw_sources_location_resolution_idx
  on public.raw_sources (location_resolution);

alter table public.raw_sources enable row level security;

revoke all on table public.raw_sources from public;
revoke all on table public.raw_sources from anon;
revoke all on table public.raw_sources from authenticated;

comment on column public.raw_sources.normalized_location_name is
  'Approximate city, region, country, or public landmark location for internal review. Not verified.';
comment on column public.raw_sources.normalized_latitude is
  'Approximate coordinate for internal review. Never street-level or private address precision.';
comment on column public.raw_sources.normalized_longitude is
  'Approximate coordinate for internal review. Never street-level or private address precision.';
comment on column public.raw_sources.location_confidence is
  'Heuristic location confidence. Not verification.';
comment on column public.raw_sources.location_resolution is
  'Heuristic location resolution. private_or_sensitive must not be promoted by default.';
comment on column public.raw_sources.location_warnings is
  'Internal warnings for approximate or sensitive location handling.';
comment on column public.reports.location_confidence is
  'Heuristic location confidence copied from reviewed raw source. Not verification.';
comment on column public.reports.location_resolution is
  'Approximate location resolution. Not verification.';
comment on column public.reports.location_warnings is
  'Location review warnings copied from reviewed raw source when available.';
