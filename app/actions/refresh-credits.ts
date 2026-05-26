"use server";

import { createClient } from "@/utils/supabase/server";

const MAX_CREDITS   = 2;
const DAILY_REFRESH = 2;

export type RefreshResult =
  | { refreshed: true;  newCredits: number }
  | { refreshed: false; reason: "NOT_AUTH" | "ALREADY_REFRESHED" | "MAX_REACHED" | "ERROR" };

export async function refreshDailyCredits(): Promise<RefreshResult> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { refreshed: false, reason: "NOT_AUTH" };

  // Profili çek
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("credits, last_credit_refresh")
    .eq("id", user.id)
    .single();

  if (fetchError || !profile) return { refreshed: false, reason: "ERROR" };

  const today         = new Date().toISOString().split("T")[0]; // "2026-05-26"
  const lastRefresh   = profile.last_credit_refresh ?? "";
  const currentCredits = profile.credits ?? 0;

  // Bugün zaten yenilendiyse dokunma
  if (lastRefresh === today) {
    return { refreshed: false, reason: "ALREADY_REFRESHED" };
  }

  // Zaten MAX'ta veya üstündeyse dokunma
  if (currentCredits >= MAX_CREDITS) {
    // Tarihi güncelle ki yarın tekrar kontrol etmesin
    await supabase
      .from("profiles")
      .update({ last_credit_refresh: today })
      .eq("id", user.id);
    return { refreshed: false, reason: "MAX_REACHED" };
  }

  // Kredisi MAX'ın altındaysa MAX'a tamamla
const newCredits = Math.max(currentCredits, DAILY_REFRESH);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      credits:             newCredits,
      last_credit_refresh: today,
    })
    .eq("id", user.id);

  if (updateError) return { refreshed: false, reason: "ERROR" };

  // Kredi transaction kaydı
  await supabase.from("credit_transactions").insert({
    user_id:      user.id,
    amount:       newCredits - currentCredits,
    process_type: "daily_refresh",
    description:  "Günlük kredi yenileme",
    metadata:     { date: today, previous: currentCredits, new: newCredits },
  });

  console.log(`[refreshDailyCredits] ${user.id} → ${currentCredits} → ${newCredits}`);
  return { refreshed: true, newCredits };
}