"use server";

import { v2 as cloudinary } from 'cloudinary';
import { createClient } from "@/utils/supabase/server";

// Cloudinary Ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function generateDreamImage(prompt: string, dreamId: string) {
  const supabase = createClient();
  
  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // 2. Paket Kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.subscription_tier?.toLowerCase() || 'free';

  try {
    // 3. Kalite Ayarları
    let model = 'turbo'; 
    let width = 768;
    let height = 512;
    let qualityPrompt = "mystic dream style, surrealism, digital art"; 

    if (tier === 'seer' || tier === 'elite') { 
        model = 'flux'; 
        width = 1280;   
        height = 720;
        qualityPrompt = "masterpiece, best quality, cinematic lighting, 8k resolution, hyperrealistic, mystic atmosphere";
    }

    const finalPrompt = `${qualityPrompt}, ${prompt}`;
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 1000000);

    // 4. Pollinations'dan İndir
    const imageUrlSource = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
    console.log("Resim indiriliyor:", imageUrlSource);

    const response = await fetch(imageUrlSource);
    if (!response.ok) throw new Error("Yapay zeka ressamı şu an çok yoğun. Lütfen 1-2 dakika sonra tekrar deneyin.");

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Cloudinary'ye Yükle
    const uploadedImageUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: "dream-images", 
                public_id: `${user.id}-${dreamId}`,
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

    // 6. VERİTABANI GÜNCELLEME (Burayı düzelttik)
    // .select() ekleyerek işlemin sonucunu kontrol ediyoruz.
    const { data: updatedData, error: dbError } = await supabase
      .from('dreams')
      .update({ image_url: uploadedImageUrl })
      .eq('id', dreamId)
      .eq('user_id', user.id) // Sadece kendi rüyasını güncelleyebilir
      .select(); // <-- Geriye güncellenen satırı döndür

    if (dbError) {
        console.error("DB SQL Hatası:", dbError);
        throw new Error("Veritabanı hatası oluştu.");
    }

    // Eğer RLS yüzünden güncelleme yapılmadıysa data boş döner
    if (!updatedData || updatedData.length === 0) {
        console.error("DB Güncelleme Başarısız: RLS kuralı veya yanlış ID.");
        throw new Error("Resim kaydedilemedi (İzin Hatası).");
    }

    console.log("Veritabanı Başarıyla Güncellendi:", updatedData);

    return { success: true, imageUrl: uploadedImageUrl };

  } catch (error: any) {
    console.error("Genel Hata:", error);
    return { error: error.message || "Bir hata oluştu." };
  }
}