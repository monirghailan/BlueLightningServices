const DEFAULT_MAX_TURNS = 10;

export function trimChatMessages<T extends { role: string }>(
  messages: T[],
  maxTurns = DEFAULT_MAX_TURNS
): T[] {
  const maxMessages = maxTurns * 2;
  if (messages.length <= maxMessages) {
    return messages;
  }

  return messages.slice(-maxMessages);
}
