const MAX_CHUNK_CHARS = 1200;
const MIN_CHUNK_CHARS = 80;

export function chunkMarkdown(content: string): string[] {
  const body = content.trim();
  if (!body) return [];

  const sections = body.split(/\n(?=#{1,3}\s)/);
  const chunks: string[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (trimmed.length < MIN_CHUNK_CHARS) continue;

    if (trimmed.length <= MAX_CHUNK_CHARS) {
      chunks.push(trimmed);
      continue;
    }

    const paragraphs = trimmed.split(/\n\n+/);
    let buffer = "";

    for (const paragraph of paragraphs) {
      const next = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      if (next.length > MAX_CHUNK_CHARS && buffer) {
        chunks.push(buffer.trim());
        buffer = paragraph;
      } else {
        buffer = next;
      }
    }

    if (buffer.trim().length >= MIN_CHUNK_CHARS) {
      chunks.push(buffer.trim());
    }
  }

  if (chunks.length === 0 && body.length >= MIN_CHUNK_CHARS) {
    return [body.slice(0, MAX_CHUNK_CHARS)];
  }

  return chunks;
}
