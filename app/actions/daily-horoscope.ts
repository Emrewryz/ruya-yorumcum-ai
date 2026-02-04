"use server";

import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs";
import OpenAI from "openai";
import { calculateTransitChart, calculateNatalChart } from "@/utils/astro-calc"; 

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { "HTTP-Referer": "https://ruyayorumcum.com", "X-Title": "Rüya Yorumcum" },
});

export async function getDailyHoroscope() {
  const supabase = createClient();
  const COST = SERVICE_COSTS.daily_horoscope || 1; 

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // 1. CACHE KONTROLÜ
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }); 
  
  const { data: existing } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (existing && existing.general_vibe) {
    return { success: true, data: existing, cached: true };
  } else if (existing && !existing.general_vibe) {
    await supabase.from('daily_horoscopes').delete().eq('id', existing.id);
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile?.birth_date) return { error: "Profilinizde doğum tarihi eksik." };

  // 2. ÖDEME AL (Peşin)
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: `Günlük Burç: ${today}`
  });

  if (txError || !txResult.success) {
      return { error: "Yetersiz bakiye.", code: "NO_CREDIT" };
  }

  try {
    const birthDate = new Date(`${profile.birth_date}T${profile.birth_time || "12:00"}`);
    const natal = calculateNatalChart(birthDate, Number(profile.birth_lat || 41), Number(profile.birth_lng || 29));
    const transit = calculateTransitChart(new Date()); 

    // 3. AI İSTEĞİ
    const prompt = `
      Sen Astrologsun.
      NATAL: Güneş ${natal.sun}, Ay ${natal.moon}, Yükselen ${natal.ascendant}.
      TRANSİT: Güneş ${transit.transit_sun}, Ay ${transit.transit_moon}.
      
      Bugün (${today}) için KISA ve ÖZ bir yorum yap.
      
      JSON FORMATINDA CEVAP VER (Markdown yok):
      {
        "general_vibe": "Ruh hali (Max 2 cümle)",
        "love_focus": "Aşk tavsiyesi (Kısa)",
        "career_focus": "İş tavsiyesi (Kısa)",
        "lucky_score": 75
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("AI boş yanıt döndü");

    // --- KRİTİK DÜZELTME: Markdown Temizliği ---
    const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiData = JSON.parse(cleanedContent);

    // Validation
    if (!aiData.general_vibe) throw new Error("Eksik veri.");

    // 4. DB KAYIT
    const { data: savedData, error: saveError } = await supabase.from('daily_horoscopes').insert({
      user_id: user.id,
      date: today,
      general_vibe: aiData.general_vibe,
      love_focus: aiData.love_focus,
      career_focus: aiData.career_focus,
      lucky_score: aiData.lucky_score || 50
    }).select().single();

    if (saveError) throw saveError;

    return { success: true, data: savedData };

  } catch (error: any) {
    console.error("Günlük Burç Hatası:", error);
    
    // 5. HATA İADESİ
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Günlük Burç Hatası'
    });
    
    return { error: "Yorum alınamadı, krediniz iade edildi." };
  }
}