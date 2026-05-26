import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

// ─── Service Role Client ──────────────────────────────────────────────────────

function getServiceClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !secret) throw new Error("Supabase env eksik.");
  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Shopier OSB Veri Tipi ────────────────────────────────────────────────────

interface ShopierPayload {
  email:         string;
  orderid:       string;
  currency:      string; // "0"=TL, "1"=USD, "2"=EUR
  price:         string;
  buyername:     string;
  buyersurname:  string;
  productcount:  string;
  productid:     string;
  productlist:   string;
  istest:        string; // "0"=canlı, "1"=test
  customernote?: string;
}

// ─── Fiyat → Kredi ───────────────────────────────────────────────────────────

function priceToCredits(amount: number): number {
  if (amount >= 160) return 10; // Laboratuvar 169 TL
  if (amount >= 80)  return 3;  // Kâşif 89 TL
  if (amount >= 1)  return 1;  // Tekli 39 TL
  return 1;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, string> = {};

  try {
    const rawText = await request.text();
    console.log("[webhook] RAW:", rawText);
    body = Object.fromEntries(new URLSearchParams(rawText));
  } catch (e) {
    console.error("[webhook] Parse hatası:", e);
    return new NextResponse("error", { status: 200 });
  }

  const { res, hash } = body;

  // ── 1. Zorunlu alanlar ──
  if (!res || !hash) {
    console.warn("[webhook] res veya hash eksik.");
    return new NextResponse("missing parameter", { status: 200 });
  }

  // ── 2. İmza doğrulama ──
  // Shopier: HMAC-SHA256(res + username, key) — hex formatında
  const username  = process.env.SHOPIER_API_KEY!;    // username (6530c...)
  const secretKey = process.env.SHOPIER_API_SECRET!; // key (b1b678...)

  const expectedHash = createHmac("sha256", secretKey)
    .update(res + username)
    .digest("hex");

  console.log("[webhook] Beklenen hash:", expectedHash);
  console.log("[webhook] Gelen hash:   ", hash);

  if (expectedHash !== hash) {
    console.warn("[webhook] Geçersiz imza — istek reddedildi.");
    return new NextResponse("invalid hash", { status: 200 });
  }

  // ── 3. Base64 JSON çöz ──
  let payload: ShopierPayload;
  try {
    const decoded = Buffer.from(res, "base64").toString("utf-8");
    console.log("[webhook] Decoded payload:", decoded);
    payload = JSON.parse(decoded);
  } catch (e) {
    console.error("[webhook] JSON parse hatası:", e);
    return new NextResponse("parse error", { status: 200 });
  }

  const { orderid, price, istest, email } = payload;

  console.log(`[webhook] orderid=${orderid} price=${price} istest=${istest} email=${email}`);

  // ── 4. Test siparişlerini kaydetme (isteğe bağlı) ──
  if (istest === "1") {
    console.log("[webhook] Test siparişi — atlandı.");
    return new NextResponse("success", { status: 200 });
  }

  // ── 5. Kredi hesapla ──
  const amount  = parseFloat(price) || 0;
  const credits = priceToCredits(amount);

  if (!orderid) {
    console.error("[webhook] orderid yok.");
    return new NextResponse("success", { status: 200 });
  }

  const supabase = getServiceClient();

  // ── 6. Duplicate kontrol ──
  const { data: existing } = await supabase
    .from("payments")
    .select("id, status")
    .eq("order_id", orderid)
    .maybeSingle();

  if (existing) {
    console.warn(`[webhook] Duplicate: ${orderid} — atlandı.`);
    return new NextResponse("success", { status: 200 });
  }

  // ── 7. Unclaimed kayıt oluştur ──
  const { error } = await supabase
    .from("payments")
    .insert({
      user_id:       null,
      order_id:      orderid,
      amount:        amount,
      currency:      "TRY",
      plan_type:     `${credits}_credits`,
      credit_amount: credits,
      status:        "unclaimed",
    });

  if (error) {
    console.error("[webhook] DB insert hatası:", error.message);

    await supabase.from("webhook_logs").insert({
      shopier_email:    email ?? "",
      shopier_order_id: orderid,
      plan_type:        `${credits}_credits`,
      amount:           amount,
      error_message:    error.message,
      is_resolved:      false,
    });
  } else {
    console.log(`[webhook] ✅ Kaydedildi: order=${orderid} credits=${credits}`);
  }

  // Shopier "success" yanıtı beklediğini belirtiyor
  return new NextResponse("success", { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}