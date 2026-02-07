"use server";

import { v2 as cloudinary } from 'cloudinary';
import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs";
import { revalidatePath } from 'next/cache';
import OpenAI from "openai";

// 1. Cloudinary Ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 2. OpenRouter Ayarları
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

export async function generateDreamImage(prompt: string, dreamId: string) {
  const supabase = createClient();
  const COST = SERVICE_COSTS.image_generation || 3;

  // --- KULLANICI KONTROLÜ ---
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // --- ÖDEME AL ---
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: `Görsel Üretimi (Rüya #${dreamId.slice(0,4)})`,
      p_metadata: { dreamId, prompt_preview: prompt.slice(0, 50) }
  });

  if (txError || !txResult.success) {
      return { 
          error: "Yetersiz bakiye. Görsel oluşturmak için kredi yükleyin.", 
          code: "NO_CREDIT" 
      };
  }

  try {
    // --- PROMPT MÜHENDİSLİĞİ ---
    // İngilizceye çeviri veya stil ekleme. Flux, İngilizce prompt ile şahlanır.
    const finalPrompt = `${prompt}, cinematic lighting, hyperrealistic, 8k, masterpiece, detailed, atmospheric, fantasy art style`;

    // --- API ÇAĞRISI (OpenRouter / FLUX.1 Schnell) ---
    // Bu model çok hızlı ve çok ucuzdur.
    const response = await openai.images.generate({
      model: "black-forest-labs/flux-1-schnell", 
      prompt: finalPrompt,
      // OpenRouter'da bazı modeller standart 1024x1024 dışını desteklemeyebilir, 
      // ama Flux genelde esnektir. Hata alırsan burayı silip varsayılan bırakabilirsin.
      size: "1024x1024", 
      n: 1,
    });

    // --- TYPESCRIPT HATASI DÜZELTMESİ (Guard Clause) ---
    // response.data'nın undefined gelme ihtimaline karşı kontrol
    if (!response || !response.data || !response.data[0] || !response.data[0].url) {
        console.error("OpenRouter Yanıtı:", JSON.stringify(response)); // Hatayı logla
        throw new Error("Görsel oluşturulamadı (API Boş Yanıt).");
    }

    const imageUrlSource = response.data[0].url;

    // --- GÖRSELİ İNDİR ---
    const imageRes = await fetch(imageUrlSource);
    const imageBlob = await imageRes.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- CLOUDINARY'YE YÜKLE ---
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
                    console.error("Cloudinary Hatası:", error);
                    reject(error);
                }
                else resolve(result?.secure_url || "");
            }
        );
        uploadStream.end(buffer);
    });

    if (!uploadedImageUrl) throw new Error("Resim depolama alanına yüklenemedi.");

    // --- VERİTABANI GÜNCELLEME ---
    const { error: dbError } = await supabase
      .from('dreams')
      .update({ image_url: uploadedImageUrl })
      .eq('id', dreamId)
      .eq('user_id', user.id);

    if (dbError) throw new Error("Veritabanı kaydı başarısız.");

    revalidatePath('/dashboard');
    return { success: true, imageUrl: uploadedImageUrl };

  } catch (error: any) {
    console.error("Kritik Hata:", error);

    // --- HATA DURUMUNDA İADE ---
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id,
        p_amount: COST,
        p_process_type: 'refund',
        p_description: 'İade: Görsel Servis Hatası'
    });

    // Kullanıcıya teknik detay yerine anlaşılır hata mesajı
    return { error: "Şu an yoğunluk var, krediniz iade edildi. Lütfen tekrar deneyin." };
  }
}