import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key ile yetkili işlem
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. GÜVENLİK KONTROLÜ (Basit Header Kontrolü)
    // Admin panelinden istek atarken headers kısmına 'x-admin-key' eklemelisin.
    // Eğer env dosyasında yoksa bu kontrolü geçici olarak kaldırabilirsin ama tavsiye etmem.
    /*const adminKey = request.headers.get('x-admin-key');
    if (process.env.ADMIN_SECRET_KEY && adminKey !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json({ error: 'Yetkisiz Erişim' }, { status: 403 });
    }*/

    const body = await request.json();
    const { email, plan } = body;

    if (!email || !plan) {
      return NextResponse.json({ error: 'Email ve Plan zorunludur' }, { status: 400 });
    }

    // --- KREDİ HESAPLAMA ---
    let startCredits = 0;
    if (plan === 'pro') startCredits = 3;
    if (plan === 'elite') startCredits = 10;

    console.log(`Admin İşlemi Başladı: ${email} -> ${plan} (Kredi: ${startCredits})`);

    // 2. Kullanıcıyı Bul
    const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (userError || !userProfile) {
        console.error("Kullanıcı bulunamadı hatası:", userError);
        return NextResponse.json({ error: 'Bu email ile kayıtlı kullanıcı yok.' }, { status: 404 });
    }

    const userId = userProfile.id;

    // 3. Subscriptions Tablosuna Ekle
    // Önce eskileri pasif yap
    await supabase.from('subscriptions').update({ is_active: false }).eq('user_id', userId);

    // Yeni abonelik
    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userId,
            provider: 'admin_manual',
            package_key: plan,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true
        });

    if (subError) {
        console.error("Subscription Yazma Hatası:", subError);
        return NextResponse.json({ error: 'Abonelik tablosu güncellenemedi: ' + subError.message }, { status: 500 });
    }

    // 4. Profiles Tablosunu Güncelle (TIER + KREDİLER)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
            subscription_tier: plan,
            tarot_credits: startCredits // <-- KREDİLER BURADA GÜNCELLENİYOR
        })
        .eq('id', userId);

    if (profileError) {
        console.error("Profile Yazma Hatası:", profileError);
        return NextResponse.json({ error: 'Profil güncellenemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Paket (${plan}) ve Krediler (${startCredits}) tanımlandı` });

  } catch (error: any) {
    console.error('Kritik Sunucu Hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}