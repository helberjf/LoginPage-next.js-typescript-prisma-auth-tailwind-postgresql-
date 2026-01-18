import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const orderId = url.searchParams.get("orderId");
  const paymentId = url.searchParams.get("payment_id");
  const status = url.searchParams.get("status");
  const merchantOrderId = url.searchParams.get("merchant_order_id");

  const redirectUrl = new URL(`${url.origin}/checkout/success`);

  if (orderId) redirectUrl.searchParams.set("orderId", orderId);
  if (paymentId) redirectUrl.searchParams.set("paymentId", paymentId);
  if (status) redirectUrl.searchParams.set("status", status);
  if (merchantOrderId) redirectUrl.searchParams.set("merchantOrderId", merchantOrderId);

  return NextResponse.redirect(redirectUrl);
}
