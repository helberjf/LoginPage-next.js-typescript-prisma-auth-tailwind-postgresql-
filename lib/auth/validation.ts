/* lib/auth/validation.ts */

import { z } from "zod";

/* =========================
   Reusable rules
========================= */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must contain at least 2 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain a special character");

const confirmPasswordSchema = z
  .string()
  .min(1, "Password confirmation is required");

/* =========================
   Helpers
========================= */

const matchPasswords = (passwordKey: string, confirmKey: string) => ({
  message: "Passwords do not match",
  path: [confirmKey],
});

/* =========================
   Schemas
========================= */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: nameSchema,              // ✅ único campo de nome
    email: emailSchema,
    password: passwordSchema,
    confirm: confirmPasswordSchema,
    cpf: z.string().optional(),    // opcional, alinhado ao Prisma
  })
  .refine(
    (data) => data.password === data.confirm,
    matchPasswords("password", "confirm")
  );

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: confirmPasswordSchema,
  })
  .refine(
    (data) => data.password === data.confirm,
    matchPasswords("password", "confirm")
  );

/* =========================
   Types
========================= */

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
