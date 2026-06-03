"use server";

import { createClient } from "@/utils/supabase/server";

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface DictionaryEntryAI {
  title:       string;
  slug:        string;
  description: string;
  content:     DictionaryContent;
}

interface DictionaryContent {
  type:              "ultimate";
  psychological:     string;
  traditional_wisdom: {
    introduction: string;
    pillars: { title: string; description: string }[];
  };
  scenarios:  { title: string; meaning: string }[];
  faq:        { question: string; answer: string }[];
}

// ─── Slug Türkçe → URL ────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")  // ← bu satır eksikti
    .replace(/İ/g, "i")  // ← büyük İ de
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 100);
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sen ansiklopedik bir rüya tabiri yazarısın.

GÖREV: Sana bir rüya metni verilecek. Şu kuralları KESİNLİKLE uygula:

1. GIZLILIK: Rüyadaki isimleri, kişisel travmaları, birinci tekil şahıs ifadelerini
   ("ben", "benim", "gördüm", "hissettim") tamamen yok say.
2. SOYUTLAMA: Sadece rüyadaki ana nesneleri ve eylemleri (örn: "eski okul", "siyah su",
   "boğulmak", "uçmak") birleştirerek genel ve ansiklopedik bir rüya tabiri yaz.
3. DİL: Her şey 3. tekil şahıs ağzıyla ("rüyayı gören", "kişi", "bu rüya").
4. FORMAT: Yanıtın SADECE aşağıdaki JSON olsun, başka hiçbir şey ekleme:

{
  "title": "Rüyada [Ana Tema] Görmek",
  "slug": "ruyada-ana-tema-gormek",
  "description": "160 karakteri geçmeyen meta açıklama",
  "content": {
    "type": "ultimate",
    "psychological": "Jung ve Freud perspektifinden 2-3 paragraf psikolojik analiz.",
    "traditional_wisdom": {
      "introduction": "İslami kaynaklara (İbn-i Sirin, İmam Nablusi) dayalı giriş paragrafı.",
      "pillars": [
        { "title": "Olumlu Yorum", "description": "Açıklama..." },
        { "title": "Olumsuz Yorum", "description": "Açıklama..." }
      ]
    },
    "scenarios": [
      { "title": "Senaryo başlığı", "meaning": "Bu senaryonun anlamı..." }
    ],
    "faq": [
      { "question": "Soru?", "answer": "Cevap." }
    ]
  }
}`;

// ─── Ana Fonksiyon ────────────────────────────────────────────────────────────

export async function generateDictionaryEntry(dreamText: string): Promise<void> {
      console.log("[DictGen] BAŞLADI:", dreamText.slice(0, 50)); // ← ekle

  // Çok kısa metinleri atla
  if (!dreamText || dreamText.trim().length < 20) return;

  try {
    // ── 1. AI'dan içerik üret ──
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":  "https://www.ruyayorumcum.com.tr",
"X-Title":       "Ruya Yorumcum - Dictionary Generator",
      },
      body: JSON.stringify({
        model:       "google/gemini-2.5-flash-lite",
        max_tokens:  2000,
        temperature: 0.6,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: `Rüya metni: ${dreamText.slice(0, 500)}` },
        ],
      }),
    });

    if (!res.ok) {
      console.warn(`[DictGen] AI isteği başarısız: HTTP ${res.status}`);
      return;
    }

    const data  = await res.json();
    const raw   = data?.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let entry: DictionaryEntryAI;
    try {
      entry = JSON.parse(clean);
    } catch {
      console.warn("[DictGen] JSON parse hatası:", raw.slice(0, 200));
      return;
    }

    // Zorunlu alan kontrolü
    if (!entry.title?.trim() || !entry.slug?.trim() || !entry.content) {
      console.warn("[DictGen] Eksik alanlar, atlanıyor.");
      return;
    }

    // Slug normalize et
    const slug = toSlug(entry.slug || entry.title);
    const firstLetter = entry.title
      .replace(/^Rüyada\s+/i, "")
      .charAt(0)
      .toUpperCase() || "R";

    const supabase = createClient();

    // ── 2. Slug çakışma kontrolü ──
    const { data: existing } = await supabase
      .from("dream_dictionary")
      .select("id, search_count")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      // Zaten var → sadece search_count artır
      await supabase
        .from("dream_dictionary")
        .update({ search_count: (existing.search_count ?? 0) + 1 })
        .eq("id", existing.id);

      console.log(`[DictGen] Slug mevcut, sayaç artırıldı: ${slug}`);
      return;
    }

    // ── 3. Yeni madde ekle (is_published: false — admin onayı bekler) ──
    const { error } = await supabase.from("dream_dictionary").insert({
      term:         entry.title,
      slug,
      description:  entry.description?.slice(0, 160) ?? "",
      content:      entry.content,
      first_letter: firstLetter,
      is_published: false,       // Admin onaylayana kadar gizli
      published_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 yıl sonra — admin yayınlamadan açılmaz
      search_count: 1,
      tags:         [],
    });

    if (error) {
      console.warn("[DictGen] DB insert hatası:", error.message);
      return;
    }

    console.log(`[DictGen] Yeni madde oluşturuldu (onay bekliyor): ${slug}`);

  } catch (err: any) {
    // Fire-and-forget: hata ana akışı etkilemesin
    console.warn("[DictGen] Beklenmeyen hata:", err?.message ?? err);
  }
}