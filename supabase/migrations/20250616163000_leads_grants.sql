-- service_role needs explicit table grants for PostgREST access

grant select, insert, update, delete on public.leads to service_role;
grant select, insert, update, delete on public.lead_provisioning_jobs to service_role;
