alter table public.reports
  add column if not exists public_status text not null default 'published',
  add column if not exists archived_at timestamp with time zone,
  add column if not exists hidden_at timestamp with time zone,
  add column if not exists is_featured boolean not null default false,
  add column if not exists display_priority integer not null default 0;

alter table public.reports
  drop constraint if exists reports_public_status_check;

alter table public.reports
  add constraint reports_public_status_check
  check (public_status in ('published', 'featured', 'archived', 'hidden'));

create index if not exists reports_public_status_idx
  on public.reports (public_status);

create index if not exists reports_display_priority_idx
  on public.reports (display_priority desc, event_datetime desc);

create index if not exists reports_featured_idx
  on public.reports (is_featured);

create table if not exists public.oracle_readings (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  model text not null,
  prompt_version text not null,
  reading jsonb not null,
  status text not null default 'ready',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint oracle_readings_status_check
    check (status in ('ready', 'fallback')),
  constraint oracle_readings_report_model_prompt_key
    unique (report_id, model, prompt_version)
);

create index if not exists oracle_readings_report_id_idx
  on public.oracle_readings (report_id);

create index if not exists oracle_readings_updated_at_idx
  on public.oracle_readings (updated_at desc);

alter table public.oracle_readings enable row level security;

revoke all on table public.oracle_readings from public;
revoke all on table public.oracle_readings from anon;
revoke all on table public.oracle_readings from authenticated;

comment on column public.reports.public_status is
  'Public lifecycle status: published, featured, archived, or hidden. Not verification.';
comment on column public.reports.archived_at is
  'When a report was moved out of the main public feed.';
comment on column public.reports.hidden_at is
  'When a report was hidden from public display.';
comment on column public.reports.is_featured is
  'Manual display boost for reviewed public reports. Not verification.';
comment on column public.reports.display_priority is
  'Manual ordering boost for public display. Higher values appear earlier.';

comment on table public.oracle_readings is
  'Server-side cache of playful Oracle readings for public reports. Oracle readings are not verification.';
comment on column public.oracle_readings.reading is
  'Strict JSON Oracle reading. Playful interpretation only; not confirmation.';
comment on column public.oracle_readings.prompt_version is
  'Prompt/schema version used to generate this Oracle reading.';
