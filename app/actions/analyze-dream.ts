"use server";

import { checkUsageLimit } from "@/utils/gatekeeper";
import { createClient } from "@/utils/supabase/server";
import { getMoonPhase } from "@/utils/moon";
import OpenAI from "openai";

// 1. OpenRouter Bağlantısı
// .env.local dosyasında OPENROUTER_API_KEY olduğundan emin ol.
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY, 
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com", 
    "X-Title": "Rüya Yorumcum",
  },
});

export async function analyzeDream(dreamText: string) {
  const supabase = createClient();

  // 2. Kullanıcı Oturumunu Kontrol Et
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın." };
  }

  // --- KULLANIM LİMİTİ KONTROLÜ ---
  const usageCheck = await checkUsageLimit(user.id, 'dream_analysis');
  if (!usageCheck.allowed) {
    return { error: usageCheck.message || "Limit doldu. Paketini yükseltmelisin." };
  }

  // --- 3. KULLANICI PROFİLİNİ ÇEK ---
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, age, gender, marital_status, interest_area, bio')
    .eq('id', user.id)
    .single();

  // Profil verisini metne döküyoruz
  const userContext = `
    KULLANICI PROFİLİ:
    - İsim: ${profile?.full_name || "Bilinmiyor"}
    - Yaş: ${profile?.age || "Belirtilmemiş"}
    - Cinsiyet: ${profile?.gender || "Belirtilmemiş"}
    - Medeni Durum: ${profile?.marital_status || "Belirtilmemiş"}
    - İlgi Alanı/Meslek: ${profile?.interest_area || "Belirtilmemiş"}
    - HAYAT HİKAYESİ (BİO - ÇOK ÖNEMLİ): "${profile?.bio || "Kullanıcı hayatı hakkında bilgi vermemiş, sadece rüyaya odaklan."}"
  `;

  // Şu anki Ay Evresini Al
  const currentMoon = getMoonPhase(); 

  let aiData = null;

  try {
    // 4. TEST ETTİĞİMİZ VE ÇALIŞAN MODEL İLE ANALİZ
    const prompt = `
        Sen mistik güçleri olan, psikolojiye hakim ve kadim rüya ilimlerini bilen usta bir rüya kahinisin.
        Aşağıdaki rüyayı, KULLANICI PROFİLİ'ni baz alarak analiz et. Yorumların genel geçer değil, tamamen bu kişiye özel olmalı.

        ${userContext}

        RÜYA METNİ: "${dreamText}"

        KURALLAR VE İSTENEN ÇIKTI (SADECE JSON):
        Bana aşağıdaki JSON formatında cevap ver. Başka hiçbir metin ekleme. JSON dışında bir giriş veya kapanış cümlesi kurma.

        {
          "title": "Rüyaya verilecek gizemli, kısa ve çarpıcı bir başlık",
          
          "summary": "Rüyanın genel anlamını, sembollerin yüzeydeki mesajını net ve akıcı bir dille anlat. Okuyan kişi 'Evet, rüyamın genel tabiri bu' diyerek tatmin olsun. Ancak çok derin bilinçaltı travmalarına veya manevi sırlarına burada girme. Onları aşağıya sakla. Hem doyurucu olsun hem de daha derine inmek için merak uyandırsın. Ortalama 3-4 cümle",
          
          "psychological": "BURADA NET VE SERT OL: 'Freud'a göre', 'Jung der ki' gibi akademik ve sıkıcı girişler YAPMA. Direkt konuya gir. Kullanıcının BİO'sunu ve YAŞADIĞI DURUMLARI kullanarak nokta atışı tespitler yap. 'Senin iç dünyanda şu korku var', 'Babanla/Sevgilinle yaşadığın şu olay seni buraya itmiş' gibi, sanki onun zihnini okuyormuşsun gibi konuş.",
          
          "spiritual": "DETAYLI MANEVİ YORUM: İslami ve kadim sembolizm. Rüyadaki sembollerin manevi karşılığını detaylıca, uzun uzun anlat. Geleceğe dair işaretleri buraya yaz.",
          
          "mood": "Rüyanın baskın duygusu (Tek kelime: Örn: Kaygılı, Umutlu, Kararsız)",
          
          "mood_score": 0 ile 100 arası bir duygu puanı (Sayı),
          
          "lucky_numbers": [Buraya rüyanın sembollerinden ve kullanıcının yaş/doğum tarihine uygun hesaplanmış 3 adet şanslı sayı yaz]
        }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Sen JSON formatında çıktı veren bir rüya tabircisisin. Sadece saf JSON döndür." },
        { role: "user", content: prompt }
      ],
      // İŞTE ÇALIŞAN MODEL ID'Sİ:
      model: "google/gemini-2.0-flash-lite-001", 
      
      temperature: 1.0, 
      response_format: { type: "json_object" } 
    });

    const resultText = completion.choices[0].message.content;

    if (!resultText) throw new Error("Yapay zeka boş yanıt döndü.");

    // Temizlik (Bazen AI ```json ... ``` şeklinde döner, onu temizliyoruz)
    const cleanedText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    aiData = JSON.parse(cleanedText);

  } catch (err: any) {
    console.error("OpenRouter Hatası:", err);
    return { error: "Kâhinler şu an transa geçemiyor. Lütfen az sonra tekrar dene." };
  }

  // 5. VERİTABANINA KAYIT
  try {
    const { data: dreamData, error: dbError } = await supabase
      .from("dreams")
      .insert({
        user_id: user.id,
        dream_text: dreamText,
        dream_title: aiData.title,
        ai_response: aiData,
        moon_phase: currentMoon.phase,
        status: "completed",
        visibility: "private"
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB Kayıt Hatası:", dbError);
      return { error: "Analiz yapıldı ama günlüğe işlenemedi." };
    }

    return { success: true, data: dreamData };

  } catch (dbErr: any) {
    return { error: "Veritabanı bağlantı hatası: " + dbErr.message };
  }
}