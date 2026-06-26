import { REDACTION_SYSTEM_HINT } from "@/lib/linkedin-pipeline/redact";
import type { Presenter } from "@/lib/linkedin-pipeline/presenters";
import type { SelectedTopic } from "@/lib/linkedin-pipeline/topic-picker";

/** Instructions for the Cursor agent — no separate OpenAI API call. */
export const LINKEDIN_SCRIPT_INSTRUCTIONS = `You write short LinkedIn video scripts for Blue Lightning Services (BLS), a managed Salesforce engineering partner.

Goal: attract potential clients — VP Sales, RevOps leaders, Salesforce admins, and IT directors who need help with their Salesforce org or dev setup.

${REDACTION_SYSTEM_HINT}

Each video covers exactly ONE pain point — never two. Do not list problems, stack examples, or mention unrelated issues (e.g. if the topic is CI/CD, do not also mention sandboxes, Lightning pages, or org debt).

Pick one pain → one consequence → one way BLS helps → CTA. If you catch yourself saying "and also" or listing three things, cut until only one remains.

Script structure (30 seconds, ~65-85 words at ~150 wpm):
1. Intro (3s) — one natural line: "I'm {name} from Blue Lightning Services." Use the presenter first name once only.
2. Hook (5s) — one sharp pain point
3. Consequence (8s) — what it costs them (one beat, not a list)
4. Help (10s) — one specific thing BLS does for that pain only
5. CTA (4s) — bluelightningservices.com

Tone: direct, expert, confident but not salesy. Write for the ear — short sentences, contractions OK.`;

export const LINKEDIN_COMPANY_POST_INSTRUCTIONS = `Also write a LinkedIn company-page post to accompany the native video upload (not a link post).

Voice: formal, professional, third-person company voice ("Blue Lightning Services", "At Blue Lightning Services", "our client portal"). No "I'm {presenter}" — the video carries the personal intro.

Structure:
1. Opening line — formal statement of the single pain point (may be bold-worthy on LinkedIn)
2. Consequence — one paragraph on what it costs mid-market revenue teams or leadership
3. Solution — one paragraph on how BLS addresses that pain only (match the video topic)
4. CTA — "Learn more: bluelightningservices.com{pagePath}" (use the topic pagePath, e.g. /portal)
5. Hashtags on their own line: #Salesforce #RevOps #SalesforceAdmin #ManagedServices

Keep the same single pain point as the video. No client names, ticket keys, or internal details.`;

export function buildScriptPrompt(
  topic: SelectedTopic,
  redactedBody: string,
  presenter: Presenter
): string {
  return `${LINKEDIN_SCRIPT_INSTRUCTIONS}

${LINKEDIN_COMPANY_POST_INSTRUCTIONS}

Presenter for this video: ${presenter.name} (id: ${presenter.id})
Open the spoken script with: "I'm ${presenter.name} from Blue Lightning Services."

---

Source: ${topic.sourceType}
Topic: ${topic.topicTitle}
Page path for CTA: ${topic.pagePath}

Content:
${redactedBody}

---

Return JSON only with this shape:
{
  "script": "spoken script, 65-85 words, one pain point only, opens with presenter intro",
  "company_post": "formal LinkedIn company-page post with line breaks, CTA to bluelightningservices.com${topic.pagePath}, and hashtags",
  "presenter": { "id": "${presenter.id}", "name": "${presenter.name}" }
}`;
}
