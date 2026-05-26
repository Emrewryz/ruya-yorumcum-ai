"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

const FOLLOWUP_COST = 1;

// ─── Tipler ───────────────────────────────────────────────────────────────────

export interface FollowUpMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  credits_spent: number;
}

export type FollowUpResult =
  | { success: true; userMessage: FollowUpMessage; assistantMessage: FollowUpMessage }
  | { success: false; code: "NO_AUTH" | "NO_CREDIT" | "NOT_FOUND" | "SERVER_ERROR"; error: string };

// ─── İlk analizi okunabilir metne çevir (context için) ────────────────────────

function analysisToText(aiResponse: any): string {
  if (!aiResponse) return "Analiz mevcut değil.";
  const parts: string[] = [];
  if (aiResponse.kisa_ozet) parts.push(`Genel: ${aiResponse.kisa_ozet}`);
  if (aiResponse.islami_analiz) parts.push(`İslami Yorum: ${aiResponse.islami_analiz}`);
  if (aiResponse.psikolojik_analiz) parts.push(`Psikolojik Analiz: ${aiResponse.psikolojik_analiz}`);
  if (aiResponse.semboller) parts.push(`Semboller: ${aiResponse.semboller}`);
  return parts.join("\n\n");
}

// ─── Ana Action ───────────────────────────────────────────────────────────────

export async function sendFollowUp(
  dreamId: string,
  userMessage: string
): Promise<FollowUpResult> {
  const supabase = createClient();
  const cookieStore = cookies();

  // ── 1. Input validasyonu ──
  const trimmed = userMessage?.trim() ?? "";
  if (trimmed.length < 3) {
    return { success: false, code: "SERVER_ERROR", error: "Mesaj çok kısa." };
  }

  // ── 2. Auth kontrolü ──
  const { data: { user } } = await supabase.auth.getUser();
  const guestId = cookieStore.get("guest_session_id")?.value;

  // Misafirler follow-up yapamaz — kredi sistemi profil gerektirir
  if (!user) {
    return {
      success: false,
      code: "NO_AUTH",
      error: "Devam soruları için giriş yapmanız gerekmektedir.",
    };
  }

  // ── 3. KRİTİK: Kredi kontrolü — API'ye GİTMEDEN önce ──
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.credits ?? 0) < FOLLOWUP_COST) {
    return {
      success: false,
      code: "NO_CREDIT",
      error: "Yetersiz kredi. Devam etmek için kredi satın alın.",
    };
  }

  // ── 4. Rüyayı ve sahipliği doğrula ──
  const { data: dream, error: dreamError } = await supabase
    .from("dreams")
    .select("dream_text, ai_response, user_id, guest_session_id")
    .eq("id", dreamId)
    .single();

  if (dreamError || !dream) {
    return { success: false, code: "NOT_FOUND", error: "Rüya bulunamadı." };
  }

  const isOwner = dream.user_id === user.id;
  if (!isOwner) {
    return { success: false, code: "NOT_FOUND", error: "Bu rüyaya erişim izniniz yok." };
  }

  // ── 5. Geçmiş mesajları çek (kronolojik) ──
  const { data: prevMessages } = await supabase
    .from("dream_chat_messages")
    .select("role, content")
    .eq("dream_id", dreamId)
    .order("created_at", { ascending: true });

  // ── 6. Gemini için context array'i oluştur ──
  //
  // Yapı:
  //   [system] Sen rüya yorumcususun...
  //   [user]   İlk rüya metni
  //   [assistant] İlk analiz (JSON → okunabilir metin)
  //   [user]   Önceki soru 1  ← varsa
  //   [assistant] Önceki cevap 1
  //   ...
  //   [user]   Yeni soru (trimmed)

  const contextMessages: { role: "user" | "assistant"; content: string }[] = [
    {
      role: "user",
      content: `Rüya metni: "${dream.dream_text}"`,
    },
    {
      role: "assistant",
      content: analysisToText(dream.ai_response),
    },
    ...(prevMessages ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content ?? "",
    })),
    {
      role: "user",
      content: trimmed,
    },
  ];

  const systemPrompt = `Sen deneyimli bir rüya yorumcusu, Jungcu psikolog ve İslami rüya tabirini bilen bilge bir danışmansın.
Kullanıcı sana daha önce gördüğü rüyayı anlattı ve sen ona kapsamlı bir analiz yaptın.
Şimdi kullanıcı ek sorular soruyor. Sohbet bağlamını dikkate alarak, kısa ve derinlikli yanıtlar ver.
Türkçe yaz. Sade ve akıcı ol — JSON formatı KULLANMA, düz metin yaz.`;

  try {
    // ── 7. Krediyi düş (API'ye gitmeden hemen önce) ──
    const { data: txResult, error: txError } = await supabase.rpc(
      "handle_credit_transaction",
      {
        p_user_id: user.id,
        p_amount: -FOLLOWUP_COST,
        p_process_type: "spend",
        p_description: "Follow-up Sorusu",
        p_metadata: { dream_id: dreamId },
      }
    );

    if (txError || !txResult?.success) {
      return { success: false, code: "NO_CREDIT", error: "Kredi düşümü başarısız." };
    }

    // ── 8. Gemini API çağrısı ──
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-lite-001",
      temperature: 0.75,
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
      ],
    });

    const aiText = completion.choices[0]?.message?.content?.trim();
    if (!aiText) throw new Error("AI'dan boş yanıt.");

    // ── 9. İki mesajı DB'ye yaz ──
    const now = new Date().toISOString();

    const { data: inserted, error: insertError } = await supabase
      .from("dream_chat_messages")
      .insert([
        {
          dream_id: dreamId,
          user_id: user.id,
          role: "user",
          content: trimmed,
          credits_spent: 0,
          created_at: now,
        },
        {
          dream_id: dreamId,
          user_id: user.id,
          role: "assistant",
          content: aiText,
          credits_spent: FOLLOWUP_COST,
          created_at: new Date(Date.now() + 1).toISOString(), // 1ms sonra — sıralama için
        },
      ])
      .select("id, role, content, created_at, credits_spent");

    if (insertError || !inserted || inserted.length < 2) {
      throw new Error("Mesajlar kaydedilemedi.");
    }

    // ── 10. dreams.last_message_at güncelle ──
    await supabase
      .from("dreams")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", dreamId);

    const userMsg = inserted.find((m) => m.role === "user")!;
    const assistantMsg = inserted.find((m) => m.role === "assistant")!;

    return {
      success: true,
      userMessage: userMsg as FollowUpMessage,
      assistantMessage: assistantMsg as FollowUpMessage,
    };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[sendFollowUp] Hata:", msg);

    // Kredi iadesi
    await supabase.rpc("handle_credit_transaction", {
      p_user_id: user.id,
      p_amount: FOLLOWUP_COST,
      p_process_type: "refund",
      p_description: "İade: Follow-up Hatası",
    });

    return { success: false, code: "SERVER_ERROR", error: "Bir hata oluştu. Lütfen tekrar deneyin." };
  }
}