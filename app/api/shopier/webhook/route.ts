import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !secret) throw new Error("Supabase env eksik.");
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface ShopierPayload {
  email:        string;
  orderid:      string;
  currency:     string | number;
  price:        string;
  buyername:    string;
  buyersurname: string;
  productcount: string | number;
  productid:    string | number;
  productlist:  string;
  istest:       string | number;
  customernote?: string;
}

function priceToCredits(amount: number): number {
  if (amount >= 160) return 10;
  if (amount >= 80)  return 3;
  if (amount >= 1)  return 1;
  return 1;
}

// ─── Multipart form-data parser ──────────────────────────────────────────────

function parseMultipart(rawText: string, boundary: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = rawText.split(`--${boundary}`);

  for (const part of parts) {
    // name="fieldname" satırını bul
    const nameMatch = part.match(/Content-Disposition:[^\r\n]*name="([^"]+)"/i);
    if (!nameMatch) continue;

    const fieldName = nameMatch[1];
    // Header bloğu ile değer arasında çift CRLF veya LF var
    const valueMatch = part.match(/\r?\n\r?\n([\s\S]*?)(\r?\n)?$/);
    if (!valueMatch) continue;

    result[fieldName] = valueMatch[1].trim();
  }

  return result;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, string> = {};

  try {
    const ct      = request.headers.get("content-type") ?? "";
    const rawText = await request.text();

    if (ct.includes("multipart/form-data")) {
      const boundaryMatch = ct.match(/boundary=([^\s;]+)/);
      const boundary      = boundaryMatch?.[1];
      if (!boundary) throw new Error("Boundary bulunamadı");
      body = parseMultipart(rawText, boundary);
    } else {
      body = Object.fromEntries(new URLSearchParams(rawText));
    }

    console.log("[webhook] res mevcut:", !!body.res);
    console.log("[webhook] hash mevcut:", !!body.hash);
  } catch (e) {
    console.error("[webhook] Parse hatası:", e);
    return new NextResponse("error", { status: 200 });
  }

  const { res, hash } = body;

  if (!res || !hash) {
    console.warn("[webhook] res veya hash eksik.");
    return new NextResponse("missing parameter", { status: 200 });
  }

  // ── İmza doğrulama ──
  const username  = process.env.SHOPIER_API_KEY!;
  const secretKey = process.env.SHOPIER_API_SECRET!;

  const expectedHash = createHmac("sha256", secretKey)
    .update(res + username)
    .digest("hex");

  if (expectedHash !== hash) {
    console.warn("[webhook] Geçersiz imza.");
    return new NextResponse("invalid hash", { status: 200 });
  }

  // ── Base64 çöz ──
  let payload: ShopierPayload;
  try {
    const decoded = Buffer.from(res, "base64").toString("utf-8");
    console.log("[webhook] Decoded:", decoded);
    payload = JSON.parse(decoded);
  } catch (e) {
    console.error("[webhook] JSON parse hatası:", e);
    return new NextResponse("parse error", { status: 200 });
  }

  const { orderid, price, istest, email } = payload;
  console.log(`[webhook] orderid=${orderid} price=${price} istest=${istest}`);

  // Test siparişini kaydetme
  if (String(istest) === "1") {
    console.log("[webhook] Test siparişi — atlandı.");
    return new NextResponse("success", { status: 200 });
  }

  const amount  = parseFloat(String(price)) || 0;
  const credits = priceToCredits(amount);
  const orderId = String(orderid);

  if (!orderId) {
    console.error("[webhook] orderid yok.");
    return new NextResponse("success", { status: 200 });
  }

  const supabase = getServiceClient();

  // Duplicate kontrol
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) {
    console.warn(`[webhook] Duplicate: ${orderId}`);
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
    console.log(`[webhook] ✅ order=${orderId} credits=${credits}`);
  }

  return new NextResponse("success", { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}