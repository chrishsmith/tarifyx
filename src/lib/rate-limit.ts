import { NextResponse } from 'next/server';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Clean expired entries every 5 min

interface RateLimitEntry {
  timestamps: number[];
}

const buckets = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks in long-running processes
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS);
      if (entry.timestamps.length === 0) buckets.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Sliding-window rate limiter (in-memory, per-process).
 * Returns { allowed, remaining, resetMs }.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
): { allowed: boolean; remaining: number; resetMs: number } {
  ensureCleanup();

  const now = Date.now();
  let entry = buckets.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    buckets.set(key, entry);
  }

  entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldestInWindow + WINDOW_MS - now,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: WINDOW_MS,
  };
}

const PUBLIC_RATE_LIMIT = 60; // per hour per IP for public routes

/**
 * IP-based rate limiter for public API routes.
 * Returns a 429 NextResponse if rate exceeded, or null if allowed.
 */
export function rateLimitByIP(request: Request, limit = PUBLIC_RATE_LIMIT): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const route = new URL(request.url).pathname;
  const { allowed, resetMs } = checkRateLimit(`pub:${route}:${ip}`, limit);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(resetMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }
  return null;
}
