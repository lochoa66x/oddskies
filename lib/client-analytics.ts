"use client";

import { track } from "@vercel/analytics";

type AnalyticsValue = boolean | number | string | null | undefined;

type OddSkiesEvent =
  | "field_log_filter_changed"
  | "language_changed"
  | "oracle_asked"
  | "report_opened"
  | "send_signal_failed"
  | "send_signal_started"
  | "send_signal_submitted"
  | "source_clicked";

type OddSkiesEventProperties = {
  category?: AnalyticsValue;
  locale?: AnalyticsValue;
  mode?: AnalyticsValue;
  mood_label?: AnalyticsValue;
  reason?: AnalyticsValue;
  region?: AnalyticsValue;
  source_type?: AnalyticsValue;
};

const eventProperties: Record<OddSkiesEvent, readonly (keyof OddSkiesEventProperties)[]> = {
  field_log_filter_changed: ["category", "region"],
  language_changed: ["locale"],
  oracle_asked: ["category", "mood_label"],
  report_opened: ["category", "region"],
  send_signal_failed: ["reason", "mode"],
  send_signal_started: ["mode"],
  send_signal_submitted: ["category", "mode"],
  source_clicked: ["category", "source_type"],
};

export function trackOddSkiesEvent(
  eventName: OddSkiesEvent,
  properties: OddSkiesEventProperties = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  const safeProperties = eventProperties[eventName].reduce<
    Record<string, AnalyticsValue>
  >((accumulator, key) => {
    const value = sanitizeAnalyticsValue(properties[key]);

    if (value !== undefined) {
      accumulator[key] = value;
    }

    return accumulator;
  }, {});

  track(eventName, safeProperties);
}

function sanitizeAnalyticsValue(value: AnalyticsValue) {
  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed ? trimmed.slice(0, 80) : undefined;
  }

  return value;
}
