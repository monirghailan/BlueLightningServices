import type { UIMessage } from "ai";

export type AssistantMessageFeedback = "up" | "down";

export type AssistantChatMetadata = {
  dbMessageId?: string;
  feedback?: AssistantMessageFeedback | null;
};

export type AssistantChatMessage = UIMessage<AssistantChatMetadata>;
