"use server";

import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs";
import OpenAI from "openai";
import { calculateTransitChart, calculateNatalChart } from "@/utils/astro-calc"; 

const openai = new OpenAI({
  baseURL: '[https://openrouter.ai/api/v1](https://openrouter.ai/api/v1)',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { "HTTP-Referer": "[https://ruyayorumcum.com](https://ruyayorumcum.com)", "X-Title": "Rüya Yorumcum" },
});

export async function getDailyHoroscope() {
  const supabase = createClient();
  const COST = SERVICE_COSTS.daily_horoscope || 1; 

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // Bugünün tarihi (Kanada formatı veritabanı ile uyumludur: YYYY-MM-DD)
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }); 
  
  // 1. CACHE KONTROLÜ (Bugün zaten yapılmış mı?)
  const { data: existing } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (existing && existing.general_vibe) {
    return { success: true, data: existing, cached: true };
  } else if (existing) {
    // Eğer kayıt var ama içi boşsa sil (Hatalı kayıt temizliği)
    await supabase.from('daily_horoscopes').delete().eq('id', existing.id);
  }

  // Profil verilerini çek
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile?.birth_date) return { error: "Profilinizde doğum tarihi eksik." };

  // 2. ÖDEME AL (Analizden Önce)
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
    // 3. ASTROLOJİK HESAPLAMA (Yeni düzelttiğimiz fonksiyonlar)
    const birthDate = new Date(`${profile.birth_date}T${profile.birth_time || "12:00"}`);
    
    // Natal Harita (Doğum)
    const natal = calculateNatalChart(
        birthDate, 
        Number(profile.birth_lat || 41), 
        Number(profile.birth_lng || 29)
    );
    
    // Transit Harita (Şu an)
    const transit = calculateTransitChart(new Date()); 

    // 4. AI PROMPT HAZIRLIĞI
    const prompt = `
      Sen profesyonel bir Astrologsun.
      NATAL HARİTA: Güneş ${natal.sun}, Ay ${natal.moon}, Yükselen ${natal.ascendant}.
      TRANSİT ETKİLER: Güneş ${transit.transit_sun}, Ay ${transit.transit_moon}.
      
      Bugün (${today}) için KISA, MİSTİK ve ÖZ bir yorum yap.
      
      ÇOK ÖNEMLİ: Cevabı SADECE ve SAF JSON formatında ver. Markdown, backticks veya açıklama ekleme.
      
      Beklenen JSON Formatı:
      {
        "general_vibe": "Günün genel ruh hali (Max 2 etkileyici cümle)",
        "love_focus": "Aşk ve ilişki tavsiyesi (Kısa ve net)",
        "career_focus": "Kariyer ve para tavsiyesi (Kısa ve net)",
        "lucky_score": 75
      }
    `;

    // 5. AI İSTEĞİ
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content || "{}";

    // --- GÜÇLENDİRİLMİŞ JSON TEMİZLİĞİ ---
    // AI bazen ```json ... ``` içinde, bazen düz metin verir. Hepsini yakalıyoruz.
    let aiData;
    try {
        // 1. Adım: Basit temizlik
        const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
        aiData = JSON.parse(cleanJson);
    } catch (e) {
        // 2. Adım: Eğer parse hatası verirse, süslü parantezleri Regex ile bulup çekiyoruz.
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            aiData = JSON.parse(match[0]);
        } else {
            throw new Error("AI yanıtı okunamadı (JSON Format Hatası).");
        }
    }

    if (!aiData.general_vibe) throw new Error("Eksik veri döndü.");

    // 6. DB KAYIT
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
    
    // 7. HATA DURUMUNDA İADE
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Günlük Burç Hatası'
    });
    
    return { error: "Yorum alınamadı, krediniz iade edildi." };
  }
}