// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { validateCpf } from "@/lib/validators/validateCpf";
import { z } from "zod";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

const guestAddressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional().nullable(),
  district: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default("BR"),
});

const guestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  cpf: z.string().min(11),
  phone: z.string().min(10),
  address: guestAddressSchema,
});

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const checkoutItemsSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  guest: guestSchema.optional(),
});

const legacyCheckoutSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  guest: guestSchema.optional(),
});

const checkoutSchema = z.union([checkoutItemsSchema, legacyCheckoutSchema]);

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    const session = await auth();
    const userId = session?.user?.id ?? null;
    const isLogged = !!userId;

    const parsed = checkoutSchema.safeParse(rawBody);

    if (!parsed.success) {
      console.error("Validation error:", parsed.error);
      return NextResponse.json(
        { error: "Dados inválidos"},
        { status: 400 }
      );
    }

    const data = parsed.data;
    const items = "items" in data
      ? data.items
      : [{ productId: data.productId, quantity: data.quantity }];
    const guest = "guest" in data ? data.guest : undefined;

    // Validar guest para usuários não logados
    if (!isLogged && !guest) {
      return NextResponse.json(
        { error: "Dados de visitante obrigatórios" },
        { status: 400 }
      );
    }

    // Validar CPF
    if (!isLogged && guest && !validateCpf(guest.cpf)) {
      return NextResponse.json(
        { error: "CPF inválido" },
        { status: 400 }
      );
    }

    // Buscar produtos e validar estoque
    const productIds = items.map(item => item.productId);
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
        name: true,
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Um ou mais produtos não foram encontrados" },
        { status: 400 }
      );
    }

    // Validar estoque e calcular preços
    const orderItems = items.map((cartItem) => {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product) {
        throw new Error(`Produto ${cartItem.productId} não encontrado`);
      }
      if (product.stock < cartItem.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}`);
      }

      const finalPrice = product.discountPercent && product.discountPercent > 0
        ? Math.round(product.priceCents * (1 - product.discountPercent / 100))
        : product.priceCents;

      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        priceCents: finalPrice,
        name: product.name,
      };
    });

    const totalCents = orderItems.reduce(
      (sum, item) => sum + (item.priceCents * item.quantity),
      0
    );

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        userId,
        guestFullName: guest?.name ?? null,
        guestEmail: guest?.email ?? null,
        guestCpf: guest?.cpf ?? null,
        guestPhone: guest?.phone ?? null,
        totalCents,
        items: {
          create: orderItems.map((item) => ({
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
      console.warn("MP_ACCESS_TOKEN não configurado - redirecionando sem pagamento");
      return NextResponse.json({
        orderId: order.id,
        redirectUrl: `${origin}/checkout/success?orderId=${order.id}`,
      });
    }

    // Criar preferência do MercadoPago
    const webhookUrl = process.env.MP_WEBHOOK_URL ?? `${origin}/api/mercadopago/webhook`;

    // Preparar dados do pagador
    const payerData = isLogged && session?.user
      ? {
          email: session.user.email ?? undefined,
        }
      : guest
      ? {
          name: guest.name.split(' ')[0],
          surname: guest.name.split(' ').slice(1).join(' ') || guest.name.split(' ')[0],
          email: guest.email,
          phone: (() => {
            const phoneDigits = onlyDigits(guest.phone);
            if (phoneDigits.length < 10) return undefined;
            return {
              area_code: phoneDigits.slice(0, 2),
              number: phoneDigits.slice(2),
            };
          })(),
          identification: (() => {
            const cpfDigits = onlyDigits(guest.cpf);
            if (cpfDigits.length < 11) return undefined;
            return {
              type: "CPF",
              number: cpfDigits,
            };
          })(),
          address: (() => {
            const zipDigits = onlyDigits(guest.address.zipCode);
            const numberDigits = onlyDigits(guest.address.number);
            const streetNumber = Number(numberDigits);
            if (!zipDigits || !guest.address.street || !Number.isFinite(streetNumber)) {
              return undefined;
            }
            return {
              zip_code: zipDigits,
              street_name: guest.address.street,
              street_number: streetNumber,
            };
          })(),
        }
      : undefined;

    const successUrl = `${origin}/checkout/success?orderId=${order.id}`;
    const failureUrl = `${origin}/checkout/failure?orderId=${order.id}`;
    const pendingUrl = successUrl;
    const useAutoReturn = origin.startsWith("https://");

    const preferenceBody: Record<string, unknown> = {
      items: orderItems.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: Number((item.priceCents / 100).toFixed(2)),
        currency_id: "BRL",
      })),
      external_reference: order.id,
      notification_url: webhookUrl,
      payer: payerData,
      back_urls: {
        success: successUrl,
        pending: pendingUrl,
        failure: failureUrl,
      },
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
      statement_descriptor: "MINHA LOJA",
    };

    if (useAutoReturn) {
      preferenceBody.auto_return = "approved";
    }

    console.log("Criando preferência MercadoPago:", JSON.stringify(preferenceBody, null, 2));

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferenceBody),
    });

    if (!mpRes.ok) {
      const errorText = await mpRes.text();
      console.error("Erro MercadoPago:", mpRes.status, errorText);
      return NextResponse.json(
        { error: `Erro na API do MercadoPago: ${mpRes.status}`, details: errorText },
        { status: 502 }
      );
    }

    const mpData = await mpRes.json() as {
      init_point?: string;
      sandbox_init_point?: string;
      id?: string;
      message?: string;
    };

    console.log("Resposta MercadoPago:", mpData);

    if (!mpData.init_point && !mpData.sandbox_init_point) {
      console.error("URL de checkout não encontrada:", mpData);
      return NextResponse.json(
        { error: mpData.message ?? "Erro ao gerar link de pagamento" },
        { status: 502 }
      );
    }

    const redirectUrl = mpData.init_point ?? mpData.sandbox_init_point!;

    return NextResponse.json({
      orderId: order.id,
      redirectUrl,
      preferenceId: mpData.id,
    });

  } catch (e) {
    console.error("Erro ao criar checkout:", e);
    return NextResponse.json(
      { 
        error: "Erro interno ao processar pagamento",
        details: e instanceof Error ? e.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  }
}