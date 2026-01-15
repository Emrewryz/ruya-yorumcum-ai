"use server";

import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. API Anahtarını Sabitliyoruz (Hata almamak için)
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
   throw new Error("API Key bulunamadı! .env dosyasını kontrol et.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Model Listesi (Yedekli)
const MODELS_TO_TRY = ["gemini-2.5-flash"];

export async function explainNumbers(numbers: number[], dreamId: string) {
  const supabase = createClient();
  
  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  if (!numbers || numbers.length === 0) return { error: "Sayı bulunamadı." };

  // 2. Profil ve Paket Kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, full_name, bio, interest_area')
    .eq('id', user.id)
    .single();

  const tier = profile?.subscription_tier?.toLowerCase() || 'free';
  if (tier === 'free' || tier === 'cirak') {
      return { error: "Bu özellik sadece Kaşif ve Kahin paketlerine özeldir." };
  }

  // 3. Cache Kontrolü
  const { data: existingReport } = await supabase
    .from('numerology_reports')
    .select('analysis')
    .eq('dream_id', dreamId)
    .single();

  if (existingReport) {
    return { success: true, data: existingReport.analysis };
  }

  // 4. Bağlam Oluşturma
  const userContext = `
    Kullanıcı: ${profile?.full_name || "Bilinmiyor"}
    İlgi Alanı: ${profile?.interest_area || "Belirtilmemiş"}
    Hayat Durumu (Bio): "${profile?.bio || "Genel yorum yap."}"
  `;

  // 5. AI İsteği
  let aiResponse = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `
        Sen mistik bir numerologsun. Kullanıcının rüyasındaki sayılar: [${numbers.join(", ")}]
        
        Kullanıcının şu anki hayat durumunu (BİO) dikkate alarak yorumla detaylıca:
        ${userContext}
        
        Bana SADECE şu JSON formatında cevap ver (Markdown yok):
        {
          "numbers": [
            { "number": 7, "title": "Ruhsal Uyanış", "meaning": "Bu sayı senin şu anki durumunla..." },
            ... diğer sayılar
          ],
          "life_analysis": "Sevgili [İsim], bu sayıların ve rüyanın enerjisi gösteriyor ki..."
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // JSON Temizliği
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
          text = text.substring(firstBrace, lastBrace + 1);
      }

      aiResponse = JSON.parse(text);
      break; 
    } catch (e) {
      console.warn(`AI Hatası (${modelName}):`, e);
    }
  }

  if (!aiResponse) return { error: "Evrensel frekanslar okunamıyor." };

  // 6. Kayıt
  const { error: dbError } = await supabase
    .from('numerology_reports')
    .insert({
      user_id: user.id,
      dream_id: dreamId,
      lucky_numbers: numbers,
      analysis: aiResponse
    });

  return { success: true, data: aiResponse };
}