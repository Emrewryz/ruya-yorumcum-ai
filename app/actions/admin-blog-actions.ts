"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { success: true; slug: string }
  | { success: false; error: string };

export async function createBlogPost(
  rawJson: string,
  scheduledDate: string // ISO UTC string
): Promise<ActionResult> {
  const supabase = createClient();

  // ── 1. Auth kontrolü ──────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Oturum bulunamadı. Lütfen giriş yapın." };
  }

  // Admin kontrolü — profiles tablosundaki is_admin veya role alanı
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, role")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin && profile?.role !== "admin") {
    return { success: false, error: "Bu işlem için admin yetkisi gerekiyor." };
  }

  // ── 2. JSON parse ─────────────────────────────────────────────────────────
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { success: false, error: "Geçersiz JSON formatı. Lütfen kontrol edin." };
  }

  // ── 3. Zorunlu alanlar ────────────────────────────────────────────────────
  const title      = parsed.title      as string | undefined;
  const slug       = parsed.slug       as string | undefined;
  const excerpt    = parsed.excerpt    as string | undefined;
  const image_url  = parsed.image_url  as string | undefined;
  const content    = parsed.content;
  const is_published = parsed.is_published !== false; // varsayılan: true

  if (!title?.trim()) return { success: false, error: "'title' alanı zorunlu." };
  if (!slug?.trim())  return { success: false, error: "'slug' alanı zorunlu." };
  if (!content)       return { success: false, error: "'content' alanı zorunlu." };

  // Slug format kontrolü — sadece küçük harf, rakam ve tire
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      success: false,
      error: "Slug yalnızca küçük harf, rakam ve tire (-) içerebilir.",
    };
  }

  // ── 4. Slug çakışma kontrolü ──────────────────────────────────────────────
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { success: false, error: `'${slug}' slug'ı zaten kullanımda.` };
  }

  // ── 5. Insert ─────────────────────────────────────────────────────────────
  const { error: insertError } = await supabase.from("blog_posts").insert({
    title,
    slug,
    excerpt:      excerpt ?? null,
    image_url:    image_url ?? null,
    content,
    is_published,
    published_at: scheduledDate, // UTC ISO string — zamanlama buradan
  });

  if (insertError) {
    console.error("[createBlogPost] insert error:", insertError);
    return { success: false, error: insertError.message };
  }

  // ── 6. Cache temizle ──────────────────────────────────────────────────────
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);

  return { success: true, slug };
}