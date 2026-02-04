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

export async function readTarot(question: string, cards: string[], spreadType: string, dreamId?: string) {
  const supabase = createClient();
  // Maliyet: utils/costs.ts içinde tanımlı değilse varsayılan 2
  const COST = SERVICE_COSTS.tarot_reading || 2; 

  // 1. KİMLİK KONTROLÜ
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "AUTH_REQUIRED", message: "Giriş yapmalısınız." };

  // 2. PROFİLİ AL
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: "PROFILE_ERROR", message: "Profil bulunamadı." };

  // -----------------------------------------------------------------
  // 3. ÖDEMEYİ AL (Atomik İşlem - Peşin Düşüş)
  // -----------------------------------------------------------------
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
    p_user_id: user.id,
    p_amount: -COST, // Eksi değer (Harcama)
    p_process_type: 'spend',
    p_description: `Tarot Falı: ${spreadType}`,
    p_metadata: { cards_count: cards.length, spread: spreadType }
  });

  // Hata kodunu (NO_CREDIT) frontend'e olduğu gibi iletiyoruz
  if (txError || !txResult.success) {
      console.error("Bakiye Hatası:", txError || txResult);
      // RPC fonksiyonun döndüğü kodu (NO_CREDIT) kullanıyoruz
      const errorCode = txResult?.code || "NO_CREDIT"; 
      return { code: errorCode, error: errorCode, message: "Yetersiz bakiye." };
  }
  // -----------------------------------------------------------------

  // --- YAPAY ZEKA İŞLEMLERİ ---
  let contextNote = "";
  switch (spreadType) {
      case "three_card": contextNote = "Geçmiş, Şimdi, Gelecek zaman çizgisinde yorumla."; break;
      case "love": contextNote = "Aşk, ilişki uyumu ve duygusal durum üzerine odaklan."; break;
      case "single_card": contextNote = "Tek kart ile net ve odaklı bir rehberlik ver."; break;
      case "dream_special": contextNote = "Bu kartları, kullanıcının gördüğü rüya ile ilişkilendirerek yorumla."; break;
      default: contextNote = "Genel tarot rehberliği.";
  }

  const userContext = `KULLANICI: ${profile.full_name}, BİO: ${profile.bio || "Bilinmiyor"}`;
  const intent = dreamId ? `BAĞLAM: Kullanıcının son rüyası üzerine tarot analizi.` : `SORU: "${question}"`;

  let aiResponse = null;

  try {
    const completion = await openai.chat.completions.create({
        messages: [
            { 
              role: "system", 
              content: `Sen mistik, bilge ve sezgileri kuvvetli bir Tarot Ustasısın.
                        Kullanıcının sorusuna veya rüyasına göre kartları yorumla.
                        
                        SADECE JSON FORMATINDA YANIT VER:
                        { 
                          "summary": "Tek cümlelik, vurucu bir özet (kehanet)", 
                          "interpretation": "Detaylı yorum (paragraflara bölünebilir)", 
                          "advice": "Kısa ve net bir tavsiye", 
                          "keywords": ["anahtar1", "anahtar2", "anahtar3"] 
                        }` 
            }, 
            { 
              role: "user", 
              content: `${userContext}\n${intent}\nÇEKİLEN KARTLAR: ${cards.join(', ')}\nMOD: ${contextNote}` 
            }
        ],
        model: "google/gemini-2.0-flash-lite-001",
        temperature: 0.8,
        response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("Boş cevap.");
    
    // JSON Temizliği
    aiResponse = JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, "").trim());

  } catch (e: any) {
    console.error("AI Hatası:", e);
    
    // -----------------------------------------------------------------
    // 4. HATA DURUMUNDA İADE (REFUND) - Güvenlik Sigortası
    // -----------------------------------------------------------------
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id,
        p_amount: COST, // Artı değer (İade)
        p_process_type: 'refund',
        p_description: `İade: Tarot Servis Hatası`
    });

    return { error: "AI_ERROR", message: "Kozmik bağlantıda sorun oluştu, krediniz iade edildi." };
  }

  // 5. KAYIT
  // insert işleminde spread_type eklendi ve interpretation jsonb uyumlu hale geldi.
  const { error: dbError } = await supabase.from("tarot_readings").insert({
      user_id: user.id,
      card_name: cards.join(", "),
      card_image_url: "standard-deck", // İlerde kart görselleri değişirse burası dinamik olabilir
      interpretation: aiResponse, // Artık DB'de jsonb olduğu için direkt obje atabiliriz
      dream_id: dreamId || null,
      spread_type: spreadType
  });

  if (dbError) {
      console.error("DB Save Error:", dbError);
      // Not: DB kaydı başarısız olsa bile kullanıcıya sonucu gösteriyoruz, 
      // ama loglara düşmesi iyi olur. İade yapmıyoruz çünkü hizmeti aldı.
  }

  return { success: true, data: aiResponse };
}