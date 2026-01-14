// 👇 EN ÜST SATIR (Dokunma)
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan');

    // 1. Paket Ayarları
    let price = 0;
    let productName = "";

    if (plan === 'pro') {
        price = 119;
        productName = "Ruya Yorumcum - KASIF";
    } else if (plan === 'elite') {
        price = 299;
        productName = "Ruya Yorumcum - KAHIN";
    } else {
        return NextResponse.json({ error: "Gecersiz paket" }, { status: 400 });
    }

    // 2. Şifre Temizliği (Boşlukları Siliyoruz)
    // .trim() komutu, şifrenin başında/sonunda boşluk varsa temizler.
    const apiKey = process.env.SHOPIER_API_KEY?.trim()!;
    const apiSecret = process.env.SHOPIER_API_SECRET?.trim()!;
    const websiteIndex = process.env.SHOPIER_WEBSITE_INDEX?.trim() || "1"; 
    
    const orderId = `${user.id.slice(0, 5)}-${Date.now()}`;
    const randomNr = Math.floor(Math.random() * 999999);

    // 3. KRİTİK DÜZELTME: Fiyat Formatı (119.00 şeklinde zorluyoruz)
    const priceStr = price.toFixed(2); // Örn: "119.00" yapar
    
    // İmza Oluşturma (Sıralama: Secret + Random + OrderID + Price + Currency)
    const dataToSign = `${apiSecret}${randomNr}${orderId}${priceStr}0`;
    
    const signature = crypto.createHash("sha256").update(dataToSign).digest("base64");

    // 4. Form HTML
    const htmlForm = `
      <!DOCTYPE html>
      <html>
      <head><title>Yönlendiriliyor...</title></head>
      <body>
        <form action="https://www.shopier.com/ShowProduct/api_pay4.php" method="post" id="shopier_form">
          <input type="hidden" name="API_key" value="${apiKey}">
          <input type="hidden" name="website_index" value="${websiteIndex}">
          <input type="hidden" name="platform_order_id" value="${orderId}">
          <input type="hidden" name="product_name" value="${productName}">
          <input type="hidden" name="product_type" value="0">
          <input type="hidden" name="buyer_name_last" value="Musteri">
          <input type="hidden" name="buyer_name_first" value="Degerli">
          <input type="hidden" name="buyer_email" value="${user.email}">
          <input type="hidden" name="buyer_phone" value="05325555555"> <input type="hidden" name="billing_address" value="Dijital Teslimat">
          <input type="hidden" name="city" value="Istanbul">
          <input type="hidden" name="country" value="Turkiye">
          <input type="hidden" name="zip_code" value="34000">
          <input type="hidden" name="total_order_value" value="${priceStr}">
          <input type="hidden" name="currency" value="0">
          <input type="hidden" name="modul_version" value="1.0.4">
          <input type="hidden" name="random_nr" value="${randomNr}">
          <input type="hidden" name="signature" value="${signature}">
          <input type="hidden" name="custom_param" value="${user.id}">
        </form>
        <script>
           document.getElementById("shopier_form").submit();
        </script>
      </body>
      </html>
    `;

    return new NextResponse(htmlForm, {
      headers: { "Content-Type": "text/html" },
    });

  } catch (error) {
    console.error("Ödeme Hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}