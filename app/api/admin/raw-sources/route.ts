import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionCookie } from "@/lib/admin-auth";
import { listRawSources } from "@/lib/admin-raw-sources";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const rows = await listRawSources({
      categoryGuess: searchParams.get("categoryGuess") ?? undefined,
      curationLabel: searchParams.get("curationLabel") ?? undefined,
      hasLocationHint: searchParams.get("hasLocationHint") ?? undefined,
      limit: Number(searchParams.get("limit") ?? 50),
      platform: searchParams.get("platform") ?? undefined,
      possibleAiGenerated: searchParams.get("possibleAiGenerated") ?? undefined,
      possibleJoke: searchParams.get("possibleJoke") ?? undefined,
      possiblePrivateLocation:
        searchParams.get("possiblePrivateLocation") ?? undefined,
      searchQuery: searchParams.get("searchQuery") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

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
