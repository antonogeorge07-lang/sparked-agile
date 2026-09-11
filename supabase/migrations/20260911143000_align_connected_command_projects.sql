begin;

alter table public.pmi_projects
  add column if not exists canonical_project_id uuid;

do $$
begin
  alter table public.pmi_projects
    add constraint pmi_projects_canonical_project_id_fkey
    foreign key (canonical_project_id)
    references public.projects(id)
    on delete cascade;
exception
  when duplicate_object then null;
end
$$;

create unique index if not exists pmi_projects_canonical_project_id_key
  on public.pmi_projects (canonical_project_id)
  where canonical_project_id is not null;

comment on column public.pmi_projects.canonical_project_id is
  'Canonical projects.id represented by this Command Centre record.';

-- Link only unambiguous owner/name matches. Ambiguous legacy rows are preserved.
with candidates as (
  select
    pp.id as pmi_project_id,
    p.id as canonical_project_id,
    count(*) over (partition by pp.id) as canonical_matches,
    count(*) over (partition by p.id) as pmi_matches
  from public.pmi_projects pp
  join public.projects p
    on p.user_id = pp.user_id
   and lower(regexp_replace(trim(p.name), '\\s+', ' ', 'g'))
       = lower(regexp_replace(trim(pp.name), '\\s+', ' ', 'g'))
  where pp.canonical_project_id is null
),
unique_matches as (
  select pmi_project_id, canonical_project_id
  from candidates
  where canonical_matches = 1
    and pmi_matches = 1
)
update public.pmi_projects pp
set canonical_project_id = matches.canonical_project_id,
    updated_at = now()
from unique_matches matches
where pp.id = matches.pmi_project_id
  and pp.canonical_project_id is null;

-- Every owner-connected project receives exactly one PMI backing record.
insert into public.pmi_projects (
  user_id,
  name,
  description,
  status,
  canonical_project_id,
  created_at,
  updated_at
)
select
  p.user_id,
  p.name,
  p.description,
  'active',
  p.id,
  p.created_at,
  now()
from public.projects p
where p.user_id is not null
  and exists (
    select 1
    from public.integrations i
    where i.project_id = p.id
      and i.is_active = true
  )
  and not exists (
    select 1
    from public.pmi_projects pp
    where pp.canonical_project_id = p.id
  )
on conflict (canonical_project_id)
  where canonical_project_id is not null
  do nothing;

create or replace function public.get_connected_command_projects()
returns table (
  id uuid,
  "pmiId" uuid,
  name text,
  description text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = public, pg_catalog
as $$
  select
    p.id,
    pp.id as "pmiId",
    p.name,
    p.description,
    p.created_at,
    p.updated_at
  from public.projects p
  join public.pmi_projects pp
    on pp.canonical_project_id = p.id
   and pp.user_id = p.user_id
  where p.user_id = auth.uid()
    and exists (
      select 1
      from public.integrations i
      where i.project_id = p.id
        and i.is_active = true
    )
  order by p.created_at desc;
$$;

revoke all on function public.get_connected_command_projects() from public;
grant execute on function public.get_connected_command_projects() to authenticated;

comment on function public.get_connected_command_projects() is
  'Returns each authenticated owner connected project with its internal PMI backing ID.';

commit;
