"use server";

import { createClient } from "@/utils/supabase/server";
import { checkUsageLimit } from "@/utils/gatekeeper";
import OpenAI from "openai";

// 1. DeepSeek İstemcisi
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY 
});

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

  // 5. Sohbet Geçmişi (Son 20 mesaj)
  // DeepSeek'e "hatırlaması" için bu geçmişi göndereceğiz.
  const { data: history } = await supabase
    .from('dream_chat_messages')
    .select('role, content')
    .eq('dream_id', dreamId)
    .order('created_at', { ascending: true }) // Eskiden yeniye doğru sırala
    .limit(20);

  // 6. AI Context (Sistem Mesajı Hazırlığı)
  const systemPrompt = `
    SEN BİR RÜYA KAHİNİSİN.
    Kullanıcının sorularını mistik, bilge, rahatlatıcı ama aynı zamanda psikolojik derinliği olan bir dille cevapla.
    Kısa, öz ve etkileyici konuş.

    KULLANICI PROFİLİ:
    - İsim: ${profile?.full_name || "Bilinmiyor"}
    - Bio: ${profile?.bio || "Yok"}

    ANALİZ EDİLEN RÜYA:
    - Başlık: ${dream.dream_title}
    - Rüya Metni: ${dream.dream_text}
    - Senin Önceki Analizin (Özet): ${dream.ai_response?.summary || "Yok"}

    GÖREVİN:
    Kullanıcı bu rüya hakkında sana soru soruyor. Rüyadaki detayları ve önceki analizini hatırla.
    Sadece rüya yorumcusu rolünde kal.
  `;

  // 7. Mesaj Zincirini Oluşturma (System + History + New Message)
  const messages: any[] = [
    { role: "system", content: systemPrompt }, // Kimlik ve Bağlam
  ];

  // Geçmiş mesajları ekle (Supabase 'role' verisi ile OpenAI 'role' verisi uyumludur: 'user' | 'assistant')
  if (history && history.length > 0) {
    history.forEach((msg) => {
        // Veritabanındaki rol isimlerini API'nin anladığı formata emin olmak için mapleyebiliriz
        // Genelde DB'de 'assistant' diye kayıtlıdır ama 'model' ise 'assistant' yapalım.
        const role = msg.role === 'user' ? 'user' : 'assistant';
        messages.push({ role: role, content: msg.content });
    });
  }

  // Yeni kullanıcı mesajını ekle
  messages.push({ role: "user", content: message });

  try {
    // 8. DeepSeek'e Gönder
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "deepseek-chat", // V3 Chat Modeli
        temperature: 1.0, // Sohbet olduğu için akıcılık önemli
    });

    const responseText = completion.choices[0].message.content;

    if (!responseText) throw new Error("Boş cevap döndü.");

    // 9. Mesajları Kaydet
    // Önce kullanıcının mesajını kaydet
    await supabase.from('dream_chat_messages').insert({
      user_id: user.id,
      dream_id: dreamId,
      role: 'user',
      content: message
    });

    // Sonra AI cevabını kaydet
    await supabase.from('dream_chat_messages').insert({
      user_id: user.id,
      dream_id: dreamId,
      role: 'assistant', // OpenAI standardı 'assistant'tır
      content: responseText
    });

    return { success: true, message: responseText };

  } catch (error: any) {
    console.error("DeepSeek Chat Hatası:", error);
    return { error: "Kahin şu an bağlantı kuramıyor. Lütfen tekrar dene." };
  }
}