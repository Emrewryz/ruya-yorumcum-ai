"use server";

import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkUsageLimit } from "@/utils/gatekeeper";

// 1. DÜZELTME: API Anahtarı buraya eklendi
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
   throw new Error("API Key bulunamadı! .env dosyasını kontrol et.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// Yedekli Model Listesi
const MODELS_TO_TRY = ["gemini-2.5-flash"];

export async function sendChatMessage(dreamId: string, message: string) {
  const supabase = createClient();

  // 1. Kullanıcı Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // 2. Limit Kontrolü
  const usageCheck = await checkUsageLimit(user.id, 'chat');
  if (!usageCheck.allowed) {
     return { error: "Sohbet hakkınız doldu veya paketiniz yetersiz." };
  }

  // 3. Rüya Verisi
  const { data: dream } = await supabase
    .from('dreams')
    .select('dream_text, dream_title, ai_response')
    .eq('id', dreamId)
    .single();

  if (!dream) return { error: "Rüya bulunamadı." };

  // 4. Profil Verisi
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio')
    .eq('id', user.id)
    .single();

  // 5. Sohbet Geçmişi
  const { data: history } = await supabase
    .from('dream_chat_messages')
    .select('role, content')
    .eq('dream_id', dreamId)
    .order('created_at', { ascending: true })
    .limit(20);

  // 6. AI İsteği (Yedekli Sistem)
  let responseText = "";
  let lastError = "";

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `
              SEN BİR RÜYA KAHİNİSİN.
              Aşağıdaki bilgilere dayanarak kullanıcının sorularını mistik, bilge ve rahatlatıcı bir dille cevapla.
              
              KULLANICI: ${profile?.full_name}, BİO: ${profile?.bio || "Yok"}
              
              ANALİZ EDİLEN RÜYA:
              Başlık: ${dream.dream_title}
              Metin: ${dream.dream_text}
              Önceki Analiz Özeti: ${dream.ai_response?.summary}
              
              GÖREVİN: Kullanıcı bu rüya hakkında sana soru soracak. Rüyadaki detayları ve önceki analizi hatırlayarak cevap ver. Kısa ve öz ol.
            ` }]
          },
          {
            role: "model",
            parts: [{ text: "Anlaşıldı. Ben senin rüya rehberinim. Rüyandaki sembolleri ve gizli mesajları derinlemesine konuşmak için buradayım. Sorunu sor." }]
          },
          ...(history?.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          })) || [])
        ] as any
      });

      const result = await chat.sendMessage(message);
      responseText = result.response.text();
      
      // Başarılıysa çık
      break; 

    } catch (error: any) {
      console.warn(`Chat Hatası (${modelName}):`, error.message);
      lastError = error.message;
    }
  }

  if (!responseText) {
    return { error: `Kahin şu an cevap veremiyor. Hata: ${lastError}` };
  }

  // 7. Mesajları Kaydet
  try {
    await supabase.from('dream_chat_messages').insert({
      user_id: user.id,
      dream_id: dreamId,
      role: 'user',
      content: message
    });

    await supabase.from('dream_chat_messages').insert({
      user_id: user.id,
      dream_id: dreamId,
      role: 'assistant',
      content: responseText
    });

    return { success: true, message: responseText };

  } catch (dbError) {
    console.error("DB Hatası:", dbError);
    return { error: "Mesaj kaydedilemedi." };
  }
}