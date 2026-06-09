"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  getOracleSourceMode,
  type OracleApiResponse,
  type OracleReading,
} from "@/lib/oracle";
import type { Report } from "@/lib/reports";

type OracleState =
  | { status: "idle" }
  | { status: "loading" }
  | { message: string; status: "error" }
  | { response: OracleApiResponse; status: "loaded" };

type ShareAction = "card" | "caption" | "full" | "link" | "native" | "summary";

export function OracleReportPanel({ report }: { report: Report }) {
  const [state, setState] = useState<OracleState>({ status: "idle" });
  const [shareStatus, setShareStatus] = useState<ShareAction | null>(null);

  useEffect(() => {
    setState({ status: "idle" });
    setShareStatus(null);
  }, [report.id]);

  async function askOracle() {
    setState({ status: "loading" });
    setShareStatus(null);

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

  function getOracleLink() {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.href.split("#")[0]}#oracle-read`;
  }

  function markShareStatus(action: ShareAction) {
    setShareStatus(action);
    window.setTimeout(() => setShareStatus(null), 1800);
  }

  async function copyOracleText(action: ShareAction, text: string) {
    if (!text) {
      return;
    }

    try {
      await writeClipboardText(text);
      markShareStatus(action);
    } catch {
      setShareStatus(null);
    }
  }

  async function copySummary() {
    if (!reading) {
      return;
    }

    await copyOracleText(
      "summary",
      buildOracleSummaryText(reading, getOracleLink()),
    );
  }

  async function copyFullRead() {
    if (!reading) {
      return;
    }

    await copyOracleText(
      "full",
      buildOracleFullText(report, reading, getOracleLink()),
    );
  }

  async function copyCaption() {
    if (!reading) {
      return;
    }

    await copyOracleText(
      "caption",
      buildOracleCaptionText(reading, getOracleLink()),
    );
  }

  async function copyLink() {
    await copyOracleText("link", getOracleLink());
  }

  async function shareOraclePerspective() {
    if (!reading) {
      return;
    }

    const url = getOracleLink();

    if (typeof navigator.share !== "function") {
      await copyOracleText("native", buildOracleCaptionText(reading, url));
      return;
    }

    try {
      await navigator.share({
        text: reading.shareableSummary,
        title: `OddSkies Oracle: ${reading.headline}`,
        url: url || undefined,
      });
      markShareStatus("native");
    } catch {
      setShareStatus(null);
    }
  }

  async function downloadShareCard() {
    if (!reading) {
      return;
    }

    const blob = await createOracleCardBlob(report, reading);

    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${slugifyDownloadName(
      report.shortLabel || report.title || report.id,
    )}-oracle-card.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    markShareStatus("card");
  }

  const response = state.status === "loaded" ? state.response : null;
  const reading = response?.reading;
  const sourceMode = getOracleSourceMode(report);

  return (
    <div
      className="rounded-lg border border-signal-violet/25 bg-night-950/70 p-3.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]"
      id="oracle-read"
    >
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

      <div className="mt-2 rounded-md border border-night-800 bg-night-900/45 px-3 py-2">
        <p className="text-xs leading-5 text-muted">
          Think it&apos;s real? Ask our little bro for normal explanations,
          weird clues, missing pieces, and a maybe-weird read.
        </p>
        <p className="mt-1 text-[0.7rem] leading-4 text-signal-amber">
          OddSkies has not verified this report. The Oracle is a playful
          reality check, not confirmation.
        </p>
      </div>
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
          <OracleReadState response={response} />

          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_11rem]">
            <div className="rounded-md border border-night-800 bg-night-900/55 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  Share Oracle Perspective
                </p>
                <button
                  className="rounded-md border border-signal-violet/30 bg-signal-violet/10 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-signal-violet transition hover:border-signal-violet/60 hover:bg-signal-violet/20"
                  onClick={shareOraclePerspective}
                  type="button"
                >
                  {shareStatus === "native" ? "Shared" : "Share"}
                </button>
              </div>
              <p className="mt-2 text-[0.8rem] leading-5 text-parchment">
                {reading.shareableSummary}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <ShareButton
                  active={shareStatus === "summary"}
                  label="Summary"
                  onClick={copySummary}
                />
                <ShareButton
                  active={shareStatus === "full"}
                  label="Full read"
                  onClick={copyFullRead}
                />
                <ShareButton
                  active={shareStatus === "caption"}
                  label="Caption"
                  onClick={copyCaption}
                />
                <ShareButton
                  active={shareStatus === "link"}
                  label="Link"
                  onClick={copyLink}
                />
                <ShareButton
                  active={shareStatus === "card"}
                  label="Card PNG"
                  onClick={downloadShareCard}
                />
              </div>
              <p
                aria-live="polite"
                className="mt-2 text-[0.68rem] leading-4 text-muted"
              >
                {shareStatus
                  ? getShareStatusText(shareStatus)
                  : "Copy includes this Oracle link when your browser allows it."}
              </p>
            </div>
            <MaybeWeirdMeter score={reading.maybeWeirdScore} />
          </div>

          <OracleShareCard reading={reading} report={report} />

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

          <div className="grid gap-3 lg:grid-cols-2">
            <OracleSupportGroup
              eyebrow="Normal lanes first"
              note="Ordinary explanations stay at the front of the line."
            >
              <OracleList
                items={reading.normalExplanations}
                title="Possible boring explanations"
              />
              <OracleTextCard text={reading.sourceCheck} title="Source check" />
            </OracleSupportGroup>
            <OracleSupportGroup
              eyebrow="Still worth checking"
              note="Clues are inspection hooks, not evidence."
            >
              <OracleList
                items={reading.weirdClues}
                title="Weird little clues"
              />
              <OracleList
                items={reading.missingContext}
                title="Missing pieces"
              />
              <OracleTextCard text={reading.nextStep} title="Next step" />
            </OracleSupportGroup>
          </div>

          <OracleSafetyNote note={reading.safetyNote} />
        </div>
      ) : null}
    </div>
  );
}

function ShareButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex min-h-9 items-center justify-center rounded-md border border-night-800 bg-night-950 px-2 py-1.5 text-[0.68rem] font-semibold text-muted transition hover:border-signal-violet/50 hover:text-parchment"
      onClick={onClick}
      type="button"
    >
      {active ? "Copied" : label}
    </button>
  );
}

function OracleShareCard({
  reading,
  report,
}: {
  reading: OracleReading;
  report: Report;
}) {
  const safeScore = getSafeMaybeWeirdScore(reading.maybeWeirdScore);

  return (
    <div className="rounded-lg border border-night-800 bg-night-950/45 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Share card preview
        </p>
        <span className="rounded-md border border-signal-amber/25 bg-signal-amber/10 px-2 py-1 text-[0.66rem] font-bold text-signal-amber">
          {getOracleVerdictLabel(reading.verdict)}
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-signal-violet/35 bg-[radial-gradient(circle_at_16%_8%,rgba(72,224,194,0.16),transparent_30%),linear-gradient(135deg,rgba(31,25,58,0.94),rgba(8,11,20,0.98))] p-4 shadow-[0_0_34px_rgba(139,92,246,0.12)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-signal-violet">
              OddSkies Oracle
            </p>
            <h3 className="mt-2 text-xl font-black leading-7 text-parchment">
              {reading.headline}
            </h3>
          </div>
          <div className="min-w-[6rem]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-signal-amber">
                Maybe-weird
              </span>
              <span className="text-sm font-black text-signal-amber">
                {safeScore}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-night-950">
              <div
                className="h-full rounded-full bg-gradient-to-r from-signal-teal via-signal-amber to-signal-ember"
                style={{ width: `${safeScore}%` }}
              />
            </div>
          </div>
        </div>
        <p className="mt-4 border-l-2 border-signal-violet/70 pl-3 text-base font-semibold leading-7 text-parchment">
          &quot;{reading.shareQuote}&quot;
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-night-800 pt-3 text-[0.68rem] leading-4 text-muted">
          <span>{report.shortLabel || report.title}</span>
          <span>Reality check, not truth machine.</span>
        </div>
      </div>
    </div>
  );
}

function OracleSafetyNote({ note }: { note: string }) {
  const required =
    "OddSkies has not verified this report. This Oracle read is a playful reality check, not confirmation.";
  const extra = note
    .replace(/OddSkies cannot verify this report\.?/i, "")
    .replace(/OddSkies has not verified this report\.?/i, "")
    .replace(/This (?:Oracle read|is) (?:a )?playful reality check,? not confirmation\.?/i, "")
    .trim();

  return (
    <p className="rounded-md border border-signal-amber/25 bg-signal-amber/10 px-3 py-2 text-xs leading-5 text-signal-amber">
      {required}
      {extra ? ` ${extra}` : ""}
    </p>
  );
}

function OracleReadState({ response }: { response: OracleApiResponse | null }) {
  if (!response) {
    return null;
  }

  const text = getOracleReadStateText(response);

  return (
    <div className="rounded-md border border-night-800 bg-night-900/40 px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-muted">
          Read state
        </p>
        <span className="rounded-md border border-night-800 bg-night-950 px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-muted">
          {getOracleStatusLabel(response.status)}
        </span>
      </div>
      <p className="mt-2 text-[0.72rem] leading-5 text-muted">{text}</p>
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

function getOracleReadStateText(response: OracleApiResponse) {
  if (response.status === "cached") {
    return response.cachedAt
      ? `Showing the latest cached Oracle read from ${formatOracleDate(
          response.cachedAt,
        )}. Same report, same prompt, same little lantern.`
      : "Showing the latest cached Oracle read for this report.";
  }

  if (response.status === "fallback") {
    return "The live Oracle caught static, so this is a local fallback read. Useful, cautious, and not pretending to be fresh magic.";
  }

  if (response.status === "sleeping") {
    return "The Oracle is asleep, so OddSkies is showing a careful local read until the fog clears.";
  }

  return "Fresh Oracle read for this public case file.";
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

function buildOracleSummaryText(reading: OracleReading, url: string) {
  return [reading.shareableSummary, url].filter(Boolean).join("\n");
}

function buildOracleCaptionText(reading: OracleReading, url: string) {
  const safeScore = getSafeMaybeWeirdScore(reading.maybeWeirdScore);

  return [
    `The Oracle says: ${reading.headline}`,
    `Verdict: ${getOracleVerdictLabel(reading.verdict)} | Maybe-weird: ${safeScore}/100`,
    `"${reading.shareQuote}"`,
    "Still unverified. Reality check, not truth machine.",
    url,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildOracleFullText(
  report: Report,
  reading: OracleReading,
  url: string,
) {
  const safeScore = getSafeMaybeWeirdScore(reading.maybeWeirdScore);

  return [
    "OddSkies Oracle perspective",
    report.title,
    "",
    `Headline: ${reading.headline}`,
    `Verdict: ${getOracleVerdictLabel(reading.verdict)}`,
    `Maybe-weird: ${safeScore}/100 (curiosity meter, not evidence)`,
    "",
    `The Oracle says: ${reading.fieldNote}`,
    "",
    `Oracle quote: "${reading.shareQuote}"`,
    "",
    `Source check: ${reading.sourceCheck}`,
    `Next step: ${reading.nextStep}`,
    "",
    "OddSkies has not verified this report. This Oracle read is a playful reality check, not confirmation.",
    url,
  ]
    .filter((line) => line !== undefined && line !== null)
    .join("\n");
}

function getShareStatusText(action: ShareAction) {
  if (action === "card") {
    return "Oracle card downloaded.";
  }

  if (action === "native") {
    return "Oracle perspective shared.";
  }

  return "Copied to clipboard.";
}

async function writeClipboardText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back to a temporary textarea below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}

function OracleSupportGroup({
  children,
  eyebrow,
  note,
}: {
  children: ReactNode;
  eyebrow: string;
  note: string;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-night-800 bg-night-950/35 p-2.5">
      <div className="px-1">
        <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-signal-teal">
          {eyebrow}
        </p>
        <p className="mt-1 text-[0.72rem] leading-5 text-muted">{note}</p>
      </div>
      {children}
    </div>
  );
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
  const safeScore = getSafeMaybeWeirdScore(score);

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

function getSafeMaybeWeirdScore(score: number) {
  return Math.min(Math.max(Math.round(score), 0), 100);
}

async function createOracleCardBlob(report: Report, reading: OracleReading) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const safeScore = getSafeMaybeWeirdScore(reading.maybeWeirdScore);
  const verdict = getOracleVerdictLabel(reading.verdict);
  const label = report.shortLabel || report.title;

  context.fillStyle = "#080b14";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const glow = context.createRadialGradient(190, 80, 0, 190, 80, 520);
  glow.addColorStop(0, "rgba(72,224,194,0.24)");
  glow.addColorStop(0.48, "rgba(139,92,246,0.12)");
  glow.addColorStop(1, "rgba(8,11,20,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const panelGradient = context.createLinearGradient(90, 78, 1110, 552);
  panelGradient.addColorStop(0, "#1f193a");
  panelGradient.addColorStop(0.54, "#101522");
  panelGradient.addColorStop(1, "#080b14");
  drawRoundRect(context, 70, 62, 1060, 506, 28);
  context.fillStyle = panelGradient;
  context.fill();
  context.strokeStyle = "rgba(139,92,246,0.62)";
  context.lineWidth = 3;
  context.stroke();

  context.font = "700 26px Arial, sans-serif";
  context.fillStyle = "#8b5cf6";
  context.fillText("ODDSKIES ORACLE", 112, 124);

  context.font = "700 24px Arial, sans-serif";
  const chipWidth = Math.min(context.measureText(verdict).width + 42, 330);
  drawRoundRect(context, 1068 - chipWidth, 92, chipWidth, 48, 12);
  context.fillStyle = "rgba(246,180,75,0.12)";
  context.fill();
  context.strokeStyle = "rgba(246,180,75,0.52)";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#f6b44b";
  context.fillText(verdict, 1088 - chipWidth, 124);

  context.font = "900 54px Arial, sans-serif";
  context.fillStyle = "#f5efe4";
  const afterHeadlineY = drawWrappedText(
    context,
    reading.headline,
    112,
    202,
    920,
    64,
    2,
  );

  context.strokeStyle = "rgba(139,92,246,0.72)";
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(112, afterHeadlineY + 24);
  context.lineTo(112, afterHeadlineY + 170);
  context.stroke();

  context.font = "700 34px Arial, sans-serif";
  context.fillStyle = "#f5efe4";
  const afterQuoteY = drawWrappedText(
    context,
    `"${reading.shareQuote}"`,
    140,
    afterHeadlineY + 58,
    880,
    44,
    3,
  );

  context.font = "700 22px Arial, sans-serif";
  context.fillStyle = "#aab0c0";
  drawWrappedText(
    context,
    reading.shareableSummary,
    112,
    Math.min(afterQuoteY + 42, 452),
    880,
    30,
    2,
  );

  context.font = "700 22px Arial, sans-serif";
  context.fillStyle = "#f6b44b";
  context.fillText(`MAYBE-WEIRD ${safeScore}/100`, 112, 514);
  drawRoundRect(context, 380, 496, 354, 18, 9);
  context.fillStyle = "#080b14";
  context.fill();
  const meterGradient = context.createLinearGradient(380, 496, 734, 496);
  meterGradient.addColorStop(0, "#48e0c2");
  meterGradient.addColorStop(0.52, "#f6b44b");
  meterGradient.addColorStop(1, "#ff795f");
  drawRoundRect(context, 380, 496, 3.54 * safeScore, 18, 9);
  context.fillStyle = meterGradient;
  context.fill();

  context.font = "700 20px Arial, sans-serif";
  context.fillStyle = "#aab0c0";
  context.fillText("Curiosity meter, not evidence.", 758, 514);

  context.font = "700 20px Arial, sans-serif";
  context.fillStyle = "#48e0c2";
  context.fillText(label, 112, 552);
  context.fillStyle = "#aab0c0";
  context.fillText("Reality check, not truth machine.", 730, 552);

  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
  });
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (context.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;

    if (lines.length === maxLines) {
      break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  const clippedLines = lines.slice(0, maxLines);

  if (words.length > clippedLines.join(" ").split(/\s+/).length) {
    clippedLines[clippedLines.length - 1] = fitTextWithEllipsis(
      context,
      clippedLines[clippedLines.length - 1],
      maxWidth,
    );
  }

  clippedLines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return y + clippedLines.length * lineHeight;
}

function fitTextWithEllipsis(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  let clipped = text.replace(/[.,;:!?-]+$/, "").trimEnd();

  while (clipped && context.measureText(`${clipped}...`).width > maxWidth) {
    clipped = clipped.slice(0, -1).trimEnd();
  }

  return clipped ? `${clipped}...` : "...";
}

function drawRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function slugifyDownloadName(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 56) || "oddskies"
  );
}
