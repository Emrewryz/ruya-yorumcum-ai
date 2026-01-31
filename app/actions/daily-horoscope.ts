"use server";

import { createClient } from "@/utils/supabase/server";
import { checkUsageLimit } from "@/utils/gatekeeper";
import OpenAI from "openai";
import { calculateNatalChart, calculateTransitChart } from "@/utils/astro-calc"; 

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

export async function getDailyHoroscope() {
  console.log("🚀 [Daily] Profesyonel Günlük Analiz (Transit Destekli) Başladı");
  const supabase = await createClient();
  
  // 1. KULLANICI KONTROLÜ
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // 2. PROFİL KONTROLÜ
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, birth_date, birth_time, birth_city, birth_lat, birth_lng, subscription_tier')
    .eq('id', user.id)
    .single();

  if (!profile?.birth_date) {
    return { error: "MISSING_INFO", message: "Doğum haritası bilgileri eksik." };
  }

  // DÜZELTME 1: Free Kullanıcı Bloğunu Kaldırdık
  // limits.ts dosyasında Free kullanıcıya "daily_limit: 1" vermiştik.
  // Burada onları manuel engellersek, o hakkı kullanamazlar.
  // Kontrolü tamamen aşağıdaki "checkUsageLimit" (Gatekeeper) fonksiyonuna bırakıyoruz.

  const limitCheck = await checkUsageLimit(user.id, 'daily_horoscope');
  if (!limitCheck.allowed) {
    // Burası "Limitiniz doldu" veya "Paketiniz yetersiz" mesajını döner
    return { error: limitCheck.message };
  }

  // --- TIMEZONE FIX ---
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

  // 3. ÖNBELLEK KONTROLÜ
  const { data: existing } = await supabase
    .from('daily_horoscopes')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  if (existing) {
    if (!existing.general_vibe || existing.general_vibe.length < 50) {
        console.log("♻️ [Daily] Yetersiz içerik, yenileniyor...");
        await supabase.from('daily_horoscopes').delete().eq('id', existing.id);
    } else {
        console.log("✅ [Cache] Günlük yorum önbellekten alındı.");
        return { success: true, data: existing, fromCache: true };
    }
  }

  // 4. MATEMATİKSEL HESAPLAMALAR
  try {
    const cleanTime = profile.birth_time ? profile.birth_time.split(':').slice(0, 2).join(':') : "12:00"; 
    const isoString = `${profile.birth_date}T${cleanTime}:00`;
    const birthDateTime = new Date(isoString);

    if (isNaN(birthDateTime.getTime())) throw new Error("Tarih hatası");

    const lat = Number(profile.birth_lat) || 41.0082;
    const lng = Number(profile.birth_lng) || 28.9784;

    // A) NATAL HARİTA
    // DÜZELTME 2: astro-calc.ts güncellediğimiz için artık değişkenler sadeleşti.
    // 'sun_sign' yerine 'sun', 'ascendant_sign' yerine 'ascendant' kullanıyoruz.
    const natalChart = calculateNatalChart(birthDateTime, lat, lng);
    
    // B) TRANSIT HARİTA
    const transitChart = calculateTransitChart(new Date());

    console.log(`✅ [Daily] Harita: Natal Güneş ${natalChart.sun} | Transit Güneş ${transitChart.transit_sun}`);

    // 5. AI PROMPT
    console.log("🤖 [Daily] AI Yazmaya Başlıyor...");
    
    const prompt = `
      Sen profesyonel, sezgileri güçlü ve derinlemesine analiz yapan usta bir astrologsun.
      Danışanına bugünün gökyüzü hareketlerinin (transitlerin) onun doğum haritasına (natal) etkilerini anlatacaksın.

      DANIŞAN: ${profile.full_name}, ${profile.birth_city}

      VERİ SETİ 1: KİŞİNİN DOĞUM HARİTASI (KİMLİĞİ)
      - Güneş (Benlik): ${natalChart.sun}
      - Ay (Duygular): ${natalChart.moon}
      - Yükselen (Dış Görünüş): ${natalChart.ascendant} 
      - Merkür (İletişim): ${natalChart.mercury}
      - Venüs (Aşk): ${natalChart.venus}
      - Mars (Eylem): ${natalChart.mars}

      VERİ SETİ 2: BUGÜNÜN GÖKYÜZÜ (TRANSİTLER)
      - Transit Güneş: ${transitChart.transit_sun}
      - Transit Ay: ${transitChart.transit_moon} (Bugünün ruh hali)
      - Transit Merkür: ${transitChart.transit_mercury}
      - Transit Venüs: ${transitChart.transit_venus}
      - Transit Mars: ${transitChart.transit_mars} (Zorlayıcı veya tetikleyici etki)
      - Transit Jüpiter: ${transitChart.transit_jupiter} (Şans)
      - Transit Satürn: ${transitChart.transit_saturn} (Sınav)

      GÖREV:
      Bu verileri harmanlayarak kişiye özel, nokta atışı bir günlük burç yorumu yaz.
      Özellikle Transit Ay'ın ve Mars'ın kişinin duygu dünyasına etkisine odaklan.

      ÇIKTI KURALLARI (JSON):
      1. "general_vibe": BUGÜNÜN ANA TEMASI. **En az 5-6 dolgun ve akıcı cümle.** Asla kısa geçiştirme. Transitlerin genel ruh halini ve motivasyonunu nasıl etkilediğini detaylı anlat.
      2. "love_focus": AŞK VE İLİŞKİLER. Venüs ve Ay transitlerine göre 3-4 cümlelik tavsiye.
      3. "career_focus": KARİYER VE PARA. Merkür, Mars ve Satürn konumlarına göre somut uyarılar.
      4. "lucky_score": 1-100 arası mantıklı bir puan.

      Lütfen cevabı sadece JSON formatında ver.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001",
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    let rawContent = completion.choices[0].message.content || "{}";
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const aiResponse = JSON.parse(rawContent);

    // --- ESNEK VERİ AYRIŞTIRMA ---
    const generalVibe = aiResponse.general_vibe || aiResponse.generalVibe || "Bugün enerjiler yoğun, iç sesinizi dinleyin.";
    const loveFocus = aiResponse.love_focus || aiResponse.loveFocus || "Kalbinizin sesini dinleyin.";
    const careerFocus = aiResponse.career_focus || aiResponse.careerFocus || "İş hayatında detaylara odaklanın.";
    const luckyScore = aiResponse.lucky_score || aiResponse.luckyScore || 50;

    // Veri Kalite Kontrolü
    if (generalVibe.length < 30) {
        throw new Error("AI içeriği çok kısa üretildi, tekrar denenmeli.");
    }

    // 6. KAYIT
    const { data: newRecord, error: dbError } = await supabase
      .from('daily_horoscopes')
      .insert({
        user_id: user.id,
        date: today,
        general_vibe: generalVibe,
        love_focus: loveFocus,
        career_focus: careerFocus,
        lucky_score: luckyScore
      })
      .select()
      .single();

    if (dbError) throw new Error("DB Kayıt Hatası: " + dbError.message);

    console.log("🎉 [Daily] Başarıyla kaydedildi (Transit verili).");
    return { success: true, data: newRecord };

  } catch (error: any) {
    console.error("💥 [HATA]:", error);
    return { error: "Sistem hatası: " + (error.message || "Bilinmiyor") };
  }
}