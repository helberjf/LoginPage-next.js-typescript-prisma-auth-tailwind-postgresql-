import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { validateCpf } from "@/lib/validators/validateCpf";
import { z } from "zod";

type CheckoutItem = {
  productId: string;
  quantity: number;
  priceCents: number;
};

type CheckoutBody = {
  items: CheckoutItem[];
  guest?: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    address?: {
      street: string;
      number: string;
      complement?: string | null;
      district: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
};

const guestAddressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional().nullable(),
  district: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().optional().nullable(),
});

const guestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  cpf: z.string().min(1),
  phone: z.string().min(1),
  address: guestAddressSchema,
});

const newCheckoutSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().optional().default(1),
  guest: guestSchema.optional(),
});

const legacyCheckoutSchema = z.object({
  totalCents: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        priceCents: z.number().int().positive(),
      })
    )
    .min(1),
  guest: z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      cpf: z.string().min(1),
      phone: z.string().min(1),
    })
    .optional(),
});

export async function POST(req: Request) {
  const rawBody = await req.json();

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isLogged = !!userId;

  const parsedNew = newCheckoutSchema.safeParse(rawBody);
  const parsedLegacy = legacyCheckoutSchema.safeParse(rawBody);

  if (!parsedNew.success && !parsedLegacy.success) {
    return NextResponse.json(
      { error: "Payload inválido" },
      { status: 400 }
    );
  }

  const guest = isLogged
    ? null
    : parsedNew.success
      ? parsedNew.data.guest ?? null
      : parsedLegacy.success
        ? parsedLegacy.data.guest ?? null
        : null;

  if (!isLogged && !guest) {
    return NextResponse.json(
      { error: "Dados de visitante obrigatórios" },
      { status: 400 }
    );
  }

  // ===== CPF =====
  if (isLogged) {
    const user = await prisma.user.findUnique({
      where: { id: userId! },
      select: {
        profile: {
          select: {
            cpf: true,
          },
        },
      },
    });

    const cpf = user?.profile?.cpf;

    if (!cpf || !validateCpf(cpf)) {
      return NextResponse.json(
        { error: "CPF inválido ou não cadastrado" },
        { status: 400 }
      );
    }
  } else {
    if (!guest) {
      return NextResponse.json(
        { error: "Dados de visitante obrigatórios" },
        { status: 400 }
      );
    }

    if (!validateCpf(guest.cpf)) {
      return NextResponse.json(
        { error: "CPF do visitante inválido" },
        { status: 400 }
      );
    }
  }

  // ===== MONTAGEM DOS ITENS / TOTAL =====
  let items: CheckoutItem[];
  let totalCents: number;
  let productIdForRedirect: string | null = null;

  if (parsedNew.success) {
    const product = await prisma.product.findUnique({
      where: { id: parsedNew.data.productId },
      select: { id: true, priceCents: true, active: true, deletedAt: true, stock: true },
    });

    if (!product || !product.active || product.deletedAt !== null || product.stock <= 0) {
      return NextResponse.json(
        { error: "Produto inválido ou indisponível" },
        { status: 400 }
      );
    }

    const quantity = parsedNew.data.quantity ?? 1;
    items = [{ productId: product.id, quantity, priceCents: product.priceCents }];
    totalCents = product.priceCents * quantity;
    productIdForRedirect = product.id;
  } else {
    const body = parsedLegacy.data as CheckoutBody;
    
    // Fetch all products to get current prices
    const productIds = body.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        active: true,
        deletedAt: null,
      },
      select: {
        id: true,
        priceCents: true,
        discountPercent: true,
        stock: true,
      },
    });

    if (products.length !== body.items.length) {
      return NextResponse.json(
        { error: "Um ou mais produtos não foram encontrados" },
        { status: 400 }
      );
    }

    // Check stock and build items with prices
    items = body.items.map((cartItem) => {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product) {
        throw new Error(`Produto ${cartItem.productId} não encontrado`);
      }
      if (product.stock < cartItem.quantity) {
        throw new Error(`Estoque insuficiente para o produto ${cartItem.productId}`);
      }
      
      const finalPrice = product.discountPercent && product.discountPercent > 0
        ? Math.round(product.priceCents * (1 - product.discountPercent / 100))
        : product.priceCents;
        
      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceCents: finalPrice,
      };
    });

    totalCents = items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
  }

  // ===== CRIAÇÃO DO PEDIDO =====
  const order = await prisma.order.create({
    data: {
      userId,
      guestFullName: guest?.name ?? null,
      guestEmail: guest?.email ?? null,
      guestCpf: guest?.cpf ?? null,
      guestPhone: guest?.phone ?? null,
      totalCents,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      },
    },
    select: { id: true },
  });

  const origin = new URL(req.url).origin;

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({
      orderId: order.id,
      redirectUrl: `${origin}/checkout/success?orderId=${order.id}`,
    });
  }

  // ===== MERCADO PAGO (PREFERENCE) =====
  try {
    const title = productIdForRedirect ? "Compra" : "Pedido";

    const webhookUrl = process.env.MP_WEBHOOK_URL ?? `${origin}/api/mercadopago/webhook`;

    const preferenceBody = {
      items: items.map((it) => ({
        title,
        quantity: it.quantity,
        unit_price: Number((it.priceCents / 100).toFixed(2)),
        currency_id: "BRL",
      })),
      external_reference: order.id,
      notification_url: webhookUrl,
      payer: guest
        ? {
            name: guest.name,
            email: guest.email,
            phone: { number: guest.phone },
            identification: { type: "CPF", number: guest.cpf },
            address: parsedNew.success
              ? {
                  zip_code: parsedNew.data.guest?.address.zipCode,
                  street_name: parsedNew.data.guest?.address.street,
                  street_number: parsedNew.data.guest?.address.number,
                }
              : undefined,
          }
        : undefined,
      back_urls: {
        success: `${origin}/api/feedback?orderId=${order.id}`,
        pending: `${origin}/api/feedback?orderId=${order.id}`,
        failure: `${origin}/api/feedback?orderId=${order.id}`,
      },
      auto_return: "approved",
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = (await mpRes.json()) as { init_point?: string; sandbox_init_point?: string; id?: string; message?: string };

    if (!mpRes.ok || (!mpData.init_point && !mpData.sandbox_init_point)) {
      return NextResponse.json(
        { error: mpData.message ?? "Erro ao criar preferência no MercadoPago" },
        { status: 502 }
      );
    }

    const redirectUrl = mpData.init_point ?? mpData.sandbox_init_point!;

    return NextResponse.json({ orderId: order.id, redirectUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento" },
      { status: 502 }
    );
  }
}
