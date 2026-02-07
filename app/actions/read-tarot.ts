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

// AI bazen JSON'u ```json ... ``` bloğu içinde veriyor, bunu temizlemek için yardımcı fonksiyon.
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

export async function readTarot(question: string, cards: string[], spreadType: string, dreamId?: string) {
  const supabase = createClient();
  const COST = SERVICE_COSTS.tarot_reading || 2; 

  // 1. KİMLİK KONTROLÜ
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "AUTH_REQUIRED", message: "Giriş yapmalısınız." };

  // 2. PROFİLİ AL
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, marital_status, gender, age')
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

  if (txError || !txResult.success) {
      console.error("Bakiye Hatası:", txError || txResult);
      const errorCode = txResult?.code || "NO_CREDIT"; 
      return { code: errorCode, error: errorCode, message: "Yetersiz bakiye." };
  }
  // -----------------------------------------------------------------

  // --- YAPAY ZEKA İŞLEMLERİ ---

  // A. Pozisyon Anlamlarını Belirle
  let positionMeanings: string[] = [];
  
  switch (spreadType) {
      case "three_card":
          positionMeanings = ["Geçmiş (Köken)", "Şimdi (Mevcut Durum)", "Gelecek (Olası Sonuç)"];
          break;
      case "love":
          positionMeanings = ["Senin Enerjin ve Duyguların", "Partnerin/Karşı Tarafın Enerjisi", "İlişkinin Potansiyeli ve Sonuç"];
          break;
      case "dream_special":
          positionMeanings = ["Rüyanın Bilinçaltı Nedeni", "Rüyanın Vermek İstediği Mesaj", "Uyanık Hayatta Yapman Gereken"];
          break;
      case "single_card":
          positionMeanings = ["Anlık Rehberlik ve Cevap"];
          break;
      default:
          positionMeanings = cards.map((_, i) => `${i + 1}. Kart`);
  }

  // B. Kullanıcı Bağlamı
  const userContext = `
    KULLANICI: ${profile.full_name}
    CİNSİYET: ${profile.gender || "Belirtilmemiş"}
    İLİŞKİ DURUMU: ${profile.marital_status || "Belirtilmemiş"}
    BİO: ${profile.bio || "Yok"}
  `;
  
  const intent = dreamId ? `BAĞLAM: Kullanıcının son rüyası üzerine tarot analizi.` : `SORU/NİYET: "${question}"`;

  // C. Kart Listesi Metni
  const cardsListText = cards.map((c, i) => 
     `${i + 1}. KART: "${c}" \n   POZİSYON ANLAMI: ${positionMeanings[i] || 'Genel'}`
  ).join('\n\n');

  try {
    const prompt = `
      Sen mistik, bilge ve sezgileri çok kuvvetli bir Tarot Üstadısın.
      Kullanıcının niyetine göre kartları yorumlayacaksın.
      
      ${userContext}
      ${intent}
      
      AÇILIM TİPİ: ${spreadType}
      
      ÇEKİLEN KARTLAR:
      ${cardsListText}

      GÖREVİN:
      Bana SADECE geçerli bir JSON objesi ver. Başka hiçbir metin yazma.
      Her kartı kendi pozisyonuna göre tek tek detaylıca yorumla, sonra hepsini harmanlayıp genel bir sentez yap.
      
      İSTENEN JSON FORMATI:
      {
        "summary": "Tek cümlelik, gizemli ve vurucu bir başlık/özet.",
        "cards_analysis": [
          {
            "card_name": "Kartın Tam Adı",
            "position": "Kartın Pozisyonu (Örn: Geçmiş)",
            "meaning": "Bu kartın bu pozisyondaki detaylı yorumu. Kullanıcının sorusuyla ilişkilendir."
          }
          // ... Diğer kartlar için de aynı yapı
        ],
        "synthesis": "Tüm kartların birleşiminden çıkan GENEL SONUÇ. Kartlar arasındaki ilişkiyi ve hikayeyi anlat.",
        "advice": "Kullanıcıya net bir tavsiye.",
        "keywords": ["anahtar1", "anahtar2", "anahtar3"]
      }
    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "Sen sadece JSON formatında yanıt veren bir Tarot API'sisin." }, 
            { role: "user", content: prompt }
        ],
        model: "google/gemini-2.0-flash-lite-001",
        temperature: 0.85, // Biraz yaratıcılık için
        response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("Boş cevap.");
    
    // JSON Temizliği ve Parse
    const aiResponse = JSON.parse(cleanJson(resultText));

    // 4. VERİTABANINA KAYIT
    // Not: interpretation sütunu jsonb olduğu için aiResponse objesini direkt kaydediyoruz.
    const { error: dbError } = await supabase.from("tarot_readings").insert({
        user_id: user.id,
        card_name: cards.join(", "),
        card_image_url: "standard-deck", 
        interpretation: aiResponse, 
        dream_id: dreamId || null,
        spread_type: spreadType
    });

    if (dbError) {
        console.error("DB Save Error:", dbError);
    }

    return { success: true, data: aiResponse };

  } catch (e: any) {
    console.error("AI Hatası:", e);
    
    // 5. HATA DURUMUNDA İADE (REFUND)
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id,
        p_amount: COST, // Artı değer (İade)
        p_process_type: 'refund',
        p_description: `İade: Tarot Servis Hatası`
    });

    return { error: "AI_ERROR", message: "Kozmik bağlantıda sorun oluştu, krediniz iade edildi." };
  }
}