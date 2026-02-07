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
  const supabase = createClient(); // await createClient() değil, senkron olabilir sürüme göre
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Giriş yapmalısınız." };

  const COST = SERVICE_COSTS.astrology_chart || 5; 

  // 1. Profil Güncelleme (Eğer formdan şehir/tarih geldiyse)
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

  // 2. Güncel Profili Çek
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile?.birth_date || !profile?.birth_time) {
    return { error: "Doğum bilgileri eksik.", missingInfo: true };
  }

  // 3. MATEMATİKSEL HESAPLAMA (Garantili Veri)
  // Yeni düzelttiğimiz astro-calc fonksiyonunu kullanıyoruz.
  let exactChart;
  try {
    const cleanTime = profile.birth_time.split(':').slice(0, 2).join(':'); 
    const isoString = `${profile.birth_date}T${cleanTime}:00`;
    const birthDateTime = new Date(isoString);
    
    // Koordinatlar yoksa varsayılan İstanbul
    const lat = Number(profile.birth_lat) || 41.0082;
    const lng = Number(profile.birth_lng) || 28.9784;

    exactChart = calculateNatalChart(birthDateTime, lat, lng);
  } catch (err) {
    console.error("Hesaplama Hatası:", err);
    return { error: "Doğum tarihi hesaplanamadı. Tarih formatını kontrol edin." };
  }

  // 4. ÖDEME AL (Bakiyeden düş)
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: 'Natal Harita Analizi',
      p_metadata: { sun: exactChart.sun }
  });

  if (txError || !txResult.success) {
      // Para yoksa bile temel matematiksel veriyi dön (Kullanıcıya önizleme sunmak için)
      return { 
          success: false, 
          error: "Yetersiz bakiye.", 
          code: "NO_CREDIT",
          basicData: exactChart 
      };
  }

  // 5. AI ANALİZİ (Güçlendirilmiş Prompt ve Parse)
  try {
    const prompt = `
      Sen uzman bir astrologsun.
      DOĞUM HARİTASI VERİLERİ:
      - Güneş Burcu: ${exactChart.sun}
      - Ay Burcu: ${exactChart.moon}
      - Yükselen Burcu: ${exactChart.ascendant}
      
      Görevin: Bu kombinasyona göre kullanıcının karakterini ve potansiyelini analiz etmek.
      
      Lütfen cevabı SADECE aşağıdaki JSON formatında ver. Markdown veya ek metin kullanma.
      
      {
        "sun_sign": "${exactChart.sun}", 
        "moon_sign": "${exactChart.moon}",
        "ascendant_sign": "${exactChart.ascendant}", 
        "character_analysis": "Kişilik analizi (En az 3-4 cümle, derinlikli ve mistik bir dil)",
        "career_love": "Kariyer ve Aşk hayatı potansiyeli (Birleşik paragraf, yol gösterici)"
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content || "{}";
    
    // --- GÜÇLENDİRİLMİŞ JSON PARSE (Hata Önleyici) ---
    let aiResponse;
    try {
        // 1. Temizle
        const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
        aiResponse = JSON.parse(cleanJson);
    } catch (e) {
        // 2. Regex ile Kurtar
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
            aiResponse = JSON.parse(match[0]);
        } else {
            throw new Error("AI Yanıtı JSON formatında değil.");
        }
    }

    // 6. VERİTABANINA KAYIT
    const { error: dbError } = await supabase.from('astrology_readings').insert({
      user_id: user.id,
      sun_sign: aiResponse.sun_sign || exactChart.sun,
      moon_sign: aiResponse.moon_sign || exactChart.moon,
      ascendant_sign: aiResponse.ascendant_sign || exactChart.ascendant,
      analysis: aiResponse
    });

    if (dbError) throw dbError;

    return { success: true, data: aiResponse };

  } catch (error: any) {
    console.error("AI Analiz Hatası:", error);
    
    // 7. HATA DURUMUNDA İADE (Refund)
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Astroloji Hatası'
    });

    // Hata olsa bile temel veriyi göster ki kullanıcı tamamen boş ekran görmesin
    return { 
        error: "Yapay zeka yanıt vermedi (Kredi iade edildi). Temel haritanız aşağıdadır.", 
        success: false, 
        basicData: exactChart 
    };
  }
}