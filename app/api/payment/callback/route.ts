export const dynamic = 'force-dynamic'; 

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Admin yetkisiyle profil güncellemek için gerekli
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  return new NextResponse('Shopier Callback Aktif', { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const customId = formData.get('custom_param')?.toString(); // Supabase User ID
    const status = formData.get('status')?.toString().toLowerCase(); // 'success'
    const paymentLink = formData.get('product_link')?.toString() || "";

    console.log("💳 Shopier Sinyali Alındı:", { status, customId });

    // 1. Shopier Test Botu Kontrolü: Test sinyallerine 200 OK dönmeliyiz
    if (!customId) return new NextResponse('OK', { status: 200 });

    // 2. Ödeme Başarısızsa İşlem Yapma
    if (status !== 'success') return new NextResponse('OK', { status: 200 });

    // 3. Alınan Paketi Belirle (Link ID veya Fiyat Üzerinden)
    let newTier = 'pro';
    if (paymentLink.includes('43213110') || formData.get('total_order_value') === '299.00') {
      newTier = 'elite';
    }

    // 4. Veritabanında Kullanıcıyı Yükselt
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        subscription_tier: newTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', customId);

    if (error) {
      console.error("❌ Veritabanı Güncellenemedi:", error.message);
      return new NextResponse('OK', { status: 200 });
    }

    console.log(`✅ Kullanıcı ${customId} artık ${newTier} paketinde!`);
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error("💥 Callback Hatası:", error);
    return new NextResponse('OK', { status: 200 });
  }
}