/**
 * Pick today's topic and write a prompt bundle for the Cursor agent to write the script.
 * HeyGen, posting, etc. are manual — Cursor writes script + post copy from the prompt.
 *
 * Usage:
 *   npm run linkedin:prepare-script
 *   # Then in Cursor chat: "Write today's LinkedIn script from .daily-topic.json"
 *   npm run linkedin:prepare-script -- --record   # after you publish
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { loadEnvLocal } from "./env";

function readPublishedTopic():
  | { sourceType: string; sourceRef: string; topicTitle: string }
  | null {
  const scriptPath = "scripts/linkedin-pipeline/.daily-script.json";
  if (!existsSync(scriptPath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(scriptPath, "utf8")) as {
      topic?: { sourceType?: string; sourceRef?: string; topicTitle?: string };
    };
    if (parsed.topic?.sourceType && parsed.topic?.sourceRef) {
      return {
        sourceType: parsed.topic.sourceType,
        sourceRef: parsed.topic.sourceRef,
        topicTitle: parsed.topic.topicTitle ?? parsed.topic.sourceRef,
      };
    }
  } catch {
    // fall through to topic picker
  }
  return null;
}

async function main() {
  loadEnvLocal();

  const outPath = "scripts/linkedin-pipeline/.daily-topic.json";
  const shouldRecord = process.argv.includes("--record");

  const { pickDailyTopic } = await import("@/lib/linkedin-pipeline/topic-picker");
  const { redactSensitivePatterns } = await import("@/lib/linkedin-pipeline/redact");
  const {
    buildScriptPrompt,
    LINKEDIN_SCRIPT_INSTRUCTIONS,
    LINKEDIN_COMPANY_POST_INSTRUCTIONS,
  } = await import("@/lib/linkedin-pipeline/script-prompt");
  const { pickPresenterForDate } = await import(
    "@/lib/linkedin-pipeline/presenters"
  );
  const { recordUsedSource } = await import(
    "@/lib/linkedin-pipeline/used-sources"
  );

  if (shouldRecord) {
    const published = readPublishedTopic();
    if (published) {
      recordUsedSource(published.sourceType, published.sourceRef);
      console.log(`Recorded topic as used: ${published.topicTitle}`);
      return;
    }

    const topic = await pickDailyTopic();
    recordUsedSource(topic.sourceType, topic.sourceRef);
    console.log(`Recorded topic as used: ${topic.sourceRef}`);
    console.log(
      "(Tip: save .daily-script.json before --record to lock the published topic.)"
    );
    return;
  }

  const topic = await pickDailyTopic();
  const presenter = pickPresenterForDate();
  const redactedBody = redactSensitivePatterns(topic.promptBody).text;
  const scriptPrompt = buildScriptPrompt(topic, redactedBody, presenter);

  const result = {
    presenter,
    topic: {
      sourceType: topic.sourceType,
      sourceRef: topic.sourceRef,
      topicTitle: topic.topicTitle,
      pagePath: topic.pagePath,
    },
    redactedBody,
    instructions: LINKEDIN_SCRIPT_INSTRUCTIONS,
    companyPostInstructions: LINKEDIN_COMPANY_POST_INSTRUCTIONS,
    scriptPrompt,
    outputTemplate: {
      script: "<65-85 word spoken script with presenter intro>",
      company_post:
        "<formal LinkedIn company-page post with CTA to bluelightningservices.com{pagePath}>",
      presenter,
      topic: {
        sourceType: topic.sourceType,
        sourceRef: topic.sourceRef,
        topicTitle: topic.topicTitle,
        pagePath: topic.pagePath,
      },
    },
  };

  writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");

  console.log(`Topic: ${topic.topicTitle}`);
  console.log(`Presenter: ${presenter.name}`);
  console.log(`Wrote ${outPath}\n`);
  console.log("Next step — ask Cursor:");
  console.log('  "Write today\'s LinkedIn script from scripts/linkedin-pipeline/.daily-topic.json"');
  console.log("\nCursor will return JSON with script + company_post. Save it as:");
  console.log("  scripts/linkedin-pipeline/.daily-script.json");
  console.log("\nAfter you publish:");
  console.log("  npm run linkedin:prepare-script -- --record");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
