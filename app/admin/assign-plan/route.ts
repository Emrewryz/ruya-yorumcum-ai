import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service Role Key ile yetkili işlem
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, plan } = body;

    if (!email || !plan) {
      return NextResponse.json({ error: 'Email ve Plan zorunludur' }, { status: 400 });
    }

    console.log(`Admin İşlemi Başladı: ${email} -> ${plan}`);

    // 1. Kullanıcıyı Bul
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

    // 2. Subscriptions Tablosuna Ekle (Tarihler BURAYA yazılmalı)
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

    // 3. Profiles Tablosunu Güncelle (SADECE TIER)
    // DİKKAT: Burada start_date veya end_date ASLA olmamalı.
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_tier: plan })
        .eq('id', userId);

    if (profileError) {
        console.error("Profile Yazma Hatası:", profileError);
        return NextResponse.json({ error: 'Profil güncellenemedi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Paket tanımlandı' });

  } catch (error: any) {
    console.error('Kritik Sunucu Hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}