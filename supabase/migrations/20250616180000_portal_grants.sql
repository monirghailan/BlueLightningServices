-- service_role needs explicit table grants for PostgREST access

grant select, insert, update, delete on public.organizations to service_role;
grant select, insert, update, delete on public.invitations to service_role;
grant select, insert, update, delete on public.organization_members to service_role;
grant select, insert, update, delete on public.profiles to service_role;
