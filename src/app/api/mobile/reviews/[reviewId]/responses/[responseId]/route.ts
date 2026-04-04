import { NextRequest, NextResponse } from "next/server";
import {
  authenticateMobile,
  requireMobileOrgMember,
  requireMobileOrgAdmin,
} from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishResponse, deletePublishedResponse } from "@/lib/google/publish";

type Params = { params: Promise<{ reviewId: string; responseId: string }> };

/**
 * PUT    — update response content or status (edit, approve, reject, submit, publish)
 * DELETE — discard a draft/rejected response
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { responseId } = await params;
  const body = await request.json();
  const action: string | undefined = body.action;

  const supabase = createAdminClient();

  const { data: response } = await supabase
    .from("responses")
    .select("id, status, organization_id, review_id")
    .eq("id", responseId)
    .single();

  if (!response) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  const memberCheck = await requireMobileOrgMember(
    session.userId,
    response.organization_id
  );
  if (memberCheck instanceof NextResponse) return memberCheck;

  switch (action) {
    case "edit": {
      const content: string | undefined = body.content;
      if (!content?.trim()) {
        return NextResponse.json({ error: "Content is required" }, { status: 400 });
      }
      if (response.status !== "draft") {
        return NextResponse.json(
          { error: "Only draft responses can be edited" },
          { status: 400 }
        );
      }
      await supabase
        .from("responses")
        .update({ content: content.trim(), updated_at: new Date().toISOString() })
        .eq("id", responseId);
      return NextResponse.json({ success: true });
    }

    case "submit": {
      if (response.status !== "draft") {
        return NextResponse.json(
          { error: "Only draft responses can be submitted" },
          { status: 400 }
        );
      }
      await supabase
        .from("responses")
        .update({
          status: "pending_approval",
          updated_at: new Date().toISOString(),
        })
        .eq("id", responseId);

      await supabase.from("audit_log").insert({
        organization_id: response.organization_id,
        user_id: session.userId,
        action: "response.submitted_for_approval",
        entity_type: "response",
        entity_id: responseId,
      });
      return NextResponse.json({ success: true });
    }

    case "approve": {
      const adminCheck = await requireMobileOrgAdmin(
        session.userId,
        response.organization_id
      );
      if (adminCheck instanceof NextResponse) return adminCheck;

      await supabase
        .from("responses")
        .update({
          status: "approved",
          approved_by: session.userId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", responseId);

      await supabase.from("audit_log").insert({
        organization_id: response.organization_id,
        user_id: session.userId,
        action: "response.approved",
        entity_type: "response",
        entity_id: responseId,
      });
      return NextResponse.json({ success: true });
    }

    case "reject": {
      const adminCheckR = await requireMobileOrgAdmin(
        session.userId,
        response.organization_id
      );
      if (adminCheckR instanceof NextResponse) return adminCheckR;

      await supabase
        .from("responses")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", responseId);

      await supabase.from("audit_log").insert({
        organization_id: response.organization_id,
        user_id: session.userId,
        action: "response.rejected",
        entity_type: "response",
        entity_id: responseId,
        metadata: body.note ? { note: body.note } : null,
      });
      return NextResponse.json({ success: true });
    }

    case "publish": {
      const result = await publishResponse(responseId, session.userId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    case "unpublish": {
      const result = await deletePublishedResponse(responseId, session.userId);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json(
        { error: "Invalid action. Use: edit, submit, approve, reject, publish, unpublish" },
        { status: 400 }
      );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { responseId } = await params;
  const supabase = createAdminClient();

  const { data: response } = await supabase
    .from("responses")
    .select("id, status, organization_id")
    .eq("id", responseId)
    .single();

  if (!response) {
    return NextResponse.json({ error: "Response not found" }, { status: 404 });
  }

  const memberCheck = await requireMobileOrgMember(
    session.userId,
    response.organization_id
  );
  if (memberCheck instanceof NextResponse) return memberCheck;

  if (!["draft", "rejected"].includes(response.status)) {
    return NextResponse.json(
      { error: "Cannot discard this response" },
      { status: 400 }
    );
  }

  await supabase.from("responses").delete().eq("id", responseId);

  await supabase.from("audit_log").insert({
    organization_id: response.organization_id,
    user_id: session.userId,
    action: "response.discarded",
    entity_type: "response",
    entity_id: responseId,
  });

  return NextResponse.json({ success: true });
}
