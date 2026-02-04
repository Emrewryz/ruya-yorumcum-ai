"use server";

import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs";
import { getMoonPhase } from "@/utils/moon";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

export async function analyzeDream(dreamText: string) {
  const supabase = createClient();
  const COST = SERVICE_COSTS.dream_analysis || 1; // 1 Kredi

  // 1. Auth Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // 2. Profil Verisini Çek
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, age, gender, marital_status, interest_area, bio')
    .eq('id', user.id)
    .single();

  // -----------------------------------------------------------------
  // 3. ÖDEME AL (Atomik İşlem - Kredi Düşme)
  // -----------------------------------------------------------------
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST, // Eksi bakiye (Harcama)
      p_process_type: 'spend',
      p_description: 'Rüya Analizi',
      p_metadata: { text_length: dreamText.length }
  });

  if (txError || !txResult.success) {
      // Bakiye yetersizse buraya düşer
      return { error: "Yetersiz bakiye. Analiz için kredi yükleyin." };
  }
  // -----------------------------------------------------------------

  const currentMoon = getMoonPhase(); 

  try {
    // 4. AI Analizi
    const userContext = `Kullanıcı: ${profile?.full_name}, Bio: ${profile?.bio}`;
    
    const prompt = `
        Sen usta bir rüya tabircisisin. Aşağıdaki rüyayı analiz et.
        ${userContext}
        Rüya: "${dreamText}"
        
        SADECE JSON FORMATINDA CEVAP VER:
        {
          "title": "Kısa Başlık",
          "summary": "Genel yorum",
          "psychological": "Psikolojik analiz",
          "spiritual": "Manevi analiz",
          "mood": "Tek kelime ruh hali",
          "mood_score": 0-100 arası sayı,
          "lucky_numbers": [3 sayı]
        }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Sen JSON formatında çıktı veren bir kahinsin." },
        { role: "user", content: prompt }
      ],
      model: "google/gemini-2.0-flash-lite-001", 
      temperature: 1.0, 
      response_format: { type: "json_object" } 
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("Boş cevap.");
    const aiData = JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, "").trim());

    // 5. Kayıt
    const { data: dreamData, error: dbError } = await supabase
      .from("dreams")
      .insert({
        user_id: user.id,
        dream_text: dreamText,
        dream_title: aiData.title,
        ai_response: aiData,
        moon_phase: currentMoon.phase,
        status: "completed",
        visibility: "private"
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return { success: true, data: dreamData };

  } catch (err: any) {
    console.error("Hata:", err);

    // 6. HATA DURUMUNDA İADE (Güvenilirlik)
    // Eğer AI hata verirse veya DB kaydetmezse, krediyi geri veriyoruz.
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id,
        p_amount: COST, // Artı bakiye (İade)
        p_process_type: 'refund',
        p_description: 'İade: Rüya Analiz Hatası'
    });

    return { error: "Analiz sırasında bir hata oluştu, krediniz iade edildi." };
  }
}