"use server";

import { v2 as cloudinary } from 'cloudinary';
import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs";
import { revalidatePath } from 'next/cache';

// Cloudinary Ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function generateDreamImage(prompt: string, dreamId: string) {
  const supabase = createClient();
  
  // Maliyet: 3 Kredi
  const COST = SERVICE_COSTS.image_generation || 3;

  // 1. Kullanıcı Oturum Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // ---------------------------------------------------------
  // 2. ÖDEME AL (Atomik İşlem - Peşin Düşüş)
  // ---------------------------------------------------------
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST, // Eksi bakiye (Harcama)
      p_process_type: 'spend',
      p_description: `Rüya Görselleştirme (Rüya #${dreamId.slice(0,4)})`,
      p_metadata: { dreamId, prompt_preview: prompt.slice(0, 50) }
  });

  if (txError || !txResult.success) {
      return { 
          error: "Yetersiz bakiye. Görsel oluşturmak için kredi yükleyin.", 
          code: "NO_CREDIT" 
      };
  }
  // ---------------------------------------------------------

  try {
    // 3. Model Ayarları (STANDART: ULTRA KALİTE)
    // Kredi sisteminde kullanıcı "ödediği" için her zaman en iyi sonucu hak eder.
    const model = 'flux'; 
    const width = 1280;   
    const height = 720;
    const qualityPrompt = "masterpiece, best quality, cinematic lighting, 8k resolution, hyperrealistic, mystic atmosphere";

    const finalPrompt = `${qualityPrompt}, ${prompt}`;
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const seed = Math.floor(Math.random() * 1000000);

    // 4. Pollinations AI'dan Görseli İndir
    const imageUrlSource = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
    
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
                public_id: `${user.id}-${dreamId}`, // Aynı rüya için üzerine yazar
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

    if (!uploadedImageUrl) throw new Error("Resim sunucuya yüklenemedi.");

    // 6. Veritabanını Güncelle
    const { error: dbError } = await supabase
      .from('dreams')
      .update({ image_url: uploadedImageUrl })
      .eq('id', dreamId)
      .eq('user_id', user.id);

    if (dbError) throw new Error("Veritabanı güncelleme hatası.");

    revalidatePath('/dashboard');

    return { success: true, imageUrl: uploadedImageUrl };

  } catch (error: any) {
    console.error("Görsel Oluşturma Hatası:", error);

    // ---------------------------------------------------------
    // 7. HATA DURUMUNDA İADE (REFUND) - SİGORTA
    // ---------------------------------------------------------
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id,
        p_amount: COST, // Artı bakiye (İade)
        p_process_type: 'refund',
        p_description: 'İade: Görsel Oluşturma Hatası'
    });

    return { error: error.message || "Bir hata oluştu, krediniz iade edildi." };
  }
}