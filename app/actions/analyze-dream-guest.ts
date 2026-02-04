"use server";

import OpenAI from "openai";
import { cookies } from "next/headers";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

export async function analyzeDreamGuest(dreamText: string) {
  const cookieStore = cookies();
  
  // Güvenlik: Kısa metinleri engelle
  if (!dreamText || dreamText.length < 10) {
    return { error: "Lütfen rüyanızı biraz daha detaylı anlatın." };
  }

  try {
    const prompt = `
      Rol: Sen dünyanın en gizemli rüya tabircisisin.
      Rüya: "${dreamText.slice(0, 500)}"
      
      GÖREVİN:
      Kullanıcıya rüyasındaki en önemli sembolü (örneğin: Yılan, Su, Düşmek, Eski Sevgili) seçerek bunun ne anlama geldiğini anlatmaya başla.
      
      KRİTİK KURAL (ÇOK ÖNEMLİ):
      Cümlenin sonunu ASLA getirme. Tam en can alıcı, en gizemli, gelecekle ilgili en önemli detayı vereceğin anda cümleyi "..." ile bitir. Kullanıcı devamını okumak için çıldırsın.
      
      YAPMA:
      - "Zaman gösterecek" deme.
      - "Hayırlı olsun" deme.
      - Cümleyi tamamlama.
      
      İyi Örnekler:
      - "Rüyanızdaki 'kırık ayna' sembolü, aileniz içinde saklanan eski bir sırra işaret ediyor. Aynanın sol elinizde olması ise, bu sırrın yakında..."
      - "Gördüğünüz 'yüksek dalgalar', kariyerinizde yaklaşan büyük bir değişimin habercisi. Ancak suyun renginin bulanık olması, bu değişimin..."
      
      Çıktı Formatı (JSON): { "hook": "..." }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001",
      max_tokens: 60, // Kısa tutuyoruz ki AI uzatamasın
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0].message.content || "{}";
    let aiData;
    
    try {
        aiData = JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch (e) {
        aiData = { hook: resultText };
    }

    // Yarıda kesilmemişse (Nokta ile bitmişse) biz manuel keselim
    let finalHook = aiData.hook || "";
    if (finalHook.endsWith(".")) {
        finalHook = finalHook.slice(0, -1) + "...";
    }

    cookieStore.set("guest_dream_used", "true", { maxAge: 60 * 60 * 24 });

    return { success: true, hook: finalHook };

  } catch (error) {
    console.error("Guest Analiz Hatası:", error);
    // Hata durumunda bile merak uyandıran bir fallback
    return { success: true, hook: "Bu rüya, bilinçaltınızın size çok acil bir uyarısıdır. Özellikle rüyada hissettiğiniz o duygu..." };
  }
}