// lib/validators/auth.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(4, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  remember: z.boolean().optional(),
});

export type LoginSchema = z.infer<typeof loginSchema>;
