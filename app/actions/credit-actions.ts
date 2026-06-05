"use server";

import { createClient } from "@/utils/supabase/server";

type SpendResult =
  | { success: true }
  | { success: false; error: string; code?: string };

// ─── Detaylı tahlil kilidini aç — 2 kredi ─────────────────────────────────────

export async function spendAnalysisCredit(dreamId: string): Promise<SpendResult> {
  const supabase = createClient();

  // Auth kontrolü
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Giriş yapmanız gerekiyor.", code: "NO_AUTH" };
  }

  // Kredi kontrolü — 2 kredi gerekiyor
  const { data: profile } = await supabase
    .from("profiles").select("credits").eq("id", user.id).single();

  if (!profile || profile.credits < 2) {
    return { success: false, error: "Yetersiz kredi. En az 2 krediniz olması gerekiyor.", code: "NO_CREDIT" };
  }

  // Zaten açık mı?
  const { data: dream } = await supabase
    .from("dreams").select("detay_unlocked").eq("id", dreamId).single();

  if (dream?.detay_unlocked) return { success: true };

  // DB'de kilidi aç
  const { error: updateError } = await supabase
    .from("dreams")
    .update({ detay_unlocked: true })
    .eq("id", dreamId)
    .eq("user_id", user.id);

  if (updateError) {
    return { success: false, error: "Kilit açma işlemi başarısız." };
  }

  // 2 kredi düş
  const { error: rpcError } = await supabase.rpc("handle_credit_transaction", {
    p_user_id:      user.id,
    p_amount:       -2,
    p_process_type: "analysis_unlock",
    p_description:  `Detaylı tahlil kilidi açıldı: ${dreamId}`,
  });

  if (rpcError) {
    // Geri al
    await supabase.from("dreams").update({ detay_unlocked: false }).eq("id", dreamId);
    return { success: false, error: "Kredi işlemi başarısız." };
  }

  return { success: true };
}