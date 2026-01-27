"use server";

import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

// 1. OpenRouter İstemcisi
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1', 
  apiKey: process.env.OPENROUTER_API_KEY,      // .env.local dosyasındaki anahtar
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

  // 3. Profil ve Paket Kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, full_name, bio, interest_area')
    .eq('id', user.id)
    .single();

  // Paket Kontrolü (Free ve Çırak erişemez)
  // NOT: "admin" rolü veya geliştirici testi için bu kontrolü geçici olarak gevşetmek isteyebilirsin.
  const tier = profile?.subscription_tier?.toLowerCase() || 'free';
  if (tier === 'free' || tier === 'cirak') {
      return { error: "Bu özellik sadece Kaşif ve Kahin paketlerine özeldir." };
  }

  // 4. Cache Kontrolü (Daha önce bu rüya için analiz yapılmış mı?)
  const { data: existingReport } = await supabase
    .from('numerology_reports')
    .select('analysis')
    .eq('dream_id', dreamId)
    .single();

  if (existingReport) {
    return { success: true, data: existingReport.analysis };
  }

  // 5. Bağlam Oluşturma
  const userContext = `
    Kullanıcı: ${profile?.full_name || "Bilinmiyor"}
    İlgi Alanı: ${profile?.interest_area || "Belirtilmemiş"}
    Hayat Durumu (Bio): "${profile?.bio || "Genel yorum yap."}"
  `;

  // 6. AI İsteği (OpenRouter - Gemini 2.0 Flash Lite)
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
        // ONAYLADIĞIMIZ HIZLI MODEL:
        model: "google/gemini-2.0-flash-lite-001", 
        
        temperature: 1.0, 
        response_format: { type: "json_object" } 
    });

    const resultText = completion.choices[0].message.content;

    if (!resultText) throw new Error("Numeroloji analizi boş döndü.");

    // Temizlik
    const cleanedText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();

    aiResponse = JSON.parse(cleanedText);

  } catch (e: any) {
    console.error("OpenRouter Numeroloji Hatası:", e);
    return { error: "Evrensel frekanslar şu an okunamıyor. Lütfen daha sonra dene." };
  }

  // 7. Veritabanına Kayıt
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