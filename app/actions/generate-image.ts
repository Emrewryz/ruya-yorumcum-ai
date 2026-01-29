"use server";

import { v2 as cloudinary } from 'cloudinary';
import { createClient } from "@/utils/supabase/server";
import { checkUsageLimit } from "@/utils/gatekeeper"; // Bekçi import edildi

// Cloudinary Ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function generateDreamImage(prompt: string, dreamId: string) {
  const supabase = createClient();
  
  // 1. Kullanıcı Oturum Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // ---------------------------------------------------------
  // 2. GÜVENLİK VE LİMİT KONTROLÜ (BEKÇİ DEVREDE)
  // ---------------------------------------------------------
  // dreamId'yi de gönderiyoruz ki "Bu rüyaya zaten resim yapılmış mı?" kontrolü yapılabilsin.
  const limitCheck = await checkUsageLimit(user.id, 'image_generation', dreamId);

  // Eğer bekçi "Giremezsin" derse, işlemi burada durdur.
  if (!limitCheck.allowed) {
    return { 
        error: limitCheck.message, // "Günlük limit doldu" veya "Paket yükselt" mesajı
        code: limitCheck.code      // Frontend'de modal açmak için gerekli kod (LIMIT, UPGRADE, ALREADY)
    };
  }
  // ---------------------------------------------------------

  // 3. Kalite Ayarı için Tier Bilgisi (Bekçiden gelen veriyi kullanıyoruz, tekrar sorguya gerek yok)
  const tier = limitCheck.tier || 'free';

  try {
    // 4. Model ve Kalite Ayarları
    let model = 'turbo'; 
    let width = 768;
    let height = 512;
    let qualityPrompt = "mystic dream style, surrealism, digital art"; 

    // Elite veya Seer (Kahin) paketindeyse FLUX modelini kullan
    if (tier === 'pro' || tier === 'elite') { 
        model = 'flux'; 
        width = 1280;   
        height = 720;
        qualityPrompt = "masterpiece, best quality, cinematic lighting, 8k resolution, hyperrealistic, mystic atmosphere";
    }

    const finalPrompt = `${qualityPrompt}, ${prompt}`;
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 1000000);

    // 5. Pollinations AI'dan Görseli İndir
    const imageUrlSource = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
    console.log("Resim indiriliyor:", imageUrlSource);

    const response = await fetch(imageUrlSource);
    if (!response.ok) throw new Error("Yapay zeka ressamı şu an çok yoğun. Lütfen 1-2 dakika sonra tekrar deneyin.");

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Cloudinary'ye Yükle
    const uploadedImageUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: "dream-images", 
                public_id: `${user.id}-${dreamId}`, // Aynı rüya için üzerine yazar (overwrite: true)
                overwrite: true,
                resource_type: "image" 
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Hatası:", error);
                    reject(error);
                }
                else resolve(result?.secure_url || "");
            }
        );
        uploadStream.end(buffer);
    });

    if (!uploadedImageUrl) throw new Error("Resim Cloudinary'ye yüklenemedi.");
    console.log("Cloudinary Linki Alındı:", uploadedImageUrl);

    // 7. Veritabanını Güncelle
    const { data: updatedData, error: dbError } = await supabase
      .from('dreams')
      .update({ image_url: uploadedImageUrl })
      .eq('id', dreamId)
      .eq('user_id', user.id) // Sadece kendi rüyasını güncelleyebilir (RLS ek güvenlik)
      .select(); 

    if (dbError) {
        console.error("DB SQL Hatası:", dbError);
        throw new Error("Veritabanı hatası oluştu.");
    }

    if (!updatedData || updatedData.length === 0) {
        console.error("DB Güncelleme Başarısız: RLS kuralı veya yanlış ID.");
        throw new Error("Resim kaydedilemedi (İzin Hatası).");
    }

    // 8. Başarılı Sonuç Dön
    return { success: true, imageUrl: uploadedImageUrl };

  } catch (error: any) {
    console.error("Genel Hata:", error);
    return { error: error.message || "Bir hata oluştu." };
  }
}