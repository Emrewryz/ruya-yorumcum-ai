import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !secret) throw new Error("Supabase env eksik.");
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Shopier'in bilinen sunucu IP aralıkları
interface ShopierPayload {
  email:        string;
  orderid:      string;
  currency:     string | number;
  price:        string;
  buyername:    string;
  buyersurname: string;
  productid:    string | number;
  productcount: string | number;
  istest:       string | number;
  customernote?: string;
}

function priceToCredits(amount: number): number {
  if (amount >= 249) return 100;
  if (amount >= 89)  return 30;
  if (amount >= 39)  return 10;
  return 1;
}

function parseMultipart(rawText: string, boundary: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = rawText.split(`--${boundary}`);
  for (const part of parts) {
    const nameMatch  = part.match(/Content-Disposition:[^\r\n]*name="([^"]+)"/i);
    const valueMatch = part.match(/\r?\n\r?\n([\s\S]*?)(\r?\n)?$/);
    if (nameMatch && valueMatch) {
      result[nameMatch[1]] = valueMatch[1].trim();
    }
  }
  return result;
}

export async function POST(request: NextRequest) {

  // ── Body parse ──
  let body: Record<string, string> = {};
  try {
    const ct      = request.headers.get("content-type") ?? "";
    const rawText = await request.text();

    if (ct.includes("multipart/form-data")) {
      const boundary = ct.match(/boundary=([^\s;]+)/)?.[1];
      if (!boundary) throw new Error("Boundary yok");
      body = parseMultipart(rawText, boundary);
    } else {
      body = Object.fromEntries(new URLSearchParams(rawText));
    }
  } catch (e) {
    console.error("[webhook] Parse hatası:", e);
    return new NextResponse("error", { status: 200 });
  }

  const { res } = body;
  if (!res) {
    console.warn("[webhook] res alanı eksik.");
    return new NextResponse("missing parameter", { status: 200 });
  }

  // ── Base64 çöz ──
  let payload: ShopierPayload;
  try {
    payload = JSON.parse(Buffer.from(res, "base64").toString("utf-8"));
    console.log("[webhook] orderid:", payload.orderid, "price:", payload.price, "istest:", payload.istest);
  } catch (e) {
    console.error("[webhook] JSON parse hatası:", e);
    return new NextResponse("parse error", { status: 200 });
  }

  const { orderid, price, istest, email } = payload;

  // Test siparişlerini kaydetme
  if (String(istest) === "1") {
    console.log("[webhook] Test siparişi — atlandı.");
    return new NextResponse("success", { status: 200 });
  }

  const amount  = parseFloat(String(price)) || 0;
  const credits = priceToCredits(amount);
  const orderId = String(orderid);

  const supabase = getServiceClient();

  // Duplicate kontrol
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) {
    console.warn("[webhook] Duplicate:", orderId);
    return new NextResponse("success", { status: 200 });
  }

  const { error } = await supabase
    .from("payments")
    .insert({
      user_id:       null,
      order_id:      orderId,
      amount:        amount,
      currency:      "TRY",
      plan_type:     `${credits}_credits`,
      credit_amount: credits,
      status:        "unclaimed",
    });

  if (error) {
    console.error("[webhook] DB hatası:", error.message);
    await supabase.from("webhook_logs").insert({
      shopier_email:    String(email ?? ""),
      shopier_order_id: orderId,
      plan_type:        `${credits}_credits`,
      amount:           amount,
      error_message:    error.message,
      is_resolved:      false,
    });
  } else {
    console.log(`[webhook] ✅ Kaydedildi: order=${orderId} credits=${credits}`);
  }

  return new NextResponse("success", { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}