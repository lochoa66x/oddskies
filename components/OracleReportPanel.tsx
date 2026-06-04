"use client";

import { useEffect, useState } from "react";
import type { OracleApiResponse } from "@/lib/oracle";
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
        {response ? (
          <span className="rounded-md border border-night-800 bg-night-900 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted">
            {response.status === "sleeping" ? "Oracle sleeping" : "Oracle read"}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-xs leading-5 text-muted">
        Think it&apos;s real? Ask our little bro for possible normal
        explanations, weird clues, and a maybe-weird verdict. It cannot verify
        anything.
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
        <div className="mt-3 space-y-3">
          <div className="rounded-md border border-night-800 bg-night-900/80 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-parchment">
                {reading.headline}
              </p>
              <span className="rounded-md border border-signal-amber/30 bg-signal-amber/10 px-2 py-1 text-xs font-bold text-signal-amber">
                {reading.verdict} · {reading.maybeWeirdScore}/100
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">
              {reading.fieldNote}
            </p>
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
            <div className="rounded-md border border-night-800 bg-night-900/60 p-3">
              <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
                Next step
              </p>
              <p className="mt-2 text-xs leading-5 text-parchment">
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

function OracleList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-md border border-night-800 bg-night-900/60 p-3">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li className="flex gap-2 text-xs leading-5 text-parchment" key={item}>
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal-teal" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
