import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mailgun";
import crypto from "crypto";
import type { Prisma } from "@prisma/client";

type SignatureParts = {
  ts: string;
  v1: string;
} | null;

type MpPayment = {
  id?: number;
  status?: string;
  payment_type_id?: string;
  transaction_amount?: number;
  currency_id?: string;
  external_reference?: string;
  message?: string;
};

type MpWebhookBody = {
  type?: string;
  action?: string;
  data?: { id?: string | number };
  id?: string | number;
};

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
type PaymentMethod = "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "BOLETO";
type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";

function parseMercadoPagoSignature(headerValue: string | null): SignatureParts {
  if (!headerValue) return null;

  const parts = headerValue.split(",").map((p) => p.trim());
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const v1Part = parts.find((p) => p.startsWith("v1="));

  if (!tsPart || !v1Part) return null;

  const ts = tsPart.replace("ts=", "");
  const v1 = v1Part.replace("v1=", "");

  if (!ts || !v1) return null;
  return { ts, v1 };
}

function normalizeSignatureId(id: string): string {
  const isAlphanumeric = /^[a-z0-9]+$/i.test(id);
  return isAlphanumeric ? id.toLowerCase() : id;
}
import { rateLimit } from "@/lib/rate-limit";

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch (error) {
    console.error("Error comparing signatures:", error);
    return false;
  }
}

function getClientIp(req: Request): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return null;
}
function mapPaymentMethod(paymentTypeId: unknown): PaymentMethod {
  const t = typeof paymentTypeId === "string" ? paymentTypeId : "";

  if (t === "pix") return "PIX";
  if (t === "credit_card") return "CREDIT_CARD";
  if (t === "debit_card") return "DEBIT_CARD";
  if (t === "ticket" || t === "bolbradesco" || t === "pec" || t === "atm") return "BOLETO";

  return "CREDIT_CARD";
}

function mapPaymentStatus(status: unknown): PaymentStatus {
  const s = typeof status === "string" ? status : "";

  if (s === "approved") return "PAID";
  if (s === "pending" || s === "in_process" || s === "authorized") return "PENDING";
  if (s === "cancelled") return "CANCELLED";
  if (s === "refunded" || s === "charged_back") return "REFUNDED";

  return "FAILED";
}

function mapOrderStatus(paymentStatus: PaymentStatus): OrderStatus {
  if (paymentStatus === "PAID") return "PAID";
  if (paymentStatus === "REFUNDED") return "REFUNDED";
  if (paymentStatus === "CANCELLED" || paymentStatus === "FAILED") return "CANCELLED";
  return "PENDING";
}

