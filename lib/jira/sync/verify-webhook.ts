import { createHmac, timingSafeEqual } from "crypto";

/** Jira Cloud WebSub HMAC header (see Atlassian webhook docs). */
export function verifyJiraHubSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  const match = signatureHeader.match(/^sha256=([a-f0-9]+)$/i);
  if (!match) return false;

  const receivedHex = match[1].toLowerCase();
  const expectedHex = createHmac("sha256", secret).update(payload, "utf8").digest("hex");

  if (receivedHex.length !== expectedHex.length) return false;

  try {
    return timingSafeEqual(Buffer.from(receivedHex, "hex"), Buffer.from(expectedHex, "hex"));
  } catch {
    return false;
  }
}

function secretsMatch(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Accepts Jira native HMAC (X-Hub-Signature) or legacy x-jira-webhook-secret (curl/tests).
 */
export function verifyJiraWebhookAuth(
  payload: string,
  headers: { get(name: string): string | null }
): boolean {
  const secret = process.env.JIRA_WEBHOOK_SECRET;
  if (!secret) return false;

  const customHeader = headers.get("x-jira-webhook-secret");
  if (customHeader && secretsMatch(customHeader, secret)) {
    return true;
  }

  return verifyJiraHubSignature(payload, headers.get("x-hub-signature"), secret);
}

/** Atlassian documentation test vector for HMAC verification. */
export function jiraWebhookHmacSelfTest(): boolean {
  const secret = "It's a Secret to Everybody";
  const payload = "Hello World!";
  const expected = "a4771c39fbe90f317c7824e83ddef3caae9cb3d976c214ace1f2937e133263c9";
  return verifyJiraHubSignature(payload, `sha256=${expected}`, secret);
}
