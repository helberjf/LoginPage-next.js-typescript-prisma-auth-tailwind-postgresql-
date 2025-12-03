import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória")
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "Nome obrigatório"),
  lastName: z.string().min(1, "Sobrenome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirm: z.string().min(6)
}).refine(data => data.password === data.confirm, {
  message: "As senhas não coincidem",
  path: ["confirm"]
});


export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido")
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6),
  confirm: z.string().min(6)
});
