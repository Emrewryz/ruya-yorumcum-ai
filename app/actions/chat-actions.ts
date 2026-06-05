"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:            string;
  role:          "user" | "assistant";
  content:       string;
  created_at:    string;
  credits_spent: number;
}

export interface DreamSession {
  id:             string;
  dream_title:    string | null;
  dream_text:     string;
  ai_response: {
    kisa_ozet:      string;
    detayli_tahlil: string; // ← güncellendi
    semboller:      string;
    // Eski alanlar — geriye dönük uyumluluk için opsiyonel
    islami_analiz?:     string;
    psikolojik_analiz?: string;
  };
  moon_phase:      string | null;
  image_url:       string | null;
  created_at:      string;
  detay_unlocked:  boolean;        // ← yeni
  // Eski alanlar — silinmedi, mevcut veriler bozulmasın
  islami_unlocked:     boolean;
  psikolojik_unlocked: boolean;
  messages:        ChatMessage[];
}

export interface SidebarChat {
  id:              string;
  dream_title:     string | null;
  dream_text:      string;
  last_message_at: string;
  message_count:   number;
}

// ─── Sidebar için sohbet listesi ─────────────────────────────────────────────

export async function getChatList(): Promise<SidebarChat[]> {
  const supabase    = createClient();
  const cookieStore = cookies();

  const { data: { user } } = await supabase.auth.getUser();
  const guestId = cookieStore.get("guest_session_id")?.value;

  if (!user && !guestId) return [];

  const query = supabase
    .from("dreams")
    .select("id, dream_title, dream_text, last_message_at, created_at")
    .eq("status", "completed")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(30);

  if (user) {
    query.eq("user_id", user.id);
  } else {
    query.eq("guest_session_id", guestId!);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((d) => ({
    id:              d.id,
    dream_title:     d.dream_title,
    dream_text:      d.dream_text,
    last_message_at: d.last_message_at ?? d.created_at,
    message_count:   0,
  }));
}

// ─── Tek sohbeti ID ile yükle ─────────────────────────────────────────────────

export async function getDreamSession(dreamId: string): Promise<DreamSession | null> {
  const supabase    = createClient();
  const cookieStore = cookies();

  const { data: { user } } = await supabase.auth.getUser();
  const guestId = cookieStore.get("guest_session_id")?.value;

  const { data: dream, error } = await supabase
    .from("dreams")
    .select(`
      id,
      dream_title,
      dream_text,
      ai_response,
      moon_phase,
      image_url,
      created_at,
      user_id,
      guest_session_id,
      detay_unlocked,
      islami_unlocked,
      psikolojik_unlocked
    `)
    .eq("id", dreamId)
    .single();

  if (error || !dream) return null;

  // Yetki kontrolü
  const isOwner =
    (user && dream.user_id === user.id) ||
    (!user && guestId && dream.guest_session_id === guestId);

  if (!isOwner) return null;

  const { data: messages } = await supabase
    .from("dream_chat_messages")
    .select("id, role, content, created_at, credits_spent")
    .eq("dream_id", dreamId)
    .order("created_at", { ascending: true });

  return {
    id:                  dream.id,
    dream_title:         dream.dream_title,
    dream_text:          dream.dream_text,
    ai_response:         dream.ai_response as DreamSession["ai_response"],
    moon_phase:          dream.moon_phase,
    image_url:           dream.image_url ?? null,
    created_at:          dream.created_at,
    detay_unlocked:      dream.detay_unlocked      ?? false,
    islami_unlocked:     dream.islami_unlocked     ?? false,
    psikolojik_unlocked: dream.psikolojik_unlocked ?? false,
    messages:            (messages ?? []) as ChatMessage[],
  };
}