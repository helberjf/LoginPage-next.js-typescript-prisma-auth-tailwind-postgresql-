import {
  RegExpMatcher,
  TextCensor,
  EnglishDataset,
  EnglishRecommendedTransformers,
} from "obscenity";

import { ptBrDataset } from "./ptBrDataset";
import type { User } from "@prisma/client";

/* =========================
   Name formatter
========================= */

export function formatName(fullName: User["name"] | undefined): string {
  if (!fullName) return "Anonymous User";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

/* =========================
   Profanity matcher
========================= */

// Combina dataset PT-BR + EN de forma correta
const matcher = new RegExpMatcher({
  blacklistedTerms: [
    ...ptBrDataset.blacklistedTerms,
    ...EnglishDataset.blacklistedTerms,
  ],
  blacklistMatcherTransformers: EnglishRecommendedTransformers,
});

/* =========================
   Public API
========================= */

export function containsProfanity(text: string): boolean {
  return matcher.hasMatch(text);
}