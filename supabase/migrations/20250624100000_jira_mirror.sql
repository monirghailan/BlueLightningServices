-- Jira mirror tables for portal (no live Jira API on portal reads)

create type public.jira_issue_sync_status as enum (
  'synced',
  'pending_create',
  'pending_update',
  'error'
);

create type public.jira_comment_source as enum ('portal', 'jira', 'cursor');

create type public.jira_comment_sync_status as enum ('synced', 'pending', 'error');

create type public.jira_outbox_operation as enum (
  'create_issue',
  'add_comment',
  'rank_backlog',
  'move_to_board',
  'move_to_backlog'
);

create type public.jira_outbox_status as enum ('pending', 'processing', 'done', 'failed');

alter table public.organizations
add column if not exists jira_last_synced_at timestamptz,
add column if not exists metrics_computed_at timestamptz;

create table public.jira_issues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  jira_key text unique,
  summary text not null,
  description text not null default '',
  issue_type text not null default 'Task',
  priority text,
  status text not null default 'To Do',
  status_category text not null default 'new',
  labels text[] not null default '{}',
  parent_jira_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  is_in_backlog boolean not null default false,
  backlog_rank int,
  exclude_from_close_metric boolean not null default false,
  sync_status public.jira_issue_sync_status not null default 'synced',
  sync_error text,
  jira_updated_at timestamptz
);

create index jira_issues_org_updated_idx on public.jira_issues (organization_id, updated_at desc);
create index jira_issues_org_status_category_idx on public.jira_issues (organization_id, status_category);
create index jira_issues_jira_key_idx on public.jira_issues (jira_key) where jira_key is not null;
create index jira_issues_backlog_idx on public.jira_issues (organization_id, is_in_backlog, backlog_rank)
where is_in_backlog = true;

create table public.jira_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.jira_issues (id) on delete cascade,
  jira_comment_id text unique,
  author_display_name text not null default 'Unknown',
  author_email text,
  body_markdown text not null default '',
  source public.jira_comment_source not null default 'jira',
  sync_status public.jira_comment_sync_status not null default 'synced',
  created_at timestamptz not null default now()
);

create index jira_comments_issue_id_idx on public.jira_comments (issue_id, created_at);

create table public.jira_status_transitions (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.jira_issues (id) on delete cascade,
  from_status text not null default '',
  to_status text not null,
  transitioned_at timestamptz not null,
  unique (issue_id, transitioned_at, to_status)
);

create index jira_status_transitions_issue_id_idx on public.jira_status_transitions (issue_id, transitioned_at);

create table public.organization_metrics (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  computed_at timestamptz not null default now(),
  open_tickets int not null default 0,
  closed_this_month int not null default 0,
  avg_time_to_close_days numeric(10, 1) not null default 0,
  oldest_open jsonb,
  by_type jsonb not null default '{}',
  by_status jsonb not null default '{}',
  throughput jsonb not null default '[]'
);

create table public.jira_sync_outbox (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  operation public.jira_outbox_operation not null,
  payload jsonb not null default '{}',
  status public.jira_outbox_status not null default 'pending',
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index jira_sync_outbox_pending_idx on public.jira_sync_outbox (status, created_at)
where status = 'pending';

-- RLS: mirror data accessed via service_role only (portal API uses service client)
alter table public.jira_issues enable row level security;
alter table public.jira_comments enable row level security;
alter table public.jira_status_transitions enable row level security;
alter table public.organization_metrics enable row level security;
alter table public.jira_sync_outbox enable row level security;

grant select, insert, update, delete on public.jira_issues to service_role;
grant select, insert, update, delete on public.jira_comments to service_role;
grant select, insert, update, delete on public.jira_status_transitions to service_role;
grant select, insert, update, delete on public.organization_metrics to service_role;
grant select, insert, update, delete on public.jira_sync_outbox to service_role;
