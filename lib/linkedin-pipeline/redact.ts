const CLIENT_LABEL_PATTERN = /\bclient-[a-z0-9-]+\b/gi;
const SALESFORCE_ID_PATTERN = /\b[a-zA-Z0-9]{15,18}\b/g;
const SANDBOX_URL_PATTERN =
  /https?:\/\/[^\s]*(?:sandbox|\.force\.com|\.salesforce\.com)[^\s]*/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

export type RedactionResult = {
  text: string;
  clientSlugs: string[];
  blockedPatternsFound: string[];
};

export function redactClientLabels(text: string, clientSlugs: string[]): string {
  let result = text;

  for (const slug of clientSlugs) {
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "gi"), "[client]");
    result = result.replace(new RegExp(`client-${escaped}`, "gi"), "[client]");
  }

  result = result.replace(CLIENT_LABEL_PATTERN, "[client]");
  return result;
}

export function redactSensitivePatterns(text: string): RedactionResult {
  const clientSlugs = [...text.matchAll(CLIENT_LABEL_PATTERN)].map((match) =>
    match[0].slice("client-".length).toLowerCase()
  );

  let redacted = redactClientLabels(text, clientSlugs);
  redacted = redacted.replace(SANDBOX_URL_PATTERN, "[redacted-url]");
  redacted = redacted.replace(EMAIL_PATTERN, "[redacted-email]");
  redacted = redacted.replace(SALESFORCE_ID_PATTERN, "[redacted-id]");

  const blockedPatternsFound = findBlockedPatterns(redacted, clientSlugs);

  return {
    text: redacted.trim(),
    clientSlugs: [...new Set(clientSlugs)],
    blockedPatternsFound,
  };
}

export function findBlockedPatterns(
  text: string,
  clientSlugs: string[]
): string[] {
  const found: string[] = [];

  if (/\bclient-[a-z0-9-]+\b/i.test(text)) found.push("client-label");
  if (
    /https?:\/\/[^\s]*(?:sandbox|\.force\.com|\.salesforce\.com)[^\s]*/i.test(
      text
    )
  )
    found.push("sandbox-url");
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text))
    found.push("email");

  for (const slug of clientSlugs) {
    if (slug && new RegExp(slug, "i").test(text)) {
      found.push(`client-slug:${slug}`);
    }
  }

  return [...new Set(found)];
}

export const REDACTION_SYSTEM_HINT = `Generalize all examples to anonymous mid-market B2B Salesforce teams.
Never name clients, client industries tied to one customer, contact names, sandbox URLs, record IDs, or internal ticket keys in spoken content or post copy.`;
