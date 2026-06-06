"use server";

import { createClient }            from "@/utils/supabase/server";
import { revalidatePath }          from "next/cache";
import { generateDictionaryEntry } from "@/app/actions/generate-dictionary-entry";

// ─── Fallback model dizisi ─────────────────────────────────────────────────────

const MODELS = [
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
];

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type DreamAnalysis = {
  kisa_ozet:      string;
  detayli_tahlil: string;
  semboller:      string;
};

type AnalyzeResult =
  | { success: true;  dreamId: string }
  | { success: false; error: string; code?: string };

// ─── System Prompt ────────────────────────────────────────────────────────────
// kisa_ozet: Kullanıcıyı merak ettiren kısa teaser — detayları verme
// detayli_tahlil: İslami + psikolojik derin yorum — ödeme duvarı arkasında

function buildSystemPrompt(personalization: Record<string, any> | null): string {
  const base = `Sen Jung psikolojisi, İslami rüya tabiri geleneği ve sembolizm konusunda uzman, gizemli bir rüya yorumcususun.

Kullanıcının rüyasını aldığında SADECE şu JSON formatında yanıt ver, başka hiçbir şey ekleme:
{
  "kisa_ozet": "...",
  "detayli_tahlil": "...",
  "semboller": "..."
}

── kisa_ozet KURALLARI (Teaser / Fragman) ──────────────────────────────────────
Sen bir sinema fragmanı yazıyorsun. Kullanıcıyı merakta bırak, tatmin etme.

KESİN KURALLAR:
1. MAKSİMUM 3 cümle, en fazla 50 kelime.
2. Rüyadaki sembollerin ne anlama geldiğini ASLA açıklama. Sadece dikkat çekici olduklarını vurgula.
3. Çözüm, tavsiye veya rahatlatıcı söz verme.
4. Ton: Gizemli, hafif karanlık, merak uyandırıcı.
5. Yanıtı mutlaka tamamlanmamış bir "kanca" cümlesiyle bitir.
   Örnek kancalar: "...ancak asıl mesaj henüz yüzeye çıkmadı:", "...bu sembol çok daha derin bir şeyi işaret ediyor:", "...ve bu rüyanın seni en çok zorlayacak kısmı şurada gizli:"
6. Türkçe yaz.

── detayli_tahlil KURALLARI ────────────────────────────────────────────────────
Bu bölüm ödeme duvarının arkasındadır. Derin, doyurucu ve değerli olmalı.
• En az 4 paragraf.
• ÖNCE İslami/geleneksel yorum: İbn-i Sirin ve Nablusi referanslı net tabir.
• SONRA günlük dil psikoloji harmanı: "iç dünyanız, son günlerdeki stresiniz, zihninizin yansıması" gibi herkesin anlayacağı ifadeler.
• YASAK: Arketip, Jung, Freud, Kolektif Bilinçdışı, Psikanaliz — bunları ASLA kullanma.
• Paragraflar arasına boş satır koy (\\n\\n).

── semboller KURALLARI ─────────────────────────────────────────────────────────
• 2-4 ana sembol, madde madde.
• Format: "🔹 [Sembol]: [Kısa anlam]"`;

  if (!personalization || Object.keys(personalization).length === 0) return base;

  const ctx = [
    personalization.yasam_evreni && `Yaşam evresi: ${personalization.yasam_evreni}`,
    personalization.ruh_hali     && `Ruh hali: ${personalization.ruh_hali}`,
    personalization.zihin_mesgul && `Zihin meşguliyeti: ${personalization.zihin_mesgul}`,
  ].filter(Boolean).join(", ");

  return `${base}\n\nKullanıcı bağlamı (yorumu kişiselleştir): ${ctx}`;
}

// ─── Model çağrısı ────────────────────────────────────────────────────────────

