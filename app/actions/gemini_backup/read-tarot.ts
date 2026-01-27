/*"use server";
import { checkUsageLimit } from "@/utils/gatekeeper";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
   throw new Error("API Key bulunamadı! .env dosyasını kontrol et.");
}
const genAI = new GoogleGenerativeAI(apiKey);

const MODELS_TO_TRY = ["gemini-2.5-flash-lite"];

// Parametreleri güncelledik: dreamId opsiyonel eklendi
export async function readTarot(question: string, cards: string[], dreamId?: string) {
  const supabase = createClient();

  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // Limit Kontrolü
  const usageCheck = await checkUsageLimit(user.id, 'tarot_reading');
  if (!usageCheck.allowed) {
    return { error: usageCheck.message || "Tarot hakkın doldu." };
  }

  // 2. Profil ve (Varsa) Rüya Verisini Çek
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, interest_area')
    .eq('id', user.id)
    .single();

  let context = `KULLANICI: ${profile?.full_name}, BİO: ${profile?.bio || "Bilinmiyor"}`;
  let intent = "";

  // Eğer DREAM_ID varsa, rüyayı çek ve niyeti ona göre ayarla
  if (dreamId) {
      const { data: dream } = await supabase
        .from('dreams')
        .select('dream_text, dream_title')
        .eq('id', dreamId)
        .single();
      
      if (dream) {
          intent = `
            DİKKAT: Kullanıcı bir soru sormadı. Bunun yerine gördüğü son rüyayı daha iyi anlamak için tarot açıyor.
            RÜYA: "${dream.dream_title} - ${dream.dream_text}"
            GÖREV: Çıkan kartları, bu rüyanın gizli mesajını ve kullanıcının bilinçaltını çözmek için yorumla.
          `;
      }
  } else {
      intent = `SORU: "${question}"`;
  }

  let aiResponse = null;

  // 3. AI İsteği
  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `
        Sen mistik bir tarot yorumcususun.
        ${context}
        
        ${intent}
        
        Çekilen Kartlar:
        1. GEÇMİŞ (Kökler): ${cards[0]}
        2. ŞİMDİ (Durum): ${cards[1]}
        3. GELECEK (Sonuç): ${cards[2]}

        Bana SADECE geçerli bir JSON formatında cevap ver. Markdown yok.
        {
          "interpretation": "Kartların sentezi ve duruma özel detaylı, mistik bir cevap.",
          "advice": "Kullanıcıya kısa ve net bir tavsiye.",
          "keywords": ["Kelime1", "Kelime2", "Kelime3"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      aiResponse = JSON.parse(text);
      break; 

    } catch (e: any) {
      console.warn(`AI Hatası:`, e.message);
    }
  }

  if (!aiResponse) return { error: "Kartların enerjisi okunamıyor." };

  // 4. Kayıt
  const { error: dbError } = await supabase
    .from("tarot_readings")
    .insert({
      user_id: user.id,
      card_name: cards.join(", "),
      card_image_url: "standard-deck",
      interpretation: JSON.stringify(aiResponse),
      dream_id: dreamId || null
    });

  return { success: true, data: aiResponse };
}*/