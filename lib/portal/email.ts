import { Resend } from "resend";
import { site } from "@/lib/content";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendInviteEmail(input: {
  to: string;
  orgName: string;
  inviteUrl: string;
  inviterEmail: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — invite email skipped:", input.to);
    return { skipped: true };
  }

  const from =
    process.env.CONTACT_FROM_EMAIL ??
    `Blue Lightning Services <noreply@bluelightningservices.com>`;

  await resend.emails.send({
    from,
    to: input.to,
    subject: `You're invited to ${input.orgName} on ${site.name} Portal`,
    html: `
      <p>You've been invited to join <strong>${input.orgName}</strong> on the ${site.name} client portal.</p>
      <p><a href="${input.inviteUrl}">Accept invitation and set your password</a></p>
      <p>This link expires in 7 days. Invited by ${input.inviterEmail}.</p>
      <p>If you didn't expect this email, you can ignore it.</p>
    `,
  });

  return { skipped: false };
}
