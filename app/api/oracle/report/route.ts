import { NextRequest, NextResponse } from "next/server";
import {
  ORACLE_JSON_SCHEMA,
  ORACLE_PROMPT_VERSION,
  ORACLE_SYSTEM_PROMPT,
  buildOracleUserInput,
  getFallbackOracleReading,
  getSleepingOracleReading,
  sanitizeOracleReading,
} from "@/lib/oracle";
import { getCachedOracleReading, saveOracleReading } from "@/lib/oracle-cache";
import { getHomepageDisplayReports, getReports } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request);

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const reportId = body.value.report_id;

  if (typeof reportId !== "string" || reportId.trim().length === 0) {
    return NextResponse.json(
      { error: "A public report id is required." },
      { status: 400 },
    );
  }

  const reports = await getReports();
  const publicReports = getHomepageDisplayReports(reports);
  const report =
    publicReports.find((item) => item.id === reportId) ??
    reports.find((item) => item.id === reportId && item.isDemo);

  if (!report) {
    return NextResponse.json(
      { error: "The Oracle can only read public Field Log reports right now." },
      { status: 404 },
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
  const cached = await getCachedOracleReading(report, model);

  if (cached) {
    return NextResponse.json({
      cachedAt: cached.cachedAt,
      model: cached.model,
      promptVersion: cached.promptVersion,
      reading: cached.reading,
      reportId: report.id,
      status: cached.status,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      model: null,
      promptVersion: ORACLE_PROMPT_VERSION,
      reading: getSleepingOracleReading(report),
      reportId: report.id,
      status: "sleeping",
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      body: JSON.stringify({
        input: buildOracleUserInput(report),
        instructions: ORACLE_SYSTEM_PROMPT,
        max_output_tokens: 1000,
        model,
        store: false,
        text: {
          format: {
            name: "oddskies_oracle_reading",
            schema: ORACLE_JSON_SCHEMA,
            strict: true,
            type: "json_schema",
          },
        },
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      return NextResponse.json({
        model,
        promptVersion: ORACLE_PROMPT_VERSION,
        reading: getFallbackOracleReading(report),
        reportId: report.id,
        status: "fallback",
      });
    }

    const payload = (await response.json()) as unknown;
    const outputText = getResponseOutputText(payload);
    const parsed = outputText ? JSON.parse(outputText) : null;
    const reading = sanitizeOracleReading(parsed, report);

    await saveOracleReading(report, model, reading, "ready");

    return NextResponse.json({
      model,
      promptVersion: ORACLE_PROMPT_VERSION,
      reading,
      reportId: report.id,
      status: "ready",
    });
  } catch (error) {
    console.error("Oracle report request failed", formatError(error));

    return NextResponse.json({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
      promptVersion: ORACLE_PROMPT_VERSION,
      reading: getFallbackOracleReading(report),
      reportId: report.id,
      status: "fallback",
    });
  }
}

async function readRequestBody(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > 2048) {
    return { error: "Oracle request is too large.", ok: false as const };
  }

  try {
    return {
      ok: true as const,
      value: (await request.json()) as { report_id?: unknown },
    };
  } catch {
    return { error: "Oracle request must be JSON.", ok: false as const };
  }
}

function getResponseOutputText(payload: unknown) {
  if (!isRecord(payload)) {
    return "";
  }

  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }

  if (!Array.isArray(payload.output)) {
    return "";
  }

  for (const outputItem of payload.output) {
    if (!isRecord(outputItem) || !Array.isArray(outputItem.content)) {
      continue;
    }

    for (const contentItem of outputItem.content) {
      if (!isRecord(contentItem)) {
        continue;
      }

      if (typeof contentItem.text === "string") {
        return contentItem.text;
      }
    }
  }

  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
