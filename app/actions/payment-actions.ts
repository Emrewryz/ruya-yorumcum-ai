"use server";

import { createClient } from "@/utils/supabase/server";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type ClaimOrderResult =
  | { success: true;  credits: number; message: string }
  | { success: false; code: "NOT_FOUND" | "ALREADY_CLAIMED" | "NO_AUTH" | "SERVER_ERROR"; error: string };

// ─── Sipariş Doğrulama ───────────────────────────────────────────────────────

export async function claimOrder(orderId: string): Promise<ClaimOrderResult> {
  const trimmedId = orderId?.trim();

  if (!trimmedId || trimmedId.length < 3) {
    return { success: false, code: "NOT_FOUND", error: "Geçerli bir sipariş numarası girin." };
  }

  const supabase = createClient();

  // ── 1. Auth kontrolü ──
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, code: "NO_AUTH", error: "Kredileri yüklemek için giriş yapmanız gerekmektedir." };
  }

  // ── 2. Siparişi bul ──
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("id, status, credit_amount, order_id")
    .eq("order_id", trimmedId)
    .maybeSingle();

  if (fetchError) {
    console.error("[claimOrder] DB hatası:", fetchError.message);
    return { success: false, code: "SERVER_ERROR", error: "Bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  // ── 3. Sipariş bulunamadı ──
  if (!payment) {
    return {
      success: false,
      code: "NOT_FOUND",
      error: "Sipariş numarası bulunamadı. Shopier'den aldığınız numarayı kontrol edin.",
    };
  }

  // ── 4. Daha önce kullanılmış ──
  if (payment.status === "claimed") {
    return {
      success: false,
      code: "ALREADY_CLAIMED",
      error: "Bu sipariş numarası daha önce kullanılmış.",
    };
  }

  // ── 5. Unclaimed değilse (beklenmedik durum) ──
  if (payment.status !== "unclaimed") {
    return {
      success: false,
      code: "SERVER_ERROR",
      error: "Sipariş geçerli değil. Destek için iletişime geçin.",
    };
  }

  const creditAmount = payment.credit_amount ?? 1;

  // ── 6. Krediyi ekle (RPC ile atomic) ──
  const { data: txResult, error: txError } = await supabase.rpc(
    "handle_credit_transaction",
    {
      p_user_id:      user.id,
      p_amount:       creditAmount,
      p_process_type: "purchase",
      p_description:  `Sipariş Doğrulama — ${creditAmount} Kredi`,
      p_metadata:     { order_id: trimmedId },
    }
  );

  if (txError || !txResult?.success) {
    console.error("[claimOrder] Kredi eklenemedi:", txError?.message);
    return { success: false, code: "SERVER_ERROR", error: "Kredi yüklenemedi. Lütfen tekrar deneyin." };
  }

  // ── 7. Siparişi claimed yap ve kullanıcıyı bağla ──
  const { error: updateError } = await supabase
    .from("payments")
    .update({
      status:  "claimed",
      user_id: user.id,
    })
    .eq("id", payment.id);

  if (updateError) {
    // Kredi eklendi ama status güncellenemedi — kritik değil, log'la
    console.error("[claimOrder] Status güncelleme hatası:", updateError.message);
  }

  return {
    success: true,
    credits: creditAmount,
    message: `${creditAmount} kredi başarıyla hesabınıza yüklendi!`,
  };
}