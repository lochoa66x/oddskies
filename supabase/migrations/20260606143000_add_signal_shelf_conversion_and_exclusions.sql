-- V2.9a Pass 2: raw source conversion to Signal Shelf plus private
-- collector exclusions for intentional future suppression.

create extension if not exists pgcrypto;

alter table public.raw_sources
  add column if not exists curated_link_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'raw_sources_curated_link_id_fkey'
  ) then
    alter table public.raw_sources
      add constraint raw_sources_curated_link_id_fkey
      foreign key (curated_link_id)
      references public.curated_links(id)
      on delete set null;
  end if;
end $$;

alter table public.raw_sources
  drop constraint if exists raw_sources_status_check;

alter table public.raw_sources
  add constraint raw_sources_status_check check (
    status in (
      'new',
      'needs_review',
      'approved',
      'converted_to_signal_shelf',
      'rejected',
      'duplicate',
      'low_context',
      'private_or_sensitive',
      'possible_joke',
      'possible_ai_generated'
    )
  );

create index if not exists raw_sources_curated_link_id_idx
  on public.raw_sources (curated_link_id);

create table if not exists public.collector_exclusions (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  match_type text not null,
  match_value text not null,
  reason text not null,
  source_raw_source_id uuid references public.raw_sources(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collector_exclusions_match_type_check check (
    match_type in (
      'source_post_id',
      'source_url',
      'author_handle',
      'domain',
      'text_contains',
      'search_query'
    )
  ),
  constraint collector_exclusions_match_value_not_empty_check check (
    length(trim(match_value)) > 0
  ),
  constraint collector_exclusions_reason_not_empty_check check (
    length(trim(reason)) > 0
  )
);

create unique index if not exists collector_exclusions_unique_active_match_idx
  on public.collector_exclusions (platform, match_type, lower(match_value))
  where is_active = true;

create index if not exists collector_exclusions_active_platform_idx
  on public.collector_exclusions (is_active, platform, match_type);

create index if not exists collector_exclusions_source_raw_source_idx
  on public.collector_exclusions (source_raw_source_id);

create or replace function public.set_collector_exclusions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists collector_exclusions_set_updated_at
  on public.collector_exclusions;

create trigger collector_exclusions_set_updated_at
  before update on public.collector_exclusions
  for each row
  execute function public.set_collector_exclusions_updated_at();

alter table public.collector_exclusions enable row level security;

revoke all on table public.collector_exclusions from public;
revoke all on table public.collector_exclusions from anon;
revoke all on table public.collector_exclusions from authenticated;

comment on column public.raw_sources.curated_link_id is
  'Signal Shelf link created from this staged source, when converted manually.';
comment on table public.collector_exclusions is
  'Private collector suppression rules. Used to skip future noisy matches intentionally.';
comment on column public.collector_exclusions.match_type is
  'How the collector should match this exclusion rule.';
comment on column public.collector_exclusions.match_value is
  'Normalized value to match. Keep broad author/domain/text rules intentional and reversible.';
