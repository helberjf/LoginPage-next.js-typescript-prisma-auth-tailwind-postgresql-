// src/lib/rate-limit.ts

const rateLimitMap = new Map<string, { count: number; last: number }>();

interface Options {
  limit: number;
  windowMs: number;
}

export function rateLimit({ limit, windowMs }: Options) {
  return (ip: string) => {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry) {
      rateLimitMap.set(ip, { count: 1, last: now });
      return true;
    }

    // Janela expirou
    if (now - entry.last > windowMs) {
      rateLimitMap.set(ip, { count: 1, last: now });
      return true;
    }

    entry.count++;

    // Ultrapassou limite
    if (entry.count > limit) {
      return false;
    }

    return true;
  };
}
