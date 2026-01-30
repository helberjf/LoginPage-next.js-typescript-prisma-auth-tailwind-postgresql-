import "server-only";

const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_URL)?.replace(/\/$/, "");
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

export function normalizeR2Url(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (R2_PUBLIC_URL && trimmed.includes("r2.cloudflarestorage.com")) {
    try {
      const parsed = new URL(trimmed);
      let path = parsed.pathname;
      if (R2_BUCKET_NAME && path.startsWith(`/${R2_BUCKET_NAME}/`)) {
        path = path.replace(`/${R2_BUCKET_NAME}`, "");
      }
      return `${R2_PUBLIC_URL}${path}`;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}
