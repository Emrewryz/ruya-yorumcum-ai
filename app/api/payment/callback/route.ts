import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Supabase Admin İstemcisi (Veritabanını güncellemek için yetkili)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // DİKKAT: Bunu .env dosyana eklemelisin!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Shopier'den gelen form verisini al
    const formData = await req.formData();
    const status = formData.get('status'); // 'success' veya 'failed'
    const customId = formData.get('custom_param'); // Bizim gönderdiğimiz User ID
    const orderId = formData.get('platform_order_id'); // Shopier Sipariş No
    const productId = formData.get('product_link'); // Hangi ürünü aldı?

    console.log("Shopier Bildirimi Geldi:", { status, customId, orderId });

    // 2. Ödeme Başarısızsa dur
    if (status !== 'success') {
      return NextResponse.json({ message: 'Ödeme başarısız' }, { status: 200 });
    }

    if (!customId) {
      console.error("Kullanıcı ID (custom_param) bulunamadı!");
      return NextResponse.json({ message: 'Eksik parametre' }, { status: 400 });
    }

    // 3. Hangi paket alındı? (Linke göre karar veriyoruz)
    // Not: Linklerin son kısmını kontrol ediyoruz
    const isElite = productId?.toString().includes('43213110'); // Kahin ID
    const newTier = isElite ? 'elite' : 'pro';

    // 4. Supabase'de kullanıcıyı güncelle
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        subscription_tier: newTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', customId);

    if (error) {
      console.error("DB Güncelleme Hatası:", error);
      return NextResponse.json({ message: 'DB Hatası' }, { status: 500 });
    }

    console.log(`Kullanıcı (${customId}) paketi güncellendi: ${newTier}`);
    return NextResponse.json({ message: 'Başarılı' }, { status: 200 });

  } catch (error) {
    console.error("Callback Hatası:", error);
    return NextResponse.json({ message: 'Sunucu Hatası' }, { status: 500 });
  }
}