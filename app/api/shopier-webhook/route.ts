import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("📢 --- SHOPIER OSB WEBHOOK GELDİ ---");

    // 1. Form Verisini Al
    const formData = await request.formData();
    const resData = formData.get('res'); // Base64 şifreli JSON
    const hash = formData.get('hash');   // Doğrulama İmzası

    // Eğer OSB verileri yoksa (Belki eski tip callback gelmiştir), reddet
    if (!resData || !hash) {
        console.error("❌ HATA: Eksik Parametre (res veya hash yok).");
        return new Response('Missing parameters', { status: 400 });
    }

    // 2. API Bilgilerini Al
    const apiUser = process.env.SHOPIER_API_USER;
    const apiKey = process.env.SHOPIER_SECRET;

    if (!apiUser || !apiKey) {
        console.error("❌ HATA: .env dosyasında API bilgileri eksik!");
        return new Response('Server Config Error', { status: 500 });
    }

    // 3. İMZA DOĞRULAMA (PHP'deki mantığın aynısı)
    // PHP: hash_hmac('sha256', $_POST['res'] . $username, $key, false);
    const expectedHash = crypto
        .createHmac('sha256', apiKey)
        .update(String(resData) + apiUser)
        .digest('hex');

    if (String(hash) !== expectedHash) {
        console.error("❌ HATA: Geçersiz İmza! (Hash uyuşmuyor)");
        return new Response('Invalid Hash', { status: 400 });
    }

    // 4. Veriyi Çöz (Base64 Decode)
    // PHP: base64_decode($_POST['res']);
    const buffer = Buffer.from(String(resData), 'base64');
    const jsonString = buffer.toString('utf-8');
    const data = JSON.parse(jsonString);

    console.log("✅ İmza Doğrulandı. Gelen Veri:", data);

    // Veri İçeriği (PHP örneğindeki değişkenler)
    // const status = data.status; // OSB'de status dönmeyebilir, veri geldiyse işlem başarılıdır.
    const email = data.email;
    const orderId = data.orderid;
    const price = data.price;
    // const productList = data.productlist; // İstersen buradan ürün adına da bakabilirsin

    // --- PAKET BELİRLEME ---
    const paidAmount = parseFloat(String(price));
    let planType = '';

    if (paidAmount >= 100 && paidAmount <= 200) planType = 'pro';      
    else if (paidAmount >= 250 && paidAmount <= 500) planType = 'elite'; 
    else if (paidAmount <= 10) planType = 'pro'; // Test için
    else {
        console.error(`⚠️ Tutar Eşleşmedi: ${paidAmount}`);
        // Yine de success dönmeliyiz ki Shopier tekrar denemesin
        return new Response('success', { status: 200 });
    }

    console.log(`🔄 İşlem: ${email} -> ${planType} (Sipariş: ${orderId})`);

    // --- DATABASE İŞLEMLERİ ---
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
        // Shopier bizden "success" cevabı bekler, yoksa sürekli istek atar.
        return new Response('success', { status: 200 });
    }

    const userId = userProfile.id;

    // Abonelik Güncelle
    await supabase.from('subscriptions').update({ is_active: false }).eq('user_id', userId);

    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            provider: 'shopier_osb',
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

    console.log(`✅ BAŞARILI: ${cleanEmail} paket tanımlandı.`);
    
    // PHP: echo "success";
    return new Response('success', { status: 200 });

  } catch (err: any) {
    console.error("🔥 Sunucu Hatası:", err.message);
    return new Response('Internal Error', { status: 500 });
  }
}