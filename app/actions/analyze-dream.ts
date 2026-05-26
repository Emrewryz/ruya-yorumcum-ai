"use server";

import { createClient } from "@/utils/supabase/server";
import { getMoonPhase } from "@/utils/moon";
import OpenAI from "openai";
import { cookies } from "next/headers";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com.tr",
    "X-Title": "Rüya Yorumcum",
  },
});

const DREAM_ANALYSIS_COST = 1;

export interface DreamAnalysis {
  kisa_ozet: string;
  islami_analiz: string;
  psikolojik_analiz: string;
  semboller: string;
}

export type AnalyzeDreamResult =
  | { success: true; dreamId: string; analysis: DreamAnalysis }
  | { success: false; code?: "GUEST_LIMIT" | "NO_CREDIT" | "VALIDATION" | "SERVER"; error: string };

function cleanJson(text: string): string {
  let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = clean.indexOf("{");
  const lastBrace  = clean.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  return clean;
}

function getOrCreateGuestId(cookieStore: ReturnType<typeof cookies>): string {
  const existing = cookieStore.get("guest_session_id")?.value;
  if (existing) return existing;
  const newId = crypto.randomUUID();
  cookieStore.set("guest_session_id", newId, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return newId;
}

export async function analyzeDream(dreamText: string): Promise<AnalyzeDreamResult> {
  const supabase     = createClient();
  const cookieStore  = cookies();
  const trimmed      = dreamText?.trim() ?? "";

  if (trimmed.length < 10) {
    return { success: false, code: "VALIDATION", error: "Rüyanızı biraz daha detaylı anlatır mısınız?" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  const guestSessionId = !user ? getOrCreateGuestId(cookieStore) : null;

  if (!user) {
    const hasUsedFree = cookieStore.get("guest_dream_analyzed")?.value;
    if (hasUsedFree) {
      return { success: false, code: "GUEST_LIMIT", error: "Ücretsiz analiz hakkınızı kullandınız. Devam etmek için kayıt olun veya kredi satın alın." };
    }
  }

  if (user) {
    const { data: txResult, error: txError } = await supabase.rpc("handle_credit_transaction", {
      p_user_id:     user.id,
      p_amount:      -DREAM_ANALYSIS_COST,
      p_process_type:"spend",
      p_description: "Rüya Analizi",
      p_metadata:    { text_length: trimmed.length },
    });
    if (txError || !txResult?.success) {
      return { success: false, code: "NO_CREDIT", error: "Yetersiz bakiye." };
    }
  }

  const currentMoon = getMoonPhase();

  try {
    const systemPrompt = `Sen sadece geçerli JSON döndüren, uzman bir rüya analiz motorusun.
JSON dışında hiçbir şey yazma. Tüm içerik Türkçe olmalı.
Analizlerin derin, şefkatli ve özgün olsun.`;

    const userPrompt = `Aşağıdaki rüyayı analiz et.

RÜYA: "${trimmed.slice(0, 1200)}"

Yalnızca şu JSON formatında yanıt ver:
{
  "kisa_ozet": "FRAGMAN KURALI — Bu alanı çok dikkatli yaz. Rüyanın en çarpıcı sembolünü veya duygusunu yakala ve analiz etmeye başla, ama tam en can alıcı noktada — bilinçaltının gerçek mesajını açıklamak üzereyken — cümleyi bir soruyla veya '...' ile ASLA tamamlama. Kullanıcı devamını okumak için yanmalı. Örnek format: '[Sembol/duygu tespiti yapan 1-2 güçlü cümle]. Ancak bu rüyadaki [kritik detay], bilinçaltınızda çok daha derin bir [tema/korku/arzu]nın kilidini açıyor...' — Maksimum 3 cümle.",
  "islami_analiz": "İbn-i Sirin ve İmam Nablusi geleneğine dayanan derin analiz. Müjde mi uyarı mı, hayır mı şer mi? Dini referanslar kullan. En az 3-4 paragraf.",
  "psikolojik_analiz": "Carl Jung arketipleri, bilinçaltı mesajlar, gölge benlik, bastırılmış duygular üzerinden derin analiz. En az 3-4 paragraf.",
  "semboller": "En güçlü 3-4 sembolü belirle. Her birini yeni satırda '[Sembol]: [Kadim ve psikolojik anlam]' formatında yaz."
}`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      model:           "google/gemini-2.0-flash-lite-001",
      temperature:     0.75,
      response_format: { type: "json_object" },
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("AI'dan boş yanıt.");

    const raw = JSON.parse(cleanJson(resultText));

    const aiData: DreamAnalysis = {
      kisa_ozet:         raw.kisa_ozet         || raw.kisaOzet         || raw.summary    || "",
      islami_analiz:     raw.islami_analiz     || raw.islamiAnaliz     || raw.islamic    || "",
      psikolojik_analiz: raw.psikolojik_analiz || raw.psikolojikAnaliz || raw.psychological || "",
      semboller:         raw.semboller         || raw.symbols          || raw.sembol     || "",
    };

    for (const field of ["kisa_ozet", "islami_analiz", "psikolojik_analiz", "semboller"] as const) {
      if (!aiData[field]) throw new Error(`Eksik alan: ${field}`);
    }

    const { data: dreamData, error: dbError } = await supabase
      .from("dreams")
      .insert({
        user_id:          user ? user.id : null,
        guest_session_id: guestSessionId,
        dream_text:       trimmed,
        dream_title:      aiData.kisa_ozet.slice(0, 100),
        ai_response:      aiData,
        moon_phase:       currentMoon.phase,
        status:           "completed",
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    if (!user) {
      cookieStore.set("guest_dream_analyzed", "true", {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return { success: true, dreamId: dreamData.id, analysis: aiData };

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[analyzeDream] Hata:", message);

    if (user) {
      await supabase.rpc("handle_credit_transaction", {
        p_user_id:     user.id,
        p_amount:      DREAM_ANALYSIS_COST,
        p_process_type:"refund",
        p_description: "İade: Rüya Analiz Hatası",
      });
    }

    return { success: false, code: "SERVER", error: "Analiz sırasında bir sorun oluştu. Lütfen tekrar deneyin." };
  }
}