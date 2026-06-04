import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SignalRequestBody = {
  source_url?: unknown;
  submitter_note?: unknown;
  category_guess?: unknown;
  location_hint?: unknown;
  event_time_hint?: unknown;
  contact_email?: unknown;
  consent?: unknown;
  safety?: unknown;
  company?: unknown;
};

const SUCCESS_MESSAGE =
  "Signal received. It is now waiting in the fog for review.";
const FAILURE_MESSAGE =
  "The signal did not come through. Check the link and try again.";

const MAX_BODY_LENGTH = 9_000;
const MAX_URL_LENGTH = 2_048;
const MAX_NOTE_LENGTH = 1_200;
const MAX_SHORT_FIELD_LENGTH = 160;
const MAX_EMAIL_LENGTH = 254;

const ALLOWED_CATEGORIES = new Set([
  "",
  "UFO / UAP",
  "Strange Lights",
  "Haunted Places",
  "Paranormal",
  "Local Legends",
  "Unknown",
]);

const PRIVATE_PATH_HINTS = [
  "/admin",
  "/account",
  "/dm",
  "/dms",
  "/inbox",
  "/message",
  "/messages",
  "/private",
  "/settings",
];

const PRIVATE_HOST_HINTS = [
  "discord.com",
  "mail.google.com",
  "messenger.com",
  "slack.com",
  "teams.microsoft.com",
  "web.whatsapp.com",
];

function getSupabaseAdminConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing server Supabase configuration.");
  }

  if (serviceRoleKey.startsWith("sb_publishable_")) {
    throw new Error("Service role key is not configured.");
  }

  return { serviceRoleKey, supabaseUrl };
}

function getString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".");

  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part))) {
    return false;
  }

  const [first, second] = parts.map(Number);

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first === 169 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  return (
    host === "localhost" ||
    host === "::1" ||
    host.endsWith(".local") ||
    !host.includes(".") ||
    isPrivateIpv4(host)
  );
}

function looksLikePrivateMessageUrl(url: URL) {
  const host = url.hostname.toLowerCase();
  const pathname = url.pathname.toLowerCase();

  return (
    PRIVATE_HOST_HINTS.some((hint) => host === hint || host.endsWith(`.${hint}`)) ||
    PRIVATE_PATH_HINTS.some((hint) => pathname.includes(hint))
  );
}

function hasSensitiveText(value: string) {
  const text = value.toLowerCase();
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const phonePattern =
    /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/;
  const addressPattern =
    /\b\d{1,6}\s+[a-z0-9.'-]+(?:\s+[a-z0-9.'-]+){0,4}\s+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|boulevard|blvd|way|place|pl)\b/i;
  const unitPattern = /\b(?:apt|apartment|unit|suite|ste)\s*#?\s*\w+/i;

  return (
    emailPattern.test(text) ||
    phonePattern.test(text) ||
    addressPattern.test(text) ||
    unitPattern.test(text)
  );
}

function getHostnameTitle(url: URL) {
  return `User signal: ${url.hostname.replace(/^www\./, "")}`;
}

function buildFailure(status: number, detail?: string) {
  return NextResponse.json(
    {
      detail,
      message: FAILURE_MESSAGE,
      ok: false,
    },
    { status },
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (rawBody.length > MAX_BODY_LENGTH) {
    return buildFailure(413, "Signal payload is too large.");
  }

  let body: SignalRequestBody;

  try {
    body = JSON.parse(rawBody) as SignalRequestBody;
  } catch {
    return buildFailure(400, "Signal payload could not be read.");
  }

  if (getString(body.company, 80)) {
    return NextResponse.json({
      message: SUCCESS_MESSAGE,
      ok: true,
    });
  }

  const sourceUrl = getString(body.source_url, MAX_URL_LENGTH);
  const submitterNote = getString(body.submitter_note, MAX_NOTE_LENGTH);
  const categoryGuess = getString(body.category_guess, MAX_SHORT_FIELD_LENGTH);
  const locationHint = getString(body.location_hint, MAX_SHORT_FIELD_LENGTH);
  const eventTimeHint = getString(body.event_time_hint, MAX_SHORT_FIELD_LENGTH);
  const contactEmail = getString(body.contact_email, MAX_EMAIL_LENGTH);
  const consent = body.consent === true;
  const safety = body.safety === true;

  if (!sourceUrl || !consent || !safety) {
    return buildFailure(400, "Required signal fields are missing.");
  }

  if (!ALLOWED_CATEGORIES.has(categoryGuess)) {
    return buildFailure(400, "Category is not recognized.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    return buildFailure(400, "Source link is not a valid URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return buildFailure(400, "Only public http or https links are accepted.");
  }

  if (isBlockedHost(parsedUrl.hostname)) {
    return buildFailure(400, "Internal or local links are not accepted.");
  }

  if (looksLikePrivateMessageUrl(parsedUrl)) {
    return buildFailure(400, "Private message or account links are not accepted.");
  }

  const warnings: string[] = [];

  if (hasSensitiveText(`${submitterNote} ${locationHint}`)) {
    warnings.push("possible_sensitive_personal_detail");
  }

  if (!submitterNote) {
    warnings.push("no_submitter_note");
  }

  if (!locationHint) {
    warnings.push("no_location_hint");
  }

  if (!eventTimeHint) {
    warnings.push("no_event_time_hint");
  }

  const status = warnings.length > 0 ? "needs_review" : "new";
  const noteLines = [
    "Public Send a Signal submission. Raw sources are evidence trails, not public reports.",
    eventTimeHint ? `Event time hint: ${eventTimeHint}` : null,
    contactEmail ? `Contact email provided for internal follow-up: ${contactEmail}` : null,
    warnings.length > 0 ? `Warnings: ${warnings.join(", ")}` : null,
    "Submitter consented to review, editing, rejection, and unverified display rules.",
    "Submitter confirmed no private messages, private accounts, exact private addresses, harassment, or unsafe material.",
  ].filter(Boolean);

  const row = {
    category_guess: categoryGuess || null,
    location_hint: locationHint || null,
    platform: "user_submission",
    raw_text:
      submitterNote ||
      `Public signal submitted for review: ${parsedUrl.toString()}`,
    raw_title: getHostnameTitle(parsedUrl),
    review_notes: noteLines.join("\n"),
    search_query: "user_submission",
    source_url: parsedUrl.toString(),
    status,
  };

  try {
    const { serviceRoleKey, supabaseUrl } = getSupabaseAdminConfig();
    const response = await fetch(`${supabaseUrl}/rest/v1/raw_sources`, {
      body: JSON.stringify(row),
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
        apikey: serviceRoleKey,
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 409 || errorText.includes("23505")) {
        return buildFailure(409, "This source may already be waiting in the fog.");
      }

      console.error("Send signal insert failed", errorText);
      return buildFailure(500, "The review queue did not accept the signal.");
    }
  } catch (error) {
    console.error("Send signal failed", error);
    return buildFailure(500, "The review queue is not available.");
  }

  return NextResponse.json({
    message: SUCCESS_MESSAGE,
    ok: true,
  });
}
