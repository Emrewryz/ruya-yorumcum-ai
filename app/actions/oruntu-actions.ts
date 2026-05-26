"use server";

import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://ruyayorumcum.com.tr",
    "X-Title": "Rüya Yorumcum",
  },
});

export type OruntuResult =
  | { success: true;  analysis: string }
  | { success: false; error: string };

export async function generateOruntuAnalizi(): Promise<OruntuResult> {
  const supabase = createClient();

  // ── 1. Auth kontrolü ──
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Giriş yapmanız gerekmektedir." };
  }

  // ── 2. Rüyaları çek ──
  const { data: dreams, error: dbError } = await supabase
    .from("dreams")
    .select("dream_text, dream_title, ai_response, created_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(7);

  if (dbError) {
    return { success: false, error: "Rüyalar yüklenirken sorun oluştu." };
  }

  if (!dreams || dreams.length < 2) {
    return { success: false, error: "Haftalık analiz için en az 2 rüya gerekiyor." };
  }

  // ── 3. Kredi kontrolü ──
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.credits ?? 0) < 5) {
    return { success: false, error: "Bu analiz için 5 kredi gerekiyor." };
  }

  // ── 4. Krediyi düş ──
  const { data: txResult, error: txError } = await supabase.rpc("handle_credit_transaction", {
    p_user_id:      user.id,
    p_amount:       -5,
    p_process_type: "spend",
    p_description:  "Haftalık Örüntü Analizi",
    p_metadata:     { dream_count: dreams.length },
  });

  if (txError || !txResult?.success) {
    return { success: false, error: "Kredi düşümü başarısız. Lütfen tekrar deneyin." };
  }

  // ── 5. Bağlam oluştur ──
  const dreamContext = dreams
    .map((d, i) => {
      const tarih = new Date(d.created_at).toLocaleDateString("tr-TR", {
        day: "numeric", month: "long",
      });
      const ozet = (d.ai_response as any)?.kisa_ozet ?? d.dream_text.slice(0, 120);
      return `Rüya ${i + 1} (${tarih}):\nMetin: "${d.dream_text.slice(0, 200)}"\nÖzet: ${ozet}`;
    })
    .join("\n\n---\n\n");

  try {
    // ── 6. AI Analizi ──
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-lite-001",
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: "Sen deneyimli bir Jungcu psikolog ve rüya analistisin. Derin, samimi ve kişisel analizler yaparsın. Türkçe yazarsın.",
        },
        {
          role: "user",
          content: `Aşağıdaki rüyaları analiz ederek bu kişiye özel haftalık bilinçaltı örüntü raporu hazırla.

${dreamContext}

Raporunda şunları ele al:
1. Tekrar eden temalar ve semboller
2. Bilinçaltının işlemeye çalıştığı ana konu
3. Duygusal örüntüler ve eğilimler  
4. Bu dönem için kişisel bir içgörü ve öneri

Başlık veya madde işareti kullanma. Akıcı, derin ve samimi paragraflar yaz. Kişiye doğrudan hitap et.

`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) throw new Error("Boş yanıt.");

    return { success: true, analysis: text };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[generateOruntuAnalizi] Hata:", msg);

    // ── 7. Hata durumunda kredi iadesi ──
    await supabase.rpc("handle_credit_transaction", {
      p_user_id:      user.id,
      p_amount:       5,
      p_process_type: "refund",
      p_description:  "İade: Haftalık Analiz Hatası",
    });

    return { success: false, error: "Analiz sırasında bir sorun oluştu. Lütfen tekrar deneyin." };
  }
}