import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    console.log("📢 --- SHOPIER WEBHOOK TETİKLENDİ ---");

    // 1. Service Role Key Kontrolü
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ HATA: Supabase Key eksik!");
      return new NextResponse('Server Config Error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. VERİYİ OKUMA (FormData Yöntemine Geri Dönüyoruz)
    // Çünkü Shopier Multipart/Form-data gönderiyor.
    const formData = await request.formData();
    
    // --- ÖZEL DURUM: SHOPIER PANEL TESTİ ---
    // Shopier panelindeki "Test Et" butonu 'res' adında Base64 veri yollar.
    // Gerçek siparişlerde bu gelmez.
    const testRes = formData.get('res');
    
    if (testRes) {
        console.log("🧪 BU BİR PANEL TEST SİNYALİDİR.");
        try {
            // Base64'ü çözüp içine bakalım (Meraklısı için)
            const buffer = Buffer.from(String(testRes), 'base64');
            const json = JSON.parse(buffer.toString('utf-8'));
            console.log("Test İçeriği:", json);
            console.log("✅ Test başarılı kabul edildi.");
        } catch (e) {
            console.log("Test verisi okunamadı ama sorun yok.");
        }
        // Shopier'e "Her şey yolunda" diyoruz
        return new NextResponse('OK', { status: 200 });
    }
    // ----------------------------------------


    // 3. GERÇEK SİPARİŞ VERİLERİNİ AL
    const status = formData.get('status_type');
    const email = formData.get('buyer_email_protected');
    const price = formData.get('price');
    const randomNr = formData.get('random_nr');
    const signature = formData.get('signature');
    const platformOrderId = formData.get('platform_order_id');

    console.log("📩 Gerçek Sipariş Verisi:", { email, price, status });

    // 4. İmza Doğrulama (Güvenlik)
    const osbSecret = "a1baa98593ff1af8aad67cee252ab5d6"; // Shopier Şifren
    const expectedSignature = crypto
      .createHash('sha256')
      .update(String(randomNr) + osbSecret)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error("❌ HATA: İmza Uyuşmazlığı! (Gerçek Sipariş)");
      return new NextResponse('Invalid Signature', { status: 400 });
    }

    if (status !== 'success') {
      console.log("ℹ️ Ödeme başarılı değil, işlem yapılmadı.");
      return new NextResponse('Ignored', { status: 200 });
    }

    // 5. Paket Tipi Belirleme
    let planType = '';
    const paidAmount = parseFloat(String(price));

    // 1 TL Test ve Gerçek Paketler
    if (paidAmount >= 1 && paidAmount <= 5) planType = 'pro'; 
    else if (paidAmount >= 118 && paidAmount <= 120) planType = 'pro'; // Kaşif
    else if (paidAmount >= 298 && paidAmount <= 300) planType = 'elite'; // Kahin
    else {
        console.warn(`⚠️ Fiyat pakete uymadı: ${paidAmount}`);
        return new NextResponse('Unknown Plan', { status: 200 });
    }

    // 6. Veritabanı Güncelleme
    console.log(`🔄 Güncelleme: ${email} -> ${planType}`);

    const { data, error } = await supabase
        .from('profiles')
        .update({ 
            subscription_tier: planType,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('email', String(email))
        .select();

    if (error) {
        console.error("❌ DB Hatası:", error.message);
        return new NextResponse('DB Error', { status: 500 });
    }

    if (!data || data.length === 0) {
        console.error("❌ KULLANICI BULUNAMADI! Email: " + email);
        return new NextResponse('User Not Found', { status: 200 });
    }

    console.log("✅ BAŞARILI! Paket Tanımlandı.");
    return new NextResponse('OK', { status: 200 });

  } catch (err: any) {
    console.error("🔥 SUNUCU HATASI:", err.message);
    return new NextResponse('Internal Error', { status: 500 });
  }
}