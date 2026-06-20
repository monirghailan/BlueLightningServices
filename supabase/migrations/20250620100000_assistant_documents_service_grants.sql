-- service_role needs write access for org guide indexing (index-org-guide.ts, reindex API)

grant select, insert, update, delete on public.assistant_documents to service_role;
