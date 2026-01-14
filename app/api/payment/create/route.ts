export const dynamic = 'force-dynamic';
import { createClient } from "@/utils/supabase/server"; // Veya senin client yolun
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    // 1. URL'den hangi paketin seçildiğini al (örn: ?plan=pro)
    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan');
    
    // 2. Kullanıcıyı Kontrol Et
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    // 3. Paket Ayarları
    let productPrice = 0;
    let productName = "";

    if (plan === 'pro') {
        productPrice = 119;
        productName = "Ruya Yorumcum - KASIF";
    } else if (plan === 'elite') {
        productPrice = 299;
        productName = "Ruya Yorumcum - KAHIN";
    } else {
        return NextResponse.json({ error: "Geçersiz paket" }, { status: 400 });
    }

    // 4. Shopier Değişkenleri
    const apiKey = process.env.SHOPIER_API_KEY!;
    const apiSecret = process.env.SHOPIER_API_SECRET!;
    const websiteIndex = 1; // Shopier panelinde Website Index kaçsa o (Genelde 1)
    
    // Sipariş Numarası Oluştur (Benzersiz olmalı)
    const orderId = `${user.id.slice(0, 5)}-${Date.now()}`;
    
    // 5. KRİTİK: İmza Oluşturma (Sıralama Çok Önemli!)
    // Formül: API_SECRET + random_nr + platform_order_id + total_order_value + currency
    const randomNr = Math.floor(Math.random() * 999999);
    const dataToSign = `${apiSecret}${randomNr}${orderId}${productPrice}0`;
    
    // SHA-256 ile şifrele
    const signature = crypto.createHash("sha256").update(dataToSign).digest("base64");

    // 6. Otomatik Gönderilen Form (Auto-Submit Form)
    // Bu HTML, kullanıcıyı saniyesinde Shopier ödeme ekranına atar.
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
          <input type="hidden" name="product_type" value="1"> <input type="hidden" name="buyer_name_last" value="Musteri">
          <input type="hidden" name="buyer_name_first" value="Degerli">
          <input type="hidden" name="buyer_email" value="${user.email}">
          <input type="hidden" name="buyer_phone" value="05555555555"> <input type="hidden" name="billing_address" value="Dijital Teslimat">
          <input type="hidden" name="city" value="Istanbul">
          <input type="hidden" name="country" value="Turkiye">
          <input type="hidden" name="zip_code" value="34000">
          <input type="hidden" name="total_order_value" value="${productPrice}">
          <input type="hidden" name="currency" value="0"> <input type="hidden" name="modul_version" value="1.0.4">
          <input type="hidden" name="random_nr" value="${randomNr}">
          <input type="hidden" name="signature" value="${signature}">
          <input type="hidden" name="custom_param" value="${user.id}"> </form>
        <script>
          document.getElementById("shopier_form").submit();
        </script>
        <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#020617;color:white;font-family:sans-serif;">
            <h2>Güvenli ödeme sayfasına yönlendiriliyorsunuz...</h2>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(htmlForm, {
      headers: { "Content-Type": "text/html" }, // JSON değil HTML döndürüyoruz
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}