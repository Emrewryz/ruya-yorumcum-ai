import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("📢 --- SHOPIER OSB WEBHOOK GELDİ ---");

    // 1. Form Verisini Al
    const formData = await request.formData();
    const resData = formData.get('res'); // Şifreli Veri (Base64 JSON)
    const hash = formData.get('hash');   // Güvenlik İmzası

    // Kontrol: Veri var mı?
    if (!resData || !hash) {
        console.error("❌ HATA: Eksik Parametre. 'res' veya 'hash' yok.");
        return new Response('Missing parameters', { status: 400 });
    }

    // 2. Kimlik Bilgilerini Al (.env'den)
    const osbUser = process.env.SHOPIER_API_USER;
    const osbPass = process.env.SHOPIER_SECRET;

    if (!osbUser || !osbPass) {
        console.error("❌ HATA: .env dosyasında SHOPIER bilgileri eksik!");
        return new Response('Server Config Error', { status: 500 });
    }

    // 3. İMZA DOĞRULAMA
    const expectedHash = crypto
        .createHmac('sha256', osbPass)
        .update(String(resData) + osbUser)
        .digest('hex');

    if (String(hash) !== expectedHash) {
        console.error("❌ HATA: Geçersiz İmza! Shopier'den gelmiyor olabilir.");
        return new Response('Invalid Hash', { status: 400 });
    }

    // 4. Şifreli Veriyi Çöz
    const buffer = Buffer.from(String(resData), 'base64');
    const jsonString = buffer.toString('utf-8');
    const data = JSON.parse(jsonString);

    console.log(`✅ Doğrulama Başarılı. Sipariş: #${data.orderid}, Email: ${data.email}`);

    // --- PAKET VE KREDİ BELİRLEME ---
    const paidAmount = parseFloat(String(data.price));
    let planType = '';
    let startCredits = 0; // Varsayılan kredi

    // KAŞİF: 119 TL (110 - 130 arası kabul) -> 3 Kredi
    if (paidAmount >= 60 && paidAmount <= 130) {
        planType = 'pro';
        startCredits = 3;
    } 
    // KAHİN: 299 TL (290 - 310 arası kabul) -> 10 Kredi
    else if (paidAmount >= 290 && paidAmount <= 310) {
        planType = 'elite';
        startCredits = 10;
    } 
    else {
        console.log(`⚠️ Tanımsız Fiyat: ${paidAmount} TL. İşlem yapılmıyor.`);
        return new Response('success', { status: 200 });
    }

    // --- SUPABASE BAĞLANTISI ---
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cleanEmail = String(data.email).trim().toLowerCase();

    // A) Kullanıcıyı Bul
    const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .single();

    // --- GÜVENLİK AĞI: KULLANICI YOKSA LOGLA ---
    if (userError || !userProfile) {
        console.error(`❌ Kullanıcı Bulunamadı: ${cleanEmail} -> Admin Paneline Kaydediliyor.`);
        
        await supabase.from('webhook_logs').insert({
            shopier_email: cleanEmail,
            shopier_order_id: String(data.orderid),
            plan_type: planType,
            amount: paidAmount,
            error_message: 'User not found in profiles table',
            is_resolved: false
        });

        return new Response('success', { status: 200 });
    }

    const userId = userProfile.id;

    // B) Eski Abonelikleri Kapat
    await supabase.from('subscriptions').update({ is_active: false }).eq('user_id', userId);

    // C) Yeni Abonelik Ekle
    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            provider: 'shopier',
            package_key: planType,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 Gün
            is_active: true
        });

    if (subError) {
        console.error("❌ Veritabanı Hatası (Insert):", subError);
        return new Response('DB Error', { status: 500 });
    }

    // D) Profili Güncelle (PAKET + KREDİ YÜKLEME)
    await supabase.from('profiles').update({ 
        subscription_tier: planType,
        tarot_credits: startCredits // <-- KREDİ GÜNCELLEMESİ EKLENDİ
    }).eq('id', userId);

    console.log(`🎉 BAŞARILI! ${cleanEmail} kullanıcısına ${planType} ve ${startCredits} kredi tanımlandı.`);
    
    return new Response('success', { status: 200 });

  } catch (err: any) {
    console.error("🔥 Sunucu Hatası:", err.message);
    return new Response('Internal Error', { status: 500 });
  }
}