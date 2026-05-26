"use server";

import { createClient } from "@/utils/supabase/server";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type CreditActionResult =
  | { success: true; remainingCredits: number }
  | { success: false; code: "NO_AUTH" | "NO_CREDIT" | "SERVER_ERROR"; error: string };

// ─── Ana Action ───────────────────────────────────────────────────────────────

export async function spendAnalysisCredit(dreamId: string): Promise<CreditActionResult> {
  const supabase = createClient();

  // 1. Auth kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, code: "NO_AUTH", error: "Giriş yapmanız gerekmektedir." };
  }

  // 2. KRİTİK — RPC'ye bırakmadan önce manuel kredi kontrolü
  //    Böylece NO_CREDIT vs SERVER_ERROR ayrımı her zaman doğru olur
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, code: "SERVER_ERROR", error: "Profil yüklenemedi." };
  }

  if ((profile.credits ?? 0) < 1) {
    return { success: false, code: "NO_CREDIT", error: "Yetersiz bakiye." };
  }

  // 3. Krediyi düş
  const { data: txResult, error: txError } = await supabase.rpc(
    "handle_credit_transaction",
    {
      p_user_id: user.id,
      p_amount: -1,
      p_process_type: "spend",
      p_description: "Rüya Analizi Kilidi",
      p_metadata: { dream_id: dreamId },
    }
  );

  if (txError) {
    console.error("[spendAnalysisCredit] RPC hatası:", txError.message);
    return { success: false, code: "SERVER_ERROR", error: "Bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  // RPC başarısız döndürdüyse (race condition — kredi bitmişse)
  if (!txResult?.success) {
    return { success: false, code: "NO_CREDIT", error: "Yetersiz bakiye." };
  }

  // 4. Güncel bakiyeyi döndür
  const { data: updated } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  return { success: true, remainingCredits: updated?.credits ?? 0 };
}