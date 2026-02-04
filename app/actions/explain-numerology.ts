"use server";

import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

export async function explainNumbers(numbers: number[], dreamId: string) {
  const supabase = createClient();
  const COST = SERVICE_COSTS.numerology || 2; 

  // 1. API Key ve Kullanıcı Kontrolü
  if (!process.env.OPENROUTER_API_KEY) return { error: "Sistem hatası: API Key eksik." };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // 2. CACHE KONTROLÜ (Daha önce analiz yapılmış mı?)
  const { data: existingReport } = await supabase
    .from('numerology_reports')
    .select('analysis')
    .eq('dream_id', dreamId)
    .single();

  if (existingReport?.analysis) {
    return { success: true, data: existingReport.analysis };
  }

  // 3. KRİTİK ADIM: KULLANICININ NUMEROLOJİ HARİTASINI ÇEK
  // AI'nın karşılaştırma yapabilmesi için kullanıcının kendi sayılarını bilmesi lazım.
  const { data: personalNumerology } = await supabase
    .from('personal_numerology')
    .select('life_path_number, destiny_number')
    .eq('user_id', user.id)
    .single();

  // Eğer kullanıcının numeroloji kaydı yoksa varsayılan değer ata
  const userLifePath = personalNumerology?.life_path_number || "Bilinmiyor";
  const userDestiny = personalNumerology?.destiny_number || "Bilinmiyor";

  // 4. KREDİ İŞLEMİ (Harcama)
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: `Rüya Numerolojisi (Rüya #${dreamId.slice(0,4)})`,
      p_metadata: { numbers }
  });

  if (txError || !txResult.success) {
      return { error: "Yetersiz bakiye.", code: "NO_CREDIT" };
  }

  // 5. AI ANALİZİ
  try {
    const { data: profile } = await supabase.from('profiles').select('full_name, bio').eq('id', user.id).single();
    
    // Prompt'u güncelledik: Kullanıcının Yaşam Yolu sayısını AI'ya veriyoruz.
    const prompt = `
        Sen mistik bir numerologsun.
        
        DANIŞAN BİLGİLERİ:
        - İsim: ${profile?.full_name}
        - Yaşam Yolu Sayısı: ${userLifePath} (BU ÇOK ÖNEMLİ, KIYASLA)
        - Kader Sayısı: ${userDestiny}
        
        RÜYADA GÖRÜLEN SAYILAR: [${numbers.join(", ")}]
        
        GÖREV:
        Rüyadaki bu sayıların anlamını açıkla VE danışanın Yaşam Yolu sayısı (${userLifePath}) ile olan uyumunu analiz et.
        
        Lütfen SADECE şu JSON formatında cevap ver:
        { 
          "numbers": [
            { "number": 7, "title": "Ruhsal Uyanış", "meaning": "Bu sayı rüyanda..." }
          ], 
          "life_analysis": "Rüyanda gördüğün sayılar ile senin yaşam yolun olan ${userLifePath} sayısı arasındaki ilişki şudur..." 
        }
    `;

    console.log("📡 AI İsteği (ExplainNumbers) Gönderiliyor...");

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "Sen JSON formatında çıktı veren bir numerologsun." },
            { role: "user", content: prompt }
        ],
        model: "google/gemini-2.0-flash-lite-001", 
        temperature: 1.0,
        response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("Boş veri döndü.");

    const cleanJson = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    let aiResponse;
    try {
        aiResponse = JSON.parse(cleanJson);
    } catch (jsonError) {
        throw new Error("AI cevabı JSON formatında değil.");
    }

    // 6. KAYDET (Şemanla Tam Uyumlu)
    // Önce var mı diye kontrol ediyoruz (Manuel Upsert Mantığı)
    // Çünkü dream_id üzerinde unique constraint olmayabilir.
    const { data: currentReport } = await supabase
        .from('numerology_reports')
        .select('id')
        .eq('dream_id', dreamId)
        .single();

    if (currentReport) {
        // Varsa GÜNCELLE
        await supabase
            .from('numerology_reports')
            .update({
                lucky_numbers: numbers, // integer[] ile uyumlu
                analysis: aiResponse    // jsonb ile uyumlu
            })
            .eq('id', currentReport.id);
    } else {
        // Yoksa EKLE
        const { error: insertError } = await supabase
            .from('numerology_reports')
            .insert({
                user_id: user.id,
                dream_id: dreamId,
                lucky_numbers: numbers,
                analysis: aiResponse
            });
        
        if (insertError) throw insertError;
    }

    return { success: true, data: aiResponse };

  } catch (e: any) {
    console.error("🔥 ExplainNumbers HATASI:", e);
    
    // Hata olursa iade yap
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Numeroloji Hatası'
    });
    
    return { error: `Analiz yapılamadı: ${e.message}` };
  }
}