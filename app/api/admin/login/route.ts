import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSessionCookie,
  getAdminTokenMissingMessage,
  isAdminConfigured,
  verifyAdminToken,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: getAdminTokenMissingMessage() },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { token?: unknown };

  if (!verifyAdminToken(body.token)) {
    return NextResponse.json({ error: "Invalid admin token." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set(
    ADMIN_COOKIE_NAME,
    createAdminSessionCookie(),
    adminCookieOptions(),
  );

  return response;
}
