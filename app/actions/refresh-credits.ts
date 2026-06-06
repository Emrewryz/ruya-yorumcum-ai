"use server";

// ── Günlük kredi yenileme KALDIRILDI ──────────────────────────────────────────
// Kullanıcılar artık günlük ücretsiz kredi almıyor.
// Yeni kayıt bonusu: 3 kredi (tek seferlik, Supabase DEFAULT ile verilir).

export type RefreshResult =
  | { refreshed: true;  newCredits: number }
  | { refreshed: false; reason: "NOT_AUTH" | "ALREADY_REFRESHED" | "MAX_REACHED" | "ERROR" };

export async function refreshDailyCredits(): Promise<RefreshResult> {
  return { refreshed: false, reason: "MAX_REACHED" };
}