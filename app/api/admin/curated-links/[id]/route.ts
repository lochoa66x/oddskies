import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookie } from "@/lib/admin-auth";
import {
  type CuratedLinkInput,
  updateAdminCuratedLink,
} from "@/lib/admin-curated-links";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as CuratedLinkInput;
    const row = await updateAdminCuratedLink(id, body);

    return NextResponse.json({ row });
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
