"use server";

import { createClient } from "@/utils/supabase/server";

export type CreditActionResult =
  | { success: true;  remainingCredits: number }
  | { success: false; code: "NO_AUTH" | "NO_CREDIT" | "SERVER_ERROR"; error: string };

export async function spendAnalysisCredit(
  dreamId: string,
  target?: "islami" | "psikolojik"
): Promise<CreditActionResult> {
  const supabase = createClient();

  // 1. Auth kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, code: "NO_AUTH", error: "Giriş yapmanız gerekmektedir." };
  }

  // 2. Kredi kontrolü
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
      p_user_id:      user.id,
      p_amount:       -1,
      p_process_type: "spend",
      p_description:  "Rüya Analizi Kilidi",
      p_metadata:     { dream_id: dreamId, target },
    }
  );

  if (txError) {
    return { success: false, code: "SERVER_ERROR", error: "Bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  if (!txResult?.success) {
    return { success: false, code: "NO_CREDIT", error: "Yetersiz bakiye." };
  }

  // 4. Unlock state'i DB'ye kaydet — sayfa yenilemede korunur
  if (target && dreamId) {
    const updateField = target === "islami"
      ? { islami_unlocked: true }
      : { psikolojik_unlocked: true };

    await supabase
      .from("dreams")
      .update(updateField)
      .eq("id", dreamId)
      .eq("user_id", user.id);
  }

  // 5. Güncel bakiyeyi döndür
  const { data: updated } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  return { success: true, remainingCredits: updated?.credits ?? 0 };
}