export async function POST(req: Request) {
  let payload: unknown = null;
  let body: MpWebhookBody = {};

  try {
    // Rate limit (proteção contra abuso)
    const rl = rateLimit(req, {
      limit: 60,
      windowMs: 60 * 1000,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições" },
        {
          status: 429,
          headers: rl.retryAfter
            ? { "Retry-After": String(rl.retryAfter) }
            : undefined,
        }
      );
    }

    // Allowlist de IPs (se configurado)
    const allowlistRaw = process.env.MP_WEBHOOK_ALLOWED_IPS;
    if (allowlistRaw) {
      const allowlist = allowlistRaw
        .split(",")
        .map((ip) => ip.trim())
        .filter(Boolean);

      if (allowlist.length) {
        const clientIp = getClientIp(req);
        if (!clientIp || !allowlist.includes(clientIp)) {
          console.warn("IP não autorizado:", clientIp ?? "unknown");
          return NextResponse.json({ error: "IP não autorizado" }, { status: 403 });
        }
      }
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MP_ACCESS_TOKEN ausente");
      return NextResponse.json({ error: "MP_ACCESS_TOKEN ausente" }, { status: 500 });
    }

    const url = new URL(req.url);

    // Validar assinatura do webhook
    const webhookSecret = process.env.MP_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signatureHeader = req.headers.get("x-signature");
      const requestIdHeader = req.headers.get("x-request-id");

      const parsedSignature = parseMercadoPagoSignature(signatureHeader);

      const idFromUrl =
        url.searchParams.get("data.id") ??
        url.searchParams.get("id") ??
        url.searchParams.get("data_id");

      if (!parsedSignature || !requestIdHeader || !idFromUrl) {
        console.warn("Assinatura inválida ou incompleta");
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }

      // Validar timestamp
      const nowSeconds = Math.floor(Date.now() / 1000);
      const tsSeconds = Number(parsedSignature.ts);
      if (!Number.isFinite(tsSeconds) || Math.abs(nowSeconds - tsSeconds) > 5 * 60) {
        console.warn("Assinatura expirada");
        return NextResponse.json({ error: "Assinatura expirada" }, { status: 401 });
      }

      // Validar assinatura HMAC
      const normalizedId = normalizeSignatureId(idFromUrl);
      const signatureTemplate = `id:${normalizedId};request-id:${requestIdHeader};ts:${parsedSignature.ts};`;
      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(signatureTemplate)
        .digest("hex");

      if (!timingSafeEqualHex(expected, parsedSignature.v1)) {
        console.warn("Assinatura HMAC inválida");
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }
    }

    // Parse do body
    try {
      payload = await req.json();
    } catch (parseError) {
      console.warn("Erro ao fazer parse do JSON:", parseError);
      payload = null;
    }

    body = (payload ?? {}) as MpWebhookBody;

    // Extrair payment ID
    const dataId =
      body?.data?.id ??
      body?.id ??
      url.searchParams.get("data.id") ??
      url.searchParams.get("id") ??
      url.searchParams.get("data_id");
    const providerId = dataId !== undefined && dataId !== null ? String(dataId) : null;

    // Criar evento de webhook
    const payloadJson: Prisma.InputJsonValue =
      payload && typeof payload === "object"
        ? (payload as Prisma.InputJsonValue)
        : {};

    const event = providerId
      ? await prisma.webhookEvent.upsert({
          where: { providerId },
          create: {
            providerId,
            payload: payloadJson,
          },
          update: {
            payload: payloadJson,
          },
          select: { id: true, processed: true },
        })
      : await prisma.webhookEvent.create({
          data: {
            providerId,
            payload: payloadJson,
          },
          select: { id: true, processed: true },
        });

    if (!providerId) {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processed: true, processedAt: new Date() },
      });
      return NextResponse.json({ received: true });
    }

    // Verificar se já foi processado (deduplicação)
    if (event.processed) {
      console.log(`Webhook já processado: ${providerId}`);
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processed: true, processedAt: new Date() },
      });
      return NextResponse.json({ received: true, dedup: true });
    }

    // Buscar detalhes do pagamento no MercadoPago
    const mpPaymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${providerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const mpPayment = await mpPaymentRes.json() as MpPayment;

    if (!mpPaymentRes.ok) {
      console.error("Erro ao buscar pagamento no MercadoPago:", mpPayment);
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { 
          processed: false,
          error: mpPayment.message ?? "Erro ao buscar pagamento"
        },
      });
      return NextResponse.json(
        { error: mpPayment.message ?? "Erro ao buscar pagamento" },
        { status: 502 }
      );
    }

    const orderId = mpPayment.external_reference;
    if (!orderId) {
      console.log("Pagamento sem external_reference, ignorando");
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processed: true, processedAt: new Date() },
      });
      return NextResponse.json({ received: true, ignored: true });
    }

    // Mapear status
    const paymentStatus = mapPaymentStatus(mpPayment.status);
    const orderStatus = mapOrderStatus(paymentStatus);
    const amountCents = Math.round(Number(mpPayment.transaction_amount ?? 0) * 100);

    // Atualizar ou criar pagamento
    const existingPayment = await prisma.payment.findFirst({
      where: { mpPaymentId: providerId },
      select: { id: true },
    });

    const mpPaymentJson: Prisma.InputJsonValue =
      mpPayment && typeof mpPayment === "object"
        ? (mpPayment as Prisma.InputJsonValue)
        : {};

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: paymentStatus,
          method: mapPaymentMethod(mpPayment.payment_type_id),
          amountCents,
          rawPayload: mpPaymentJson,
        },
      });
      console.log(`Pagamento atualizado: ${existingPayment.id}`);
    } else {
      await prisma.payment.create({
        data: {
          orderId,
          method: mapPaymentMethod(mpPayment.payment_type_id),
          status: paymentStatus,
          mpPaymentId: providerId,
          amountCents,
          rawPayload: mpPaymentJson,
        },
      });
      console.log(`Novo pagamento criado para ordem: ${orderId}`);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        totalCents: true,
        guestEmail: true,
        guestFullName: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        items: {
          select: {
            quantity: true,
            priceCents: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!order) {
      console.warn("Pedido não encontrado para atualização:", orderId);
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processed: true, processedAt: new Date() },
      });
      return NextResponse.json({ received: true, ignored: true });
    }

    // Atualizar status do pedido
    await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus },
    });

    console.log(`Pedido atualizado: ${orderId} -> ${orderStatus}`);

    // Enviar email de confirmação somente na transição para PAID
    if (orderStatus === "PAID" && order.status !== "PAID") {
      const to = order.user?.email ?? order.guestEmail ?? "";
      if (to) {
        const itemsHtml = order.items
          .map(
            (item) =>
              `<li>${item.product?.name ?? "Produto"} x${item.quantity} — R$ ${(item.priceCents / 100).toFixed(2)}</li>`
          )
          .join("");

        const total = (order.totalCents / 100).toFixed(2);
        const customerName = order.user?.name ?? order.guestFullName ?? "Cliente";

        try {
          await sendEmail({
            to,
            subject: "Pagamento aprovado - Pedido confirmado",
            html: `
              <p>Olá ${customerName},</p>
              <p>Seu pagamento foi aprovado e o pedido foi confirmado.</p>
              <p><strong>Pedido:</strong> ${order.id}</p>
              <p><strong>Total:</strong> R$ ${total}</p>
              <ul>${itemsHtml}</ul>
              <p>Obrigado pela compra!</p>
            `,
          });
        } catch (emailError) {
          console.error("Erro ao enviar email de confirmação:", emailError);
        }
      }
    }

    // Marcar evento como processado
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { processed: true, processedAt: new Date() },
    });

    console.log(`✓ Webhook processado: Order ${orderId}, Payment ${providerId}, Status ${orderStatus}`);

    return NextResponse.json({
      received: true,
      orderId,
      paymentId: providerId,
      status: orderStatus,
    });

  } catch (e) {
    console.error("❌ Erro crítico no webhook:", e);

    // Tentar salvar erro no evento
    try {
      const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
      
      if (body?.id || body?.data?.id) {
        const providerId = String(body.id ?? body.data?.id);
        
        const existingEvent = await prisma.webhookEvent.findFirst({
          where: { providerId },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });

        if (existingEvent) {
          await prisma.webhookEvent.update({
            where: { id: existingEvent.id },
            data: {
              processed: false,
              error: errorMessage,
            },
          });
        }
      }
    } catch (dbError) {
      console.error("Erro ao salvar erro no DB:", dbError);
    }

    return NextResponse.json(
      { error: "Erro interno no processamento do webhook" },
      { status: 500 }
    );
  }
}