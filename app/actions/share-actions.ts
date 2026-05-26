"use server";

import { createClient } from "@/utils/supabase/server";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type ShareTokenResult =
  | { success: true; token: string; url: string }
  | { success: false; error: string };

// ─── Token üret veya mevcut olanı döndür ─────────────────────────────────────

export async function generateShareToken(dreamId: string): Promise<ShareTokenResult> {
  const supabase = createClient();

  // Sahiplik kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Bu işlem için giriş yapmanız gerekmektedir." };
  }

  // Rüyayı çek
  const { data: dream, error: fetchError } = await supabase
    .from("dreams")
    .select("id, user_id, share_token")
    .eq("id", dreamId)
    .single();

  if (fetchError || !dream) {
    return { success: false, error: "Rüya bulunamadı." };
  }

  // Sahip değilse reddet
  if (dream.user_id !== user.id) {
    return { success: false, error: "Bu rüyayı paylaşma izniniz yok." };
  }

  // Token zaten varsa aynısını döndür (idempotent)
  if (dream.share_token) {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/share/${dream.share_token}`;
    return { success: true, token: dream.share_token, url };
  }

  // Yeni token üret
  const token = crypto.randomUUID();

  const { error: updateError } = await supabase
    .from("dreams")
    .update({ share_token: token })
    .eq("id", dreamId);

  if (updateError) {
    return { success: false, error: "Token oluşturulamadı. Lütfen tekrar deneyin." };
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/share/${token}`;
  return { success: true, token, url };
}

// ─── Token ile rüyayı herkese açık çek (share sayfası için) ──────────────────
// Server component'ta çağrılır — auth gerektirmez, token = erişim anahtarı

export async function getDreamByToken(token: string) {
  const supabase = createClient();

  // Rüyayı token ile çek
  // RLS: share_token IS NOT NULL olan satırlar SELECT'e açık olmalı
  const { data: dream, error } = await supabase
    .from("dreams")
    .select("id, dream_text, dream_title, ai_response, moon_phase, created_at, share_token")
    .eq("share_token", token)
    .single();

  if (error || !dream) return null;

  // Follow-up mesajlarını çek
  const { data: messages } = await supabase
    .from("dream_chat_messages")
    .select("id, role, content, created_at")
    .eq("dream_id", dream.id)
    .order("created_at", { ascending: true });

  return {
    dream,
    messages: messages ?? [],
  };
}