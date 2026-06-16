import { Resend } from "resend";
import {
  portalInviteEmailSubject,
  renderPortalInviteEmailHtml,
  renderPortalInviteEmailText,
  type PortalInviteEmailContext,
} from "@/lib/email/templates/portal-invite";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendInviteEmail(input: {
  to: string;
  orgName: string;
  inviteUrl: string;
  inviterEmail: string;
  context?: PortalInviteEmailContext;
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
    subject: portalInviteEmailSubject(input),
    html: renderPortalInviteEmailHtml(input),
    text: renderPortalInviteEmailText(input),
  });

  return { skipped: false };
}
