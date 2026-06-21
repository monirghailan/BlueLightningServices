import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedSupabase,
  portalErrorResponse,
  requirePortalSession,
} from "@/lib/portal/auth";
import { assistantMessageFeedbackSchema } from "@/lib/validations/portal";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePortalSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = assistantMessageFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid feedback." },
        { status: 400 }
      );
    }

    const supabase = await getAuthenticatedSupabase();

    const { data: message, error: fetchError } = await supabase
      .from("assistant_messages")
      .select("id, role, conversation_id")
      .eq("id", id)
      .eq("role", "assistant")
      .maybeSingle();

    if (fetchError) {
      console.error(fetchError);
      return NextResponse.json({ error: "Failed to load message." }, { status: 500 });
    }

    if (!message) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("assistant_conversations")
      .select("user_id, organization_id")
      .eq("id", message.conversation_id)
      .maybeSingle();

    if (conversationError) {
      console.error(conversationError);
      return NextResponse.json({ error: "Failed to load message." }, { status: 500 });
    }

    if (
      !conversation ||
      conversation.user_id !== session.userId ||
      conversation.organization_id !== session.organization.id
    ) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const feedbackAt = parsed.data.feedback ? new Date().toISOString() : null;

    const { data: updated, error: updateError } = await supabase
      .from("assistant_messages")
      .update({
        feedback: parsed.data.feedback,
        feedback_at: feedbackAt,
      })
      .eq("id", id)
      .select("id, feedback, feedback_at")
      .single();

    if (updateError || !updated) {
      console.error(updateError);
      return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      id: updated.id,
      feedback: updated.feedback,
      feedbackAt: updated.feedback_at,
    });
  } catch (error) {
    return portalErrorResponse(error);
  }
}
