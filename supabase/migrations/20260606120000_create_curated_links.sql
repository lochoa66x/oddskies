-- Signal Shelf is a public curated-link shelf, not a report table.
-- Links can point to OddSkies pages or external public resources, but they do
-- not verify any report or source.

create extension if not exists pgcrypto;

create table if not exists public.curated_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text not null,
  source_name text,
  category text,
  link_type text,
  region text,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  safety_label text not null default 'unverified_resource',
  notes text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curated_links_link_type_check check (
    link_type is null
    or link_type in (
      'archive',
      'case_context',
      'culture_note',
      'external_reference',
      'internal_resource',
      'source_guidance',
      'tool'
    )
  ),
  constraint curated_links_url_not_empty_check check (length(trim(url)) > 0),
  constraint curated_links_title_not_empty_check check (length(trim(title)) > 0)
);

create index if not exists curated_links_active_featured_idx
  on public.curated_links (is_active, is_featured, sort_order, published_at desc);

create index if not exists curated_links_category_idx
  on public.curated_links (category)
  where is_active = true;

create index if not exists curated_links_link_type_idx
  on public.curated_links (link_type)
  where is_active = true;

create index if not exists curated_links_region_idx
  on public.curated_links (region)
  where is_active = true;

create index if not exists curated_links_tags_idx
  on public.curated_links using gin (tags);

create or replace function public.set_curated_links_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists curated_links_set_updated_at on public.curated_links;

create trigger curated_links_set_updated_at
  before update on public.curated_links
  for each row
  execute function public.set_curated_links_updated_at();

alter table public.curated_links enable row level security;

revoke all on table public.curated_links from public;
revoke all on table public.curated_links from anon;
revoke all on table public.curated_links from authenticated;

grant select on table public.curated_links to anon, authenticated;

drop policy if exists curated_links_public_read_active on public.curated_links;

create policy curated_links_public_read_active
  on public.curated_links
  for select
  to anon, authenticated
  using (is_active = true);

comment on table public.curated_links is
  'Public curated links for Signal Shelf. Not reports, not verification, not raw source staging.';
comment on column public.curated_links.is_active is
  'Only active links are publicly readable through RLS.';
comment on column public.curated_links.safety_label is
  'Short display label such as internal_resource, unverified_resource, or source_context.';
comment on column public.curated_links.notes is
  'Optional public curator note. Do not store private review notes here.';
