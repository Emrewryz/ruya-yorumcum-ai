"use server";

import { createClient }            from "@/utils/supabase/server";
import { revalidatePath }          from "next/cache";
import { generateDictionaryEntry } from "@/app/actions/generate-dictionary-entry";

// ─── Fallback model dizisi — en ucuzdan en pahalıya ──────────────────────────

const MODELS = [
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-flash-preview-05-20",
  "google/gemini-2.5-pro",
];

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type DreamAnalysis = {
  kisa_ozet:         string;
  islami_analiz:     string;
  psikolojik_analiz: string;
  semboller:         string;
};

type AnalyzeResult =
  | { success: true;  dreamId: string }
  | { success: false; error: string; code?: string };

// ─── Sistem Promptu ───────────────────────────────────────────────────────────

function buildSystemPrompt(personalization: Record<string, any> | null): string {
  const base = `Sen 'Rüya Yorumcum' platformunun uzman rüya analistisin.
Hem İslami rüya tabiri geleneğini (İbn-i Sirin, İmam Nablusi) hem de modern psikolojiyi (Jung arketipleri, Freud sembolizmi) harmanlayan sentez yöntemiyle çalışırsın.
Cevaplarını KESINLIKLE şu JSON formatında ver, başka hiçbir şey ekleme:
{
  "kisa_ozet": "2-3 cümle genel değerlendirme",
  "islami_analiz": "İslami kaynaklara dayalı detaylı yorum",
  "psikolojik_analiz": "Psikolojik/Jungian yorum",
  "semboller": "Rüyadaki sembollerin kısa açıklamaları"
}`;

  if (!personalization || Object.keys(personalization).length === 0) return base;

  const ctx = [
    personalization.yasam_evreni && `Yaşam evresi: ${personalization.yasam_evreni}`,
    personalization.ruh_hali     && `Ruh hali: ${personalization.ruh_hali}`,
    personalization.zihin_mesgul && `Zihin meşguliyeti: ${personalization.zihin_mesgul}`,
  ].filter(Boolean).join(", ");

  return `${base}\n\nKullanıcı bağlamı (analizi kişiselleştir): ${ctx}`;
}

// ─── OpenRouter'a istek at ─────────────────────────────────────────────────────

async function callModel(model: string, dreamText: string, systemPrompt: string): Promise<DreamAnalysis> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer":  "https://www.ruyayorumcum.com.tr",
      "X-Title":       "Rüya Yorumcum",
    },
    body: JSON.stringify({
      model,
      max_tokens:  1200,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: `Rüya: ${dreamText}` },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${model} → HTTP ${res.status}: ${text}`);
  }

  const data = await res.json();
  const raw  = data?.choices?.[0]?.message?.content ?? "";

  // JSON parse — markdown backtick varsa temizle
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed  = JSON.parse(cleaned) as DreamAnalysis;

  if (!parsed.kisa_ozet) throw new Error(`${model} → Beklenen JSON alanları eksik`);

  return parsed;
}

// ─── Ana Fonksiyon ────────────────────────────────────────────────────────────

export async function analyzeDream(dreamText: string): Promise<AnalyzeResult> {
  const supabase = createClient();

  // ── Auth / Kredi Kontrolü ──
  const { data: { user } } = await supabase.auth.getUser();
  const guestSessionId      = !user ? crypto.randomUUID() : null;

  if (!user) {
    // Misafir limit kontrolü (session bazlı)
    const { count } = await supabase
      .from("dreams")
      .select("id", { count: "exact", head: true })
      .is("user_id", null)
      .eq("guest_session_id", guestSessionId ?? "");

    if ((count ?? 0) >= 1) {
      return { success: false, error: "Misafir limiti doldu.", code: "GUEST_LIMIT" };
    }
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credits < 1) {
      return { success: false, error: "Yetersiz kredi.", code: "NO_CREDIT" };
    }
  }

  // ── Personalizasyon ──
  let personalization: Record<string, any> | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("personalization_data")
      .eq("id", user.id)
      .single();
    personalization = profile?.personalization_data ?? null;
  }

  const systemPrompt = buildSystemPrompt(personalization);

  // ── 3'lü Fallback Sistemi ──────────────────────────────────────────────────
  let analysis: DreamAnalysis | null = null;
  const errors: string[] = [];

  for (const model of MODELS) {
    try {
      console.log(`[analyzeDream] Deneniyor: ${model}`);
      analysis = await callModel(model, dreamText, systemPrompt);
      console.log(`[analyzeDream] Başarılı: ${model}`);
      break; // Başarılı → döngüden çık
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.warn(`[analyzeDream] Hata (${model}): ${msg}`);
      errors.push(`${model}: ${msg}`);
      // Bir sonraki modele geç
    }
  }

  // Tüm modeller başarısız
  if (!analysis) {
    console.error("[analyzeDream] Tüm modeller başarısız:", errors);
    return {
      success: false,
      code:    "ALL_MODELS_FAILED",
      error:   "Yapay zeka sunucularımızda anlık bir yoğunluk var. Rüyanız güvende, lütfen birkaç saniye sonra tekrar deneyin.",
    };
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Rüyayı Kaydet ──
  const { data: dream, error: dreamError } = await supabase
    .from("dreams")
    .insert({
      user_id:          user?.id ?? null,
      guest_session_id: guestSessionId,
      dream_text:       dreamText,
      ai_response:      analysis,
      status:           "completed",
    })
    .select("id")
    .single();

  if (dreamError || !dream) {
    console.error("[analyzeDream] DB kayıt hatası:", dreamError);
    return { success: false, error: "Analiz tamamlandı fakat kaydedilemedi.", code: "DB_ERROR" };
  }

  // ── İlk Chat Mesajını Kaydet ──
  await supabase.from("dream_chat_messages").insert({
    dream_id:  dream.id,
    user_id:   user?.id ?? null,
    role:      "assistant",
    content:   analysis.kisa_ozet,
    credits_spent: 0,
  });

  // ── Kredi Düş ──
  if (user) {
    await supabase.rpc("handle_credit_transaction", {
      p_user_id:    user.id,
      p_amount:     -1,
      p_process_type: "dream_analysis",
      p_description: `Rüya analizi: ${dreamText.slice(0, 50)}`,
    });
  }

  revalidatePath("/");

  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/dict-gen`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    dreamText,
    secret: process.env.DICT_GEN_SECRET,
  }),
}).catch((e) => console.warn("[analyzeDream] dict-gen tetiklenemedi:", e?.message));

  return { success: true, dreamId: dream.id };
}