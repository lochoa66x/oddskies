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
  const [copyStatus, setCopyStatus] = useState<"copied" | "idle">("idle");

  useEffect(() => {
    setState({ status: "idle" });
    setCopyStatus("idle");
  }, [report.id]);

  async function askOracle() {
    setState({ status: "loading" });
    setCopyStatus("idle");

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
        message: "The Oracle lost the signal. Try again after the static clears.",
        status: "error",
      });
    }
  }

  async function copySummary() {
    if (!reading?.shareableSummary) {
      return;
    }

    try {
      await navigator.clipboard.writeText(reading.shareableSummary);
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 1800);
    } catch {
      setCopyStatus("idle");
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
      {sourceMode === "Public report file" ? (
        <p className="mt-1 text-[0.7rem] leading-4 text-muted/80">
          Still unverified. The Oracle is a reality check, not a truth machine.
        </p>
      ) : (
        <p className="mt-1 text-[0.7rem] leading-4 text-muted/80">
          Reading this as a {sourceMode.toLowerCase()}. That label describes
          source context, not truth.
        </p>
      )}

      <button
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-signal-violet/40 bg-signal-violet/15 px-3 py-2 text-sm font-semibold text-parchment transition hover:border-signal-violet/70 hover:bg-signal-violet/25 disabled:cursor-wait disabled:opacity-70"
        disabled={state.status === "loading"}
        onClick={askOracle}
        type="button"
      >
        {state.status === "loading"
          ? "Oracle is checking the fog..."
          : "Ask the Oracle"}
      </button>

      {state.status === "error" ? (
        <p className="mt-3 rounded-md border border-signal-ember/30 bg-signal-ember/10 px-3 py-2 text-xs leading-5 text-signal-ember">
          {state.message}
        </p>
      ) : null}

      {reading ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_11rem]">
            <div className="rounded-md border border-night-800 bg-night-900/55 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  Pocket summary
                </p>
                <button
                  className="rounded-md border border-signal-violet/30 bg-signal-violet/10 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-signal-violet transition hover:border-signal-violet/60 hover:bg-signal-violet/20"
                  onClick={copySummary}
                  type="button"
                >
                  {copyStatus === "copied" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-2 text-[0.8rem] leading-5 text-parchment">
                {reading.shareableSummary}
              </p>
            </div>
            <MaybeWeirdMeter score={reading.maybeWeirdScore} />
          </div>

          {response?.cachedAt ? (
            <p className="rounded-md border border-night-800 bg-night-900/40 px-3 py-2 text-[0.72rem] leading-5 text-muted">
              Showing latest cached Oracle read from{" "}
              {formatOracleDate(response.cachedAt)}. Same report, same prompt,
              same little lantern.
            </p>
          ) : null}

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
            <p className="relative mt-4 text-xs leading-5 text-muted">
              {reading.oracleNote}
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
              title="Possible boring"
            />
            <OracleList items={reading.weirdClues} title="Weird little clues" />
            <OracleList
              items={reading.missingContext}
              title="Missing pieces"
            />
            <OracleTextCard text={reading.sourceCheck} title="Source check" />
            <OracleTextCard text={reading.nextStep} title="Next step" />
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

  return "The Oracle is staring into the fog and needs a moment.";
}

function getOracleStatusLabel(status: OracleApiResponse["status"]) {
  if (status === "sleeping") {
    return "Oracle sleeping";
  }

  if (status === "cached") {
    return "Latest cached read";
  }

  if (status === "fallback") {
    return "Static fallback";
  }

  return "Oracle read";
}

function getOracleVerdictLabel(verdict: OracleApiResponse["reading"]["verdict"]) {
  const labels: Record<OracleApiResponse["reading"]["verdict"], string> = {
    "Culture Note": "Culture note",
    "Mildly Odd": "Mildly odd",
    "Needs Another Witness": "Bring another witness",
    "Probably Normal": "Probably just Earth",
    "Reality Mostly Intact": "Reality mostly intact",
    "Sky Is Being Dramatic": "Sky being dramatic",
    "Source Trail Is Thin": "Trail needs breadcrumbs",
    "Suspiciously Interesting": "Suspiciously interesting",
  };

  return labels[verdict];
}

function OracleTextCard({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-md border border-night-800 bg-night-900/50 p-2.5">
      <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <p className="mt-2 text-[0.78rem] leading-5 text-muted">{text}</p>
    </div>
  );
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

function MaybeWeirdMeter({ score }: { score: number }) {
  const safeScore = Math.min(Math.max(Math.round(score), 0), 100);

  return (
    <div className="rounded-md border border-signal-amber/25 bg-signal-amber/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-signal-amber">
          Maybe-weird
        </p>
        <span className="text-sm font-black text-signal-amber">
          {safeScore}
        </span>
      </div>
      <div
        aria-label={`Maybe-weird meter ${safeScore} out of 100`}
        className="mt-3 h-2 overflow-hidden rounded-full border border-signal-amber/25 bg-night-950"
        role="meter"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={safeScore}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-signal-teal via-signal-amber to-signal-ember"
          style={{ width: `${safeScore}%` }}
        />
      </div>
      <p className="mt-2 text-[0.7rem] leading-4 text-muted">
        Curiosity meter, not evidence.
      </p>
    </div>
  );
}

function formatOracleDate(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "an earlier visit";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
