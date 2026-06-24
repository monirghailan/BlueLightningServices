-- Link orphaned portal comments to their Jira mirror row, then remove the duplicate.
-- Pairs: portal row (no jira_comment_id) + jira row (same issue, same body).

with normalized_comments as (
  select
    id,
    issue_id,
    source,
    jira_comment_id,
    trim(replace(body_markdown, E'\r\n', E'\n')) as body_norm
  from public.jira_comments
),
matches as (
  select distinct on (portal.id)
    portal.id as portal_id,
    jira.jira_comment_id
  from normalized_comments portal
  inner join normalized_comments jira
    on jira.issue_id = portal.issue_id
    and jira.source = 'jira'
    and jira.jira_comment_id is not null
    and jira.body_norm = portal.body_norm
  where portal.source = 'portal'
    and portal.jira_comment_id is null
  order by portal.id, jira.id
)
update public.jira_comments as c
set
  jira_comment_id = m.jira_comment_id,
  sync_status = 'synced'
from matches m
where c.id = m.portal_id;

delete from public.jira_comments as j
using public.jira_comments as p
where j.source = 'jira'
  and p.source = 'portal'
  and j.issue_id = p.issue_id
  and j.jira_comment_id is not null
  and p.jira_comment_id = j.jira_comment_id;
