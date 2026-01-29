// utils/gatekeeper.ts
import { createClient } from "@/utils/supabase/server";
import { TIER_LIMITS, Feature, Tier } from "./limits";

export async function checkUsageLimit(userId: string, feature: Feature, dreamId?: string) {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // 1. Profil Bilgilerini Çek
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, tarot_credits')
    .eq('id', userId)
    .single();

  const userTier: Tier = (profile?.subscription_tier?.toLowerCase() as Tier) || 'free';
  const config = TIER_LIMITS[userTier][feature];

  // Özellik pakete dahil değilse
  if (!config.included && feature !== 'tarot_reading') {
    return { allowed: false, message: "Bu özellik paketinize dahil değil. Yükseltmek ister misiniz?", code: "UPGRADE_REQUIRED" };
  }

  // 2. Özel Durum: TAROT (Kredi Mantığı)
  if (feature === 'tarot_reading') {
    if ((profile?.tarot_credits || 0) <= 0) {
      return { allowed: false, message: "Günlük tarot krediniz bitti. Yarın tekrar yenilenecek!", code: "LIMIT_REACHED" };
    }
    return { allowed: true, tier: userTier };
  }

  // 3. Özel Durum: GÖRSEL ÜRETİMİ (Rüya Başına 1 Kontrolü)
  if (feature === 'image_generation' && dreamId) {
    const { data: dream } = await supabase
      .from('dreams')
      .select('image_url')
      .eq('id', dreamId)
      .single();
    
    // Eğer rüyada zaten resim varsa ve Pro ise tekrar üretilmesin
    if (dream?.image_url && userTier === 'pro') {
      return { allowed: false, message: "Bu rüya için zaten bir görsel oluşturdunuz.", code: "ALREADY_GENERATED" };
    }
  }

  // 4. Genel Günlük Limit Sayımı (Rüya, Chat vb.)
  let count = 0;
  if (feature === 'dream_analysis') {
    const { count: c } = await supabase.from('dreams').select('*', { count: 'exact', head: true })
      .eq('user_id', userId).gte('created_at', todayISO);
    count = c || 0;
  } else if (feature === 'chat') {
    const { count: c } = await supabase.from('dream_chat_messages').select('*', { count: 'exact', head: true })
      .eq('user_id', userId).eq('role', 'user').gte('created_at', todayISO);
    count = c || 0;
  }

  if (count >= config.daily_limit) {
    return { allowed: false, message: "Günlük limitinize ulaştınız. Yarın tekrar bekliyoruz!", code: "LIMIT_REACHED" };
  }

  return { allowed: true, tier: userTier };
}