-- Portal tables were created with RLS but without PostgREST role grants.
-- Authenticated users need table privileges before RLS policies can apply.

grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.invitations to authenticated;
