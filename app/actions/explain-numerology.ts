"use server";

import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

// 1. DeepSeek İstemcisi
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY 
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

  // 6. AI İsteği
  let aiResponse = null;

  try {
    const prompt = `
        Sen mistik bir numerologsun. Sayıların enerjisini ve evrensel frekanslarını okuyorsun.
        
        Kullanıcının rüyasında beliren sayılar: [${numbers.join(", ")}]
        
        Kullanıcının şu anki hayat durumunu (BİO) dikkate alarak bu sayıların ona ne anlatmak istediğini yorumla.
        ${userContext}
        
        KURALLAR VE FORMAT:
        Bana SADECE şu JSON formatında cevap ver. Başka hiçbir metin ekleme.
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
            { role: "system", content: "Sen JSON formatında çıktı veren mistik bir numerologsun." },
            { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
        temperature: 1.1, // Mistik hava için biraz yaratıcılık
        response_format: { type: "json_object" } // JSON garantisi
    });

    const resultText = completion.choices[0].message.content;

    if (!resultText) throw new Error("Numeroloji analizi boş döndü.");

    aiResponse = JSON.parse(resultText);

  } catch (e) {
    console.error("DeepSeek Numeroloji Hatası:", e);
    return { error: "Evrensel frekanslar şu an okunamıyor. Lütfen daha sonra dene." };
  }

  // 7. Veritabanına Kayıt
  const { error: dbError } = await supabase
    .from('numerology_reports')
    .insert({
      user_id: user.id,
      dream_id: dreamId,
      lucky_numbers: numbers, // Veritabanında integer array (int[]) tuttuğunu varsayıyorum
      analysis: aiResponse
    });

  if (dbError) {
      console.error("DB Kayıt Hatası:", dbError);
      // DB hatası olsa bile kullanıcıya sonucu gösterelim, sadece cache çalışmamış olur.
  }

  return { success: true, data: aiResponse };
}