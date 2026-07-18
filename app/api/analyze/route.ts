import { NextRequest, NextResponse } from "next/server";
import { ScreeningInputError, screenConversation, validateScreeningInput } from "../../../lib/screening";

export const runtime = "nodejs";
export const maxDuration = 5;

const MAX_REQUEST_BYTES = 64 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;

type RateRecord = { count: number; resetAt: number };
type RateLimitStore = typeof globalThis & { wardshipDemoRateLimit?: Map<string, RateRecord> };

function rateLimitStore() {
  const globalStore = globalThis as RateLimitStore;
  if (!globalStore.wardshipDemoRateLimit) globalStore.wardshipDemoRateLimit = new Map();
  return globalStore.wardshipDemoRateLimit;
}

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

function withinDemoRateLimit(key: string) {
  const now = Date.now();
  const store = rateLimitStore();

  if (store.size > 256) {
    for (const [storedKey, record] of store) {
      if (record.resetAt <= now) store.delete(storedKey);
    }
  }

  const record = store.get(key);
  if (!record || record.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false;

  record.count += 1;
  return true;
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export async function POST(request: NextRequest) {
  try {
    const declaredLength = Number(request.headers.get("content-length") || "0");
    if (declaredLength > MAX_REQUEST_BYTES) {
      return jsonError("Request exceeds the demo size limit.", 413);
    }
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return jsonError("Content-Type must be application/json.", 415);
    }
    if (!withinDemoRateLimit(clientKey(request))) {
      return jsonError("Demo rate limit exceeded. Try again in a minute.", 429);
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
      return jsonError("Request exceeds the demo size limit.", 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonError("Request body must be valid JSON.", 400);
    }

    const input = validateScreeningInput(body);
    const result = await screenConversation(input);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-Wardship-Demo": "keyword-heuristic-only"
      }
    });
  } catch (error) {
    if (error instanceof ScreeningInputError) {
      return jsonError(error.message, 400);
    }
    return jsonError("Demo screening could not be completed.", 500);
  }
}
