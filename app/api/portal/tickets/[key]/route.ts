import { NextRequest, NextResponse } from "next/server";
import {
  portalErrorResponse,
  requirePortalAdmin,
} from "@/lib/portal/auth";
import { getTicketDetail } from "@/lib/portal/jira-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await requirePortalAdmin();
    const { key } = await params;

    const ticket = await getTicketDetail(session.organization, key);
    if (!ticket) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return portalErrorResponse(error);
  }
}
