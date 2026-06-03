import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { listCollectorRuns } from "@/lib/collector-runs";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 5);
    const rows = await listCollectorRuns(limit);

    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 },
    );
  }
}

function isAuthorized(request: NextRequest) {
  return verifyAdminSessionCookie(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
