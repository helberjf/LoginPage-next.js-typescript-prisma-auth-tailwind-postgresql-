'use server';
import {
  RegExpMatcher,
  englishRecommendedTransformers as transformers,
} from "obscenity";

import { ptBrDataset } from "./ptBrDataset"; // <- CORRETO

import type { User } from "@prisma/client";

export function formatName(fullName: User["name"] | undefined): string {
  if (!fullName) return "Anonymous User";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

const matcher = new RegExpMatcher({
  ...ptBrDataset,
  ...transformers,
});

export function containsProfanity(text: string): boolean {
  return matcher.hasMatch(text);
}
