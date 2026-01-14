import { createClient } from "@/utils/supabase/server";
import { TIER_LIMITS } from "./limits";

// DÜZELTME 1: Buraya 'chat' eklendi
type Feature = 'dream_analysis' | 'tarot_reading' | 'image_generation' | 'chat';
type Tier = 'free' | 'pro' | 'elite';

export async function checkUsageLimit(userId: string, feature: Feature) {
  const supabase = createClient();

  // 1. Kullanıcının Paketini Öğren
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  let userTier: Tier = 'free';
  if (profile?.subscription_tier) {
    const dbTier = profile.subscription_tier.toLowerCase();
    if (dbTier === 'explorer') userTier = 'pro';
    else if (dbTier === 'seer') userTier = 'elite';
    else if (dbTier === 'pro') userTier = 'pro';
    else if (dbTier === 'elite') userTier = 'elite';
  }

  const limit = TIER_LIMITS[userTier][feature];

  // Limit 0 ise (Örn: Ücretsiz pakette Chat) direkt reddet
  if (limit === 0) return { allowed: false, tier: userTier, message: "Bu özellik paketine dahil değil." };

  // 2. Bugünün Tarih Aralığı
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // 3. Kullanım Sayısını Hesapla
  let count = 0;

  if (feature === 'dream_analysis') {
    const { count: dreamCount } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayISO);
    
    count = dreamCount || 0;
  } 
  
  else if (feature === 'tarot_reading') {
    let timeFilter = todayISO; 
    if (userTier === 'pro') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      timeFilter = lastWeek.toISOString();
    }

    const { count: tarotCount } = await supabase
      .from('tarot_readings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', timeFilter);

    count = tarotCount || 0;
  }

  // DÜZELTME 2: Chat Sayacı Eklendi
  else if (feature === 'chat') {
    const { count: chatCount } = await supabase
      .from('dream_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user') // Sadece kullanıcının attığı mesajları sayıyoruz
      .gte('created_at', todayISO);

    count = chatCount || 0;
  }

  // 4. Karar Ver
  if (count >= limit) {
    return { 
      allowed: false, 
      tier: userTier,
      message: userTier === 'pro' && feature === 'tarot_reading' 
        ? "Haftalık tarot hakkın doldu." 
        : "Günlük kullanım limitine ulaştın."
    };
  }

  return { allowed: true, tier: userTier };
}