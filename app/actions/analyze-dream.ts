"use server";
import { checkUsageLimit } from "@/utils/gatekeeper";
import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMoonPhase } from "@/utils/moon"; // Ay fazını da dinamik yapalım

// 1. API Anahtarını Alıyoruz
// process.env kısmını tamamen siliyoruz, şifreyi direkt yapıştırıyoruz:
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
   throw new Error("API Key bulunamadı! .env dosyasını kontrol et.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// MODEL ÖNCELİK LİSTESİ
const MODELS_TO_TRY = [
  "gemini-2.5-flash", // Daha stabil model (2.5 henüz herkese açık olmayabilir, hata alırsan bunu kulla
];

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

  // --- 3. KULLANICI PROFİLİNİ ÇEK (BİO VE DEMOGRAFİK) ---
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
  const currentMoon = getMoonPhase(); // Senin utils/moon.ts dosyanı kullanır

  let aiData = null;
  let errorLog = [];

  // 4. YEDEKLİ MODEL SİSTEMİ
  for (const modelName of MODELS_TO_TRY) {
    try {
      // console.log(`Model deneniyor: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        Sen mistik güçleri olan, psikolojiye hakim ve kadim rüya ilimlerini bilen usta bir rüya kahinisin.
        Aşağıdaki rüyayı, KULLANICI PROFİLİ'ni baz alarak analiz et. Yorumların genel geçer değil, tamamen bu kişiye özel olmalı.

        ${userContext}

        RÜYA METNİ: "${dreamText}"

        KURALLAR VE İSTENEN ÇIKTI (SADECE JSON):
        Bana aşağıdaki JSON formatında cevap ver. Markdown, backtick veya ekstra metin kullanma.

        {
          "title": "Rüyaya verilecek gizemli, kısa ve çarpıcı bir başlık",
          
          "summary": "Rüyanın genel anlamını, sembollerin yüzeydeki mesajını net ve akıcı bir dille anlat. Okuyan kişi 'Evet, rüyamın genel tabiri bu' diyerek tatmin olsun. Ancak çok derin bilinçaltı travmalarına veya manevi sırlarına burada girme. Onları aşağıya sakla. Hem doyurucu olsun hem de daha derine inmek için merak uyandırsın. Ortalama 3-4 cümle",
          
          "psychological": "BURADA NET VE SERT OL: 'Freud'a göre', 'Jung der ki' gibi akademik ve sıkıcı girişler YAPMA. Direkt konuya gir. Kullanıcının BİO'sunu ve YAŞADIĞI DURUMLARI kullanarak nokta atışı tespitler yap. 'Senin iç dünyanda şu korku var', 'Babanla/Sevgilinle yaşadığın şu olay seni buraya itmiş' gibi, sanki onun zihnini okuyormuşsun gibi konuş.",
          
          "spiritual": "DETAYLI MANEVİ YORUM: İslami ve kadim sembolizm. Rüyadaki sembollerin manevi karşılığını detaylıca, uzun uzun anlat. Geleceğe dair işaretleri buraya yaz.",
          
          "mood": "Rüyanın baskın duygusu (Tek kelime: Örn: Kaygılı, Umutlu, Kararsız)",
          
          "mood_score": 0 ile 100 arası bir duygu puanı (100 çok pozitif, 0 çok negatif),
          
          "lucky_numbers": [Buraya rüyanın sembollerinden ve kullanıcının yaş/doğum tarihine uygun hesaplanmış 3 adet şanslı sayı yaz]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Temizlik (Bazen AI ```json ... ``` şeklinde döner, onu temizliyoruz)
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      aiData = JSON.parse(text);

      console.log(`✅ BAŞARILI! ${modelName} kişiselleştirilmiş analiz yaptı.`);
      break; 

    } catch (err: any) {
      console.warn(`⚠️ ${modelName} hatası: ${err.message}`);
      errorLog.push(`${modelName}: ${err.message}`);
    }
  }

  // 5. HATA YÖNETİMİ
  if (!aiData) {
    console.error("Modeller başarısız:", errorLog);
    return { error: "Kâhinler şu an transa geçemiyor (AI Servis Hatası). Lütfen az sonra tekrar dene." };
  }

  // 6. VERİTABANINA KAYIT
  try {
    const { data: dreamData, error: dbError } = await supabase
      .from("dreams")
      .insert({
        user_id: user.id,
        dream_text: dreamText,
        dream_title: aiData.title,
        ai_response: aiData,
        moon_phase: currentMoon.phase, // Artık dinamik!
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