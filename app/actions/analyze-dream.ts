"use server";

import { createClient } from "@/utils/supabase/server";
import { getMoonPhase } from "@/utils/moon";
import OpenAI from "openai";
import { cookies } from "next/headers";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
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
  const lastBrace = clean.lastIndexOf("}");
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
  const supabase = createClient();
  const cookieStore = cookies();

  const trimmed = dreamText?.trim() ?? "";
  if (trimmed.length < 20) {
    return {
      success: false,
      code: "VALIDATION",
      error: "Rüyanızı en az 20 karakter ile anlatmanız gerekmektedir.",
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  const guestSessionId = !user ? getOrCreateGuestId(cookieStore) : null;

  if (!user) {
    const hasUsedFree = cookieStore.get("guest_dream_analyzed")?.value;
    if (hasUsedFree) {
      return {
        success: false,
        code: "GUEST_LIMIT",
        error: "Ücretsiz analiz hakkınızı kullandınız. Devam etmek için kayıt olun veya kredi satın alın.",
      };
    }
  }

  if (user) {
    const { data: txResult, error: txError } = await supabase.rpc("handle_credit_transaction", {
      p_user_id: user.id,
      p_amount: -DREAM_ANALYSIS_COST,
      p_process_type: "spend",
      p_description: "Rüya Analizi",
      p_metadata: { text_length: trimmed.length },
    });
    if (txError || !txResult?.success) {
      return {
        success: false,
        code: "NO_CREDIT",
        error: "Yetersiz bakiye. Analiz için kredi satın alabilirsiniz.",
      };
    }
  }

  const currentMoon = getMoonPhase();

  try {
    const systemPrompt = `Sen sadece geçerli JSON döndüren, uzman bir rüya analiz motorusun. JSON dışında hiçbir şey yazma. Tüm içerik Türkçe olmalı.`;

    const userPrompt = `Aşağıdaki rüyayı dört farklı boyutta analiz et.

RÜYA: "${trimmed.slice(0, 1200)}"

Yalnızca aşağıdaki JSON formatında yanıt ver:
{
  "kisa_ozet": "Rüyanın özünü yakalayan 2-3 cümlelik, merak uyandırıcı bir özet.",
  "islami_analiz": "İbn-i Sirin ve İmam Nablusi metodolojisine dayanan kapsamlı analiz. Müjde mi uyarı mı, hayır mı şer mi olduğunu belirt.",
  "psikolojik_analiz": "Carl Jung'un analitik psikoloji çerçevesinde derin bir analiz. Arketipler, bilinçaltı mesajlar, bastırılmış duygular.",
  "semboller": "Rüyadaki en güçlü 3-4 sembolü belirle. Her birini yeni satırda '[Sembol Adı]: [Anlam]' formatında yaz."
}`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "google/gemini-2.0-flash-lite-001",
      temperature: 0.72,
      response_format: { type: "json_object" },
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("AI'dan boş yanıt alındı.");

    const raw = JSON.parse(cleanJson(resultText));

    const aiData: DreamAnalysis = {
      kisa_ozet:         raw.kisa_ozet         || raw.kisaOzet       || raw.summary    || raw.genel        || "",
      islami_analiz:     raw.islami_analiz     || raw.islamiAnaliz   || raw.islamic    || raw.islami       || "",
      psikolojik_analiz: raw.psikolojik_analiz || raw.psikolojikAnaliz || raw.psychological || raw.psikolojik || "",
      semboller:         raw.semboller         || raw.symbols        || raw.sembol     || raw.symboller    || "",
    };

    const requiredFields: (keyof DreamAnalysis)[] = [
      "kisa_ozet",
      "islami_analiz",
      "psikolojik_analiz",
      "semboller",
    ];

    for (const field of requiredFields) {
      if (!aiData[field] || typeof aiData[field] !== "string") {
        throw new Error(`Eksik alan: ${field}`);
      }
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
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object"
        ? JSON.stringify(err)
        : String(err);

    console.error("[analyzeDream] Hata:", message);

    if (user) {
      await supabase.rpc("handle_credit_transaction", {
        p_user_id: user.id,
        p_amount: DREAM_ANALYSIS_COST,
        p_process_type: "refund",
        p_description: "İade: Rüya Analiz Hatası",
      });
    }

    return {
      success: false,
      code: "SERVER",
      error: "Analiz sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
    };
  }
}