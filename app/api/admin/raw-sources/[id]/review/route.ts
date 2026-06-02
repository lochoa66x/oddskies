import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { updateRawSourceReview } from "@/lib/admin-raw-sources";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      rejectionReason?: string;
      reviewNotes?: string;
      status?: string;
    };
    const result = await updateRawSourceReview({
      id,
      rejectionReason: body.rejectionReason,
      reviewNotes: body.reviewNotes,
      status: body.status ?? "",
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: formatError(error) },
      { status: 400 },
    );
  }
}

function isAuthorized(request: NextRequest) {
  return verifyAdminSessionCookie(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
