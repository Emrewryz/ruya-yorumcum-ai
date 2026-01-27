"use server";

import { checkUsageLimit } from "@/utils/gatekeeper";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

// 1. OpenRouter İstemcisi
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,      // .env.local dosyasındaki OpenRouter anahtarın
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

// Parametreler: dreamId opsiyonel, eğer varsa rüya üzerine tarot açılıyor demektir
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
      // Rüya yoksa, kullanıcının sorduğu soruya odaklan
      intent = `SORU: "${question}"`;
  }

  let aiResponse = null;

  // 3. AI İsteği (OpenRouter - Gemini 2.0 Flash Lite)
  try {
    const prompt = `
        Sen mistik bir tarot yorumcususun. Kartların enerjisini hissediyor ve kullanıcının ruhuna dokunuyorsun.
        
        ${context}
        
        ${intent}
        
        ÇEKİLEN KARTLAR (3 Kart Açılımı):
        1. GEÇMİŞ (Kökler): ${cards[0]}
        2. ŞİMDİ (Durum): ${cards[1]}
        3. GELECEK (Sonuç): ${cards[2]}

        KURALLAR VE FORMAT:
        Bana SADECE şu JSON formatında cevap ver. Başka hiçbir metin ekleme. JSON dışında bir giriş veya kapanış cümlesi kurma.
        {
          "interpretation": "Kartların sentezi ve duruma özel detaylı, mistik bir cevap. Kullanıcıyla konuşur gibi yaz.",
          "advice": "Kullanıcıya kısa, net ve uygulanabilir bir tavsiye.",
          "keywords": ["AnahtarKelime1", "AnahtarKelime2", "AnahtarKelime3"]
        }
    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "Sen JSON formatında çıktı veren mistik bir tarot yorumcususun. Sadece saf JSON döndür." },
            { role: "user", content: prompt }
        ],
        // ONAYLADIĞIMIZ HIZLI MODEL:
        model: "google/gemini-2.0-flash-lite-001", 
        
        temperature: 1.0, // Yaratıcı ve mistik olması için
        response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0].message.content;

    if (!resultText) throw new Error("Kartlar sessiz kaldı (Boş cevap).");

    // Temizlik (JSON bloklarını kaldır)
    const cleanedText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();

    aiResponse = JSON.parse(cleanedText);

  } catch (e: any) {
    console.error("OpenRouter Tarot Hatası:", e);
    return { error: "Kartların enerjisi şu an okunamıyor. Lütfen tekrar dene." };
  }

  // 4. Veritabanına Kayıt
  const { error: dbError } = await supabase
    .from("tarot_readings")
    .insert({
      user_id: user.id,
      card_name: cards.join(", "),
      card_image_url: "standard-deck",
      interpretation: JSON.stringify(aiResponse), // JSON olarak saklıyoruz
      dream_id: dreamId || null
    });

  if (dbError) {
      console.error("DB Kayıt Hatası:", dbError);
  }

  return { success: true, data: aiResponse };
}