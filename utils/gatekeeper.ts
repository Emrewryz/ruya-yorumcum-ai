import { createClient } from "@/utils/supabase/server";
import { TIER_LIMITS, Feature, Tier } from "./limits";

export async function checkUsageLimit(userId: string, feature: Feature, dreamId?: string) {
  const supabase = createClient();
  
  // Gün başlangıcını ayarla (Bugün 00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  
  // Tarih formatı (Daily Horoscope tablosu 'YYYY-MM-DD' tutuyor)
  const todayDateString = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

  // 1. Profil ve Paket Bilgisini Çek
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, tarot_credits')
    .eq('id', userId)
    .single();

  const userTier: Tier = (profile?.subscription_tier?.toLowerCase() as Tier) || 'free';
  
  // Eğer özellik limiti tanımlanmamışsa güvenli varsayılan olarak free'ye düş
  const config = TIER_LIMITS[userTier][feature] || TIER_LIMITS['free'][feature];

  // A) ÖZELLİK PAKETE HİÇ DAHİL DEĞİLSE (included: false)
  // Tarot hariç (çünkü o krediyle çalışıyor), diğerleri direkt reddedilir.
  if (!config.included && feature !== 'tarot_reading') {
    return { 
        allowed: false, 
        message: "Bu özellik mevcut paketinizde bulunmuyor. Detaylı analizler için paketinizi yükseltin.", 
        code: "UPGRADE_REQUIRED" 
    };
  }

  // B) ÖZEL DURUM: TAROT (Kredi Sistemi)
  if (feature === 'tarot_reading') {
    if ((profile?.tarot_credits || 0) <= 0) {
      return { allowed: false, message: "Tarot krediniz tükenmiş.", code: "LIMIT_REACHED" };
    }
    return { allowed: true, tier: userTier };
  }

  // C) ÖZEL DURUM: GÖRSEL ÜRETİMİ (Rüya başına 1 adet)
  if (feature === 'image_generation' && dreamId) {
    const { data: dream } = await supabase
      .from('dreams')
      .select('image_url')
      .eq('id', dreamId)
      .single();
    
    if (dream?.image_url && userTier !== 'elite') { // Elite sınırsız olabilir mesela
      return { allowed: false, message: "Bu rüya için zaten görsel oluşturuldu.", code: "ALREADY_GENERATED" };
    }
  }

  // 4. SAYIM İŞLEMİ (Limit Kontrolü)
  let count = 0;

  if (feature === 'dream_analysis') {
    // Rüya sayımı
    const { count: c } = await supabase.from('dreams')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayISO);
    count = c || 0;

  } else if (feature === 'chat') {
    // Chat mesajı sayımı
    const { count: c } = await supabase.from('dream_chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role', 'user')
        .gte('created_at', todayISO);
    count = c || 0;

  } else if (feature === 'daily_horoscope') {
    // --- YENİ: Günlük Burç Sayımı ---
    // 'date' sütunu YYYY-MM-DD formatındadır.
    const { count: c } = await supabase.from('daily_horoscopes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', todayDateString);
    count = c || 0;

  } else if (feature === 'astrology') {
    // --- YENİ: Natal Harita Analizi Sayımı ---
    // Free kullanıcıda limit 0 olduğu için burası çalışır ve direkt engeller.
    const { count: c } = await supabase.from('astrology_readings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayISO);
    count = c || 0;
  }

  // LİMİT KONTROLÜ
  // Eğer limit 0 ise (Free astrology gibi), 0 >= 0 True olur ve engeller. Doğru çalışır.
  if (count >= config.daily_limit) {
    // Elite kullanıcılar için limit genelde çok yüksek (999) olduğu için buraya takılmazlar.
    
    let errorMsg = "Günlük limitinize ulaştınız.";
    
    if (feature === 'astrology' && config.daily_limit === 0) {
        errorMsg = "Detaylı harita yorumu sadece Pro ve Elite paketlerde mevcuttur.";
    } else if (feature === 'daily_horoscope') {
        errorMsg = "Günlük burç yorumunuzu zaten aldınız. Yarın tekrar bekleriz!";
    }

    return { 
        allowed: false, 
        message: errorMsg, 
        code: "LIMIT_REACHED" 
    };
  }

  return { allowed: true, tier: userTier };
}