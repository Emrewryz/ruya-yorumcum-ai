export const dynamic = 'force-dynamic';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resData = formData.get('res')?.toString(); // PHP örneğindeki $_POST['res']

    if (!resData) {
      return new NextResponse('missing parameter', { status: 200 });
    }

    // 1. Veriyi Çöz (Base64 Decode) - PHP'deki base64_decode karşılığı
    const decodedJson = Buffer.from(resData, 'base64').toString('utf-8');
    const result = JSON.parse(decodedJson); // PHP'deki json_decode karşılığı

    // 2. Verileri Al
    const customId = result.custom_param; // Bizim gönderdiğimiz User ID
    const orderId = result.orderid;
    const price = result.price;

    console.log("🔔 Shopier OSB Alındı. Sipariş No:", orderId);

    // 3. Veritabanı Güncelleme (Sadece geçerli bir User ID varsa)
    if (customId) {
      let newTier = 'pro';
      if (price === '299.00' || price === '299') {
        newTier = 'elite';
      }

      await supabaseAdmin
        .from('profiles')
        .update({ 
          subscription_tier: newTier,
          updated_at: new Date().toISOString()
        })
        .eq('id', customId);
    }

    // 4. KRİTİK: PHP örneğindeki gibi sadece "success" dön
    return new NextResponse('success', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error("Callback Hatası:", error);
    return new NextResponse('success', { status: 200 }); // Hata olsa da success dönüyoruz
  }
}