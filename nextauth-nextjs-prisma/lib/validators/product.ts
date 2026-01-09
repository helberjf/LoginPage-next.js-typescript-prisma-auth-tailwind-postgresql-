import { z } from 'zod'

export const productCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  price: z.preprocess((v) => typeof v === 'string' ? parseFloat(v) : v, z.number().nonnegative()),
  stock: z.preprocess((v) => typeof v === 'string' ? parseInt(v, 10) : v, z.number().int().nonnegative()).optional().default(0),
  paymentMethods: z.array(z.string()).optional().default([]),
  active: z.boolean().optional().default(true),
  mp_enabled: z.boolean().optional().default(false),
  mp_metadata: z.any().optional().nullable(),
  mp_price_decimal: z.preprocess((v) => {
    if (v == null || v === '') return null
    return typeof v === 'string' ? parseFloat(v) : v
  }, z.number().nonnegative()).nullable().optional(),
})

export const productUpdateSchema = productCreateSchema.partial()

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
