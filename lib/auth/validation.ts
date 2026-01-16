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
  .refine(
    v => {
      const parts = v.split(/\s+/);
      return parts.length >= 2 && parts.every(p => p.length >= 2);
    },
    "Please enter first and last name"
  );

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
      .refine(
        val => !Number.isNaN(Date.parse(val)),
        "Invalid birth date"
      ),

    gender: z.enum(["MALE", "FEMALE", "OTHER"]),

    /* =========================
       ENDEREÇO
    ========================= */

    address: z
      .object({
        zipCode: z
          .string()
          .transform(v => v.replace(/\D/g, "")),

        street: z.string().min(1, "Street is required"),
        number: z.string().min(1, "Number is required"),
        complement: z.string().optional(),
        district: z.string().min(1, "District is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(2, "State is required"),

        // Mantido explícito para fácil remoção futura
        country: z.string().default("BR"),
      })
      .superRefine((address, ctx) => {
        /* =========================================================
           🇧🇷 VALIDAÇÃO BRASIL
        ========================================================= */
        if (address.country === "BR") {
          if (!/^\d{8}$/.test(address.zipCode)) {
            ctx.addIssue({
              code: "custom",
              path: ["zipCode"],
              message: "CEP deve conter exatamente 8 números",
            });
          }

          if (address.state.length !== 2) {
            ctx.addIssue({
              code: "custom",
              path: ["state"],
              message: "UF deve conter 2 letras",
            });
          }
        }

        /* =========================================================
           🌍 VALIDAÇÃO ESTRANGEIROS (REMOVÍVEL)
        ========================================================= */
        if (address.country !== "BR") {
          if (address.zipCode.length < 3) {
            ctx.addIssue({
              code: "custom",
              path: ["zipCode"],
              message: "ZIP code inválido",
            });
          }
        }
      }),
  })
  /* =========================
     PASSWORD MATCH
  ========================= */
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm) {
      ctx.addIssue({
        code: "custom",
        path: ["confirm"],
        message: "Passwords do not match",
      });
    }
  });
