import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Service Role Key ile "Admin Yetkili" Supabase başlatıyoruz
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // 1. Verileri Al
    const status = formData.get('status_type'); 
    const email = formData.get('buyer_email_protected'); // Kullanıcının girdiği mail
    const price = formData.get('price'); 
    const randomNr = formData.get('random_nr');
    const signature = formData.get('signature'); 
    
    // Shopier OSB Şifren (Paneldeki ile aynı olmalı)
    const osbSecret = "a1baa98593ff1af8aad67cee252ab5d6"; 

    // 2. Güvenlik: İmza Kontrolü (Sahte istekleri engelle)
    const expectedSignature = crypto
      .createHash('sha256')
      .update(String(randomNr) + osbSecret)
      .digest('base64');

    if (signature !== expectedSignature) {
      return new NextResponse('Invalid Signature', { status: 400 });
    }

    if (status !== 'success') {
      return new NextResponse('Payment Failed', { status: 200 });
    }

    // 3. Hangi Paket? (Fiyata göre tespit)
    let planType = '';
    const paidAmount = parseFloat(String(price));

    if (paidAmount >= 118 && paidAmount <= 120) planType = 'pro'; // Kaşif (119 TL)
    else if (paidAmount >= 298 && paidAmount <= 300) planType = 'elite'; // Kahin (299 TL)
    else if (paidAmount === 1) planType = 'pro'; // Test için 1 TL
    else return new NextResponse('Unknown Plan', { status: 200 });

    if (!email) return new NextResponse('No Email', { status: 200 });

    // 4. Veritabanını Güncelle
    // DİKKAT: profiles tablosunda 'email' sütunu olduğunu varsayıyoruz.
    // Yoksa admin panelinden manuel eşleştirme gerekir.
    
    const { data, error } = await supabase
        .from('profiles')
        .update({ 
            subscription_tier: planType,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 Gün
        })
        .eq('email', String(email)) 
        .select();

    if (error) {
        console.error("DB Hatası:", error);
        return new NextResponse('DB Error', { status: 500 });
    }

    if (data.length === 0) {
        console.log("Kullanıcı bulunamadı (Email eşleşmedi):", email);
        // Burada Admin'e mail attırabilirsin "Biri ödedi ama bulamadık" diye
    }

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    return new NextResponse('Server Error', { status: 500 });
  }
}