"use server";

import { createClient } from "@/utils/supabase/server";

// ─── Slug Türkçe → URL ────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/İ/g, "i")
    .replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 100);
}

const SYSTEM_PROMPT = `Sen bir rüya tabiri uzmanisın.

GÖREV: Verilen rüya metninden SADECE ana temayı çıkar.

KURALLAR:
1. İsimleri, kişisel detayları, "ben/benim/gördüm" ifadelerini tamamen yok say.
2. Sadece ana nesne veya eylemi bul (örn: "yılan", "uçmak", "eski ev").
3. Başlık "Rüyada X Görmek" formatında olsun. "Görmek Rüyası" gibi tekrar KULLANMA.
4. Slug tamamen küçük harf, sadece ASCII karakter, kelimeler tire ile ayrılmış.
5. SADECE şu JSON döndür: { "title": "Rüyada X Görmek", "slug": "ruyada-x-gormek" }`;

export async function generateDictionaryEntry(dreamText: string): Promise<void> {
  console.log("[DictGen] BAŞLADI:", dreamText.slice(0, 50));

  if (!dreamText || dreamText.trim().length < 20) {
    console.log("[DictGen] Metin çok kısa, atlandı.");
    return;
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":  "https://www.ruyayorumcum.com.tr",
        "X-Title":       "Ruya Yorumcum - Dict Trigger",
      },
      body: JSON.stringify({
        model:       "google/gemini-2.5-flash-lite",
        max_tokens:  100,
        temperature: 0.3,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: `Rüya: ${dreamText.slice(0, 300)}` },
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

    let entry: { title: string; slug: string };
    try {
      entry = JSON.parse(clean);
    } catch {
      console.warn("[DictGen] JSON parse hatası:", raw.slice(0, 100));
      return;
    }

    if (!entry.title?.trim() || !entry.slug?.trim()) {
      console.warn("[DictGen] Eksik alanlar, atlandı.");
      return;
    }

    const slug        = toSlug(entry.slug || entry.title);
    const firstLetter = entry.title.replace(/^Rüyada\s+/i, "").charAt(0).toUpperCase() || "R";

    const supabase = createClient();

    const { data: existing } = await supabase
      .from("dream_dictionary")
      .select("id, search_count")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("dream_dictionary")
        .update({ search_count: (existing.search_count ?? 0) + 1 })
        .eq("id", existing.id);
      console.log(`[DictGen] Slug mevcut, sayaç artırıldı: ${slug}`);
      return;
    }

    const { error } = await supabase.from("dream_dictionary").insert({
      term:         entry.title.trim(),
      slug,
      description:  "",
      content:      null,
        source:       "ai_trigger",   // ← EKLE

      first_letter: firstLetter,
      is_published: false,
      published_at: null,
      search_count: 1,
      tags:         [],
    });

    if (error) {
      console.warn("[DictGen] DB insert hatası:", error.message);
      return;
    }

    console.log(`[DictGen] Başlık kaydedildi (içerik bekleniyor): ${slug}`);

  } catch (err: any) {
    console.warn("[DictGen] Beklenmeyen hata:", err?.message ?? err);
  }
}