"use server";

import { createClient } from "@/utils/supabase/server";
import { checkUsageLimit } from "@/utils/gatekeeper"; // Bekçi eklendi
import OpenAI from "openai";

// 1. OpenRouter İstemcisi
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
  
  // 2. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  if (!numbers || numbers.length === 0) return { error: "Sayı bulunamadı." };

  // 3. LİMİT VE YETKİ KONTROLÜ (BEKÇİ) [GÜNCELLENDİ]
  // Manuel if(tier=='free') kontrolü yerine merkezi sistemi kullanıyoruz.
  const limitCheck = await checkUsageLimit(user.id, 'numerology');

  if (!limitCheck.allowed) {
      return { 
          error: limitCheck.message || "Bu özellik paketine dahil değil.",
          code: limitCheck.code // Frontend'de modal açmak için (opsiyonel)
      };
  }

  // 4. Profil Verisi (Prompt için)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, interest_area')
    .eq('id', user.id)
    .single();

  // 5. Cache Kontrolü (Daha önce bu rüya için analiz yapılmış mı?)
  const { data: existingReport } = await supabase
    .from('numerology_reports')
    .select('analysis')
    .eq('dream_id', dreamId)
    .single();

  if (existingReport) {
    return { success: true, data: existingReport.analysis };
  }

  // 6. Bağlam Oluşturma
  const userContext = `
    Kullanıcı: ${profile?.full_name || "Bilinmiyor"}
    İlgi Alanı: ${profile?.interest_area || "Belirtilmemiş"}
    Hayat Durumu (Bio): "${profile?.bio || "Genel yorum yap."}"
  `;

  // 7. AI İsteği
  let aiResponse = null;

  try {
    const prompt = `
        Sen mistik bir numerologsun. Sayıların enerjisini ve evrensel frekanslarını okuyorsun.
        
        Kullanıcının rüyasında beliren sayılar: [${numbers.join(", ")}]
        
        Kullanıcının şu anki hayat durumunu (BİO) dikkate alarak bu sayıların ona ne anlatmak istediğini yorumla.
        ${userContext}
        
        KURALLAR VE FORMAT:
        Bana SADECE şu JSON formatında cevap ver. Başka hiçbir metin ekleme. JSON dışında bir giriş veya kapanış cümlesi kurma.
        {
          "numbers": [
            { "number": 7, "title": "Ruhsal Uyanış", "meaning": "Bu sayı senin şu anki durumunla..." },
            ... diğer sayılar (Listedeki her sayı için)
          ],
          "life_analysis": "Sevgili [İsim], bu sayıların ve rüyanın enerjisi gösteriyor ki... (Burada tüm sayıların toplam enerjisini ve kullanıcıya özel tavsiyeni yaz)"
        }
    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "Sen JSON formatında çıktı veren mistik bir numerologsun. Sadece saf JSON döndür." },
            { role: "user", content: prompt }
        ],
        model: "google/gemini-2.0-flash-lite-001", 
        temperature: 1.0, 
        response_format: { type: "json_object" } 
    });

    const resultText = completion.choices[0].message.content;

    if (!resultText) throw new Error("Numeroloji analizi boş döndü.");

    // Temizlik
    aiResponse = JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, "").trim());

  } catch (e: any) {
    console.error("AI Hatası:", e);
    return { error: "Evrensel frekanslar şu an okunamıyor. Lütfen daha sonra dene." };
  }

  // 8. Veritabanına Kayıt
  const { error: dbError } = await supabase
    .from('numerology_reports')
    .insert({
      user_id: user.id,
      dream_id: dreamId,
      lucky_numbers: numbers, 
      analysis: aiResponse
    });

  if (dbError) {
      console.error("DB Kayıt Hatası:", dbError);
  }

  return { success: true, data: aiResponse };
}