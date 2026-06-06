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
  const base = `Sen İslami rüya tabiri geleneğine ve modern psikolojiye hakim, son derece profesyonel, net ve objektif bir rüya tahlilcisisin.

Kullanıcının rüyasını aldığında SADECE şu JSON formatında yanıt ver, başka hiçbir kelime ekleme:
{
  "kisa_ozet": "...",
  "detayli_tahlil": "...",
  "semboller": "..."
}

── kisa_ozet KURALLARI (Ön Analiz / Kanca) ─────────────────────────────────────
Bu bölüm kullanıcının ücretsiz gördüğü kısımdır. Profesyonel bir teşhis ver, ancak asıl tahlili eksik bırakarak merak uyandır.

KESİN KURALLAR:
1. MAKSİMUM 3 cümle, en fazla 40 kelime.
2. DİL VE TON: Son derece ciddi, direkt ve analitik. "Bilinçaltının fısıltısı", "karanlık yolculuk", "ruhunun derinlikleri" gibi çocuksu, edebi veya falcı ağzı kelimeleri KESİNLİKLE KULLANMA.
3. İÇERİK STRATEJİSİ (Teşhisi ver, reçeteyi sakla): Rüyadaki en belirgin temayı veya duyguyu direkt söyle (Kullanıcıya "Evet beni anladı" dedirt). ANCAK bu durumun hayatına etkisini, neye işaret ettiğini veya İslami uyarısını ASLA açıklama.
4. SON CÜMLE (Profesyonel Kanca): Yanıtı her zaman bu eksik kalan bilginin detaylı tahlilde olduğunu belirten ciddi bir cümleyle bitir. 
   Örnek son cümleler:
   - "Bu sembolün taşıdığı asıl uyarılar ve İslami karşılığı tahlilin devamında incelenmiştir."
   - "Bu durumun günlük hayatınızdaki kök nedeni ve neye işaret ettiği detaylı raporda açıklanmaktadır."
   - "Bu rüyanın size yönelik asıl mesajı ve dikkat etmeniz gerekenler tahlilin derinliklerinde yatmaktadır."

── detayli_tahlil KURALLARI (Premium İçerik) ───────────────────────────────────
Bu bölüm ödeme duvarının arkasındadır. Derin, tatmin edici ve net bilgi vermelidir.
• En az 3 paragraf.
• ÖNCE İslami/geleneksel yorum: İbn-i Sirin veya Nablusi gibi klasik tabirlerdeki net anlamı doğrudan söyle.
• SONRA günlük dil psikoloji harmanı: Son günlerdeki stres, karar aşamaları veya zihin meşguliyeti gibi herkesin anlayacağı gerçekçi bağlantılar kur.
• YASAK: Arketip, Kolektif Bilinçdışı, Psikanaliz, Freud, Jung gibi akademik veya ezoterik terimleri ASLA KULLANMA. Basit ve profesyonel Türkçe kullan.
• Paragraflar arasına boş satır koy (\\n\\n).

── semboller KURALLARI ─────────────────────────────────────────────────────────
• Rüyadaki 2 veya 3 ana nesneyi/durumu madde madde yaz.
• Format: "🔹 [Sembol]: [Klasik veya Psikolojik kısa anlamı]"`;

  if (!personalization || Object.keys(personalization).length === 0) return base;

  const ctx = [
    personalization.yasam_evresi && `Yaşam evresi: ${personalization.yasam_evresi}`,
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