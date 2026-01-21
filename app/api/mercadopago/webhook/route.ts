import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function parseMercadoPagoSignature(headerValue: string | null) {
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

function normalizeSignatureId(id: string) {
  const isAlphanumeric = /^[a-z0-9]+$/i.test(id);
  return isAlphanumeric ? id.toLowerCase() : id;
}

function timingSafeEqualHex(a: string, b: string) {
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

function mapPaymentMethod(paymentTypeId: unknown) {
  const t = typeof paymentTypeId === "string" ? paymentTypeId : "";

  if (t === "pix") return "PIX" as const;
  if (t === "credit_card") return "CREDIT_CARD" as const;
  if (t === "debit_card") return "DEBIT_CARD" as const;
  if (t === "ticket" || t === "bolbradesco" || t === "pec" || t === "atm") return "BOLETO" as const;

  return "CREDIT_CARD" as const;
}

function mapPaymentStatus(status: unknown) {
  const s = typeof status === "string" ? status : "";

  if (s === "approved") return "PAID" as const;
  if (s === "pending" || s === "in_process" || s === "authorized") return "PENDING" as const;
  if (s === "cancelled") return "CANCELLED" as const;
  if (s === "refunded" || s === "charged_back") return "REFUNDED" as const;

  return "FAILED" as const;
}

function mapOrderStatus(paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED") {
  if (paymentStatus === "PAID") return "PAID" as const;
  if (paymentStatus === "REFUNDED") return "REFUNDED" as const;
  if (paymentStatus === "CANCELLED" || paymentStatus === "FAILED") return "CANCELLED" as const;
  return "PENDING" as const;
}

type MpPayment = {
  id?: number;
  status?: string;
  payment_type_id?: string;
  transaction_amount?: number;
  currency_id?: string;
  external_reference?: string;
};

type MpWebhookBody = {
  type?: string;
  action?: string;
  data?: { id?: string | number };
  id?: string | number;
};

export async function POST(req: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "MP_ACCESS_TOKEN ausente" }, { status: 500 });
    }

    const url = new URL(req.url);

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
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }

      const nowSeconds = Math.floor(Date.now() / 1000);
      const tsSeconds = Number(parsedSignature.ts);
      if (!Number.isFinite(tsSeconds) || Math.abs(nowSeconds - tsSeconds) > 5 * 60) {
        return NextResponse.json({ error: "Assinatura expirada" }, { status: 401 });
      }

      const normalizedId = normalizeSignatureId(idFromUrl);
      const signatureTemplate = `id:${normalizedId};request-id:${requestIdHeader};ts:${parsedSignature.ts};`;
      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(signatureTemplate)
        .digest("hex");

      if (!timingSafeEqualHex(expected, parsedSignature.v1)) {
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "MP_WEBHOOK_SECRET ausente" }, { status: 500 });
    }

    let payload: unknown = null;
    try {
      payload = await req.json();
    } catch {
      payload = null;
    }

    const body = (payload ?? {}) as MpWebhookBody;

    const dataId =
      body?.data?.id ??
      body?.id ??
      url.searchParams.get("data.id") ??
      url.searchParams.get("id") ??
      url.searchParams.get("data_id");
    const providerId = dataId !== undefined && dataId !== null ? String(dataId) : null;

    const event = await prisma.webhookEvent.create({
      data: {
        providerId,
        payload: (payload ?? {}) as any,
      },
      select: { id: true },
    });

    if (!providerId) {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processed: true, processedAt: new Date() },
      });
      return NextResponse.json({ received: true });
    }

    const alreadyProcessed = await prisma.webhookEvent.findFirst({
      where: {
        providerId,
        processed: true,
      },
      select: { id: true },
    });

    if (alreadyProcessed) {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processed: true, processedAt: new Date() },
      });
      return NextResponse.json({ received: true, dedup: true });
    }

    const mpPaymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${providerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const mpPayment = (await mpPaymentRes.json()) as MpPayment & { message?: string };

    if (!mpPaymentRes.ok) {
      console.error("MercadoPago payment fetch error", mpPayment);
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processed: false },
      });
      return NextResponse.json({ error: mpPayment.message ?? "Erro ao buscar pagamento" }, { status: 502 });
    }

    const orderId = mpPayment.external_reference;
    if (!orderId) {
      await prisma.webhookEvent.update({
        where: { id: event.id },
        data: { processed: true, processedAt: new Date() },
      });
      return NextResponse.json({ received: true, ignored: true });
    }

    const paymentStatus = mapPaymentStatus(mpPayment.status);
    const orderStatus = mapOrderStatus(paymentStatus);

    const amountCents = Math.round(Number(mpPayment.transaction_amount ?? 0) * 100);

    const existingPayment = await prisma.payment.findFirst({
      where: { mpPaymentId: providerId },
      select: { id: true },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: paymentStatus,
          method: mapPaymentMethod(mpPayment.payment_type_id),
          amountCents,
          rawPayload: mpPayment as any,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId,
          method: mapPaymentMethod(mpPayment.payment_type_id),
          status: paymentStatus,
          mpPaymentId: providerId,
          amountCents,
          rawPayload: mpPayment as any,
        },
      });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: orderStatus },
    });

    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { processed: true, processedAt: new Date() },
    });

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro no webhook" }, { status: 500 });
  }
}
