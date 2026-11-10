// Sliding-window rate limiter in Node memory with automatic eviction

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as unknown as {
  __pageRateLimitBuckets?: Map<string, RateLimitBucket>;
  __pageRateLimitCleanupStarted?: boolean;
};

const buckets =
  globalForRateLimit.__pageRateLimitBuckets ??
  (globalForRateLimit.__pageRateLimitBuckets = new Map<string, RateLimitBucket>());

// Clean expired buckets every 5 minutes
if (!globalForRateLimit.__pageRateLimitCleanupStarted && typeof setInterval !== "undefined") {
  globalForRateLimit.__pageRateLimitCleanupStarted = true;
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) {
          buckets.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  ).unref?.();
}

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  let bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(identifier, bucket);
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowSeconds),
    };
  }

  bucket.count++;
  if (bucket.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

export function resetRateLimits() {
  buckets.clear();
}
