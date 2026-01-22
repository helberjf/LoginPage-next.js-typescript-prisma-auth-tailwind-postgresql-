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

/**
 * Utilitários de validação centralizados
 * Usados em formulários, APIs e componentes
 */

import { validateCpf } from "../validators/validateCpf";

/**
 * Remove todos os caracteres não numéricos
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Valida se o nome tem pelo menos nome e sobrenome
 * Cada parte deve ter pelo menos 2 caracteres
 */
export function hasSurname(name: string): boolean {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every((p) => p.length >= 2);
}

/**
 * Valida CEP brasileiro (8 dígitos)
 */
export function validateCep(cep: string): boolean {
  const digits = onlyDigits(cep);
  return digits.length === 8;
}

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 * DDD (2 dígitos) + número (8 ou 9 dígitos)
 */
export function validatePhone(phone: string): boolean {
  const digits = onlyDigits(phone);
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Valida email básico
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valida senha forte
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra minúscula
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mínimo 8 caracteres");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Precisa de letra minúscula");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Precisa de letra maiúscula");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Precisa de número");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push("Precisa de caractere especial");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formata CPF para exibição
 * 12345678900 -> 123.456.789-00
 */
export function formatCpf(cpf: string): string {
  const digits = onlyDigits(cpf);
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata CEP para exibição
 * 12345678 -> 12345-678
 */
export function formatCep(cep: string): string {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return cep;
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

/**
 * Formata telefone brasileiro para exibição
 * 11999887766 -> (11) 99988-7766
 */
export function formatPhone(phone: string): string {
  const digits = onlyDigits(phone);
  
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  
  return phone;
}

/**
 * Converte telefone para formato E.164
 */
export function toE164(phone: string, countryCode: string = "+55"): string {
  const digits = onlyDigits(phone);
  
  if (digits.length < 10) {
    throw new Error("Telefone inválido");
  }
  
  // Remove + do country code se existir
  const code = countryCode.replace(/\+/g, "");
  
  return `+${code}${digits}`;
}

/**
 * Valida data de nascimento
 * Deve ser no passado e maior de idade opcional
 */
export function validateBirthDate(
  birthDate: string,
  minAge?: number
): boolean {
  const date = new Date(birthDate);
  const now = new Date();

  // Data no futuro
  if (date > now) return false;

  // Data muito antiga (mais de 150 anos)
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - 150);
  if (date < minDate) return false;

  // Verificar idade mínima se fornecida
  if (minAge) {
    const age = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && now.getDate() < date.getDate())
    ) {
      return age - 1 >= minAge;
    }
    
    return age >= minAge;
  }

  return true;
}

/**
 * Exporta função de validação de CPF para conveniência
 */
export { validateCpf };