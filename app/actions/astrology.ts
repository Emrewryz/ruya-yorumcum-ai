"use server";

import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs"; 
import OpenAI from "openai";
import { TURKEY_CITIES } from "@/constants/cities";
import { calculateNatalChart } from "@/utils/astro-calc"; 

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { "HTTP-Referer": "https://ruyayorumcum.com", "X-Title": "Rüya Yorumcum" },
});

export async function getAstrologyAnalysis(formData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Giriş yapmalısınız." };

  const COST = SERVICE_COSTS.astrology_chart || 5; 

  // 1. Profil Güncelleme (Opsiyonel)
  if (formData) {
    const selectedCity = TURKEY_CITIES.find(c => c.name === formData.city);
    if (selectedCity) {
      await supabase.from('profiles').update({
        birth_date: formData.birth_date,
        birth_time: formData.birth_time,
        birth_city: selectedCity.name,
        birth_lat: selectedCity.lat,
        birth_lng: selectedCity.lng
      }).eq('id', user.id);
    }
  }

  // 2. Profili Çek
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile?.birth_date || !profile?.birth_time) {
    return { error: "Doğum bilgileri eksik.", missingInfo: true };
  }

  // 3. MATEMATİKSEL HESAPLAMA (Garantili Veri)
  let exactChart;
  try {
    const cleanTime = profile.birth_time.split(':').slice(0, 2).join(':'); 
    const isoString = `${profile.birth_date}T${cleanTime}:00`;
    const birthDateTime = new Date(isoString);
    const lat = Number(profile.birth_lat) || 41.0082;
    const lng = Number(profile.birth_lng) || 28.9784;

    exactChart = calculateNatalChart(birthDateTime, lat, lng);
  } catch (err) {
    return { error: "Doğum tarihi hesaplanamadı." };
  }

  // 4. ÖDEME AL
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: 'Natal Harita Analizi',
      p_metadata: { sun: exactChart.sun }
  });

  if (txError || !txResult.success) {
      // Para yoksa temel veriyi dön, ama success: false de.
      return { 
          success: false, 
          error: "Yetersiz bakiye.", 
          code: "NO_CREDIT",
          basicData: exactChart 
      };
  }

  // 5. AI ANALİZİ
  try {
    const prompt = `
      Sen uzman bir astrologsun.
      HARİTA: Güneş ${exactChart.sun}, Ay ${exactChart.moon}, Yükselen ${exactChart.ascendant}.
      
      Detaylı analiz yap.
      JSON FORMATI (Markdown Yok):
      {
        "sun_sign": "${exactChart.sun}", 
        "moon_sign": "${exactChart.moon}",
        "ascendant_sign": "${exactChart.ascendant}", 
        "character_analysis": "Kişilik analizi (Detaylı)",
        "career_love": "Kariyer ve Aşk hayatı analizi (Birleşik paragraf)"
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content || "{}";
    
    // --- KRİTİK DÜZELTME: JSON Clean ---
    const cleanedContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiResponse = JSON.parse(cleanedContent);

    // DB Kayıt
    await supabase.from('astrology_readings').insert({
      user_id: user.id,
      sun_sign: aiResponse.sun_sign || exactChart.sun,
      moon_sign: aiResponse.moon_sign || exactChart.moon,
      ascendant_sign: aiResponse.ascendant_sign || exactChart.ascendant,
      analysis: aiResponse
    });

    return { success: true, data: aiResponse };

  } catch (error: any) {
    console.error("AI Hatası:", error);
    
    // 6. İADE
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Astroloji Hatası'
    });

    // Hata olsa bile temel veriyi göster
    return { 
        error: "Yapay zeka yanıt vermedi (Kredi iade edildi). Temel haritanız aşağıdadır.", 
        success: false, 
        basicData: exactChart 
    };
  }
}