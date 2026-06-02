"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function AdminLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Admin login failed.");
      }

      window.location.reload();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : String(loginError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-lg border border-night-800 bg-night-900 p-6 shadow-glow">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-signal-teal">
        Token required
      </p>
      <h2 className="mt-3 text-2xl font-bold">Review room locked</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Enter the OddSkies admin token. The token is checked server-side and the
        browser receives only an HttpOnly session cookie.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold text-parchment">
          Admin token
          <input
            className="mt-2 w-full rounded-lg border border-night-800 bg-night-950 px-4 py-3 text-parchment outline-none transition focus:border-signal-teal"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste token"
            type="password"
            value={token}
          />
        </label>
        {error ? <p className="text-sm text-signal-ember">{error}</p> : null}
        <button
          className="rounded-lg bg-signal-teal px-5 py-3 text-sm font-bold text-night-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || !token.trim()}
          type="submit"
        >
          {loading ? "Checking..." : "Unlock review room"}
        </button>
      </form>
    </section>
  );
}
