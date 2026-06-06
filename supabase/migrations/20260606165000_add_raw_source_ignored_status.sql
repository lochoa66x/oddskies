-- Review hardening: add a neutral private bucket for reviewed raw sources
-- that should not become Field Log reports or Signal Shelf links.

alter table public.raw_sources
  drop constraint if exists raw_sources_status_check;

alter table public.raw_sources
  add constraint raw_sources_status_check check (
    status in (
      'new',
      'needs_review',
      'approved',
      'converted_to_signal_shelf',
      'ignored',
      'rejected',
      'duplicate',
      'low_context',
      'private_or_sensitive',
      'possible_joke',
      'possible_ai_generated'
    )
  );

comment on column public.raw_sources.status is
  'Internal review status. ignored means reviewed and kept private without promotion or conversion.';
