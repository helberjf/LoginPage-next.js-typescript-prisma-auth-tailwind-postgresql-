import type { Session } from "@auth/core/types";

export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user?.email;
}

export function getUserId(session: Session | null): string | null {
  return session?.user?.id ?? null;
}

export function hasRole(session: Session | null, role: string) {
  // Só para exemplo — se quiser roles reais depois, adaptamos o schema
  // ex: user.role === "admin"
  return false;
}
