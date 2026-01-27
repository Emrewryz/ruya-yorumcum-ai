import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    console.log("📢 --- SHOPIER WEBHOOK TETİKLENDİ ---");

    const formData = await request.formData();
    
    const status = formData.get('status_type');
    const email = formData.get('buyer_email_protected');
    const price = formData.get('price');
    const randomNr = formData.get('random_nr');
    const signature = formData.get('signature');
    const testRes = formData.get('res'); // Shopier panel testi için

    // --- SHOPIER TEST SİNYALİ ---
    if (testRes === '1') {
       console.log("🧪 Shopier panel test sinyali alındı.");
       return new Response('OK', { status: 200 });
    }

    // --- GÜVENLİK VE İMZA DOĞRULAMA ---
    // Şifreyi artık .env dosyasından alıyoruz
    const osbSecret = process.env.SHOPIER_SECRET; 

    if (!osbSecret) {
        console.error("❌ HATA: SHOPIER_SECRET .env dosyasında bulunamadı!");
        return new Response('Server Config Error', { status: 500 });
    }
    
    const expectedSignature = crypto
      .createHash('sha256')
      .update(String(randomNr) + osbSecret)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error("❌ HATA: Geçersiz İmza!");
      return new Response('Invalid Signature', { status: 400 });
    }

    // Ödeme başarılı değilse işlem yapma
    if (status !== 'success') {
       return new Response('OK', { status: 200 });
    }

    // --- PAKET BELİRLEME ---
    const paidAmount = parseFloat(String(price));
    let planType = '';

    // Fiyat aralıklarını kendi güncel fiyatlarına göre kontrol et
    if (paidAmount >= 100 && paidAmount <= 200) planType = 'pro';      
    else if (paidAmount >= 250 && paidAmount <= 500) planType = 'elite'; 
    else if (paidAmount <= 10) planType = 'pro'; // Test ürünleri için
    else {
        console.error(`❌ Eşleşmeyen Tutar: ${paidAmount}`);
        return new Response('OK', { status: 200 });
    }

    // --- DATABASE İŞLEMLERİ ---
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Kullanıcıyı Bul
    const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .single();

    if (userError || !userProfile) {
        console.error(`❌ Kullanıcı Bulunamadı: ${cleanEmail}`);
        // Shopier tekrar denemesin diye 200 dönüyoruz
        return new Response('User Not Found', { status: 200 });
    }

    const userId = userProfile.id;

    // 2. Abonelik Ekle
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

    // 3. Profili Güncelle
    await supabase.from('profiles').update({ subscription_tier: planType }).eq('id', userId);

    console.log(`✅ BAŞARILI: ${cleanEmail} -> ${planType}`);
    return new Response('OK', { status: 200 });

  } catch (err: any) {
    console.error("🔥 Sunucu Hatası:", err.message);
    return new Response('Internal Error', { status: 500 });
  }
}