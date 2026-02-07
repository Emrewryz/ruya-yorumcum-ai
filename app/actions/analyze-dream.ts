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

// JSON Temizleme Yardımcısı
function cleanJson(text: string) {
    let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.substring(firstBrace, lastBrace + 1);
    }
    return clean;
}

export async function analyzeDream(dreamText: string) {
  const supabase = createClient();
  const COST = SERVICE_COSTS.dream_analysis || 1; 

  // 1. Auth Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // 2. Profil Verisini Çek
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, age, gender, marital_status, interest_area, bio')
    .eq('id', user.id)
    .single();

  // 3. ÖDEME AL
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: 'Rüya Analizi',
      p_metadata: { text_length: dreamText.length }
  });

  if (txError || !txResult.success) {
      return { code: "NO_CREDIT", error: "Yetersiz bakiye." };
  }

  const currentMoon = getMoonPhase(); 

  try {
    // 4. AI Analizi - GELİŞMİŞ PROMPT
    const userContext = `
      Kullanıcı Bilgileri:
      İsim: ${profile?.full_name || "Bilinmiyor"}
      Yaş: ${profile?.age || "Bilinmiyor"}
      İlgi Alanları: ${profile?.interest_area || "Genel"}
      Biyografi: ${profile?.bio || "Yok"}
    `;
    
    const prompt = `
        Sen dünyanın en yetenekli rüya yorumcususun. Hem kadim İslami kaynaklara (İbn-i Sirin, İmam Nablusi) hakimsin hem de modern psikoloji (Carl Jung, Freud) analizi yapabiliyorsun.
        
        KULLANICI:
        ${userContext}
        
        RÜYA:
        "${dreamText}"
        
        GÖREVİN:
        Bu rüyayı 3 farklı açıdan analiz et ve JSON formatında dön. Asla "yorum yok" deme, sembollerden yola çık.
        
        1. "general": Rüyayı genel olarak ne anlama geldiğini, neye işaret ettiğini 2-3 cümleyle vurucu şekilde anlat.
        2. "psychological": Rüyayı bilinçaltı, bastırılmış duygular ve psikolojik arketipler üzerinden analiz et.
        3. "islamic": Rüyayı İslami rüya tabirleri geleneğine göre (hayır mı şer mi, uyarı mı müjde mi) yorumla. Dini referanslar kullan.
        
        SADECE AŞAĞIDAKİ JSON FORMATINDA CEVAP VER (Başka hiçbir metin yazma):
        {
          "title": "Rüyaya Gizemli ve Kısa Bir Başlık",
          "summary": "Genel analiz metni buraya (akıcı ve net)",
          "psychological": "Psikolojik analiz metni buraya (bilimsel ve derin)",
          "islamic": "İslami analiz metni buraya (manevi ve geleneksel)",
          "mood": "Tek kelime baskın duygu (Örn: Huzurlu, Gergin)",
          "mood_score": 0 ile 100 arası bir sayı,
          "lucky_numbers": [3 tane şanslı sayı]
        }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Sen sadece geçerli bir JSON objesi döndüren bir API gibisin." },
        { role: "user", content: prompt }
      ],
      model: "google/gemini-2.0-flash-lite-001", 
      temperature: 0.7, // Biraz daha tutarlı olması için düşürdüm
      response_format: { type: "json_object" } 
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("Boş cevap.");
    
    // Temizlenmiş JSON parse işlemi
    const aiData = JSON.parse(cleanJson(resultText));

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

    // İADE İŞLEMİ
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id,
        p_amount: COST,
        p_process_type: 'refund',
        p_description: 'İade: Rüya Analiz Hatası'
    });

    return { error: "Analiz sırasında bir hata oluştu, krediniz iade edildi." };
  }
}