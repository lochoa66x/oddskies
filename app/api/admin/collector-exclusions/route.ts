import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookie } from "@/lib/admin-auth";
import {
  createCollectorExclusion,
  listCollectorExclusions,
  type CollectorExclusionInput,
} from "@/lib/admin-raw-sources";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const rows = await listCollectorExclusions();

    return NextResponse.json({ rows });
  } catch (error) {
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as CollectorExclusionInput;
    const row = await createCollectorExclusion(body);

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
