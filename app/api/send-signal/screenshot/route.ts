import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ScreenshotExtraction = {
  category_guess?: string;
  event_time_hint?: string;
  extracted_text?: string;
  extraction_notes?: string[];
  location_hint?: string;
  possible_title?: string;
  privacy_warnings?: string[];
  source_platform_hint?: string;
  source_url_hint?: string;
};

const SUCCESS_OCR_MESSAGE =
  "Screenshot signal received. We found some text and created a review draft.";
const SUCCESS_FALLBACK_MESSAGE =
  "Screenshot signal received. The text was hard to read, so your note will guide review.";
const FAILURE_MESSAGE =
  "The screenshot signal did not come through. Check the file and try again.";
const UNSAFE_MESSAGE =
  "Please avoid private messages, exact addresses, personal information, faces, or anything that could put someone at risk.";
const MAX_MULTIPART_LENGTH = 6_500_000;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_URL_LENGTH = 2_048;
const MAX_NOTE_LENGTH = 1_200;
const MAX_SHORT_FIELD_LENGTH = 160;
const MAX_EMAIL_LENGTH = 254;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_CATEGORIES = new Set([
  "",
  "UFO / UAP",
  "Strange Lights",
  "Haunted Places",
  "Paranormal",
  "Local Legends",
  "Mandela / Reality Weirdness",
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

const OCR_SCHEMA = {
  additionalProperties: false,
  properties: {
    category_guess: { maxLength: 80, type: "string" },
    event_time_hint: { maxLength: 160, type: "string" },
    extracted_text: { maxLength: 3200, type: "string" },
    extraction_notes: {
      items: { maxLength: 160, type: "string" },
      maxItems: 6,
      type: "array",
    },
    location_hint: { maxLength: 160, type: "string" },
    possible_title: { maxLength: 120, type: "string" },
    privacy_warnings: {
      items: { maxLength: 160, type: "string" },
      maxItems: 8,
      type: "array",
    },
    source_platform_hint: { maxLength: 80, type: "string" },
    source_url_hint: { maxLength: 2048, type: "string" },
  },
  required: [
    "extracted_text",
    "possible_title",
    "category_guess",
    "location_hint",
    "event_time_hint",
    "source_platform_hint",
    "source_url_hint",
    "privacy_warnings",
    "extraction_notes",
  ],
  type: "object",
} as const;

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

function getFormString(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
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

function hasUnsafeLanguage(value: string) {
  return /\b(doxx|dox|swat|harass|stalk|kill|hurt|attack|home address|private address)\b/i.test(
    value,
  );
}

function buildFailure(status: number, detail?: string, message = FAILURE_MESSAGE) {
  return NextResponse.json(
    {
      detail,
      message,
      ok: false,
    },
    { status },
  );
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > MAX_MULTIPART_LENGTH) {
    return buildFailure(413, "Screenshot payload is too large.");
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return buildFailure(400, "Screenshot payload could not be read.");
  }

  if (getFormString(formData, "company", 80)) {
    return NextResponse.json({
      message: SUCCESS_FALLBACK_MESSAGE,
      ok: true,
    });
  }

  const file = formData.get("screenshot_file");
  const submitterNote = getFormString(formData, "submitter_note", MAX_NOTE_LENGTH);
  const userCategory = getFormString(
    formData,
    "category_guess",
    MAX_SHORT_FIELD_LENGTH,
  );
  const userLocation = getFormString(
    formData,
    "location_hint",
    MAX_SHORT_FIELD_LENGTH,
  );
  const userEventTime = getFormString(
    formData,
    "event_time_hint",
    MAX_SHORT_FIELD_LENGTH,
  );
  const contactEmail = getFormString(formData, "contact_email", MAX_EMAIL_LENGTH);
  const sourceUrl = getFormString(formData, "source_url", MAX_URL_LENGTH);
  const consent = getFormString(formData, "consent", 10) === "true";
  const safety = getFormString(formData, "safety", 10) === "true";

  if (!consent || !safety) {
    return buildFailure(400, "Consent and safety confirmations are required.");
  }

  if (!ALLOWED_CATEGORIES.has(userCategory)) {
    return buildFailure(400, "Category is not recognized.");
  }

  if (!(file instanceof File)) {
    return buildFailure(400, "A screenshot file is required.");
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return buildFailure(400, "Screenshot file must be under 5 MB.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return buildFailure(400, "Only JPG, PNG, or WebP screenshots are accepted.");
  }

  const userSource = sourceUrl ? getSafePublicUrl(sourceUrl) : null;

  if (userSource?.blocked) {
    return buildFailure(400, userSource.detail, UNSAFE_MESSAGE);
  }

  const ocrResult = await extractScreenshotText(file);

  if (!ocrResult.extraction && !submitterNote) {
    return buildFailure(
      400,
      "OCR is unavailable and no review note was provided.",
      "The screenshot was hard to read. Add a note so review has a trail.",
    );
  }

  const extraction = ocrResult.extraction;
  const extractedText = cleanString(extraction?.extracted_text, 3_200);
  const extractedCategory = normalizeCategoryGuess(extraction?.category_guess);
  const extractedLocation = cleanString(extraction?.location_hint, 160);
  const extractedEventTime = cleanString(extraction?.event_time_hint, 160);
  const extractedSourceUrl = cleanString(extraction?.source_url_hint, MAX_URL_LENGTH);
  const extractedSource = !userSource?.url && extractedSourceUrl
    ? getSafePublicUrl(extractedSourceUrl)
    : null;
  const sourceUrlForInsert = userSource?.url ?? extractedSource?.url ?? null;
  const privacyWarnings = cleanStringArray(extraction?.privacy_warnings);
  const extractionNotes = cleanStringArray(extraction?.extraction_notes);
  const sourcePlatformHint = cleanString(extraction?.source_platform_hint, 80);
  const possibleTitle =
    cleanString(extraction?.possible_title, 120) || "User screenshot signal";
  const categoryGuess = userCategory || extractedCategory || "Unknown";
  const locationHint = userLocation || extractedLocation;
  const eventTimeHint = userEventTime || extractedEventTime;
  const reviewText = [submitterNote, extractedText, locationHint].join(" ");
  const weakWarnings = [
    ...privacyWarnings,
    ...(ocrResult.status === "fallback" ? ["ocr_unavailable_or_failed"] : []),
    ...(extractedSource?.blocked ? ["extracted_source_url_rejected"] : []),
    ...(sourceUrlForInsert ? [] : ["no_source_url"]),
    ...(submitterNote ? [] : ["no_submitter_note"]),
    ...(locationHint ? [] : ["no_location_hint"]),
    ...(eventTimeHint ? [] : ["no_event_time_hint"]),
  ];

  if (hasSeverePrivacyWarning(privacyWarnings) || hasSensitiveText(reviewText)) {
    return buildFailure(
      400,
      "Screenshot appears to include private or personal information.",
      UNSAFE_MESSAGE,
    );
  }

  if (hasUnsafeLanguage(reviewText)) {
    return buildFailure(
      400,
      "Screenshot appears to include unsafe or targeting language.",
      UNSAFE_MESSAGE,
    );
  }

  const status = weakWarnings.length > 0 ? "needs_review" : "new";
  const rawTextParts = [
    submitterNote ? `Submitter note:\n${submitterNote}` : null,
    extractedText ? `Extracted screenshot text:\n${extractedText}` : null,
    !extractedText && ocrResult.status === "fallback"
      ? "Screenshot text was not extracted. Submitter note should guide review."
      : null,
  ].filter(Boolean);
  const noteLines = [
    "Public Send a Signal screenshot submission. Raw sources are evidence trails, not public reports.",
    "Screenshot processed; original image not retained.",
    `OCR status: ${ocrResult.status}`,
    sourcePlatformHint ? `Source platform hint: ${sourcePlatformHint}` : null,
    extractedSourceUrl ? `Extracted source URL hint: ${extractedSourceUrl}` : null,
    extractedSource?.blocked ? `Rejected extracted source URL: ${extractedSource.detail}` : null,
    eventTimeHint ? `Event time hint: ${eventTimeHint}` : null,
    contactEmail ? `Contact email provided for internal follow-up: ${contactEmail}` : null,
    extractionNotes.length > 0 ? `Extraction notes: ${extractionNotes.join("; ")}` : null,
    privacyWarnings.length > 0 ? `Privacy warnings: ${privacyWarnings.join("; ")}` : null,
    weakWarnings.length > 0 ? `Review flags: ${weakWarnings.join(", ")}` : null,
    "Submitter consented to review, editing, rejection, and unverified display rules.",
    "Submitter confirmed no private messages, private accounts, exact private addresses, faces, harassment, or unsafe material.",
  ].filter(Boolean);
  const row = {
    category_guess: categoryGuess,
    collected_at: new Date().toISOString(),
    extracted_event_datetime_text: eventTimeHint || null,
    has_location_hint: Boolean(locationHint),
    has_media_hint: true,
    has_time_hint: Boolean(eventTimeHint),
    location_hint: locationHint || null,
    platform: "user_screenshot",
    possible_private_location: weakWarnings.some((warning) =>
      /private|address|location|face|personal/i.test(warning),
    ),
    raw_text: rawTextParts.join("\n\n"),
    raw_title: possibleTitle,
    review_notes: noteLines.join("\n"),
    search_query: "user_screenshot",
    source_url: sourceUrlForInsert,
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

      console.error("Send screenshot signal insert failed", errorText);
      return buildFailure(500, "The review queue did not accept the screenshot.");
    }
  } catch (error) {
    console.error("Send screenshot signal failed", formatError(error));
    return buildFailure(500, "The review queue is not available.");
  }

  return NextResponse.json({
    message:
      ocrResult.status === "ready" ? SUCCESS_OCR_MESSAGE : SUCCESS_FALLBACK_MESSAGE,
    ok: true,
    status: ocrResult.status,
  });
}

async function extractScreenshotText(file: File) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { extraction: null, status: "fallback" as const };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;
    const model =
      process.env.OPENAI_VISION_MODEL?.trim() ||
      process.env.OPENAI_MODEL?.trim() ||
      "gpt-4.1-mini";
    const response = await fetch("https://api.openai.com/v1/responses", {
      body: JSON.stringify({
        input: [
          {
            content: [
              {
                text: [
                  "Extract readable text and review hints from this screenshot for OddSkies.",
                  "Do OCR/extraction only. Do not verify the claim. Do not identify private people.",
                  "Flag private messages, faces, names, phone numbers, emails, exact addresses, harassment, doxxing, private accounts, workplaces, schools, or sensitive locations.",
                  "If the screenshot is hard to read, say so in extraction_notes.",
                ].join("\n"),
                type: "input_text",
              },
              {
                image_url: dataUrl,
                type: "input_image",
              },
            ],
            role: "user",
          },
        ],
        max_output_tokens: 1200,
        model,
        store: false,
        text: {
          format: {
            name: "oddskies_screenshot_extraction",
            schema: OCR_SCHEMA,
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
      return { extraction: null, status: "fallback" as const };
    }

    const payload = (await response.json()) as unknown;
    const outputText = getResponseOutputText(payload);
    const parsed = outputText ? JSON.parse(outputText) : null;

    return {
      extraction: normalizeExtraction(parsed),
      status: "ready" as const,
    };
  } catch (error) {
    console.error("Screenshot OCR failed", formatError(error));

    return { extraction: null, status: "fallback" as const };
  }
}

function getSafePublicUrl(value: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    return { blocked: true as const, detail: "Source link is not a valid URL." };
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return {
      blocked: true as const,
      detail: "Only public http or https links are accepted.",
    };
  }

  if (isBlockedHost(parsedUrl.hostname)) {
    return { blocked: true as const, detail: "Internal or local links are not accepted." };
  }

  if (looksLikePrivateMessageUrl(parsedUrl)) {
    return {
      blocked: true as const,
      detail: "Private message or account links are not accepted.",
    };
  }

  return { blocked: false as const, url: parsedUrl.toString() };
}

function normalizeExtraction(value: unknown): ScreenshotExtraction {
  if (!isRecord(value)) {
    return {
      extraction_notes: ["OCR returned an unreadable response."],
      extracted_text: "",
      privacy_warnings: [],
    };
  }

  return {
    category_guess: cleanString(value.category_guess, 80),
    event_time_hint: cleanString(value.event_time_hint, 160),
    extracted_text: cleanString(value.extracted_text, 3_200),
    extraction_notes: cleanStringArray(value.extraction_notes),
    location_hint: cleanString(value.location_hint, 160),
    possible_title: cleanString(value.possible_title, 120),
    privacy_warnings: cleanStringArray(value.privacy_warnings),
    source_platform_hint: cleanString(value.source_platform_hint, 80),
    source_url_hint: cleanString(value.source_url_hint, 2_048),
  };
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((item) => cleanString(item, 180))
        .filter(Boolean)
        .slice(0, 8)
    : [];
}

function normalizeCategoryGuess(value: unknown) {
  const category = cleanString(value, 80);

  return ALLOWED_CATEGORIES.has(category) && category ? category : "";
}

function hasSeverePrivacyWarning(warnings: string[]) {
  return warnings.some((warning) =>
    /private message|direct message|\bdm\b|exact address|home address|phone|email|face|personal information|private account|dox|harass|school|workplace/i.test(
      warning,
    ),
  );
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
