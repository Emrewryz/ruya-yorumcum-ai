"use server";

import { createClient } from "@/utils/supabase/server";
import { PACKAGES } from "../../utils/packages";
import { randomBytes } from "crypto";

// Shopier API Bilgileri (.env dosyasından)
const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY;
const SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET;
const SHOPIER_WEBSITE_INDEX = 1; // Genelde 1'dir, değişirse Shopier panelinden bak.

// 🔥 KRİTİK AYAR: Sitenin Gerçek Adresi
// Shopier işlemleri bittiğinde buraya geri dönecek.
const APP_URL = "https://www.ruyayorumcum.com.tr";

export async function createShopierOrder(packageId: string) {
  const supabase = createClient();

  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // 2. Paket Kontrolü
  const selectedPackage = PACKAGES.find(p => p.id === packageId);
  if (!selectedPackage) return { error: "Geçersiz paket." };

  // 3. Profil Bilgilerini Al (Shopier zorunlu tutuyor)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, id') 
    .eq('id', user.id)
    .single();

  if (!profile) return { error: "Profil bulunamadı." };

  // 4. Benzersiz Sipariş Numarası Oluştur
  // Format: user_id + "-" + randomString
  // Webhook'ta bu user_id'yi ayrıştırıp krediyi ona yükleyeceğiz.
  const orderId = `${user.id}-${randomBytes(4).toString('hex')}`;

  // 5. Shopier Form Verilerini Hazırla
  const args = {
    API_KEY: SHOPIER_API_KEY,
    WEBSITE_INDEX: SHOPIER_WEBSITE_INDEX,
    PLATFORM_ORDER_ID: orderId,
    PRODUCT_NAME: selectedPackage.name,
    PRODUCT_TYPE: 1, // 1: Fiziksel, 2: Dijital (Dijital seçersek kargo istemez)
    BUYER_NAME: profile.full_name?.split(' ').slice(0, -1).join(' ') || "Musteri",
    BUYER_SURNAME: profile.full_name?.split(' ').slice(-1).join(' ') || "Soyad",
    BUYER_EMAIL: user.email || "user@ruyayorumcum.com",
    BUYER_ACCOUNT_AGE: 0,
    BUYER_ID_NR: 0,
    BUYER_PHONE: "05555555555", // Shopier zorunlu tutar, dummy veri atabiliriz
    TOTAL_ORDER_VALUE: selectedPackage.price.toFixed(2), // Örn: "39.00"
    CURRENCY: 0, // 0: TL
    MODUL_VERSION: '1.0.4',
    // Geri Dönüş URL'i (Ödeme bitince nereye haber verilecek?)
    CALLBACK_URL: `${APP_URL}/api/shopier-webhook` 
  };

  // 6. Form HTML'ini Oluştur (Auto-Submit)
  const generateShopierForm = (data: any) => {
    // Güvenlik İmzası (Signature) Oluşturma
    // Shopier dökümantasyonuna göre sıralama önemlidir: random_nr + platform_order_id + total_order_value + currency
    const random_nr = randomBytes(4).toString('hex');
    const signatureData = random_nr + data.PLATFORM_ORDER_ID + data.TOTAL_ORDER_VALUE + data.CURRENCY;
    
    // HMAC SHA256 ile imzala
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', SHOPIER_API_SECRET)
      .update(signatureData)
      .digest('base64');

    return `
      <form action="https://www.shopier.com/ShowProduct/api_pay4.php" method="post" id="shopier_payment_form">
        <input type="hidden" name="API_KEY" value="${data.API_KEY}">
        <input type="hidden" name="WEBSITE_INDEX" value="${data.WEBSITE_INDEX}">
        <input type="hidden" name="PLATFORM_ORDER_ID" value="${data.PLATFORM_ORDER_ID}">
        <input type="hidden" name="PRODUCT_NAME" value="${data.PRODUCT_NAME}">
        <input type="hidden" name="PRODUCT_TYPE" value="2">
        <input type="hidden" name="BUYER_NAME" value="${data.BUYER_NAME}">
        <input type="hidden" name="BUYER_SURNAME" value="${data.BUYER_SURNAME}">
        <input type="hidden" name="BUYER_EMAIL" value="${data.BUYER_EMAIL}">
        <input type="hidden" name="BUYER_PHONE" value="${data.BUYER_PHONE}">
        <input type="hidden" name="TOTAL_ORDER_VALUE" value="${data.TOTAL_ORDER_VALUE}">
        <input type="hidden" name="CURRENCY" value="${data.CURRENCY}">
        <input type="hidden" name="random_nr" value="${random_nr}">
        <input type="hidden" name="signature" value="${signature}">
        <input type="hidden" name="callback" value="${data.CALLBACK_URL}">
      </form>
      <script>document.getElementById("shopier_payment_form").submit();</script>
    `;
  };

  const htmlForm = generateShopierForm(args);

  return { success: true, html: htmlForm };
}   