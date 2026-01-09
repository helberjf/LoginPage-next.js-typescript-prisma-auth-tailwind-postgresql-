import { NextResponse } from 'next/server'
import { z } from 'zod'
import { productCreateSchema, productUpdateSchema } from '@/lib/validators/product'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

// Placeholder admin check - replace with real session/role check
async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return Boolean(user && user.role === 'ADMIN')
}

export async function GET(request: Request) {
  const ok = await requireAdmin()
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (id) {
    const product = await prisma.product.findUnique({ where: { id } })
    return NextResponse.json(product)
  }
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  const ok = await requireAdmin()
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const parsed = productCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data
  const created = await prisma.product.create({ data: {
    userId: body.userId || '', // you should supply a userId from the admin UI
    name: data.name,
    description: data.description || '',
    price: data.price,
    stock: data.stock,
    paymentMethods: data.paymentMethods,
    active: data.active,
    mp_enabled: data.mp_enabled,
    mp_metadata: data.mp_metadata,
    mp_price_decimal: data.mp_price_decimal ?? undefined,
  }})
  return NextResponse.json(created, { status: 201 })
}

export async function PUT(request: Request) {
  const ok = await requireAdmin()
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  const parsed = productUpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const updated = await prisma.product.update({ where: { id: body.id }, data: {
    name: data.name,
    description: data.description,
    price: data.price as any,
    stock: data.stock as any,
    paymentMethods: data.paymentMethods as any,
    active: data.active as any,
    mp_enabled: data.mp_enabled as any,
    mp_metadata: data.mp_metadata as any,
    mp_price_decimal: data.mp_price_decimal as any,
  }})
  return NextResponse.json(updated)
}

export async function DELETE(request: Request) {
  const ok = await requireAdmin()
  if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
