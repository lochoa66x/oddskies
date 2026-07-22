"use client";

import { FormEvent, useState } from "react";
import { trackOddSkiesEvent } from "@/lib/client-analytics";

const categories = [
  "",
  "UFO / UAP",
  "Strange Lights",
  "Haunted Places",
  "Paranormal",
  "Local Legends",
  "Mandela / Reality Weirdness",
  "Unknown",
];

const screenshotTypes = ["image/jpeg", "image/png", "image/webp"];
const maxScreenshotSize = 5 * 1024 * 1024;

type Result = {
  message: string;
  ok: boolean;
};

type SignalMode = "link" | "screenshot";

export function SendSignalForm() {
  const [mode, setMode] = useState<SignalMode>("link");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitterNote, setSubmitterNote] = useState("");
  const [categoryGuess, setCategoryGuess] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [eventTimeHint, setEventTimeHint] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [safety, setSafety] = useState(false);
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotSourceUrl, setScreenshotSourceUrl] = useState("");
  const [screenshotNote, setScreenshotNote] = useState("");
  const [screenshotCategory, setScreenshotCategory] = useState("");
  const [screenshotLocation, setScreenshotLocation] = useState("");
  const [screenshotEventTime, setScreenshotEventTime] = useState("");
  const [screenshotEmail, setScreenshotEmail] = useState("");
  const [screenshotConsent, setScreenshotConsent] = useState(false);
  const [screenshotSafety, setScreenshotSafety] = useState(false);
  const [screenshotCompany, setScreenshotCompany] = useState("");
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotResult, setScreenshotResult] = useState<Result | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    trackOddSkiesEvent("send_signal_started", { mode: "link" });

    try {
      const response = await fetch("/api/send-signal", {
        body: JSON.stringify({
          category_guess: categoryGuess,
          company,
          consent,
          contact_email: contactEmail,
          event_time_hint: eventTimeHint,
          location_hint: locationHint,
          safety,
          source_url: sourceUrl,
          submitter_note: submitterNote,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as Partial<Result>;

      const ok = Boolean(response.ok && payload.ok !== false);

      setResult({
        message:
          payload.message ??
          (response.ok
            ? "Signal received. It is waiting in the fog for review. If it fits OddSkies, it may appear later as an unverified Field Log entry."
            : "The signal got lost in the fog. Try again soon."),
        ok,
      });

      if (ok) {
        trackOddSkiesEvent("send_signal_submitted", {
          category: categoryGuess,
          mode: "link",
        });
        setSourceUrl("");
        setSubmitterNote("");
        setCategoryGuess("");
        setLocationHint("");
        setEventTimeHint("");
        setContactEmail("");
        setConsent(false);
        setSafety(false);
      } else {
        trackOddSkiesEvent("send_signal_failed", {
          mode: "link",
          reason: getSignalFailureReason(response.status),
        });
      }
    } catch {
      trackOddSkiesEvent("send_signal_failed", {
        mode: "link",
        reason: "network",
      });
      setResult({
        message: "The signal got lost in the fog. Try again soon.",
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleScreenshotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setScreenshotResult(null);
    trackOddSkiesEvent("send_signal_started", { mode: "screenshot" });

    if (!screenshotFile) {
      trackOddSkiesEvent("send_signal_failed", {
        mode: "screenshot",
        reason: "validation",
      });
      setScreenshotResult({
        message: "The screenshot signal did not come through. Check the file and try again.",
        ok: false,
      });
      return;
    }

    if (!screenshotTypes.includes(screenshotFile.type)) {
      trackOddSkiesEvent("send_signal_failed", {
        mode: "screenshot",
        reason: "validation",
      });
      setScreenshotResult({
        message: "Use a JPG, PNG, or WebP screenshot.",
        ok: false,
      });
      return;
    }

    if (screenshotFile.size === 0 || screenshotFile.size > maxScreenshotSize) {
      trackOddSkiesEvent("send_signal_failed", {
        mode: "screenshot",
        reason: "validation",
      });
      setScreenshotResult({
        message: "Use a screenshot under 5 MB.",
        ok: false,
      });
      return;
    }

    setScreenshotLoading(true);

    try {
      const formData = new FormData();

      formData.set("screenshot_file", screenshotFile);
      formData.set("source_url", screenshotSourceUrl);
      formData.set("submitter_note", screenshotNote);
      formData.set("category_guess", screenshotCategory);
      formData.set("location_hint", screenshotLocation);
      formData.set("event_time_hint", screenshotEventTime);
      formData.set("contact_email", screenshotEmail);
      formData.set("consent", String(screenshotConsent));
      formData.set("safety", String(screenshotSafety));
      formData.set("company", screenshotCompany);

      const response = await fetch("/api/send-signal/screenshot", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as Partial<Result>;

      const ok = Boolean(response.ok && payload.ok !== false);

      setScreenshotResult({
        message:
          payload.message ??
          (response.ok
            ? "Screenshot signal received. It is waiting in the fog for review."
            : "The screenshot signal did not come through. Check the file and try again."),
        ok,
      });

      if (ok) {
        trackOddSkiesEvent("send_signal_submitted", {
          category: screenshotCategory,
          mode: "screenshot",
        });
        const form = event.currentTarget;

        form.reset();
        setScreenshotFile(null);
        setScreenshotSourceUrl("");
        setScreenshotNote("");
        setScreenshotCategory("");
        setScreenshotLocation("");
        setScreenshotEventTime("");
        setScreenshotEmail("");
        setScreenshotConsent(false);
        setScreenshotSafety(false);
      } else {
        trackOddSkiesEvent("send_signal_failed", {
          mode: "screenshot",
          reason: getSignalFailureReason(response.status),
        });
      }
    } catch {
      trackOddSkiesEvent("send_signal_failed", {
        mode: "screenshot",
        reason: "network",
      });
      setScreenshotResult({
        message: "The screenshot signal did not come through. Check the file and try again.",
        ok: false,
      });
    } finally {
      setScreenshotLoading(false);
    }
  }

  return (
    <section className="field-card border-signal-teal/25 bg-night-850/90 p-4 md:p-5">
      <div className="grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-signal-teal">
            Signal details
          </p>
          <h2 className="mt-2 text-2xl font-black text-parchment">
            Drop the public trail here.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            A public link is best. A screenshot can help when the trail is
            messy, but it still waits for review before anything becomes public.
          </p>
        </div>

        <div
          aria-label="Signal submission mode"
          className="grid grid-cols-2 rounded-lg border border-night-800 bg-night-950/70 p-1"
          role="tablist"
        >
          <button
            aria-selected={mode === "link"}
            className={`rounded-md px-3 py-2 text-sm font-bold transition ${
              mode === "link"
                ? "bg-signal-teal text-night-950"
                : "text-muted hover:text-parchment"
            }`}
            onClick={() => setMode("link")}
            role="tab"
            type="button"
          >
            Paste a Link
          </button>
          <button
            aria-selected={mode === "screenshot"}
            className={`rounded-md px-3 py-2 text-sm font-bold transition ${
              mode === "screenshot"
                ? "bg-signal-violet text-parchment"
                : "text-muted hover:text-parchment"
            }`}
            onClick={() => setMode("screenshot")}
            role="tab"
            type="button"
          >
            Upload a Screenshot
          </button>
        </div>

        {mode === "link" ? (
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-teal">
                Public link
              </span>
              <input
                className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
                inputMode="url"
                maxLength={2048}
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder="Paste a Bluesky, Reddit, YouTube, news, blog, Threads, or public source link"
                required
                type="url"
                value={sourceUrl}
              />
              <span className="text-xs leading-5 text-muted">
                Use a public link whenever possible. Source trails matter.
              </span>
            </label>

            <SignalContextFields
              category={categoryGuess}
              contactEmail={contactEmail}
              eventTime={eventTimeHint}
              location={locationHint}
              note={submitterNote}
              onCategoryChange={setCategoryGuess}
              onContactEmailChange={setContactEmail}
              onEventTimeChange={setEventTimeHint}
              onLocationChange={setLocationHint}
              onNoteChange={setSubmitterNote}
            />

            <div className="hidden" aria-hidden="true">
              <label>
                Company
                <input
                  autoComplete="off"
                  onChange={(event) => setCompany(event.target.value)}
                  tabIndex={-1}
                  value={company}
                />
              </label>
            </div>

            <ConsentChecks
              consent={consent}
              safety={safety}
              safetyLabel="I am not submitting private messages, private accounts, exact home addresses, personal information, harassment, or unsafe content."
              setConsent={setConsent}
              setSafety={setSafety}
            />

            <button
              className="rounded-md border border-signal-teal/40 bg-signal-teal px-5 py-3 text-sm font-bold text-night-950 shadow-glow transition hover:bg-parchment disabled:cursor-not-allowed disabled:border-night-800 disabled:bg-night-800 disabled:text-muted disabled:shadow-none"
              disabled={loading || !sourceUrl || !consent || !safety}
              type="submit"
            >
              {loading ? "Sending signal into the fog..." : "Send a Signal"}
            </button>

            <ResultMessage result={result} />
          </form>
        ) : (
          <form className="grid gap-4" onSubmit={handleScreenshotSubmit}>
            <div className="rounded-md border border-signal-violet/25 bg-signal-violet/10 p-3">
              <h3 className="text-lg font-black text-parchment">
                Upload a Screenshot
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Have a screenshot of something odd? Send it into the fog for
                review. We will try to read it, create a draft, and discard the
                original image.
              </p>
            </div>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-violet">
                Screenshot
              </span>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-signal-violet file:px-3 file:py-2 file:text-sm file:font-bold file:text-parchment"
                onChange={(event) =>
                  setScreenshotFile(event.currentTarget.files?.[0] ?? null)
                }
                required
                type="file"
              />
              <span className="text-xs leading-5 text-muted">
                JPG, PNG, or WebP. Max 5 MB. Please avoid faces, private
                messages, exact addresses, or personal information.
              </span>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Original link, optional
              </span>
              <input
                className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
                inputMode="url"
                maxLength={2048}
                onChange={(event) => setScreenshotSourceUrl(event.target.value)}
                placeholder="If you have the public source link, add it"
                type="url"
                value={screenshotSourceUrl}
              />
              <span className="text-xs leading-5 text-muted">
                If you have the public source link, add it. Source trails matter.
              </span>
            </label>

            <SignalContextFields
              category={screenshotCategory}
              contactEmail={screenshotEmail}
              eventTime={screenshotEventTime}
              location={screenshotLocation}
              note={screenshotNote}
              onCategoryChange={setScreenshotCategory}
              onContactEmailChange={setScreenshotEmail}
              onEventTimeChange={setScreenshotEventTime}
              onLocationChange={setScreenshotLocation}
              onNoteChange={setScreenshotNote}
            />

            <div className="hidden" aria-hidden="true">
              <label>
                Company
                <input
                  autoComplete="off"
                  onChange={(event) => setScreenshotCompany(event.target.value)}
                  tabIndex={-1}
                  value={screenshotCompany}
                />
              </label>
            </div>

            <ConsentChecks
              consent={screenshotConsent}
              safety={screenshotSafety}
              safetyLabel="I am not uploading private messages, private accounts, exact home addresses, personal information, faces, harassment, or unsafe content."
              setConsent={setScreenshotConsent}
              setSafety={setScreenshotSafety}
            />

            <button
              className="rounded-md border border-signal-violet/40 bg-signal-violet px-5 py-3 text-sm font-bold text-parchment shadow-glow transition hover:bg-parchment hover:text-night-950 disabled:cursor-not-allowed disabled:border-night-800 disabled:bg-night-800 disabled:text-muted disabled:shadow-none"
              disabled={
                screenshotLoading ||
                !screenshotFile ||
                !screenshotConsent ||
                !screenshotSafety
              }
              type="submit"
            >
              {screenshotLoading ? "Reading the fog..." : "Send Screenshot"}
            </button>

            <ResultMessage result={screenshotResult} />
          </form>
        )}
      </div>
    </section>
  );
}

function getSignalFailureReason(status: number) {
  if (status >= 400 && status < 500) {
    return "validation";
  }

  return "unknown";
}

function SignalContextFields({
  category,
  contactEmail,
  eventTime,
  location,
  note,
  onCategoryChange,
  onContactEmailChange,
  onEventTimeChange,
  onLocationChange,
  onNoteChange,
}: {
  category: string;
  contactEmail: string;
  eventTime: string;
  location: string;
  note: string;
  onCategoryChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onEventTimeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onNoteChange: (value: string) => void;
}) {
  return (
    <>
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          What makes this odd?
        </span>
        <textarea
          className="min-h-32 rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm leading-6 text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
          maxLength={1200}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Tell us what you noticed. Strange lights? Haunted hallway? Local legend? Weird post?"
          value={note}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Category
          </span>
          <select
            className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition focus:border-signal-teal"
            onChange={(event) => onCategoryChange(event.target.value)}
            value={category}
          >
            <option value="">Let OddSkies guess</option>
            {categories.slice(1).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Location hint
          </span>
          <input
            className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
            maxLength={160}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="City, region, landmark, or unknown"
            value={location}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            When did it happen?
          </span>
          <input
            className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
            maxLength={160}
            onChange={(event) => onEventTimeChange(event.target.value)}
            placeholder="Tonight, last night, May 29, around midnight, unknown..."
            value={eventTime}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Email, optional
          </span>
          <input
            className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
            maxLength={254}
            onChange={(event) => onContactEmailChange(event.target.value)}
            placeholder="Only if you are okay with internal follow-up"
            type="email"
            value={contactEmail}
          />
          <span className="text-xs leading-5 text-muted">
            Only add this if you are okay with us contacting you about the
            submission. We do not need it.
          </span>
        </label>
      </div>
    </>
  );
}

function ConsentChecks({
  consent,
  safety,
  safetyLabel,
  setConsent,
  setSafety,
}: {
  consent: boolean;
  safety: boolean;
  safetyLabel: string;
  setConsent: (value: boolean) => void;
  setSafety: (value: boolean) => void;
}) {
  return (
    <>
      <label className="flex gap-3 rounded-md border border-night-800 bg-night-950/65 p-3 text-sm leading-6 text-muted">
        <input
          checked={consent}
          className="mt-1 size-4 accent-signal-teal"
          onChange={(event) => setConsent(event.target.checked)}
          required
          type="checkbox"
        />
        <span>
          I understand this submission will be reviewed, may be edited or
          rejected, and will remain unverified if published.
        </span>
      </label>

      <label className="flex gap-3 rounded-md border border-night-800 bg-night-950/65 p-3 text-sm leading-6 text-muted">
        <input
          checked={safety}
          className="mt-1 size-4 accent-signal-teal"
          onChange={(event) => setSafety(event.target.checked)}
          required
          type="checkbox"
        />
        <span>{safetyLabel}</span>
      </label>
    </>
  );
}

function ResultMessage({ result }: { result: Result | null }) {
  if (!result) {
    return null;
  }

  return (
    <p
      className={`rounded-md border px-4 py-3 text-sm font-semibold ${
        result.ok
          ? "border-signal-teal/35 bg-signal-teal/10 text-signal-teal"
          : "border-signal-ember/35 bg-signal-ember/10 text-signal-ember"
      }`}
    >
      {result.message}
    </p>
  );
}
