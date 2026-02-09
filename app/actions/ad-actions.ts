"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Sınır Ayarları
const MAX_DAILY_ADS = 3;

// 1. Durum Kontrolü (Frontend'de göstermek için)
export async function getAdStatus() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { count: 0, remaining: 0, canWatch: false };

  // Bugünün başlangıcı (UTC olarak basit tarih kontrolü)
  const today = new Date().toISOString().split('T')[0]; 

  // Bugün kaç tane 'reward_ad' işlemi yapılmış say
  const { count, error } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('process_type', 'reward_ad')
    .gte('created_at', today);

  const currentCount = count || 0;
  
  return {
    count: currentCount,
    remaining: Math.max(0, MAX_DAILY_ADS - currentCount),
    canWatch: currentCount < MAX_DAILY_ADS
  };
}

// 2. Ödül Verme (Limit Kontrollü)
export async function addRewardCredit() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, message: "Kullanıcı bulunamadı." };

  // --- GÜVENLİK KONTROLÜ: LİMİT ---
  const status = await getAdStatus();
  if (!status.canWatch) {
    return { success: false, message: "Günlük reklam izleme sınırına ulaştınız (3/3)." };
  }

  try {
    // Limit aşılmadıysa ödülü ver
    const { error } = await supabase.rpc('claim_ad_reward', { 
      user_id: user.id 
    });

    if (error) throw error;

    revalidatePath('/dashboard');
    
    return { success: true, message: "1 Kredi eklendi!" };

  } catch (error) {
    console.error("Ödül hatası:", error);
    return { success: false, message: "İşlem başarısız oldu." };
  }
}