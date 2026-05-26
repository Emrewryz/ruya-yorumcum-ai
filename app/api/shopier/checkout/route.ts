import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

// ─── Paket Tanımları ──────────────────────────────────────────────────────────

const PACKAGES = {
  tekli:       { name: "Rüya Yorumcum — Tekli Rapor",    price: 39,  credits: 1  },
  kasif:       { name: "Rüya Yorumcum — Kâşif Paketi",   price: 89,  credits: 3  },
  laboratuvar: { name: "Rüya Yorumcum — Laboratuvar",    price: 169, credits: 10 },
} as const;

type PackageKey = keyof typeof PACKAGES;

// ─── Shopier Hash Üretimi ─────────────────────────────────────────────────────
// Shopier imzası: HMAC-SHA256(apiKey + randomNr + totalOrderValue + currency, apiSecret)

function generateShopierHash(
  apiKey: string,
  apiSecret: string,
  randomNr: string,
  totalOrderValue: number,
  currency: string
): string {
  const data = apiKey + randomNr + totalOrderValue.toFixed(2) + currency;
  return createHmac("sha256", apiSecret).update(data).digest("base64");
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const packageKey = searchParams.get("package") as PackageKey | null;

  // Geçersiz paket
  if (!packageKey || !PACKAGES[packageKey]) {
    return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
  }

  const pkg = PACKAGES[packageKey];
  const apiKey    = process.env.SHOPIER_API_KEY!;
  const apiSecret = process.env.SHOPIER_API_SECRET!;
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL!;

  if (!apiKey || !apiSecret) {
    console.error("[shopier/checkout] Shopier env değişkenleri eksik.");
    return NextResponse.json({ error: "Ödeme sistemi yapılandırılmamış." }, { status: 500 });
  }

  // ── Kullanıcı bilgilerini çek ──
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Giriş yapmamış → auth sayfasına yönlendir
    return NextResponse.redirect(`${siteUrl}/auth?redirect=/api/shopier/checkout?package=${packageKey}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const fullName  = profile?.full_name || "Kullanıcı";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "Kullanıcı";
  const lastName  = nameParts.slice(1).join(" ") || "-";
  const email     = profile?.email || user.email || "no-reply@ruyayorumcum.com";

  // ── Pending ödeme kaydı oluştur ──
  // Webhook geldiğinde hangi kullanıcıya kredi ekleyeceğimizi bilmek için
  const randomNr = Math.floor(Math.random() * 9000000 + 1000000).toString();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      user_id:    user.id,
      order_id:   randomNr,         // Shopier'den aynı değer geri gelir
      amount:     pkg.price,
      currency:   "TRY",
      plan_type:  packageKey,
      status:     "pending",
    })
    .select("order_id")
    .single();

  if (paymentError) {
    console.error("[shopier/checkout] Payment kaydı hatası:", paymentError.message);
    return NextResponse.json({ error: "Ödeme başlatılamadı." }, { status: 500 });
  }

  // ── Shopier Hash ──
  const currency = "0"; // 0 = TRY
  const signature = generateShopierHash(apiKey, apiSecret, randomNr, pkg.price, currency);

  // ── buyer_id_nr: userId|credits — webhook'ta parse ederiz ──
  const buyerIdNr = `${user.id}|${pkg.credits}`;

  // ── Shopier'e otomatik POST eden HTML formu ──
  const shopierUrl = "https://www.shopier.com/ShowProduct/api_pay4.php";

  const formFields: Record<string, string> = {
    API_key:             apiKey,
    random_nr:           randomNr,
    signature:           signature,
    product_name:        pkg.name,
    product_type:        "0",          // 0 = dijital ürün
    buyer_name:          firstName,
    buyer_surname:       lastName,
    buyer_email:         email,
    buyer_id_nr:         buyerIdNr,    // userId|credits
    buyer_phone:         "",
    item_type:           "0",          // 0 = dijital
    total_order_value:   pkg.price.toFixed(2),
    currency:            currency,
    installment_count:   "0",
    platform:            "0",
    is_in_frame:         "0",
    current_language:    "0",          // 0 = TR
    return_url:          `${siteUrl}/payment/success`,
    cancel_url:          `${siteUrl}/payment/cancel`,
    callback_url:        `${siteUrl}/api/shopier/webhook`,
  };

  const inputs = Object.entries(formFields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${escapeHtml(v)}" />`)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ödeme sayfasına yönlendiriliyorsunuz...</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      gap: 16px;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 2px solid #e4e4e7;
      border-top-color: #18181b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { font-size: 14px; color: #71717a; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Ödeme sayfasına yönlendiriliyorsunuz...</p>
  <form id="shopierForm" action="${shopierUrl}" method="POST">
    ${inputs}
  </form>
  <script>
    document.getElementById('shopierForm').submit();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

// ─── HTML Escape ──────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}