import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    console.log("📢 --- SHOPIER WEBHOOK (RAW TEXT MODU) ---");

    // 1. Service Role Key Kontrolü
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ HATA: Supabase Key eksik!");
      return new NextResponse('Server Config Error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. VERİYİ OKUMA (GÜNCELLENEN KISIM BURASI)
    // formData() yerine text() kullanıyoruz. Bu daha güvenilirdir.
    const rawBody = await request.text();
    
    // Gelen ham veriyi loglayalım ki ne geldiğini görelim
    console.log("📩 Ham Veri:", rawBody);

    if (!rawBody) {
        console.error("❌ HATA: Body boş geldi!");
        return new NextResponse('Empty Body', { status: 400 });
    }

    // Ham metni (a=1&b=2 formatını) parçalıyoruz
    const params = new URLSearchParams(rawBody);
    
    const email = params.get('buyer_email_protected');
    const price = params.get('price');
    const status = params.get('status_type');
    const randomNr = params.get('random_nr');
    const signature = params.get('signature');
    const platformOrderId = params.get('platform_order_id'); // Bizim gönderdiğimiz ID (varsa)

    console.log("🔍 Ayrıştırılan Veri:", { email, price, status });

    // 3. İmza Doğrulama
    const osbSecret = "a1baa98593ff1af8aad67cee252ab5d6"; // Shopier Şifren
    const expectedSignature = crypto
      .createHash('sha256')
      .update(String(randomNr) + osbSecret)
      .digest('base64');

    // Shopier bazen imzayı farklı encoding ile gönderebilir, trim() yapalım
    if (signature?.trim() !== expectedSignature) {
      console.error("❌ HATA: İmza Uyuşmazlığı!");
      console.log(`Beklenen: ${expectedSignature}`);
      console.log(`Gelen: ${signature}`);
      return new NextResponse('Invalid Signature', { status: 400 });
    }

    if (status !== 'success') {
      console.log("ℹ️ Durum success değil.");
      return new NextResponse('Ignored', { status: 200 });
    }

    // 4. Paket Tipi Belirleme
    let planType = '';
    const paidAmount = parseFloat(String(price));

    if (paidAmount >= 1 && paidAmount <= 5) planType = 'pro'; // 1 TL Test
    else if (paidAmount >= 118 && paidAmount <= 120) planType = 'pro'; // Kaşif
    else if (paidAmount >= 298 && paidAmount <= 300) planType = 'elite'; // Kahin
    else {
        console.warn(`⚠️ Fiyat pakete uymadı: ${paidAmount}`);
        return new NextResponse('Unknown Plan', { status: 200 });
    }

    // 5. Veritabanı Güncelleme
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