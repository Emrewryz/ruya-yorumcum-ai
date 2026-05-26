import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// ─── Service Role Client (RLS bypass) ────────────────────────────────────────
// Webhook'ta aktif session olmaz — service_role gerekli

function getServiceClient() {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !secret) {
    throw new Error("Supabase service role env değişkenleri eksik.");
  }

  return createServiceClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Shopier Webhook Signature Doğrulama ─────────────────────────────────────
// Shopier callback imzası: HMAC-SHA256(apiKey + randomNr + installmentCount + status, apiSecret)

function verifyShopierSignature(
  apiKey: string,
  apiSecret: string,
  randomNr: string,
  installmentCount: string,
  status: string,
  receivedSignature: string
): boolean {
  const data     = apiKey + randomNr + installmentCount + status;
  const expected = createHmac("sha256", apiSecret).update(data).digest("base64");

  // Timing-safe karşılaştırma
  if (expected.length !== receivedSignature.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ receivedSignature.charCodeAt(i);
  }
  return diff === 0;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, string> = {};

  try {
    const contentType = request.headers.get("content-type") ?? "";

    // Shopier form-urlencoded POST gönderir
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      body = await request.json();
    }
  } catch (e) {
    console.error("[shopier/webhook] Body parse hatası:", e);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const apiKey    = process.env.SHOPIER_API_KEY!;
  const apiSecret = process.env.SHOPIER_API_SECRET!;

  if (!apiKey || !apiSecret) {
    console.error("[shopier/webhook] Shopier env değişkenleri eksik.");
    return NextResponse.json({ error: "Config error" }, { status: 500 });
  }

  // ── Gelen alanları çıkar ──
  const {
    status,
    random_nr:         randomNr,
    installment_count: installmentCount = "0",
    signature:         receivedSignature,
    buyer_id_nr:       buyerIdNr,
    order_key:         shopierOrderKey,
    platform_order_id: platformOrderId,
  } = body;

  // ── 1. Signature doğrulama (KRİTİK güvenlik adımı) ──
  if (!receivedSignature || !randomNr) {
    console.warn("[shopier/webhook] İmza veya random_nr eksik.");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const isValid = verifyShopierSignature(
    apiKey, apiSecret, randomNr, installmentCount, status, receivedSignature
  );

  if (!isValid) {
    console.warn("[shopier/webhook] Geçersiz imza. Sahte istek olabilir.");
    // Shopier 200 bekler, hata fırlatma — sadece logla ve çık
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // ── 2. Sadece başarılı ödemeleri işle ──
  if (status !== "success") {
    console.log(`[shopier/webhook] Ödeme başarısız: status=${status}`);

    // Payments tablosunu güncelle
    try {
      const supabase = getServiceClient();
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("order_id", randomNr);
    } catch {}

    return NextResponse.json({ received: true }, { status: 200 });
  }

  // ── 3. buyer_id_nr'dan userId ve credits ayıkla ──
  // Format: "userId|credits" (checkout'ta böyle gömdük)
  if (!buyerIdNr) {
    console.error("[shopier/webhook] buyer_id_nr eksik.");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const parts   = buyerIdNr.split("|");
  const userId  = parts[0]?.trim();
  const credits = parseInt(parts[1]?.trim() ?? "0", 10);

  if (!userId || !credits || credits <= 0) {
    console.error("[shopier/webhook] buyer_id_nr parse hatası:", buyerIdNr);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // ── 4. Duplicate webhook koruması ──
  // Aynı random_nr ile ikinci kez işlem yapılmasın
  const supabase = getServiceClient();

  const { data: existing } = await supabase
    .from("payments")
    .select("status")
    .eq("order_id", randomNr)
    .single();

  if (existing?.status === "completed") {
    console.warn(`[shopier/webhook] Duplicate webhook: order_id=${randomNr}`);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // ── 5. Krediyi ekle (RPC ile atomic) ──
  const { data: txResult, error: txError } = await supabase.rpc(
    "handle_credit_transaction",
    {
      p_user_id:     userId,
      p_amount:      credits,
      p_process_type: "purchase",
      p_description: `Shopier Satın Alma — ${credits} Kredi`,
      p_metadata: {
        shopier_order_key:    shopierOrderKey   ?? null,
        platform_order_id:    platformOrderId   ?? null,
        random_nr:            randomNr,
      },
    }
  );

  if (txError || !txResult?.success) {
    console.error("[shopier/webhook] Kredi ekleme hatası:", txError?.message ?? txResult);

    // Webhook log'a yaz — manuel çözüm için
    await supabase.from("webhook_logs").insert({
      shopier_email:    "",
      shopier_order_id: randomNr,
      plan_type:        `${credits}_credits`,
      amount:           null,
      error_message:    txError?.message ?? "RPC başarısız",
      is_resolved:      false,
    });

    // Shopier 200 bekler — hata verse de 200 dön
    return NextResponse.json({ received: true }, { status: 200 });
  }

  // ── 6. Payment kaydını tamamlandı olarak işaretle ──
  await supabase
    .from("payments")
    .update({ status: "completed" })
    .eq("order_id", randomNr);

  console.log(`[shopier/webhook] ✅ ${credits} kredi eklendi — userId: ${userId}`);
  return NextResponse.json({ received: true }, { status: 200 });
}

// Shopier bazen GET ile sağlık kontrolü yapar
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}