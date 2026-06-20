-- Portal Assistant: pgvector, org guide fields, personas, conversations

create extension if not exists vector;

create type public.assistant_persona as enum (
  'sales_rep',
  'sales_manager',
  'service_agent',
  'service_manager',
  'general'
);

alter table public.organizations
add column if not exists github_repo_url text,
add column if not exists github_default_branch text not null default 'main',
add column if not exists assistant_enabled boolean not null default false,
add column if not exists assistant_last_indexed_at timestamptz,
add column if not exists assistant_system_prompt_override text,
add column if not exists metadata_repo_url text,
add column if not exists metadata_last_synced_at timestamptz;

alter table public.organization_members
add column if not exists assistant_persona public.assistant_persona default 'general';

alter table public.invitations
add column if not exists assistant_persona public.assistant_persona default 'general';

create table if not exists public.assistant_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  path text not null,
  content_hash text not null,
  title text not null,
  chunk_index int not null default 0,
  content text not null,
  personas text[] not null default array['all'],
  embedding vector (1536),
  created_at timestamptz not null default now(),
  unique (organization_id, path, chunk_index)
);

create index if not exists assistant_documents_org_id_idx on public.assistant_documents (organization_id);

create index if not exists assistant_documents_embedding_idx on public.assistant_documents
using hnsw (embedding vector_cosine_ops);

create table if not exists public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assistant_conversations_user_org_idx
on public.assistant_conversations (organization_id, user_id);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  sources jsonb,
  created_at timestamptz not null default now()
);

create index if not exists assistant_messages_conversation_id_idx
on public.assistant_messages (conversation_id);

create or replace function public.match_assistant_documents (
  p_org_id uuid,
  p_query_embedding vector (1536),
  p_personas text[],
  p_match_count int default 8,
  p_match_threshold float default 0.35
)
returns table (
  id uuid,
  path text,
  title text,
  content text,
  personas text[],
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id,
    d.path,
    d.title,
    d.content,
    d.personas,
    (1 - (d.embedding <=> p_query_embedding))::float as similarity
  from public.assistant_documents as d
  where
    d.organization_id = p_org_id
    and d.embedding is not null
    and (
      'all' = any (d.personas)
      or d.personas && p_personas
    )
    and (1 - (d.embedding <=> p_query_embedding)) > p_match_threshold
  order by d.embedding <=> p_query_embedding
  limit p_match_count;
$$;

alter table public.assistant_documents enable row level security;
alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;

drop policy if exists "Members can read org assistant documents" on public.assistant_documents;
create policy "Members can read org assistant documents"
on public.assistant_documents for select
using (organization_id in (select public.user_org_ids ()));

drop policy if exists "Members can manage own conversations" on public.assistant_conversations;
create policy "Members can manage own conversations"
on public.assistant_conversations for all
using (
  user_id = auth.uid ()
  and organization_id in (select public.user_org_ids ())
)
with check (
  user_id = auth.uid ()
  and organization_id in (select public.user_org_ids ())
);

drop policy if exists "Members can manage messages in own conversations" on public.assistant_messages;
create policy "Members can manage messages in own conversations"
on public.assistant_messages for all
using (
  exists (
    select 1
    from public.assistant_conversations as c
    where
      c.id = conversation_id
      and c.user_id = auth.uid ()
      and c.organization_id in (select public.user_org_ids ())
  )
)
with check (
  exists (
    select 1
    from public.assistant_conversations as c
    where
      c.id = conversation_id
      and c.user_id = auth.uid ()
      and c.organization_id in (select public.user_org_ids ())
  )
);

grant select on public.assistant_documents to authenticated;
grant select, insert, update, delete on public.assistant_conversations to authenticated;
grant select, insert, update, delete on public.assistant_messages to authenticated;
grant execute on function public.match_assistant_documents to authenticated;
