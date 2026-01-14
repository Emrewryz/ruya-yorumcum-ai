import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const body = await req.json();
    const { plan, buyerInfo } = body;

    // 1. Paket Bilgileri
    const productMap = {
      pro: { name: "Ruya Yorumcum - KASIF", price: 119 },
      elite: { name: "Ruya Yorumcum - KAHIN", price: 299 }
    };

    const selectedProduct = productMap[plan as keyof typeof productMap];
    if (!selectedProduct) return NextResponse.json({ error: "Geçersiz paket" }, { status: 400 });

    // 2. Sipariş Numarası ve Değişkenler
    const orderId = `${user.id.slice(0, 8)}-${Date.now()}`;
    const apiKey = process.env.SHOPIER_API_KEY!;
    const apiSecret = process.env.SHOPIER_API_SECRET!;
    const websiteIndex = process.env.SHOPIER_WEBSITE_INDEX || 1;
    const randomNr = Math.floor(Math.random() * 999999999);

    // 3. İMZA OLUŞTURMA (Shopier'in en kritik kısmı)
    // Sıralama: API_SECRET + random_nr + platform_order_id + total_order_value + currency
    // ÖNEMLİ: currency her zaman "0" (TL) olmalı.
    const dataToSign = `${apiSecret}${randomNr}${orderId}${selectedProduct.price}0`;
    
    const signature = crypto.createHash("sha256").update(dataToSign).digest("base64");

    // 4. Shopier Form Verisi (Düzeltilmiş)
    const shopierData = {
      API_key: apiKey,
      website_index: websiteIndex,
      platform_order_id: orderId,
      product_name: selectedProduct.name,
      product_type: 0, // <-- KRİTİK DEĞİŞİKLİK: 0 (Fiziksel) yaptık ki hata vermesin.
      buyer_name_last: buyerInfo.surname,
      buyer_name_first: buyerInfo.name,
      buyer_email: user.email || "musteri@ruyayorumcum.com",
      buyer_phone: buyerInfo.phone,
      billing_address: "Dijital Teslimat - Adres Gerekmez", // Adres hatası almamak için dolu gönderiyoruz
      city: "Istanbul",
      country: "Turkiye",
      zip_code: "34000",
      total_order_value: selectedProduct.price,
      currency: 0, // 0 = TL
      current_language: 0, // 0 = TR
      modul_version: "1.0.4", // Standart sürüm
      random_nr: randomNr,
      signature: signature,
      custom_param: user.id // Bizim callback'te kullanacağımız ID
    };

    return NextResponse.json({ success: true, form: shopierData });

  } catch (error) {
    console.error("Ödeme Oluşturma Hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}