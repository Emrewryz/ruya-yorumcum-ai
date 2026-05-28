"use server";

import { createClient } from "@/utils/supabase/server";

// ─── Türkçe → Slug ────────────────────────────────────────────────────────────

// Sona takıldığında çirkin duran bağlaçlar ve kısa kelimeler
const STOP_WORDS = new Set([
  "ve", "ile", "bir", "da", "de", "mi", "mu", "mü", "mı",
  "bu", "su", "o", "ya", "ki", "ne", "en", "bir", "icin",
  "ile", "veya", "ama", "fakat", "lakin",
]);

function toSlug(text: string): string {
  const map: Record<string, string> = {
    ç:"c", Ç:"c", ğ:"g", Ğ:"g", ı:"i", İ:"i",
    ö:"o", Ö:"o", ş:"s", Ş:"s", ü:"u", Ü:"u",
  };

  const words = text
    .split("").map((c) => map[c] ?? c).join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Maksimum 5 kelime al — sondan stop word'leri at
  const meaningful: string[] = [];
  for (const word of words) {
    if (meaningful.length >= 5) break;
    meaningful.push(word);
  }

  // Sondan stop word'leri kaldır
  while (meaningful.length > 1 && STOP_WORDS.has(meaningful[meaningful.length - 1])) {
    meaningful.pop();
  }

  return meaningful
    .join("-")
    .replace(/-+/g, "-")   // çift tireyi tek yap
    .replace(/^-|-$/g, ""); // baştaki ve sondaki tireyi sil
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6); // 4 karakterlik ID
}

// ─── Slug üret ve DB'ye kaydet ────────────────────────────────────────────────

async function generateUniqueDreamSlug(
  supabase: ReturnType<typeof createClient>,
  title: string,
  dreamText: string
): Promise<string> {
  const base = toSlug(title || dreamText.slice(0, 40));
  const slug = `${base}-${randomSuffix()}`;

  // Çakışma kontrolü
  const { data } = await supabase
    .from("dreams")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  // Çakışırsa yeniden üret (çok düşük ihtimal)
  if (data) return generateUniqueDreamSlug(supabase, title, dreamText);
  return slug;
}

// ─── Public Toggle + Slug üretme ─────────────────────────────────────────────

export type TogglePublicResult =
  | { success: true; slug: string; isPublic: boolean; rewarded: boolean }
  | { success: false; error: string };

export async function toggleDreamPublic(
  dreamId: string,
  makePublic: boolean
): Promise<TogglePublicResult> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Giriş gerekli." };

  // Mevcut rüyayı çek
  const { data: dream, error: fetchErr } = await supabase
    .from("dreams")
    .select("id, dream_title, dream_text, slug, is_rewarded")
    .eq("id", dreamId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !dream) return { success: false, error: "Rüya bulunamadı." };

  const updates: Record<string, any> = { is_public: makePublic };

  // Slug yoksa ve herkese açık yapılıyorsa üret
  if (makePublic && !dream.slug) {
    const slug = await generateUniqueDreamSlug(
      supabase,
      dream.dream_title ?? "",
      dream.dream_text
    );
    updates.slug = slug;
  }

  // DB güncelle
  const { error: updateErr } = await supabase
    .from("dreams")
    .update(updates)
    .eq("id", dreamId);

  if (updateErr) return { success: false, error: updateErr.message };

  const finalSlug = updates.slug ?? dream.slug ?? "";
  let rewarded = dream.is_rewarded ?? false;

  // İlk kez herkese açık + henüz ödül almamışsa kredi ver
  if (makePublic && !rewarded) {
    await supabase
      .from("dreams")
      .update({ is_rewarded: true })
      .eq("id", dreamId);

    await supabase.rpc("handle_credit_transaction", {
      p_user_id:      user.id,
      p_amount:       1,
      p_process_type: "reward",
      p_description:  "Rüya paylaşım ödülü",
      p_metadata:     { dream_id: dreamId, slug: finalSlug },
    });
    rewarded = true;
  }

  return {
    success:  true,
    slug:     finalSlug,
    isPublic: makePublic,
    rewarded,
  };
}