import type { UIMessage } from "ai";

export type AssistantMessageFeedback = "up" | "down";

export type AssistantChatMetadata = {
  dbMessageId?: string;
  feedback?: AssistantMessageFeedback | null;
};

export type AssistantChatDataParts = {
  assistantStatus: {
    label: string;
  };
};

export type AssistantChatMessage = UIMessage<AssistantChatMetadata, AssistantChatDataParts>;

export const ASSISTANT_STATUS_LABELS = {
  searching: "Searching your org guide…",
  loadingSteps: "Loading step-by-step instructions…",
  drafting: "Drafting your answer…",
} as const;
