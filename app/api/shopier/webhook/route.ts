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

// ─── Fiyat → Kredi Eşleşmesi ─────────────────────────────────────────────────

function priceToCredits(amount: number): number {
  if (amount >= 160) return 10; // Laboratuvar (169 TL)
  if (amount >= 80)  return 3;  // Kâşif (89 TL)
  if (amount >= 1)  return 10;  // Tekli (39 TL)
  return 0;
}

// ─── İmza Doğrulama ──────────────────────────────────────────────────────────
// Shopier: HMAC-SHA256(apiKey + randomNr + installmentCount + status, apiSecret)

function verifySignature(
  apiKey: string,
  apiSecret: string,
  randomNr: string,
  installmentCount: string,
  status: string,
  received: string
): boolean {
  const expected = createHmac("sha256", apiSecret)
    .update(apiKey + randomNr + installmentCount + status)
    .digest("base64");

  if (expected.length !== received.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  }
  return diff === 0;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Body'yi parse et ──
  let body: Record<string, string> = {};
  try {
    const ct = request.headers.get("content-type") ?? "";
    body = ct.includes("application/x-www-form-urlencoded")
      ? Object.fromEntries(new URLSearchParams(await request.text()))
      : await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const apiKey    = process.env.SHOPIER_API_KEY!;
  const apiSecret = process.env.SHOPIER_API_SECRET!;

  if (!apiKey || !apiSecret) {
    console.error("[webhook] Shopier env eksik.");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const {
    status,
    random_nr:         randomNr         = "",
    installment_count: installmentCount = "0",
    signature:         receivedSig      = "",
    platform_order_id: platformOrderId  = "",
    total_order_value: totalOrderValue  = "0",
  } = body;

  // ── 1. İmza doğrula ──
  if (!verifySignature(apiKey, apiSecret, randomNr, installmentCount, status, receivedSig)) {
    console.warn("[webhook] Geçersiz imza — istek reddedildi.");
    return NextResponse.json({ ok: true }, { status: 200 }); // Shopier 200 bekler
  }

  // ── 2. Sadece başarılı ödemeleri işle ──
  if (status !== "success") {
    console.log(`[webhook] Başarısız ödeme: status=${status}`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // ── 3. Kredi miktarını hesapla ──
  const amount  = parseFloat(totalOrderValue) || 0;
  const credits = priceToCredits(amount);

  if (credits === 0) {
    console.warn(`[webhook] Tanımsız tutar: ${amount} TL`);
    // Bilinmeyen tutarı 1 kredi olarak kaydet, admin manuel düzeltir
  }

  const orderId = platformOrderId || randomNr;

  if (!orderId) {
    console.error("[webhook] order_id yok.");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // ── 4. Duplicate koruma ──
  const supabase = getServiceClient();

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) {
    console.warn(`[webhook] Duplicate: order_id=${orderId}`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // ── 5. Unclaimed sipariş kaydı oluştur ──
  const { error } = await supabase
    .from("payments")
    .insert({
      user_id:       null,           // Henüz bilinmiyor — claimOrder'da doldurulacak
      order_id:      orderId,
      amount:        amount,
      currency:      "TRY",
      plan_type:     `${credits}_credits`,
      credit_amount: credits || 1,   // 0 gelirse güvenlik için 1 yaz
      status:        "unclaimed",
    });

  if (error) {
    console.error("[webhook] DB insert hatası:", error.message);
    // Webhook log'a yaz
    await supabase.from("webhook_logs").insert({
      shopier_email:    "",
      shopier_order_id: orderId,
      plan_type:        `${credits}_credits`,
      amount:           amount,
      error_message:    error.message,
      is_resolved:      false,
    });
  } else {
    console.log(`[webhook] ✅ Unclaimed kayıt oluştu: order=${orderId}, credits=${credits}`);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}