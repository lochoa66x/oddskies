import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookie } from "@/lib/admin-auth";
import {
  collectYoutubeFromEnv,
  type YoutubeCollectorOptions,
} from "@/lib/collectors/youtube";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      dryRun?: boolean;
      feeds?: YoutubeCollectorOptions["feeds"];
      limit?: number;
    };
    const summary = await collectYoutubeFromEnv({
      dryRun: body.dryRun ?? true,
      feeds: cleanFeeds(body.feeds),
      limit: clampLimit(body.limit),
      logRun: true,
      mode: "admin",
      postProcessInserted: true,
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

function cleanFeeds(feeds: YoutubeCollectorOptions["feeds"]) {
  if (!Array.isArray(feeds)) {
    return undefined;
  }

  return feeds.slice(0, 5);
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
