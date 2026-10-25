import type { NextRequest } from "next/server";

/** Reject cross-origin browser mutations. Configure APP_URL behind a trusted reverse proxy. */
export function sameOriginRequest(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const requestOrigin = originUrl.origin;
    const requestHost = req.headers.get("host");
    const hostMatch = requestHost
      ? requestOrigin === `${req.nextUrl.protocol}//${requestHost}`
      : false;
    const configuredOrigin = process.env.APP_URL
      ? new URL(process.env.APP_URL).origin
      : null;
    return (
      requestOrigin === req.nextUrl.origin ||
      hostMatch ||
      requestOrigin === configuredOrigin
    );
  } catch {
    return false;
  }
}
