import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    console.log("📢 --- SHOPIER WEBHOOK TETİKLENDİ ---");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ HATA: Supabase Key eksik!");
      return new Response('Server Config Error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await request.formData();
    
    // --- ÖZEL DURUM: SHOPIER PANEL TESTİ ---
    const testRes = formData.get('res');
    
    if (testRes) {
        console.log("🧪 BU BİR PANEL TEST SİNYALİDİR.");
        // Shopier sadece 200 kodu bekler, body çok önemli değildir ama
        // 'text/plain' olarak basit bir string dönmek en garantisidir.
        return new Response('OK', { 
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
    // ----------------------------------------

    // ... (Kodun geri kalanı aynı: Gerçek Sipariş İşlemleri) ...
    
    const status = formData.get('status_type');
    const email = formData.get('buyer_email_protected');
    const price = formData.get('price');
    const randomNr = formData.get('random_nr');
    const signature = formData.get('signature');

    console.log("📩 Gerçek Sipariş Verisi:", { email, price, status });

    // İmza Doğrulama
    const osbSecret = "a1baa98593ff1af8aad67cee252ab5d6"; 
    const expectedSignature = crypto
      .createHash('sha256')
      .update(String(randomNr) + osbSecret)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error("❌ HATA: İmza Uyuşmazlığı!");
      return new Response('Invalid Signature', { status: 400 });
    }

    if (status !== 'success') {
      return new Response('Ignored', { status: 200 });
    }

    // Paket Tipi
    let planType = '';
    const paidAmount = parseFloat(String(price));

    if (paidAmount >= 1 && paidAmount <= 5) planType = 'pro'; 
    else if (paidAmount >= 118 && paidAmount <= 120) planType = 'pro';
    else if (paidAmount >= 298 && paidAmount <= 300) planType = 'elite';
    else {
        return new Response('Unknown Plan', { status: 200 });
    }

    // DB Güncelleme
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

    if (error || !data || data.length === 0) {
        console.error("❌ DB Hatası veya Kullanıcı Yok");
        // Hata olsa bile Shopier'e 200 dönüyoruz ki tekrar denemesin
        // Çünkü sorun bizde, Shopier'in tekrar denemesi bir şeyi çözmeyecek.
        return new Response('Error handled', { status: 200 });
    }

    console.log("✅ BAŞARILI!");
    
    // FİNAL CEVAP (Önemli Değişiklik Burası)
    return new Response('OK', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
    });

  } catch (err: any) {
    console.error("🔥 SUNUCU HATASI:", err.message);
    return new Response('Internal Error', { status: 500 });
  }
}