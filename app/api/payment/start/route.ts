import crypto from 'crypto';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // .env dosyasındaki anahtarların Görsel 3'tekiyle AYNI olduğundan emin ol
    // Görseldeki API Kullanıcı: 6530c225cf9e22b211f5c506207493ec
    const apiKey = process.env.SHOPIER_API_KEY; 
    const apiSecret = process.env.SHOPIER_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "API anahtarları eksik" }, { status: 500 });
    }
    
    // URL'den planı al (Yoksa varsayılan)
    const planType = searchParams.get('plan') || "pro"; 

    // Fiyat belirle (Test için 1 TL yapabilirsin ama canlıda normal fiyat olmalı)
    let price = "119"; 
    if(planType === "elite") price = "299";
    
    // !! GÖRSEL 3'TEKİ (1) İBARESİNE GÖRE İNDEX 1 OLMALI !!
    const websiteIndex = 1; 

    // SİPARİŞ NUMARASI: Çakışmayı önlemek için tarih bazlı yapıyoruz
    // Shopier aynı sipariş numarası gelirse hata verir.
    const uniqueId = Date.now().toString().slice(-9); // Son 9 haneyi al
    const orderId = `R-${uniqueId}`; 
    
    // Paneldeki "Geri Dönüş URL" ile aynı olmalı
    const callbackUrl = "https://ruya-yorumcum-ai.vercel.app/api/payment/callback";

    // KULLANICI BİLGİLERİ (Zorunlu alanlar)
    // Gerçek uygulamada bunları request.body'den veya session'dan alman lazım
    const args = {
      API_KEY: apiKey,
      WEBSITE_INDEX: websiteIndex,
      PLATFORM_ORDER_ID: orderId,
      PRODUCT_NAME: planType === 'elite' ? 'Kahin Paketi' : 'Kaşif Paketi',
      PRODUCT_TYPE: 1, // 0:Fiziksel, 1:Dijital/Yazılım
      BUYER_NAME_LASTNAME: 'Misafir Kullanici',
      BUYER_EMAIL: 'info@ruyayorumcumai.com',
      BUYER_PHONE: '05555555555',
      PRODUCT_PRICE: price, 
      CURRENCY: 0, 
      MODUL_VERSION: '1.0.9', // GÖRSEL 2'DEKİ WOOCOMMERCE VERSİYONU
      CALLBACK_URL: callbackUrl
    };

    // İMZA OLUŞTURMA (Sıralama asla değişmemeli)
    // Shopier Doküman Sırası: API_KEY + WEBSITE_INDEX + PLATFORM_ORDER_ID + PRODUCT_TYPE + PRODUCT_NAME + PRODUCT_PRICE + CURRENCY
    const signatureData = [
      args.API_KEY,
      String(args.WEBSITE_INDEX),
      args.PLATFORM_ORDER_ID,
      String(args.PRODUCT_TYPE),
      args.PRODUCT_NAME,
      String(args.PRODUCT_PRICE),
      String(args.CURRENCY)
    ];

    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(signatureData.join(''))
      .digest('base64');

    // HTML Formu
    const htmlForm = `
      <!doctype html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Ödeme Yönlendirmesi</title>
      </head>
      <body>
        <div style="text-align:center; margin-top:50px;">
            <h3>Shopier Güvenli Ödeme Sayfasına Bağlanılıyor...</h3>
            <p>Lütfen bekleyiniz.</p>
        </div>
        <form action="https://www.shopier.com/ShowProduct/api_pay4.php" method="post" id="shopier_form">
          <input type="hidden" name="API_KEY" value="${args.API_KEY}">
          <input type="hidden" name="WEBSITE_INDEX" value="${args.WEBSITE_INDEX}">
          <input type="hidden" name="PLATFORM_ORDER_ID" value="${args.PLATFORM_ORDER_ID}">
          <input type="hidden" name="PRODUCT_NAME" value="${args.PRODUCT_NAME}">
          <input type="hidden" name="PRODUCT_TYPE" value="${args.PRODUCT_TYPE}">
          <input type="hidden" name="BUYER_NAME_LASTNAME" value="${args.BUYER_NAME_LASTNAME}">
          <input type="hidden" name="BUYER_EMAIL" value="${args.BUYER_EMAIL}">
          <input type="hidden" name="BUYER_PHONE" value="${args.BUYER_PHONE}">
          <input type="hidden" name="PRODUCT_PRICE" value="${args.PRODUCT_PRICE}">
          <input type="hidden" name="CURRENCY" value="${args.CURRENCY}">
          <input type="hidden" name="CALLBACK_URL" value="${args.CALLBACK_URL}">
          <input type="hidden" name="MODUL_VERSION" value="${args.MODUL_VERSION}">
          <input type="hidden" name="SIGNATURE" value="${signature}">
        </form>
        <script>
            setTimeout(function() {
                document.getElementById("shopier_form").submit();
            }, 750);
        </script>
      </body>
      </html>
    `;

    return new NextResponse(htmlForm, { headers: { "Content-Type": "text/html" } });

  } catch (error) {
    return NextResponse.json({ error: "Hata oluştu" }, { status: 500 });
  }
}