import { site } from "@/lib/content";
import { escapeHtml } from "@/lib/email/escape";
import {
  emailButton,
  emailHeading,
  emailMuted,
  emailParagraph,
  wrapBrandedEmail,
} from "@/lib/email/layout";

export type PortalInviteEmailContext = "onboarding" | "invite";

export interface PortalInviteEmailInput {
  orgName: string;
  inviteUrl: string;
  inviterEmail: string;
  context?: PortalInviteEmailContext;
}

export function portalInviteEmailSubject(input: PortalInviteEmailInput): string {
  if (input.context === "onboarding") {
    return `Your ${input.orgName} client portal is ready`;
  }

  return `You're invited to ${input.orgName} on ${site.name} Portal`;
}

export function renderPortalInviteEmailHtml(input: PortalInviteEmailInput): string {
  const { orgName, inviteUrl, inviterEmail, context = "invite" } = input;
  const safeOrg = escapeHtml(orgName);
  const safeInviter = escapeHtml(inviterEmail);

  const isOnboarding = context === "onboarding";
  const title = isOnboarding ? "Your client portal is ready" : "You've been invited";
  const preview = isOnboarding
    ? `Set up your ${orgName} portal account on ${site.name}.`
    : `Join ${orgName} on the ${site.name} client portal.`;

  const intro = isOnboarding
    ? `We've set up a dedicated client portal for <strong>${safeOrg}</strong>. Accept your invitation to access your backlog, submit tickets, and collaborate with our team.`
    : `You've been invited to join <strong>${safeOrg}</strong> on the ${escapeHtml(site.name)} client portal.`;

  const ctaLabel = isOnboarding ? "Set up your account" : "Accept invitation";
  const inviterLine = isOnboarding
    ? `Sent by the ${escapeHtml(site.name)} team.`
    : `Invited by ${safeInviter}.`;

  const bodyHtml = [
    emailHeading(title),
    emailParagraph(intro),
    emailParagraph(
      "Use the button below to accept your invitation and create your password. This link expires in 7 days."
    ),
    emailButton(inviteUrl, ctaLabel),
    emailMuted(inviterLine),
    emailMuted("If you didn't expect this email, you can safely ignore it."),
  ].join("");

  return wrapBrandedEmail({
    preview,
    title,
    bodyHtml,
  });
}

export function renderPortalInviteEmailText(input: PortalInviteEmailInput): string {
  const { orgName, inviteUrl, inviterEmail, context = "invite" } = input;
  const isOnboarding = context === "onboarding";

  const lines = isOnboarding
    ? [
        `Your client portal is ready`,
        ``,
        `We've set up a dedicated client portal for ${orgName} on ${site.name}.`,
        `Accept your invitation to access your backlog, submit tickets, and collaborate with our team.`,
      ]
    : [
        `You've been invited`,
        ``,
        `You've been invited to join ${orgName} on the ${site.name} client portal.`,
      ];

  lines.push(
    ``,
    `Accept your invitation (expires in 7 days):`,
    inviteUrl,
    ``,
    isOnboarding ? `Sent by the ${site.name} team.` : `Invited by ${inviterEmail}.`,
    `If you didn't expect this email, you can safely ignore it.`,
    ``,
    `—`,
    site.name,
    site.email
  );

  return lines.join("\n");
}
