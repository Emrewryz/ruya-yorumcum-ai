import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("📢 --- SHOPIER WEBHOOK TETİKLENDİ ---");

    // --- GÜVENLİK KONTROLÜ: Content-Type ---
    const contentType = request.headers.get('content-type') || '';
    
    // Eğer gelen istek form verisi değilse işlemi durdur (Hatanın sebebi bu)
    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded')) {
        console.error(`⚠️ HATA: Yanlış İçerik Tipi. Gelen: ${contentType}`);
        // Shopier'e 200 dönelim ki sürekli tekrar denemesin, ama işlemi yapmayalım.
        return new Response('Invalid Content-Type', { status: 200 });
    }

    // Artık güvenle okuyabiliriz
    const formData = await request.formData();
    
    const status = formData.get('status_type');
    const email = formData.get('buyer_email_protected');
    const price = formData.get('price');
    const randomNr = formData.get('random_nr');
    const signature = formData.get('signature');
    const testRes = formData.get('res');

    // --- 1. SHOPIER TEST SİNYALİ ---
    if (testRes === '1') {
       console.log("🧪 Shopier panel test sinyali alındı.");
       return new Response('OK', { status: 200 });
    }

    // --- 2. GÜVENLİK VE İMZA DOĞRULAMA ---
    const osbSecret = process.env.SHOPIER_SECRET; 

    if (!osbSecret) {
        console.error("❌ HATA: SHOPIER_SECRET .env dosyasında yok!");
        return new Response('Server Config Error', { status: 500 });
    }
    
    // Shopier bazen randomNr'yi string, bazen number gönderebilir, garantiye alalım.
    const randomNrStr = String(randomNr); 
    const expectedSignature = crypto
      .createHash('sha256')
      .update(randomNrStr + osbSecret)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error("❌ HATA: Geçersiz İmza! Gelen:", signature, "Beklenen:", expectedSignature);
      return new Response('Invalid Signature', { status: 400 });
    }

    if (status !== 'success') {
       console.log("Bilgi: Ödeme başarısız veya iptal.");
       return new Response('OK', { status: 200 });
    }

    // --- 3. PAKET BELİRLEME ---
    const paidAmount = parseFloat(String(price));
    let planType = '';

    if (paidAmount >= 100 && paidAmount <= 200) planType = 'pro';      
    else if (paidAmount >= 250 && paidAmount <= 500) planType = 'elite'; 
    else if (paidAmount <= 10) planType = 'pro';
    else {
        console.error(`❌ Eşleşmeyen Tutar: ${paidAmount}`);
        return new Response('OK', { status: 200 });
    }

    // --- 4. DATABASE İŞLEMLERİ ---
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cleanEmail = String(email).trim().toLowerCase();

    // Kullanıcıyı Bul
    const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .single();

    if (userError || !userProfile) {
        console.error(`❌ Kullanıcı Bulunamadı: ${cleanEmail}`);
        return new Response('User Not Found', { status: 200 });
    }

    const userId = userProfile.id;

    // Abonelik Ekle
    await supabase.from('subscriptions').update({ is_active: false }).eq('user_id', userId);

    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            provider: 'shopier',
            package_key: planType,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true
        });

    if (subError) {
        console.error("❌ DB Hatası:", subError);
        return new Response('DB Error', { status: 500 });
    }

    // Profili Güncelle
    await supabase.from('profiles').update({ subscription_tier: planType }).eq('id', userId);

    console.log(`✅ BAŞARILI: ${cleanEmail} -> ${planType}`);
    return new Response('OK', { status: 200 });

  } catch (err: any) {
    console.error("🔥 Sunucu Hatası Detayı:", err.message);
    return new Response('Internal Error', { status: 500 });
  }
}