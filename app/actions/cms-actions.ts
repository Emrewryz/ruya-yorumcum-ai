"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Yetkisiz.");
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Yetkisiz.");
}

// ─── Tipler ───────────────────────────────────────────────────────────────────

export type SaveResult =
  | { success: true;  id: string; slug: string }
  | { success: false; error: string };

export interface DreamEntryInput {
  term:         string;
  slug:         string;
  description:  string;
  first_letter: string;
  tags:         string[];
  content:      Record<string, any>;
  is_published: boolean;
  published_at: string; // ISO string
}

// ─── Kaydet / Güncelle ────────────────────────────────────────────────────────

export async function saveDreamEntry(
  input: DreamEntryInput,
  existingId?: string
): Promise<SaveResult> {
  try {
    await requireAdmin();

    if (!input.term?.trim())        return { success: false, error: "term boş." };
    if (!input.slug?.trim())        return { success: false, error: "slug boş." };
    if (!input.description?.trim()) return { success: false, error: "description boş." };

    const supabase = getServiceClient();

    // published_at geçmişteyse is_published = true, ilerideyse false
    const now = new Date();
    const publishedAt = new Date(input.published_at);
    const isPublished = publishedAt <= now;

    const payload = {
      term:         input.term.trim(),
      slug:         input.slug.trim(),
      description:  input.description.trim(),
      first_letter: input.first_letter || input.term.charAt(0).toUpperCase(),
      tags:         input.tags.filter(Boolean),
      content:      input.content,
      is_published: isPublished,
      published_at: input.published_at,
      updated_at:   new Date().toISOString(),
    };

    if (existingId) {
      const { error } = await supabase
        .from("dream_dictionary").update(payload).eq("id", existingId);
      if (error) return { success: false, error: error.message };
    } else {
      const { data, error } = await supabase
        .from("dream_dictionary").insert(payload).select("id").single();
      if (error) return { success: false, error: error.message };
      revalidatePath("/ruya-tabirleri");
      revalidatePath("/admin/cms");
      revalidatePath("/admin/takvim");
      return { success: true, id: data.id, slug: input.slug };
    }

    revalidatePath("/admin/cms");
    revalidatePath("/admin/takvim");
    revalidatePath(`/ruya-tabirleri/${input.slug}`);
    return { success: true, id: existingId!, slug: input.slug };

  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── İçerik Listesi ──────────────────────────────────────────────────────────

export async function getDreamEntries(search = "") {
  await requireAdmin();
  const supabase = getServiceClient();

  let query = supabase
    .from("dream_dictionary")
    .select("id, term, slug, is_published, published_at, search_count, updated_at, content") // ← content eklendi
    .order("published_at", { ascending: false })
    .limit(200);

  if (search.trim()) query = query.ilike("term", `%${search.trim()}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
// ─── Sil ─────────────────────────────────────────────────────────────────────

export async function deleteDreamEntry(id: string): Promise<SaveResult> {
  try {
    await requireAdmin();
    const supabase = getServiceClient();
    const { error } = await supabase.from("dream_dictionary").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/cms");
    revalidatePath("/admin/takvim");
    return { success: true, id, slug: "" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}