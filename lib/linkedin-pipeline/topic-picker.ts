import { redactSensitivePatterns } from "@/lib/linkedin-pipeline/redact";
import {
  fetchRecentDoneJiraTopics,
  formatJiraTopicForPrompt,
  type JiraTopic,
} from "@/lib/linkedin-pipeline/jira-topics";
import {
  formatWebsiteTopicForPrompt,
  getWebsiteTopics,
  type WebsiteTopic,
} from "@/lib/linkedin-pipeline/topics";
import { wasSourceUsedRecently } from "@/lib/linkedin-pipeline/used-sources";

const DEDUP_DAYS = 30;

export type SelectedTopic =
  | {
      sourceType: "website";
      sourceRef: string;
      topicTitle: string;
      promptBody: string;
      pagePath: string;
      topic: WebsiteTopic;
    }
  | {
      sourceType: "jira";
      sourceRef: string;
      topicTitle: string;
      promptBody: string;
      pagePath: string;
      topic: JiraTopic;
    };

export async function pickDailyTopic(): Promise<SelectedTopic> {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const preferJira = dayOfYear % 2 === 0;

  if (preferJira) {
    const jiraTopic = await pickJiraTopic(DEDUP_DAYS);
    if (jiraTopic) return jiraTopic;
  }

  const websiteTopic = await pickWebsiteTopic(DEDUP_DAYS);
  if (websiteTopic) return websiteTopic;

  const jiraFallback = await pickJiraTopic(DEDUP_DAYS);
  if (jiraFallback) return jiraFallback;

  throw new Error("No eligible topics found for today's video.");
}

async function pickWebsiteTopic(
  dedupDays: number
): Promise<SelectedTopic | null> {
  const topics = getWebsiteTopics();
  const startIndex = new Date().getDate() % topics.length;

  for (let offset = 0; offset < topics.length; offset++) {
    const topic = topics[(startIndex + offset) % topics.length];
    const used = wasSourceUsedRecently("website", topic.id, dedupDays);
    if (used) continue;

    return {
      sourceType: "website",
      sourceRef: topic.id,
      topicTitle: topic.title,
      promptBody: formatWebsiteTopicForPrompt(topic),
      pagePath: topic.pagePath,
      topic,
    };
  }

  return null;
}

async function pickJiraTopic(dedupDays: number): Promise<SelectedTopic | null> {
  let jiraTopics: JiraTopic[];
  try {
    jiraTopics = await fetchRecentDoneJiraTopics(30);
  } catch {
    return null;
  }

  for (const topic of jiraTopics) {
    const used = wasSourceUsedRecently("jira", topic.key, dedupDays);
    if (used) continue;

    const redacted = redactSensitivePatterns(
      `${topic.title}\n${topic.body}`
    ).text;

    if (!redacted.trim()) continue;

    return {
      sourceType: "jira",
      sourceRef: topic.key,
      topicTitle: topic.title,
      promptBody: formatJiraTopicForPrompt({ ...topic, body: redacted }),
      pagePath: "/services",
      topic,
    };
  }

  return null;
}
