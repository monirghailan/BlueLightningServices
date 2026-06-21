-- Enable PostgREST embeds between organization_members and profiles.
alter table public.organization_members
  add constraint organization_members_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