async function callModel(
  model: string,
  dreamText: string,
  systemPrompt: string
): Promise<DreamAnalysis> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer":  "https://www.ruyayorumcum.com.tr",
      "X-Title":       "Ruya Yorumcum",
    },
    body: JSON.stringify({
      model,
      max_tokens:  1400,
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

  const data    = await res.json();
  const raw     = data?.choices?.[0]?.message?.content ?? "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed  = JSON.parse(cleaned) as DreamAnalysis;

  if (!parsed.kisa_ozet || !parsed.detayli_tahlil) {
    throw new Error(`${model} → Beklenen JSON alanları eksik`);
  }

  return parsed;
}

// ─── Ana Fonksiyon ────────────────────────────────────────────────────────────

export async function analyzeDream(
  dreamText:      string,
  guestSessionId?: string
): Promise<AnalyzeResult> {
  const supabase  = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = user ? null : (guestSessionId ?? crypto.randomUUID());

  // ── Misafir limit kontrolü ──
  if (!user) {
    const { count } = await supabase
      .from("dreams")
      .select("id", { count: "exact", head: true })
      .is("user_id", null)
      .eq("guest_session_id", sessionId ?? "");

    if ((count ?? 0) >= 1) {
      return { success: false, error: "Misafir limiti doldu.", code: "GUEST_LIMIT" };
    }
  } else {
    // ── Kayıtlı kullanıcı kredi kontrolü — en az 1 kredi gerekli ──
    const { data: profile } = await supabase
      .from("profiles").select("credits").eq("id", user.id).single();

    if (!profile || profile.credits < 1) {
      return { success: false, error: "Krediniz tükendi.", code: "NO_CREDIT" };
    }
  }

  // ── Personalizasyon ──
  let personalization: Record<string, any> | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("personalization_data").eq("id", user.id).single();
    personalization = profile?.personalization_data ?? null;
  }

  const systemPrompt = buildSystemPrompt(personalization);

  // ── 3'lü Fallback ──
  let analysis: DreamAnalysis | null = null;
  const errors: string[] = [];

  for (const model of MODELS) {
    try {
      console.log(`[analyzeDream] Deneniyor: ${model}`);
      analysis = await callModel(model, dreamText, systemPrompt);
      console.log(`[analyzeDream] Başarılı: ${model}`);
      break;
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      console.warn(`[analyzeDream] Hata (${model}): ${msg}`);
      errors.push(msg);
    }
  }

  if (!analysis) {
    return {
      success: false,
      code:    "ALL_MODELS_FAILED",
      error:   "Yapay zeka sunucularımızda anlık bir yoğunluk var. Rüyanız güvende, lütfen birkaç saniye sonra tekrar deneyin.",
    };
  }

  // ── Rüyayı kaydet ──
  const { data: dream, error: dreamError } = await supabase
    .from("dreams")
    .insert({
      user_id:          user?.id ?? null,
      guest_session_id: sessionId,
      dream_text:       dreamText,
      ai_response:      analysis,
      status:           "completed",
      detay_unlocked:   false,
    })
    .select("id")
    .single();

  if (dreamError || !dream) {
    return { success: false, error: "Analiz kaydedilemedi.", code: "DB_ERROR" };
  }

  // ── İlk chat mesajı ──
  await supabase.from("dream_chat_messages").insert({
    dream_id:      dream.id,
    user_id:       user?.id ?? null,
    role:          "assistant",
    content:       analysis.kisa_ozet,
    credits_spent: 0,
  });

  // ── 1 Kredi düş (kısa özet = 1 kredi) ──
  if (user) {
    await supabase.rpc("handle_credit_transaction", {
      p_user_id:      user.id,
      p_amount:       -1,
      p_process_type: "dream_analysis",
      p_description:  `Rüya analizi (teaser): ${dreamText.slice(0, 50)}`,
    });
  }

  revalidatePath("/");

  // ── Arka planda sözlük maddesi tetikle ──
  generateDictionaryEntry(dreamText).catch((e) =>
    console.warn("[analyzeDream] DictGen tetiklenemedi:", e?.message)
  );

  return { success: true, dreamId: dream.id };
}