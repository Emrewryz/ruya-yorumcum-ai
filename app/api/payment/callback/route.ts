import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Shopier bazen test için GET isteği atabilir, onu da karşılıyoruz.
export async function GET(req: NextRequest) {
  return new NextResponse('Shopier Callback API Calisiyor!', { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const customId = formData.get('custom_param');
    const status = formData.get('status');
    const paymentLink = formData.get('product_link');

    console.log("🔔 Shopier'den İstek Geldi!");
    console.log("📝 Gelen Data:", { 
      status: status?.toString(), 
      customId: customId?.toString(),
      link: paymentLink?.toString() 
    });

    // 1. SHOPIER TEST BOTU İÇİN ÖZEL AYAR
    // Eğer custom_param yoksa bu bir test isteğidir.
    // Shopier'e "Tamam kardeşim, seni duydum" (200 OK) demeliyiz ki testi onaylasın.
    if (!customId) {
      console.log("⚠️ Bu bir Shopier Test isteği olabilir (User ID yok). 200 dönülüyor.");
      return new NextResponse('OK', { status: 200 });
    }

    // 2. Ödeme Başarısızsa işlem yapma ama 200 dön (Shopier tekrar tekrar denemesin)
    if (status?.toString().toLowerCase() !== 'success') {
      console.log("❌ Ödeme başarısız veya iptal.");
      return new NextResponse('OK', { status: 200 });
    }

    // 3. Paketi Belirle
    let newTier = 'free';
    const linkString = paymentLink?.toString() || "";
    
    // Senin ürün ID'lerin (.env dosyasındakilerle aynı olmalı)
    if (linkString.includes('43213110')) {
        newTier = 'elite';
    } else if (linkString.includes('43212949')) {
        newTier = 'pro';
    } else {
        // ID eşleşmezse fiyattan yakalamayı dene
        const price = formData.get('total_order_value');
        if (price === '299.00' || price === '299') newTier = 'elite';
        else if (price === '119.00' || price === '119') newTier = 'pro';
    }

    // 4. Veritabanını Güncelle
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        subscription_tier: newTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', customId);

    if (error) {
      console.error("🔥 DB Hatası:", error);
      // DB hatası olsa bile Shopier'e yansıtma, loglara bakarsın.
      return new NextResponse('OK', { status: 200 });
    }

    console.log(`✅ BAŞARILI: Kullanıcı (${customId}) -> ${newTier} paketine geçti.`);
    
    // Shopier mutlaka "text/plain" formatında basit bir yanıt bekler.
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error("💥 Kritik Hata:", error);
    // Her durumda 200 dönüyoruz ki Shopier sistemi kilitlemesin.
    return new NextResponse('OK', { status: 200 });
  }
}