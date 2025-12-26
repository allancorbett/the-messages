/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or Upstash Rate Limit
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Rate limiter that allows a certain number of requests per time window
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or expired entry
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetAt,
    };
  }

  // Entry exists and is valid
  if (entry.count < limit) {
    entry.count++;
    return {
      success: true,
      limit,
      remaining: limit - entry.count,
      reset: entry.resetAt,
    };
  }

  // Rate limit exceeded
  return {
    success: false,
    limit,
    remaining: 0,
    reset: entry.resetAt,
  };
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string, limit: number = 10): {
  remaining: number;
  reset: number | null;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    return { remaining: limit, reset: null };
  }

  return {
    remaining: Math.max(0, limit - entry.count),
    reset: entry.resetAt,
  };
}
