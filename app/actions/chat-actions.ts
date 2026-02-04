"use server";

import { createClient } from "@/utils/supabase/server";
import { SERVICE_COSTS } from "@/utils/costs";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com",
    "X-Title": "Rüya Yorumcum",
  },
});

export async function sendChatMessage(dreamId: string, message: string) {
  const supabase = createClient();
  const COST = SERVICE_COSTS.chat_message || 1; // Maliyet: 1 Kredi

  // 1. Auth Kontrol
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Giriş yapmalısınız." };

  // -----------------------------------------------------------------
  // 2. ÖDEME AL (Atomik İşlem)
  // -----------------------------------------------------------------
  // NOT: Kullanıcıya "Sohbet Hakkı" tanımlamak yerine her mesajda düşüyoruz.
  // İleride "Sohbet Paketi" satarsak burayı güncelleriz.
  
  const { data: txResult, error: txError } = await supabase.rpc('handle_credit_transaction', {
      p_user_id: user.id,
      p_amount: -COST,
      p_process_type: 'spend',
      p_description: `Kahin Sohbet Mesajı (Rüya #${dreamId.slice(0,4)})`,
      p_metadata: { dreamId }
  });

  if (txError || !txResult.success) {
      return { error: "Yetersiz bakiye. Sohbet için kredi yükleyin." };
  }
  // -----------------------------------------------------------------

  // 3. Verileri Çek
  const { data: dream } = await supabase.from('dreams').select('*').eq('id', dreamId).single();
  const { data: profile } = await supabase.from('profiles').select('full_name, bio').eq('id', user.id).single();
  
  if (!dream) {
      // Rüya yoksa parayı iade et (Çok nadir senaryo)
      await supabase.rpc('handle_credit_transaction', {
          p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Rüya bulunamadı'
      });
      return { error: "Rüya bulunamadı." };
  }

  // 4. Geçmişi Çek
  const { data: history } = await supabase
    .from('dream_chat_messages')
    .select('role, content')
    .eq('dream_id', dreamId)
    .order('created_at', { ascending: true }) 
    .limit(10);

  // 5. Prompt Hazırla
  const messages: any[] = [
    { role: "system", content: `Sen RÜYA KAHİNİSİN. Kullanıcı: ${profile?.full_name}. Rüya: ${dream.dream_text}. Mistik ve bilge konuş.` }, 
  ];
  if (history) history.forEach(m => messages.push({ role: m.role, content: m.content }));
  messages.push({ role: "user", content: message });

  try {
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "google/gemini-2.0-flash-lite-001",
        temperature: 1.0,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) throw new Error("Boş cevap.");

    // 6. Mesajları Kaydet
    await supabase.from('dream_chat_messages').insert([
        { user_id: user.id, dream_id: dreamId, role: 'user', content: message },
        { user_id: user.id, dream_id: dreamId, role: 'assistant', content: responseText }
    ]);

    return { success: true, message: responseText };

  } catch (error: any) {
    console.error("Sohbet Hatası:", error);
    
    // Hata İadesi
    await supabase.rpc('handle_credit_transaction', {
        p_user_id: user.id, p_amount: COST, p_process_type: 'refund', p_description: 'İade: Sohbet Hatası'
    });

    return { error: "Bağlantı hatası, krediniz iade edildi." };
  }
}