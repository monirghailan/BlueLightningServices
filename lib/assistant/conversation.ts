import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveAssistantConversation(
  supabase: SupabaseClient,
  params: {
    conversationId?: string;
    userId: string;
    organizationId: string;
    title: string;
  }
): Promise<string> {
  let conversationId = params.conversationId;

  if (conversationId) {
    const { data: existing } = await supabase
      .from("assistant_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", params.userId)
      .eq("organization_id", params.organizationId)
      .maybeSingle();

    if (!existing) {
      conversationId = undefined;
    }
  }

  if (conversationId) {
    return conversationId;
  }

  const { data: created, error } = await supabase
    .from("assistant_conversations")
    .insert({
      organization_id: params.organizationId,
      user_id: params.userId,
      title: params.title,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("Failed to start conversation.");
  }

  return created.id;
}
