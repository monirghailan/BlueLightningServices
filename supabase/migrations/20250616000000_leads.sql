-- Website leads + qualified auto-provisioning queue

create type public.lead_status as enum (
  'New',
  'Contacted',
  'In Progress',
  'Not Qualified',
  'Qualified',
  'Parked'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  phone text,
  message text not null,
  source text,
  status public.lead_status not null default 'New',
  organization_id uuid references public.organizations (id) on delete set null,
  provisioned_at timestamptz,
  provisioning_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_provisioning_jobs (
  lead_id uuid primary key references public.leads (id) on delete cascade,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  error text,
  attempt_count integer not null default 0
);

create index leads_status_idx on public.leads (status);
create index leads_email_idx on public.leads (email);
create index lead_provisioning_jobs_unprocessed_idx on public.lead_provisioning_jobs (processed_at)
where processed_at is null;

create or replace function public.set_leads_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
before update on public.leads
for each row
execute function public.set_leads_updated_at ();

create or replace function public.enqueue_lead_provisioning ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if
    new.status = 'Qualified'
    and old.status is distinct from 'Qualified'
    and new.organization_id is null
  then
    insert into public.lead_provisioning_jobs (lead_id)
    values (new.id)
    on conflict (lead_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_lead_qualified
after update on public.leads
for each row
execute function public.enqueue_lead_provisioning ();

alter table public.leads enable row level security;
alter table public.lead_provisioning_jobs enable row level security;
