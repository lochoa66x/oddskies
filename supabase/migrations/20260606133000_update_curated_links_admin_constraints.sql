-- V2.9a Pass 1: keep the manual active URL uniqueness guard in migration
-- history and expand Signal Shelf link types for admin curation.

alter table public.curated_links
  drop constraint if exists curated_links_link_type_check;

alter table public.curated_links
  add constraint curated_links_link_type_check check (
    link_type is null
    or link_type in (
      'archive',
      'article',
      'case_context',
      'culture_note',
      'debunk_or_explanation',
      'external_reference',
      'internal_resource',
      'official_source',
      'rabbit_hole',
      'source_guidance',
      'tool',
      'video'
    )
  );

create unique index if not exists curated_links_unique_active_url_idx
  on public.curated_links (url)
  where is_active = true;

comment on constraint curated_links_link_type_check on public.curated_links is
  'Allowed public Signal Shelf link kinds. These are browsing/resource labels, not verification labels.';
