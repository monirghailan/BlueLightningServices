-- BLS Client Portal schema

create type public.org_status as enum ('active', 'suspended');
create type public.member_role as enum ('administrator', 'standard');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  jira_project_key text not null default 'KAN',
  jira_component_id text,
  jira_component_name text,
  jira_board_id text,
  status public.org_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'standard',
  joined_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role public.member_role not null default 'standard',
  token_hash text not null,
  expires_at timestamptz not null,
  invited_by uuid references auth.users (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index organization_members_user_id_idx on public.organization_members (user_id);
create index organization_members_org_id_idx on public.organization_members (organization_id);
create index invitations_token_hash_idx on public.invitations (token_hash);
create index invitations_email_idx on public.invitations (email);

-- Auto-create profile on signup
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user ();

-- RLS
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.invitations enable row level security;

create or replace function public.user_org_ids ()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid ();
$$;

create or replace function public.user_is_org_admin (org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid ()
      and role = 'administrator'
  );
$$;

-- organizations
create policy "Members can view their organizations"
on public.organizations for select
using (id in (select public.user_org_ids ()));

create policy "Admins can update their organizations"
on public.organizations for update
using (public.user_is_org_admin (id));

-- profiles
create policy "Users can view own profile"
on public.profiles for select
using (id = auth.uid ());

create policy "Users can view org member profiles"
on public.profiles for select
using (
  id in (
    select om.user_id
    from public.organization_members om
    where om.organization_id in (select public.user_org_ids ())
  )
);

create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid ());

-- organization_members
create policy "Members can view org membership"
on public.organization_members for select
using (organization_id in (select public.user_org_ids ()));

create policy "Admins can insert org membership"
on public.organization_members for insert
with check (public.user_is_org_admin (organization_id));

create policy "Admins can update org membership"
on public.organization_members for update
using (public.user_is_org_admin (organization_id));

create policy "Admins can delete org membership"
on public.organization_members for delete
using (public.user_is_org_admin (organization_id));

-- invitations
create policy "Admins can view org invitations"
on public.invitations for select
using (public.user_is_org_admin (organization_id));

create policy "Admins can create org invitations"
on public.invitations for insert
with check (public.user_is_org_admin (organization_id));

create policy "Admins can delete org invitations"
on public.invitations for delete
using (public.user_is_org_admin (organization_id));
