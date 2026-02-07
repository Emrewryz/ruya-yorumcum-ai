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

// AI'dan gelen JSON'u temizleyen yardımcı fonksiyon
function cleanJson(text: string) {
    if (!text) return "{}";
    let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.substring(firstBrace, lastBrace + 1);
    }
    return clean;
}

/**
 * 1. FONKSİYON: Kullanıcının zaten bir analizi var mı diye bakar.
 * Sayfa yüklenirken bunu çağıracağız. Varsa kredi harcatmayız.
 */
export async function getPersonalNumerology() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { success: false, error: "Giriş gerekli" };

  try {
    const { data, error } = await supabase
      .from('personal_numerology')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = Kayıt bulunamadı hatası (normal)
        console.error("Veri çekme hatası:", error);
    }

    if (data) {
        return { 
            success: true, 
            data: {
                fullName: data.full_name,
                birthDate: data.birth_date,
                lifePath: data.life_path_number,
                destiny: data.destiny_number,
                analysis: data.analysis // JSON verisi
            }
        };
    }

    return { success: false, code: "NOT_FOUND" }; // Kayıt yok, formu göster
  } catch (err) {
      console.error("Beklenmedik hata:", err);
      return { success: false, error: "Sunucu hatası" };
  }
}

/**
 * 2. FONKSİYON: Yeni analiz oluşturur, kredi düşer, AI yorumlar ve kaydeder.
 * Form gönderilince bu çalışır.
 */
export async function createNumerologyAnalysis(formData: { fullName: string, birthDate: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum süresi doldu." };

  const COST = SERVICE_COSTS.numerology || 2;

  // A. Matematiksel Hesaplama (Utils dosyasından)
  const stats = calculateNumerologyProfile(formData.fullName, formData.birthDate);

  // B. Ödeme Alma (Atomik İşlem)
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: `Numeroloji Haritası: LP ${stats.lifePath}`,
      p_metadata: { ...stats }
  });

  if (txError || !txResult.success) {
      return { error: "Yetersiz bakiye. Analiz için kredi yükleyin.", code: "NO_CREDIT" };
  }

  try {
    // C. Yapay Zeka Yorumlaması
    const prompt = `
      Sen usta bir Numerologsun.
      DANIŞAN: ${formData.fullName}, Doğum: ${formData.birthDate}
      
      HESAPLANAN DEĞERLER:
      - Yaşam Yolu Sayısı: ${stats.lifePath}
      - Kader Sayısı: ${stats.destiny}
      
      GÖREV: Bu kişiye özel, motive edici ve derin bir numeroloji raporu hazırla.
      
      Lütfen SADECE aşağıdaki JSON formatında yanıt ver:
      {
        "life_path_title": "Yaşam Yolu için Kısa Başlık",
        "life_path_desc": "Yaşam yolu detaylı analizi (Kişinin potansiyeli, dersleri)",
        "destiny_title": "Kader Sayısı için Kısa Başlık",
        "destiny_desc": "Kader sayısı detaylı analizi (Kişinin yetenekleri)",
        "synthesis": "Bu iki sayının birleşiminden doğan genel karakter sentezi.",
        "lucky_colors": ["Renk1", "Renk2"],
        "spirit_animal": "Ruh Hayvanı"
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001", 
      response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0].message.content || "{}";
    const aiData = JSON.parse(cleanJson(resultText));

    // D. Veritabanına Kayıt (Upsert = Varsa güncelle, yoksa ekle)
    const { error: saveError } = await supabase
        .from('personal_numerology')
        .upsert({ 
            user_id: user.id,
            full_name: formData.fullName,
            birth_date: formData.birthDate,
            life_path_number: stats.lifePath,
            destiny_number: stats.destiny,
            analysis: aiData
        }, { onConflict: 'user_id' });

    if (saveError) throw new Error(`Veritabanı hatası: ${saveError.message}`);

    // Başarılı Sonuç Dön
    return { 
        success: true, 
        data: {
            lifePath: stats.lifePath,
            destiny: stats.destiny,
            analysis: aiData,
            fullName: formData.fullName,
            birthDate: formData.birthDate
        }
    };

  } catch (error: any) {
    console.error("Numeroloji İşlem Hatası:", error);
    
    // E. Hata Durumunda İade (Güvenlik Sigortası)
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Numeroloji Hatası'
    });
    
    return { error: "Analiz sırasında teknik bir hata oluştu, krediniz iade edildi." };
  }
}