import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookie } from "@/lib/admin-auth";
import {
  collectFediverseFromEnv,
  type FediverseCollectorOptions,
} from "@/lib/collectors/fediverse";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      dryRun?: boolean;
      limit?: number;
      sources?: FediverseCollectorOptions["sources"];
    };
    const summary = await collectFediverseFromEnv({
      dryRun: body.dryRun ?? true,
      limit: clampLimit(body.limit),
      logRun: true,
      mode: "admin",
      postProcessInserted: true,
      sources: cleanSources(body.sources),
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

function cleanSources(sources: FediverseCollectorOptions["sources"]) {
  if (!Array.isArray(sources)) {
    return undefined;
  }

  return sources.slice(0, 5);
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
