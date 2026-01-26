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
        return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
    // ----------------------------------------

    const status = formData.get('status_type');
    const email = formData.get('buyer_email_protected');
    const price = formData.get('price');
    const randomNr = formData.get('random_nr');
    const signature = formData.get('signature');

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

    console.log(`🔄 İşlem Başlıyor: ${email} -> ${planType}`);

    // ADIM 1: Email'den Kullanıcının ID'sini Bul
    // (Profiles tablosunda email sütunu olduğunu varsayıyoruz)
    const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', String(email))
        .single();

    if (userError || !userProfile) {
        console.error("❌ KULLANICI BULUNAMADI! Email: " + email);
        return new Response('User Not Found', { status: 200 });
    }

    const userId = userProfile.id;

    // ADIM 2: Subscriptions Tablosuna Yeni Kayıt Ekle
    // Eski aktif abonelikleri pasife çekelim (Temizlik)
    await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId);

    // Yeni aboneliği ekle
    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            provider: 'shopier',
            package_key: planType,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 Gün
            is_active: true
        });

    if (subError) {
        console.error("❌ Subscription Insert Hatası:", subError.message);
        return new Response('DB Insert Error', { status: 500 });
    }

    // ADIM 3: Profiles Tablosunu Güncelle (Frontend Hızı İçin)
    // Sadece 'subscription_tier' güncelliyoruz, tarihleri subscriptions tablosunda tuttuk.
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_tier: planType })
        .eq('id', userId);

    if (profileError) {
        console.error("❌ Profile Update Hatası:", profileError.message);
    }

    console.log("✅ BAŞARILI! Abonelik tablosuna işlendi.");
    return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });

  } catch (err: any) {
    console.error("🔥 SUNUCU HATASI:", err.message);
    return new Response('Internal Error', { status: 500 });
  }
}