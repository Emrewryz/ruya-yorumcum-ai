// 👇 EN ÜST SATIR
export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Giris yap" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan');
    
    // Paket Fiyatı ve Adı
    let price = plan === 'elite' ? 299 : 119;
    let productName = plan === 'elite' ? "KAHIN" : "KASIF";

    // Şifreler (Test)
    const apiKey = "1180c7f5d9c933234b8d4e6c3c8c8847";
    const apiSecret = "4c25c282fe62b5bf9ca9c9f8b2ab5d1f";
    
    // 👇 BURASI ÖNEMLİ: Eğer 1 çalışmazsa 2, 3 dene. Ama genelde 1'dir.
    const websiteIndex = 1; 

    const orderId = `${Date.now()}`;
    const randomNr = Math.floor(Math.random() * 999999);
    const priceStr = price.toFixed(2); // "119.00"

    // İMZA
    const dataToSign = `${apiSecret}${randomNr}${orderId}${priceStr}0`;
    const signature = crypto.createHash("sha256").update(dataToSign).digest("base64");

    // FORM
    const htmlForm = `
      <!DOCTYPE html>
      <html>
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
          <input type="hidden" name="buyer_phone" value="05325555555">
          <input type="hidden" name="billing_address" value="Istanbul">
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
        <script>document.getElementById("shopier_form").submit();</script>
      </body>
      </html>
    `;

    return new NextResponse(htmlForm, { headers: { "Content-Type": "text/html" } });

  } catch (error) {
    return NextResponse.json({ error: "Hata" }, { status: 500 });
  }
}