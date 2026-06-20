import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const embeddingModel = openai.embedding("text-embedding-3-small");

export async function generateEmbedding(value: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: value.replaceAll("\n", " ").trim(),
  });
  return embedding;
}

export async function generateEmbeddings(
  values: string[]
): Promise<number[][]> {
  if (values.length === 0) return [];

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: values.map((v) => v.replaceAll("\n", " ").trim()),
  });

  return embeddings;
}
