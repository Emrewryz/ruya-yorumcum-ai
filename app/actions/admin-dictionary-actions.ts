"use server";

import { createClient } from "@/utils/supabase/server";

// ─── Detaylı Ultimate Format Prompt ──────────────────────────────────────────

function buildPrompt(term: string): string {
  return `Sen ansiklopedik bir rüya tabiri yazarısın.

KONU: "${term}"

KURALLAR:
1. Her şey 3. tekil şahıs ağzıyla ("rüyayı gören", "kişi", "bu rüya").
2. Başlık tekrarlarından kaçın — "Görmek Rüyası", "Rüyası Görmek" gibi tuhaf ifadeler KULLANMA.
3. Psikolojik bölüm Jung ve Freud referanslı, en az 3 paragraf olsun.
4. İslami bölüm İbn-i Sirin ve İmam Nablusi referanslı olsun.
5. En az 3 senaryo, en az 3 SSS olsun.
6. description alanı SEO odaklı, merak uyandıran, 120-160 karakter arası olsun.
7. SADECE aşağıdaki JSON döndür, başka hiçbir şey ekleme:

{
  "description": "SEO meta açıklaması (120-160 karakter)",
  "content": {
    "type": "ultimate",
    "psychological": "Jung/Freud perspektifinden detaylı psikolojik analiz (3+ paragraf)",
    "traditional_wisdom": {
      "introduction": "İslami kaynaklara dayalı giriş paragrafı",
      "pillars": [
        { "title": "Olumlu Yorum", "description": "Detaylı açıklama..." },
        { "title": "Olumsuz Yorum", "description": "Detaylı açıklama..." },
        { "title": "Manevi Anlam", "description": "Detaylı açıklama..." }
      ]
    },
    "scenarios": [
      { "title": "Senaryo başlığı", "meaning": "Bu senaryonun detaylı anlamı..." },
      { "title": "Senaryo başlığı", "meaning": "Bu senaryonun detaylı anlamı..." },
      { "title": "Senaryo başlığı", "meaning": "Bu senaryonun detaylı anlamı..." }
    ],
    "faq": [
      { "question": "Soru?", "answer": "Detaylı cevap." },
      { "question": "Soru?", "answer": "Detaylı cevap." },
      { "question": "Soru?", "answer": "Detaylı cevap." }
    ]
  }
}`;
}

// ─── Tip ──────────────────────────────────────────────────────────────────────

type GenerateResult =
  | { success: true }
  | { success: false; error: string };

// ─── Action ───────────────────────────────────────────────────────────────────

export async function generateDictionaryContent(id: string): Promise<GenerateResult> {
  const supabase = createClient();

  // ── Admin kontrolü ──
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Oturum bulunamadı." };

  const { data: profile } = await supabase
    .from("profiles").select("is_admin, role").eq("id", user.id).single();
  if (!profile?.is_admin && profile?.role !== "admin") {
    return { success: false, error: "Admin yetkisi gerekiyor." };
  }

  // ── Başlığı oku ──
  const { data: entry, error: fetchError } = await supabase
    .from("dream_dictionary")
    .select("term")
    .eq("id", id)
    .single();

  if (fetchError || !entry) return { success: false, error: "Kayıt bulunamadı." };

  // ── İçerik üret ──
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer":  "https://www.ruyayorumcum.com.tr",
      "X-Title":       "Ruya Yorumcum - Dict Content",
    },
    body: JSON.stringify({
      model:       "google/gemini-2.5-flash-lite",
      max_tokens:  2500,
      temperature: 0.7,
      messages: [
        { role: "user", content: buildPrompt(entry.term) },
      ],
    }),
  });

  if (!res.ok) {
    return { success: false, error: `AI isteği başarısız: HTTP ${res.status}` };
  }

  const data  = await res.json();
  const raw   = data?.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed: { description: string; content: object };
  try {
    parsed = JSON.parse(clean);
  } catch {
    return { success: false, error: "AI geçersiz JSON döndürdü." };
  }

  if (!parsed.content) {
    return { success: false, error: "AI yanıtında content alanı eksik." };
  }

  // ── DB'ye yaz ──
  const { error: updateError } = await supabase
    .from("dream_dictionary")
    .update({
      description: parsed.description?.slice(0, 160) ?? "",
      content:     parsed.content,
    })
    .eq("id", id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}