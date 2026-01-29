"use server";

import { createClient } from "@/utils/supabase/server";
import { checkUsageLimit } from "@/utils/gatekeeper"; // Varsa spam koruması

export async function grantAdReward() {
  const supabase = createClient();

  // 1. Kimlik Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Giriş yapmalısınız." };

  // 2. Günlük Reklam Limiti (Opsiyonel: Günde en fazla 5 reklam izleyebilsin)
  // Bu kısmı şimdilik basit tutuyorum, direkt kredi vereceğiz.

  // 3. Krediyi Arttır
  const { error } = await supabase.rpc('increment_tarot_credit', { user_id: user.id });
  
  // EĞER RPC FONKSİYONUN YOKSA, aşağıdaki manuel update kodunu kullan:
  /*
  const { data: profile } = await supabase.from('profiles').select('tarot_credits').eq('id', user.id).single();
  const newCredit = (profile?.tarot_credits || 0) + 1;
  const { error } = await supabase.from('profiles').update({ tarot_credits: newCredit }).eq('id', user.id);
  */

  if (error) {
    console.error("Ödül hatası:", error);
    return { success: false, message: "Ödül yüklenemedi." };
  }

  return { success: true, message: "1 Hak Kazandınız!" };
}