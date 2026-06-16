/** Shared KAN board used for portal backlog / move-to-board (team-managed projects allow one project board). */
export function sharedJiraBoardId(): string {
  return process.env.JIRA_BOARD_ID?.trim() || "1";
}

export function resolvePortalBoardId(org: { jira_board_id: string | null }): string {
  return process.env.JIRA_BOARD_ID?.trim() || org.jira_board_id || sharedJiraBoardId();
}
