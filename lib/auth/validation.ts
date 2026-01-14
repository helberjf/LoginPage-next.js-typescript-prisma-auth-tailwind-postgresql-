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
    name: nameSchema,
    email: emailSchema,

    password: passwordSchema,
    confirm: confirmPasswordSchema,

    cpf: z.string().optional(),

    phoneCountry: z.enum(["BR", "US", "OTHER"]),

    phone: z
      .string()
      .regex(/^\+\d{8,15}$/, "Invalid phone number"),

    birthDate: z
      .string()
      .min(1, "Birth date is required")
      .refine(val => !Number.isNaN(Date.parse(val)), "Invalid birth date"),

    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  })
  .refine(
    data => data.password === data.confirm,
    matchPasswords("password", "confirm")
  )
  .refine(
    data => {
      const birth = new Date(data.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= 18;
    },
    { message: "You must be at least 18 years old", path: ["birthDate"] }
  );

/* =========================
   Types
========================= */

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: confirmPasswordSchema,
  })
  .refine(
    data => data.password === data.confirm,
    matchPasswords("password", "confirm")
  );

