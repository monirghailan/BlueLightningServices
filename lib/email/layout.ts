import { emailBrand } from "@/lib/email/brand";
import { escapeHtml } from "@/lib/email/escape";

export interface BrandedEmailLayoutInput {
  preview: string;
  title: string;
  bodyHtml: string;
  footerNote?: string;
}

export function wrapBrandedEmail(input: BrandedEmailLayoutInput): string {
  const { preview, title, bodyHtml, footerNote } = input;
  const { name, tagline, supportEmail, portalUrl, logoUrl, colors } = emailBrand;

  const footer = footerNote
    ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${colors.muted};">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid ${colors.border};border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:${colors.background};padding:28px 32px;text-align:center;">
              <img src="${logoUrl}" alt="${escapeHtml(name)}" width="48" height="56" style="display:block;margin:0 auto 12px;border:0;" />
              <p style="margin:0;font-size:18px;font-weight:600;color:#e8eef7;line-height:1.3;">${escapeHtml(name)}</p>
              <p style="margin:6px 0 0;font-size:13px;color:#8899b4;line-height:1.4;">${escapeHtml(tagline)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
              ${footer}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${colors.border};background-color:#fafafa;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${colors.muted};text-align:center;">
                <a href="${portalUrl}" style="color:${colors.accent};text-decoration:none;">Client portal</a>
                &nbsp;·&nbsp;
                <a href="mailto:${supportEmail}" style="color:${colors.accent};text-decoration:none;">${escapeHtml(supportEmail)}</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:${colors.muted};text-align:center;">
                © ${new Date().getFullYear()} ${escapeHtml(name)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  const { colors } = emailBrand;

  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="border-radius:8px;background-color:${colors.accent};">
        <a href="${href}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:600;color:${colors.onAccent};text-decoration:none;border-radius:8px;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;line-height:1.3;color:${emailBrand.colors.text};">${escapeHtml(text)}</h1>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${emailBrand.colors.text};">${text}</p>`;
}

export function emailMuted(text: string): string {
  return `<p style="margin:0;font-size:13px;line-height:1.6;color:${emailBrand.colors.muted};">${text}</p>`;
}
