"use client";

import { FormEvent, useState } from "react";

const categories = [
  "",
  "UFO / UAP",
  "Strange Lights",
  "Haunted Places",
  "Paranormal",
  "Local Legends",
  "Unknown",
];

type Result = {
  message: string;
  ok: boolean;
};

export function SendSignalForm() {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

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

      setResult({
        message:
          payload.message ??
          (response.ok
            ? "Signal received. It is now waiting in the fog for review."
            : "The signal did not come through. Check the link and try again."),
        ok: Boolean(response.ok && payload.ok !== false),
      });

      if (response.ok) {
        setSourceUrl("");
        setSubmitterNote("");
        setCategoryGuess("");
        setLocationHint("");
        setEventTimeHint("");
        setContactEmail("");
        setConsent(false);
        setSafety(false);
      }
    } catch {
      setResult({
        message: "The signal did not come through. Check the link and try again.",
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="field-card border-signal-teal/25 bg-night-850/90 p-4 md:p-5"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-signal-teal">
            Signal details
          </p>
          <h2 className="mt-2 text-2xl font-black text-parchment">
            Drop the public trail here.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            A public link is the best trail. A short note helps the reviewer see
            what felt odd without turning it into a claim.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-teal">
            Public source link
          </span>
          <input
            className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
            inputMode="url"
            maxLength={2048}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://public-post-or-article.example/..."
            required
            type="url"
            value={sourceUrl}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            What should we notice?
          </span>
          <textarea
            className="min-h-32 rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm leading-6 text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
            maxLength={1200}
            onChange={(event) => setSubmitterNote(event.target.value)}
            placeholder="What is weird, where did it happen, and why should the map take a peek? Keep it public and source-aware."
            value={submitterNote}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Category guess
            </span>
            <select
              className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition focus:border-signal-teal"
              onChange={(event) => setCategoryGuess(event.target.value)}
              value={categoryGuess}
            >
              <option value="">Let OddSkies guess</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
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
              onChange={(event) => setLocationHint(event.target.value)}
              placeholder="City, region, or broad place"
              value={locationHint}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Event time hint
            </span>
            <input
              className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
              maxLength={160}
              onChange={(event) => setEventTimeHint(event.target.value)}
              placeholder="Tonight, May 2026, around 9 PM..."
              value={eventTimeHint}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Contact email
            </span>
            <input
              className="rounded-md border border-night-800 bg-night-950 px-4 py-3 text-sm text-parchment outline-none transition placeholder:text-muted focus:border-signal-teal"
              maxLength={254}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="Optional, internal follow-up only"
              type="email"
              value={contactEmail}
            />
          </label>
        </div>

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

        <label className="flex gap-3 rounded-md border border-night-800 bg-night-950/65 p-3 text-sm leading-6 text-muted">
          <input
            checked={consent}
            className="mt-1 size-4 accent-signal-teal"
            onChange={(event) => setConsent(event.target.checked)}
            required
            type="checkbox"
          />
          <span>
            I understand OddSkies may review, edit, label, reject, or ignore
            this signal, and any public report remains unverified.
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
          <span>
            This is a public source, not a private message, private account,
            exact private address, personal info, harassment, or unsafe material.
          </span>
        </label>

        <button
          className="rounded-md border border-signal-teal/40 bg-signal-teal px-5 py-3 text-sm font-bold text-night-950 shadow-glow transition hover:bg-parchment disabled:cursor-not-allowed disabled:border-night-800 disabled:bg-night-800 disabled:text-muted disabled:shadow-none"
          disabled={loading || !sourceUrl || !consent || !safety}
          type="submit"
        >
          {loading ? "Sending through the fog..." : "Send Signal for Review"}
        </button>

        {result ? (
          <p
            className={`rounded-md border px-4 py-3 text-sm font-semibold ${
              result.ok
                ? "border-signal-teal/35 bg-signal-teal/10 text-signal-teal"
                : "border-signal-ember/35 bg-signal-ember/10 text-signal-ember"
            }`}
          >
            {result.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
