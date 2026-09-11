begin;

alter table public.delivery_signals
  add column if not exists project_id uuid
  references public.projects(id) on delete cascade;

alter table public.delivery_signals
  drop constraint if exists delivery_signals_source_check;

alter table public.delivery_signals
  add constraint delivery_signals_source_check
  check (source in ('github', 'jira', 'combined', 'system'));

alter table public.delivery_signals
  drop constraint if exists delivery_signals_workspace_id_snapshot_date_source_key;

alter table public.delivery_signals
  drop constraint if exists delivery_signals_workspace_project_date_source_key;

alter table public.delivery_signals
  add constraint delivery_signals_workspace_project_date_source_key
  unique nulls not distinct (workspace_id, project_id, snapshot_date, source);

create index if not exists idx_delivery_signals_project_date
  on public.delivery_signals (project_id, snapshot_date desc)
  where project_id is not null;

comment on column public.delivery_signals.project_id is
  'Canonical projects.id for project-scoped snapshots; null identifies a workspace baseline.';

commit;
