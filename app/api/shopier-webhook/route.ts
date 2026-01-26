import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    console.log("--- SHOPIER BİLDİRİMİ GELDİ ---");

    // 1. URL ve Key Kontrolü
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("HATA: Supabase Key'leri Vercel'de tanımlı değil!");
      return new NextResponse('Server Config Error', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Form Verilerini Al
    const formData = await request.formData();
    const status = formData.get('status_type');
    const email = formData.get('buyer_email_protected');
    const price = formData.get('price');
    const randomNr = formData.get('random_nr');
    const signature = formData.get('signature');
    const osbSecret = "a1baa98593ff1af8aad67cee252ab5d6"; // Shopier'deki şifren

    console.log("Gelen Veri:", { email, price, status, randomNr });

    // 3. İmza Doğrulama
    const expectedSignature = crypto
      .createHash('sha256')
      .update(String(randomNr) + osbSecret)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error("HATA: İmza uyuşmuyor!");
      console.log("Beklenen:", expectedSignature);
      console.log("Gelen:", signature);
      return new NextResponse('Invalid Signature', { status: 400 });
    }

    if (status !== 'success') {
      console.log("Durum success değil, işlem yapılmadı.");
      return new NextResponse('Ignored', { status: 200 });
    }

    // 4. Paket Belirleme
    let planType = '';
    const paidAmount = parseFloat(String(price));

    // Test için 1 TL ile 5 TL arasını kabul edelim
    if (paidAmount >= 1 && paidAmount <= 5) planType = 'pro'; 
    else if (paidAmount >= 118 && paidAmount <= 120) planType = 'pro';
    else if (paidAmount >= 298 && paidAmount <= 300) planType = 'elite';
    else {
        console.log("Fiyat pakete uymadı:", paidAmount);
        return new NextResponse('Unknown Plan', { status: 200 });
    }

    // 5. Veritabanı Güncelleme
    console.log(`Veritabanı güncelleniyor... Email: ${email}, Plan: ${planType}`);

    // DİKKAT: Burada profiles tablosunda 'email' sütunu var mı diye bakıyoruz.
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
        console.error("Supabase Hatası:", error.message);
        return new NextResponse('DB Error', { status: 500 });
    }

    if (!data || data.length === 0) {
        console.error("KULLANICI BULUNAMADI! Profiles tablosunda bu email yok veya email sütunu boş.");
        // Shopier'e 200 dönüyoruz ki sürekli denemesin, ama loga hata basıyoruz.
        return new NextResponse('User Not Found', { status: 200 });
    }

    console.log("--- İŞLEM BAŞARILI ---");
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error("GENEL HATA:", error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}