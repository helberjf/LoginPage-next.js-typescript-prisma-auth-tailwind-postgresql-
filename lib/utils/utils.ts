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
   Text normalization
========================= */

export function removeAccents(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Remove acentos, normaliza leetspeak e repetições.
 */
function normalizeText(input: string): string {
  return input
    .toLowerCase()

    // remove acentos
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

    // leetspeak → letras
    .replace(/[@]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")

    // reduz repetições (ex: fooooda → fooda)
    .replace(/([a-z])\1{2,}/g, "$1$1");
}

/* =========================
   Profanity detection
========================= */

const profanityRegex = new RegExp(
  `\\b(${ptBrDataset.offensiveWords
    .map((w) =>
      w
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .join("|")})\\b`,
  "i"
);

export function containsProfanity(text: string): boolean {
  if (!text) return false;

  const normalized = normalizeText(text);
  return profanityRegex.test(normalized);
}
