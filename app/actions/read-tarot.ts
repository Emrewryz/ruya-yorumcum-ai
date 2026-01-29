"use server";

import { checkUsageLimit } from "@/utils/gatekeeper";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

// OpenRouter Yapılandırması
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

  // 1. KİMLİK KONTROLÜ
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "AUTH_REQUIRED", message: "Giriş yapmalısınız." };

  // 2. LIMIT KONTROLÜ (BEKÇİ)
  // Bekçi, kullanıcının kredisinin olup olmadığını kontrol eder.
  const usageCheck = await checkUsageLimit(user.id, 'tarot_reading');
  
  if (!usageCheck.allowed) {
      return { error: "LIMIT_REACHED", message: usageCheck.message };
  }

  // 3. PROFİL VERİLERİNİ AL
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, subscription_tier, tarot_credits')
    .eq('id', user.id)
    .single();

  if (!profile) return { error: "PROFILE_ERROR", message: "Kullanıcı profili bulunamadı." };

  const isPremium = ['pro', 'elite', 'seer'].includes(profile.subscription_tier);
  const currentCredits = profile.tarot_credits || 0;

  // -----------------------------------------------------------------
  // 4. KREDİ DÜŞME İŞLEMİ (GÜNCELLENDİ)
  // -----------------------------------------------------------------
  // ARTIK AYRIM YOK: Free, Pro veya Elite fark etmeksizin her işlem 1 kredi yer.
  // (Çünkü Pro/Elite'in kredileri zaten her gün yenileniyor/daha fazla veriliyor)
  
  if (currentCredits > 0) {
      const { error: updateError } = await supabase
          .from('profiles')
          .update({ tarot_credits: currentCredits - 1 })
          .eq('id', user.id);
      
      if (updateError) {
          console.error("Kredi düşme hatası:", updateError);
          // Kritik hata değil, işleme devam edilebilir ama loglanmalı.
      }
  } else {
      // Bekçiden kaçan olursa burada yakalanır (Teorik olarak buraya girmemeli)
      return { error: "NO_CREDIT", message: "Yetersiz kredi." };
  }
  // -----------------------------------------------------------------

  // --- YAPAY ZEKA HAZIRLIĞI ---
  
  // A. Açılım Tipine Göre Bağlam Oluşturma
  let contextNote = "";
  if (spreadType === "three_card") {
    contextNote = "Bu 'Geçmiş, Şimdi, Gelecek' açılımıdır. 1. Kart geçmişi, 2. Kart şu anki durumu, 3. Kart muhtemel geleceği temsil eder.";
  } else if (spreadType === "love") {
    contextNote = "Bu 'Aşk ve İlişki' açılımıdır. 1. Kart kullanıcının duygularını, 2. Kart partnerin/karşı tarafın enerjisini, 3. Kart ilişkinin sonucunu temsil eder.";
  } else if (spreadType === "single_card") {
    contextNote = "Bu 'Tek Kart' açılımıdır. Soruya net, odaklanmış ve doğrudan bir rehberlik ver.";
  } else if (spreadType === "dream_special") {
    contextNote = "Bu bir 'RÜYA ANALİZİ + TAROT' açılımıdır. Kullanıcının gördüğü rüyanın bilinçaltı mesajını tarot sembolleriyle birleştirerek derinlemesine yorumla.";
  }

  const userContext = `KULLANICI: ${profile.full_name}, BİO: ${profile.bio || "Bilinmiyor"}`;
  const intent = dreamId ? `RÜYA BAĞLAMI VE ANALİZİ İSTENİYOR` : `KULLANICI SORUSU: "${question}"`;

  let aiResponse = null;

  try {
    // B. Gelişmiş Prompt (Persona + JSON Formatı)
    const systemPrompt = `
        Sen yüzyıllık deneyime sahip, mistik, bilge ve derin hissiyatlı bir Tarot Ustasısın.
        Kullanıcının kartlarını yorumlarken soğuk bir yapay zeka gibi değil, 
        gizemli, edebi ve insan ruhuna dokunan bir dille konuş.

        Yanıtını KESİNLİKLE sadece aşağıdaki JSON formatında ver:
        {
            "summary": "Kartların enerjisini özetleyen, 2-3 cümlelik çok çarpıcı, mistik ve gizemli bir giriş cümlesi.",
            "interpretation": "Kartların detaylı yorumu. Akıcı, paragraflara bölünmüş, hikaye anlatır gibi bir analiz. ${contextNote}",
            "advice": "Kartların ışığında kullanıcıya verilecek net, eyleme dönük ama bilgece bir tavsiye.",
            "keywords": ["Anahtar Kelime 1", "Anahtar Kelime 2", "Anahtar Kelime 3", "Anahtar Kelime 4", "Anahtar Kelime 5"]
        }
    `;

    const userPrompt = `
        ${userContext}
        ${intent}
        SEÇİLEN KARTLAR: ${cards.join(', ')}
        AÇILIM TİPİ: ${spreadType}
        BAĞLAM NOTU: ${contextNote}
    `;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt }, 
            { role: "user", content: userPrompt }
        ],
        model: "google/gemini-2.0-flash-lite-001", 
        temperature: 0.8,
        response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0].message.content;
    if (!resultText) throw new Error("Boş cevap.");
    
    // JSON Temizleme
    aiResponse = JSON.parse(resultText.replace(/```json/g, "").replace(/```/g, "").trim());

  } catch (e: any) {
    console.error("AI Hatası:", e);
    
    // -----------------------------------------------------------------
    // 5. HATA DURUMUNDA KREDİ İADESİ (GÜNCELLENDİ)
    // -----------------------------------------------------------------
    // Yapay zeka hata verirse, kim olursa olsun kredisini iade et.
    // Çünkü yukarıda herkesden düşmüştük.
    await supabase
        .from('profiles')
        .update({ tarot_credits: currentCredits }) // Eski bakiyeyi geri yükle
        .eq('id', user.id);

    return { error: "AI_ERROR", message: "Kozmik bağlantıda bir kopukluk oldu, hakkınız iade edildi. Lütfen tekrar deneyin." };
  }

  // 6. VERİTABANINA KAYIT
  const { error: dbError } = await supabase
    .from("tarot_readings")
    .insert({
      user_id: user.id,
      card_name: cards.join(", "),
      card_image_url: "standard-deck", 
      interpretation: aiResponse, 
      dream_id: dreamId || null,
      spread_type: spreadType, 
      is_premium_reading: isPremium // Analitik için kullanıcının o anki statüsünü saklıyoruz
    });

  if (dbError) console.error("DB Log Hatası:", dbError);

  // 7. SONUÇ DÖNDÜR
  return { 
      success: true, 
      data: aiResponse 
  };
}