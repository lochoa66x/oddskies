import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "oddskies_admin";

const SESSION_LABEL = "oddskies-admin-session-v1";
const SESSION_MAX_AGE = 60 * 60 * 8;

export function isAdminConfigured() {
  return Boolean(getAdminToken());
}

export function verifyAdminToken(candidate: unknown) {
  const adminToken = getAdminToken();
  const token = typeof candidate === "string" ? candidate.trim() : "";

  if (!adminToken || !token) {
    return false;
  }

  return timingSafeCompare(token, adminToken);
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return verifyAdminSessionCookie(cookieValue);
}

export function createAdminSessionCookie() {
  const adminToken = getAdminToken();

  if (!adminToken) {
    return "";
  }

  return createHmac("sha256", adminToken).update(SESSION_LABEL).digest("hex");
}

export function verifyAdminSessionCookie(cookieValue: unknown) {
  const expected = createAdminSessionCookie();
  const value = typeof cookieValue === "string" ? cookieValue : "";

  if (!expected || !value) {
    return false;
  }

  return timingSafeCompare(value, expected);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getAdminTokenMissingMessage() {
  return "ODDSKIES_ADMIN_TOKEN is not configured.";
}

function getAdminToken() {
  return process.env.ODDSKIES_ADMIN_TOKEN?.trim() ?? "";
}

function timingSafeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
