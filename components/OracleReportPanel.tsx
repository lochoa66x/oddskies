"use client";

import { useEffect, useState } from "react";
import { getOracleSourceMode, type OracleApiResponse } from "@/lib/oracle";
import type { Report } from "@/lib/reports";

type OracleState =
  | { status: "idle" }
  | { status: "loading" }
  | { message: string; status: "error" }
  | { response: OracleApiResponse; status: "loaded" };

export function OracleReportPanel({ report }: { report: Report }) {
  const [state, setState] = useState<OracleState>({ status: "idle" });

  useEffect(() => {
    setState({ status: "idle" });
  }, [report.id]);

  async function askOracle() {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/oracle/report", {
        body: JSON.stringify({ report_id: report.id }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as
        | OracleApiResponse
        | { error?: string };

      if (!response.ok || !("reading" in payload)) {
        setState({
          message: getOracleError(payload),
          status: "error",
        });
        return;
      }

      setState({ response: payload, status: "loaded" });
    } catch {
      setState({
        message: "The Oracle signal dropped. Try again after the static clears.",
        status: "error",
      });
    }
  }

  const response = state.status === "loaded" ? state.response : null;
  const reading = response?.reading;
  const sourceMode = getOracleSourceMode(report);

  return (
    <div className="rounded-lg border border-signal-violet/25 bg-night-950/70 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-signal-violet">
            OddSkies Oracle / Alpha
          </p>
          <p className="mt-1 text-sm font-semibold text-parchment">
            Report-based reality check
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <span className="rounded-md border border-signal-violet/25 bg-signal-violet/10 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-signal-violet">
            {sourceMode}
          </span>
          {response ? (
            <span className="rounded-md border border-night-800 bg-night-900 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted">
              {getOracleStatusLabel(response.status)}
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-muted">
        Think it&apos;s real? Ask our little bro for possible normal
        explanations, weird clues, and a maybe-weird verdict. It cannot verify
        anything.
      </p>
      <p className="mt-1 text-[0.7rem] leading-4 text-muted/80">
        Reading this as a {sourceMode.toLowerCase()}. The map may be snacking
        on rough data.
      </p>

      <button
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-signal-violet/40 bg-signal-violet/15 px-3 py-2 text-sm font-semibold text-parchment transition hover:border-signal-violet/70 hover:bg-signal-violet/25 disabled:cursor-wait disabled:opacity-70"
        disabled={state.status === "loading"}
        onClick={askOracle}
        type="button"
      >
        {state.status === "loading" ? "Oracle is reading..." : "Ask the Oracle"}
      </button>

      {state.status === "error" ? (
        <p className="mt-3 rounded-md border border-signal-ember/30 bg-signal-ember/10 px-3 py-2 text-xs leading-5 text-signal-ember">
          {state.message}
        </p>
      ) : null}

      {reading ? (
        <div className="mt-4 space-y-3">
          <div className="relative overflow-hidden rounded-lg border border-signal-violet/40 bg-[radial-gradient(circle_at_18%_0%,rgba(139,92,246,0.22),transparent_34%),linear-gradient(135deg,rgba(16,21,34,0.98),rgba(8,11,20,0.98))] p-4 shadow-[0_0_42px_rgba(139,92,246,0.16)]">
            <div className="pointer-events-none absolute -right-12 -top-16 size-44 rounded-full bg-signal-violet/10 blur-3xl" />
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-signal-violet">
                  The Oracle says
                </p>
                <p className="mt-1 text-base font-semibold leading-6 text-parchment">
                  {reading.headline}
                </p>
              </div>
              <span className="rounded-md border border-signal-amber/30 bg-signal-amber/10 px-2 py-1 text-xs font-bold text-signal-amber">
                {getOracleVerdictLabel(reading.verdict)}
              </span>
            </div>
            <p className="relative mt-4 border-l-2 border-signal-violet/60 pl-4 text-base font-semibold leading-7 text-parchment md:text-lg md:leading-8">
              {reading.fieldNote}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-night-800" />
            <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">
              Supporting signals
            </span>
            <span className="h-px flex-1 bg-night-800" />
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <OracleList
              items={reading.normalExplanations}
              title="Possible normal"
            />
            <OracleList items={reading.weirdClues} title="Weird clues" />
            <OracleList
              items={reading.missingContext}
              title="Missing context"
            />
            <div className="rounded-md border border-night-800 bg-night-900/50 p-2.5">
              <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
                Next step
              </p>
              <p className="mt-2 text-[0.78rem] leading-5 text-muted">
                {reading.nextStep}
              </p>
            </div>
          </div>

          <p className="rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
            {reading.safetyNote}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function getOracleError(payload: OracleApiResponse | { error?: string }) {
  if ("error" in payload && payload.error) {
    return payload.error;
  }

  return "The Oracle blinked twice and refused to parse the sky.";
}

function getOracleStatusLabel(status: OracleApiResponse["status"]) {
  if (status === "sleeping") {
    return "Oracle sleeping";
  }

  if (status === "cached") {
    return "Cached read";
  }

  if (status === "fallback") {
    return "Fallback read";
  }

  return "Oracle read";
}

function getOracleVerdictLabel(verdict: OracleApiResponse["reading"]["verdict"]) {
  const labels: Record<OracleApiResponse["reading"]["verdict"], string> = {
    "Mildly Odd": "Mildly odd",
    "Needs More Witnesses": "Needs more witnesses",
    "Probably Normal": "Probably normal",
    "Sky Is Being Dramatic": "Sky is being dramatic",
    "Suspiciously Interesting": "Suspiciously interesting",
  };

  return labels[verdict];
}

function OracleList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-md border border-night-800 bg-night-900/50 p-2.5">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li
            className="flex gap-2 text-[0.78rem] leading-5 text-muted"
            key={item}
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal-teal/80" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
