"use server";

import { createClient } from "@/utils/supabase/server";
import { checkUsageLimit } from "@/utils/gatekeeper";
import OpenAI from "openai";
import { TURKEY_CITIES } from "@/constants/cities";
import { calculateNatalChart } from "@/utils/astro-calc"; 

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

export async function getAstrologyAnalysis(formData: any) {
  console.log("🚀 [1] Natal Analiz Başladı");
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Giriş yapmalısınız." };

  // 1. Profil Güncelleme (Eğer formdan yeni veri geliyorsa)
  if (formData) {
    console.log("📝 [2] Form verisi var, profil güncelleniyor:", formData.city);
    const selectedCity = TURKEY_CITIES.find(c => c.name === formData.city);
    
    if (selectedCity) {
      const { error: updateError } = await supabase.from('profiles').update({
        birth_date: formData.birth_date,
        birth_time: formData.birth_time,
        birth_city: selectedCity.name,
        birth_lat: selectedCity.lat,
        birth_lng: selectedCity.lng
      }).eq('id', user.id);

      if (updateError) console.error("Profil güncelleme hatası:", updateError);
    }
  }

  // 2. Güncel Profili Çek
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.birth_date || !profile?.birth_time) {
    console.log("❌ [Hata] Doğum bilgisi eksik.");
    return { error: "Doğum bilgileri eksik.", missingInfo: true };
  }

  // 3. MATEMATİKSEL HESAPLAMA
  try {
    // --- TARİH DÜZELTME ---
    // Veritabanından gelen saat '07:00:00' olabilir, biz sadece '07:00' kısmını almalıyız.
    const cleanTime = profile.birth_time.split(':').slice(0, 2).join(':'); 
    const cleanDate = profile.birth_date; // YYYY-MM-DD

    // Format: YYYY-MM-DDTHH:MM:00 (Standart ISO)
    const isoString = `${cleanDate}T${cleanTime}:00`;
    const birthDateTime = new Date(isoString);
    
    // Tarih geçerlilik kontrolü
    if (isNaN(birthDateTime.getTime())) {
        throw new Error(`Geçersiz Tarih Formatı: ${isoString}`);
    }

    const lat = Number(profile.birth_lat) || 41.0082;
    const lng = Number(profile.birth_lng) || 28.9784;

    console.log("🧮 [3] Matematik motoru çalışıyor...", { date: birthDateTime, lat, lng });

    // Matematik Motorunu Çağır (Artık tüm gezegenleri içeriyor)
    const exactChart = calculateNatalChart(birthDateTime, lat, lng);
    
    console.log("✅ [Sonuç] Harita Hesaplandı.");

    // 4. LİMİT VE PAKET KONTROLÜ (GATEKEEPER)
    // Free kullanıcılar için limit 0 olduğu için burası 'allowed: false' dönecektir.
    const limitCheck = await checkUsageLimit(user.id, 'astrology');
    
    // LİMİT YOKSA -> Sadece Temel Veriyi Dön, AI çalıştırma.
    if (!limitCheck.allowed) {
      console.log("🔒 [Limit] Kullanıcı limiti yetersiz veya Free paket. Sadece data dönülüyor.");
      return { 
        success: false, // AI işlemi başarısız sayılır ama veri döneriz
        error: limitCheck.message,
        code: limitCheck.code,
        isFreeTier: true, // Frontend'de "Kilidi Aç" ekranı göstermek için
        basicData: exactChart // Matematiksel haritayı göster, yorumu gizle
      };
    }

    // 5. AI Analizi (Sadece Pro/Elite Kullanıcılar Buraya Geçer)
    console.log("🤖 [4] AI'a gönderiliyor (Pro Kullanıcı)...");
    
    const prompt = `
      Sen derinlemesine analiz yapan uzman bir astrologsun.
      
      DANIŞAN BİLGİSİ:
      İsim: ${profile.full_name}
      Doğum Yeri: ${profile.birth_city}
      
      TEKNİK HARİTA VERİLERİ (NATAL):
      - Güneş (Benlik): ${exactChart.sun}
      - Ay (Duygular): ${exactChart.moon}
      - Yükselen (Maske): ${exactChart.ascendant}
      - Merkür (Zihin): ${exactChart.mercury}
      - Venüs (Aşk): ${exactChart.venus}
      - Mars (Eylem): ${exactChart.mars}
      - Jüpiter (Şans): ${exactChart.jupiter}
      - Satürn (Dersler): ${exactChart.saturn}
      
      GÖREV:
      Bu kişinin doğum haritasını (Natal Chart) bir bütün olarak analiz et. 
      Gezegenlerin burç konumlarını harmanlayarak karakterini, potansiyellerini ve yaşam amacını anlat.
      
      ÇIKTI FORMATI (JSON):
      Lütfen cevabı sadece aşağıdaki JSON formatında ver:
      {
        "sun_sign": "${exactChart.sun}", 
        "moon_sign": "${exactChart.moon}",
        "ascendant_sign": "${exactChart.ascendant}", 
        "character_analysis": "Kişilik, ego ve dış dünyaya yansıyan yüz üzerine 4-5 cümlelik derin analiz.",
        "emotional_world": "Ay burcuna ve Venüs'e göre duygusal ihtiyaçlar ve iç dünyası.",
        "career_talent": "Merkür, Mars ve Satürn konumlarına göre kariyer yetenekleri ve potansiyel meslekler.",
        "love_life": "Venüs ve Mars konumlarına göre aşk hayatı beklentileri ve ilişki dinamikleri.",
        "soul_purpose": "Kuzey Ay Düğümü veya Jüpiter etkisine dayalı ruhsal büyüme alanı."
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "google/gemini-2.0-flash-lite-001",
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    console.log("✅ [5] AI Cevabı alındı.");

    // Veritabanına Kayıt
    const { error: insertError } = await supabase.from('astrology_readings').insert({
      user_id: user.id,
      sun_sign: aiResponse.sun_sign,
      moon_sign: aiResponse.moon_sign,
      ascendant_sign: aiResponse.ascendant_sign,
      analysis: aiResponse
    });

    if (insertError) {
        console.error("DB Kayıt Hatası:", insertError);
        // DB hatası olsa bile kullanıcıya sonucu gösterelim
    }

    return { success: true, data: aiResponse };

  } catch (error: any) {
    console.error("💥 [KRİTİK HATA DETAYI]:", error);
    const errorMessage = error?.message || (typeof error === 'string' ? error : "Bilinmeyen hesaplama hatası");
    return { error: `Sistem hatası: ${errorMessage}` };
  }
}