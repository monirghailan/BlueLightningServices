export function estimateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateScriptLength(script: string): {
  ok: boolean;
  wordCount: number;
} {
  const wordCount = estimateWordCount(script);
  return { ok: wordCount >= 65 && wordCount <= 100, wordCount };
}
