type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitRecord = {
  count: number;
  expires: number;
};

const store = new Map<string, RateLimitRecord>();

export async function rateLimit(
  req: Request,
  { limit, windowMs }: RateLimitOptions
) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "unknown-ip";

  const now = Date.now();
  const record = store.get(ip);

  if (!record || record.expires < now) {
    store.set(ip, {
      count: 1,
      expires: now + windowMs,
    });
    return;
  }

  if (record.count >= limit) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }

  record.count += 1;
}
