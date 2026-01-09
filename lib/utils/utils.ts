import type { User } from "@prisma/client";
import { ptBrDataset } from "./ptBrDataset";

/* =========================
   Name formatter
========================= */

export function formatName(fullName: User["name"] | undefined): string {
  if (!fullName) return "Anonymous User";

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/* =========================
   Profanity check (STABLE)
========================= */

/**
 * Profanity check simples, previsível e segura.
 * - Não depende de libs quebradas
 * - Funciona em PT-BR
 * - TypeScript 100% estável
 */
const profanityRegex = new RegExp(
  `\\b(${ptBrDataset.offensiveWords
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\b`,
  "i"
);

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  return profanityRegex.test(text);
}
