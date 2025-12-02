import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória")
});

export const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido")
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6),
  confirm: z.string().min(6)
});
