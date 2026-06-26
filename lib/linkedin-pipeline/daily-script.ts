import type { Presenter } from "@/lib/linkedin-pipeline/presenters";

export type DailyScriptOutput = {
  script: string;
  company_post: string;
  presenter: Presenter;
  topic: {
    sourceType: string;
    sourceRef: string;
    topicTitle: string;
    pagePath: string;
  };
};
