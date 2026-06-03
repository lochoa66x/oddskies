import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { collectBlueskyFromEnv } from "@/lib/collectors/bluesky";

export const runtime = "nodejs";

const DEFAULT_QUERY = "strange lights";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      dryRun?: boolean;
      limit?: number;
      query?: string;
      queries?: string[];
    };
    const queries = cleanQueries(body.queries ?? [body.query ?? DEFAULT_QUERY]);
    const summary = await collectBlueskyFromEnv({
      dryRun: body.dryRun ?? true,
      limit: clampLimit(body.limit),
      logRun: true,
      mode: "admin",
      postProcessInserted: true,
      queries,
    });

    return NextResponse.json(summary);
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

function cleanQueries(queries: string[]) {
  const cleaned = queries
    .map((query) => query.trim())
    .filter((query) => query.length > 0)
    .slice(0, 3);

  return cleaned.length > 0 ? cleaned : [DEFAULT_QUERY];
}

function clampLimit(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 3;
  }

  return Math.max(1, Math.min(10, Math.floor(numberValue)));
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
