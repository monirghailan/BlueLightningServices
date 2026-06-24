import type { JiraChangelog } from "@/lib/jira/client";

export interface StatusTransitionRow {
  from_status: string;
  to_status: string;
  transitioned_at: string;
}

/** Time in this status is excluded from portal avg-time-to-close (client wait). */
export const CLOSE_METRIC_EXCLUDED_STATUS = "In Review";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_BUSINESS_DAY = 8 * MS_PER_HOUR;
const MS_PER_CALENDAR_DAY = 24 * MS_PER_HOUR;

function utcDayStart(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function isWeekday(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

/** Weekdays only: partial days as hours/8, full intermediate weekdays as 1.0 each. */
export function fractionalBusinessDaysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startMs = start.getTime();
  const endMs = end.getTime();
  if (endMs <= startMs) return 0;

  const startDay = utcDayStart(start);
  const endDay = utcDayStart(end);

  if (startDay === endDay) {
    if (!isWeekday(start)) return 0;
    return Math.min(endMs - startMs, MS_PER_BUSINESS_DAY) / MS_PER_BUSINESS_DAY;
  }

  let total = 0;

  if (isWeekday(start)) {
    const firstDayEnd = startDay + MS_PER_CALENDAR_DAY;
    total += Math.min(firstDayEnd - startMs, MS_PER_BUSINESS_DAY) / MS_PER_BUSINESS_DAY;
  }

  if (isWeekday(end)) {
    total += Math.min(endMs - endDay, MS_PER_BUSINESS_DAY) / MS_PER_BUSINESS_DAY;
  }

  for (let cursor = startDay + MS_PER_CALENDAR_DAY; cursor < endDay; cursor += MS_PER_CALENDAR_DAY) {
    if (isWeekday(new Date(cursor))) total += 1;
  }

  return total;
}

interface StatusChange {
  at: string;
  from: string;
  to: string;
}

function parseStatusChanges(changelog: JiraChangelog): StatusChange[] {
  const changes: StatusChange[] = [];

  for (const history of changelog.histories) {
    for (const item of history.items) {
      if (item.field !== "status") continue;
      changes.push({
        at: history.created,
        from: item.fromString ?? "",
        to: item.toString ?? "",
      });
    }
  }

  changes.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return changes;
}

function intervalsInStatus(
  created: string,
  resolved: string,
  changelog: JiraChangelog,
  statusName: string
): [string, string][] {
  const changes = parseStatusChanges(changelog);
  const needle = statusName.toLowerCase();
  const initialStatus = changes[0]?.from || "To Do";

  let cursor = created;
  let currentStatus = initialStatus;
  const intervals: [string, string][] = [];

  for (const change of changes) {
    if (currentStatus.toLowerCase() === needle) {
      intervals.push([cursor, change.at]);
    }
    cursor = change.at;
    currentStatus = change.to;
  }

  if (currentStatus.toLowerCase() === needle) {
    intervals.push([cursor, resolved]);
  }

  return intervals;
}

function intervalsInStatusFromRows(
  created: string,
  resolved: string,
  transitions: StatusTransitionRow[],
  statusName: string
): [string, string][] {
  const changes = transitions
    .map((row) => ({
      at: row.transitioned_at,
      from: row.from_status,
      to: row.to_status,
    }))
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const needle = statusName.toLowerCase();
  const initialStatus = changes[0]?.from || "To Do";

  let cursor = created;
  let currentStatus = initialStatus;
  const intervals: [string, string][] = [];

  for (const change of changes) {
    if (currentStatus.toLowerCase() === needle) {
      intervals.push([cursor, change.at]);
    }
    cursor = change.at;
    currentStatus = change.to;
  }

  if (currentStatus.toLowerCase() === needle) {
    intervals.push([cursor, resolved]);
  }

  return intervals;
}

/** Business days from created to resolved, minus time spent in the excluded status. */
export function activeBusinessDaysToClose(
  created: string,
  resolved: string,
  changelog: JiraChangelog,
  excludedStatus = CLOSE_METRIC_EXCLUDED_STATUS
): number {
  const total = fractionalBusinessDaysBetween(created, resolved);
  const excludedIntervals = intervalsInStatus(created, resolved, changelog, excludedStatus);
  const excluded = excludedIntervals.reduce(
    (sum, [start, end]) => sum + fractionalBusinessDaysBetween(start, end),
    0
  );

  return Math.max(0, total - excluded);
}

/** Same as activeBusinessDaysToClose but using DB transition rows. */
export function activeBusinessDaysToCloseFromTransitions(
  created: string,
  resolved: string,
  transitions: StatusTransitionRow[],
  excludedStatus = CLOSE_METRIC_EXCLUDED_STATUS
): number {
  const total = fractionalBusinessDaysBetween(created, resolved);
  const excludedIntervals = intervalsInStatusFromRows(
    created,
    resolved,
    transitions,
    excludedStatus
  );
  const excluded = excludedIntervals.reduce(
    (sum, [start, end]) => sum + fractionalBusinessDaysBetween(start, end),
    0
  );

  return Math.max(0, total - excluded);
}
