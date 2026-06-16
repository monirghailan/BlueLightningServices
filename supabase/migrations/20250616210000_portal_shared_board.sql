-- Team-managed KAN allows one project board; portal clients use shared board + saved filters.
update public.organizations
set jira_board_id = '1'
where jira_board_id is distinct from '1';
