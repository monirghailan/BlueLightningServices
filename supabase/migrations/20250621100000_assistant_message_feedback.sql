-- Per-message thumbs up/down on assistant replies

alter table public.assistant_messages
add column if not exists feedback text check (feedback in ('up', 'down')),
add column if not exists feedback_at timestamptz;

create index if not exists assistant_messages_feedback_idx
on public.assistant_messages (feedback)
where feedback is not null;
