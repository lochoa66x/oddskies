import { NextRequest, NextResponse } from "next/server";
import { collectBlueskyFromEnv } from "@/lib/collectors/bluesky";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (process.env.ODDSKIES_COLLECTOR_ENABLED !== "true") {
    return NextResponse.json(
      {
        error:
          "Collector is disabled. Set ODDSKIES_COLLECTOR_ENABLED=true to allow scheduled runs.",
      },
      { status: 403 },
    );
  }

  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const dryRun = request.nextUrl.searchParams.get("dryRun") === "true";
    const summary = await collectBlueskyFromEnv({
      dryRun,
      logRun: true,
      mode: "scheduled",
      postProcessInserted: true,
    });

    return NextResponse.json({
      message: dryRun
        ? "Scheduled Bluesky collector dry-run completed."
        : "Scheduled Bluesky collector completed. Rows remain staged in raw_sources.",
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatError(error) },
      { status: 500 },
    );
  }
}

function isAuthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.ODDSKIES_CRON_SECRET?.trim();

  if (!cronSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization") ?? "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const querySecret = request.nextUrl.searchParams.get("secret")?.trim() ?? "";

  return bearerToken === cronSecret || querySecret === cronSecret;
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
