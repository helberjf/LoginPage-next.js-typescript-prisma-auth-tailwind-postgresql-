// /lib/rateLimit.ts
type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitRecord = {
  count: number;
  expires: number;
};

const store = new Map<string, RateLimitRecord>();

export function rateLimit(
  req: Request,
  { limit, windowMs }: RateLimitOptions
): { allowed: boolean; retryAfter?: number } {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();

  if (!ip) {
    // Falha aberta (não bloqueia)
    return { allowed: true };
  }

  const now = Date.now();
  const record = store.get(ip);

  if (!record || record.expires < now) {
    store.set(ip, {
      count: 1,
      expires: now + windowMs,
    });
    return { allowed: true };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.expires - now) / 1000),
    };
  }

  record.count += 1;
  return { allowed: true };
}
