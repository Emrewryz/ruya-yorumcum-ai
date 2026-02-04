"use server";

import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs";
import OpenAI from "openai";
import { calculateNumerologyProfile } from "@/utils/numerology-calc";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { 
      "HTTP-Referer": "https://ruyayorumcum.com", 
      "X-Title": "Rüya Yorumcum" 
  },
});

export async function getNumerologyReading(formData: { fullName: string, birthDate: string }) {
  const supabase = createClient();
  
  if (!process.env.OPENROUTER_API_KEY) {
      return { error: "Sistem hatası: API Key eksik." };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  const COST = SERVICE_COSTS.numerology || 2; 

  // Profili Güncelle
  await supabase.from('profiles').update({
    full_name: formData.fullName,
    birth_date: formData.birthDate
  }).eq('id', user.id);

  // Hesaplama
  const stats = calculateNumerologyProfile(formData.fullName, formData.birthDate);

  // ÖDEME AL
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: `Numeroloji Analizi: LP ${stats.lifePath}`,
      p_metadata: { ...stats }
  });

  if (txError || !txResult.success) {
      return { 
          success: false, 
          error: "Yetersiz bakiye. Analiz için kredi yükleyin.", 
          code: "NO_CREDIT", 
          basicData: stats 
      };
  }

  // AI YORUMLAMA
  try {
    const prompt = `
      Sen mistik bir Numerologsun.
      DANIŞAN: ${formData.fullName}, Doğum: ${formData.birthDate}
      DEĞERLER: Yaşam Yolu: ${stats.lifePath}, Kader Sayısı: ${stats.destiny}.
      
      Lütfen aşağıdaki formatta geçerli bir JSON çıktısı ver (Markdown kullanma):
      {
        "life_path_title": "Kısa Başlık",
        "life_path_desc": "Detaylı açıklama...",
        "destiny_title": "Kısa Başlık",
        "destiny_desc": "Detaylı açıklama...",
        "synthesis": "Sentez yorumu...",
        "lucky_colors": ["Renk1", "Renk2"],
        "spirit_animal": "Hayvan"
      }
    `;

    console.log("📡 AI İsteği (Numeroloji) Gönderiliyor...");

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001", 
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("AI boş yanıt döndürdü.");

    const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
    let aiData;
    try {
        aiData = JSON.parse(cleanJson);
    } catch (e) {
        throw new Error("JSON format hatası");
    }

    // KAYDET (UPSERT)
    const { data: savedData, error: saveError } = await supabase
        .from('personal_numerology')
        .upsert({ 
            user_id: user.id,
            full_name: formData.fullName,
            birth_date: formData.birthDate,
            life_path_number: stats.lifePath,
            destiny_number: stats.destiny,
            analysis: aiData
        }, { onConflict: 'user_id' })
        .select()
        .single();

    if (saveError) {
        console.error("❌ DB Kayıt Hatası:", saveError);
        throw new Error(`Veritabanı hatası: ${saveError.message}`);
    }

    // --- DÜZELTME BURADA YAPILDI ---
    // Veritabanından gelen 'life_path_number' ismini Frontend'in beklediği 'lifePath' ismine çeviriyoruz.
    // Ayrıca 'analysis' JSON objesini de dışarı çıkarıyoruz ki frontend 'result.synthesis' diye erişebilsin.
    const formattedData = {
        lifePath: savedData.life_path_number,   // Mapping yapıldı
        destiny: savedData.destiny_number,      // Mapping yapıldı
        ...savedData.analysis,                  // JSON içeriği (synthesis, titles vb.) üst seviyeye taşındı
        cached: false 
    };

    return { success: true, data: formattedData };

  } catch (error: any) {
    console.error("🔥 NUMEROLOJİ HATASI:", error);
    // İADE
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Numeroloji Hatası'
    });
    return { error: `Analiz hatası: ${error.message}` };
  }
}