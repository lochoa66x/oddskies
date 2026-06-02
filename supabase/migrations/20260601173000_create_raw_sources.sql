-- OddSkies V1.1 raw source staging foundation.
--
-- raw_sources is internal staging only. Future collectors or manual capture
-- should insert public source material here first. Public map/report UI should
-- continue reading reviewed records from public.reports only.
--
-- Important: this migration intentionally creates no public read policies.
-- With RLS enabled and no anon/authenticated SELECT policy, raw_sources stays
-- private staging data.

create extension if not exists pgcrypto;

create table if not exists public.raw_sources (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  source_post_id text,
  source_url text,
  author_handle text,
  posted_at timestamptz,
  collected_at timestamptz not null default now(),
  raw_title text,
  raw_text text,
  raw_media_url text,
  search_query text,
  language text,
  location_hint text,
  category_guess text,
  event_datetime_guess timestamptz,
  status text not null default 'new',
  review_notes text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint raw_sources_status_check check (
    status in (
      'new',
      'needs_review',
      'approved',
      'rejected',
      'duplicate',
      'low_context',
      'private_or_sensitive',
      'possible_joke',
      'possible_ai_generated'
    )
  )
);

do $$
declare
  report_id_type text;
begin
  select pg_catalog.format_type(attribute.atttypid, attribute.atttypmod)
    into report_id_type
  from pg_catalog.pg_attribute attribute
  join pg_catalog.pg_class class
    on class.oid = attribute.attrelid
  join pg_catalog.pg_namespace namespace
    on namespace.oid = class.relnamespace
  where namespace.nspname = 'public'
    and class.relname = 'reports'
    and attribute.attname = 'id'
    and not attribute.attisdropped;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'raw_sources'
      and column_name = 'approved_report_id'
  ) then
    if report_id_type is null then
      raise notice 'public.reports(id) was not found. Adding approved_report_id as uuid without a foreign key.';
      alter table public.raw_sources add column approved_report_id uuid;
    else
      execute format(
        'alter table public.raw_sources add column approved_report_id %s',
        report_id_type
      );
    end if;
  end if;

  if report_id_type is not null
    and not exists (
      select 1
      from pg_catalog.pg_constraint
      where conname = 'raw_sources_approved_report_id_fkey'
    )
  then
    execute
      'alter table public.raw_sources
       add constraint raw_sources_approved_report_id_fkey
       foreign key (approved_report_id)
       references public.reports(id)
       on delete set null';
  end if;
end $$;

create index if not exists raw_sources_status_idx
  on public.raw_sources (status);

create index if not exists raw_sources_platform_idx
  on public.raw_sources (platform);

create index if not exists raw_sources_posted_at_idx
  on public.raw_sources (posted_at desc);

create index if not exists raw_sources_collected_at_idx
  on public.raw_sources (collected_at desc);

create index if not exists raw_sources_approved_report_id_idx
  on public.raw_sources (approved_report_id);

create unique index if not exists raw_sources_platform_source_post_id_idx
  on public.raw_sources (platform, source_post_id)
  where source_post_id is not null;

create unique index if not exists raw_sources_source_url_idx
  on public.raw_sources (source_url)
  where source_url is not null;

create or replace function public.set_raw_sources_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists raw_sources_set_updated_at on public.raw_sources;

create trigger raw_sources_set_updated_at
  before update on public.raw_sources
  for each row
  execute function public.set_raw_sources_updated_at();

alter table public.raw_sources enable row level security;

revoke all on table public.raw_sources from public;
revoke all on table public.raw_sources from anon;
revoke all on table public.raw_sources from authenticated;

comment on table public.raw_sources is
  'Internal staging table for future collected public source material. Not public report data.';
comment on column public.raw_sources.approved_report_id is
  'Reviewed public.reports row created from this staged source, when approved.';
comment on column public.raw_sources.status is
  'Internal review status. Raw rows should never auto-publish to public.reports.';
comment on column public.raw_sources.source_url is
  'Original public source URL when available. Preserve this whenever possible.';
comment on column public.raw_sources.raw_text is
  'Raw collected text for internal review. Do not expose this table publicly.';
