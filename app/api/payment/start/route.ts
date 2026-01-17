import crypto from 'crypto';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Ayarlar (Vercel'den veya buradan okusun)
    const apiKey = process.env.SHOPIER_API_KEY;
    const apiSecret = process.env.SHOPIER_API_SECRET;
    
    // Eğer Index parametresi gelirse onu kullan, yoksa 1
    const { searchParams } = new URL(request.url);
    const indexParam = searchParams.get('index') || "1"; 
    const websiteIndex = parseInt(indexParam);

    // 2. Sipariş Verileri
    // Fiyatı "1" olarak (küsuratsız) gönderiyoruz ki hata ihtimali kalmasın
    const price = "1"; 
    const orderId = `TEST-${Math.floor(Math.random() * 999999)}`;
    
    // Callback URL (Canlı siteye dönsün)
    const callbackUrl = "https://ruya-yorumcum-ai.vercel.app/api/payment/callback";

    const args = {
      API_KEY: apiKey,
      WEBSITE_INDEX: websiteIndex,
      PLATFORM_ORDER_ID: orderId,
      PRODUCT_NAME: 'Test Paketi',
      PRODUCT_TYPE: 1, // Dijital Ürün
      BUYER_NAME_LASTNAME: 'Test Kullanicisi',
      BUYER_EMAIL: 'test@example.com',
      BUYER_PHONE: '05555555555',
      BUYER_ADDRESS_LINE1: 'Test Mah',
      BUYER_CITY: 'Istanbul',
      BUYER_COUNTRY: 'Turkiye',
      BUYER_POSTAL_CODE: '34000',
      PRODUCT_PRICE: price,
      CURRENCY: 0,
      // MODUL_VERSION parametresini kaldırdık (Bazen hata yapar)
      CALLBACK_URL: callbackUrl
    };

    // 3. İmza Oluşturma
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
      .createHmac('sha256', apiSecret!)
      .update(signatureData.join(''))
      .digest('base64');

    // 4. Form HTML
    const htmlForm = `
      <!doctype html>
      <html lang="tr">
      <head><meta charset="UTF-8"><title>Ödeme Test</title></head>
      <body>
        <h3>Shopier'e Yönlendiriliyor...</h3>
        <form action="https://www.shopier.com/ShowProduct/api_pay4.php" method="post" id="shopier_form">
          <input type="hidden" name="API_KEY" value="${args.API_KEY}">
          <input type="hidden" name="WEBSITE_INDEX" value="${args.WEBSITE_INDEX}">
          <input type="hidden" name="PLATFORM_ORDER_ID" value="${args.PLATFORM_ORDER_ID}">
          <input type="hidden" name="PRODUCT_NAME" value="${args.PRODUCT_NAME}">
          <input type="hidden" name="PRODUCT_TYPE" value="${args.PRODUCT_TYPE}">
          <input type="hidden" name="BUYER_NAME_LASTNAME" value="${args.BUYER_NAME_LASTNAME}">
          <input type="hidden" name="BUYER_EMAIL" value="${args.BUYER_EMAIL}">
          <input type="hidden" name="BUYER_PHONE" value="${args.BUYER_PHONE}">
          <input type="hidden" name="BUYER_ADDRESS_LINE1" value="${args.BUYER_ADDRESS_LINE1}">
          <input type="hidden" name="BUYER_CITY" value="${args.BUYER_CITY}">
          <input type="hidden" name="BUYER_COUNTRY" value="${args.BUYER_COUNTRY}">
          <input type="hidden" name="BUYER_POSTAL_CODE" value="${args.BUYER_POSTAL_CODE}">
          <input type="hidden" name="PRODUCT_PRICE" value="${args.PRODUCT_PRICE}">
          <input type="hidden" name="CURRENCY" value="${args.CURRENCY}">
          <input type="hidden" name="CALLBACK_URL" value="${args.CALLBACK_URL}">
          <input type="hidden" name="RANDOM_NR" value="${Math.floor(Math.random() * 999999)}">
          <input type="hidden" name="SIGNATURE" value="${signature}">
        </form>
        <script>document.getElementById("shopier_form").submit();</script>
      </body>
      </html>
    `;

    return new NextResponse(htmlForm, { headers: { "Content-Type": "text/html" } });

  } catch (error) {
    return NextResponse.json({ error: "Kod Hatası" }, { status: 500 });
  }
}