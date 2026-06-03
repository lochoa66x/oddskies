create table if not exists public.collector_runs (
  id uuid primary key default gen_random_uuid(),
  collector_name text not null,
  platform text not null,
  mode text not null default 'manual',
  status text not null default 'started',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  query_count integer not null default 0,
  fetched_count integer not null default 0,
  inserted_count integer not null default 0,
  duplicate_count integer not null default 0,
  error_count integer not null default 0,
  dry_run boolean not null default false,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  constraint collector_runs_status_check check (
    status in ('started', 'completed', 'completed_with_errors', 'failed')
  ),
  constraint collector_runs_mode_check check (
    mode in ('manual', 'admin', 'scheduled')
  )
);

alter table public.collector_runs enable row level security;

revoke all on table public.collector_runs from public;
revoke all on table public.collector_runs from anon;
revoke all on table public.collector_runs from authenticated;

create index if not exists collector_runs_started_at_idx
  on public.collector_runs (started_at desc);

create index if not exists collector_runs_collector_name_idx
  on public.collector_runs (collector_name, started_at desc);

comment on table public.collector_runs is
  'Internal run log for source collectors. Not public report data.';

comment on column public.collector_runs.summary is
  'Per-run and per-query collector summary. Internal only.';

comment on column public.collector_runs.status is
  'started, completed, completed_with_errors, or failed.';
