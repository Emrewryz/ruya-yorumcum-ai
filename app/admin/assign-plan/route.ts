import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Bu işlem hassas olduğu için Service Role Key kullanıyoruz
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, plan } = await request.json();

    if (!email || !plan) {
      return NextResponse.json({ error: 'Email ve Plan gerekli' }, { status: 400 });
    }

    // 1. Kullanıcıyı Bul
    const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (userError || !userProfile) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const userId = userProfile.id;

    // 2. Eski Abonelikleri Kapat
    await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('user_id', userId);

    // 3. Yeni Abonelik Ekle (Subscriptions Tablosuna)
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

    if (subError) throw subError;

    // 4. Profili Güncelle (Sadece Tier)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ subscription_tier: plan })
        .eq('id', userId);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}