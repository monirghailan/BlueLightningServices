import { createHash, randomBytes } from "crypto";

export function hashInviteToken(token: string): string {
  const secret = process.env.PORTAL_INVITE_SECRET ?? "dev-invite-secret";
  return createHash("sha256").update(`${token}:${secret}`).digest("hex");
}

export function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

export function inviteExpiryDate(days = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
