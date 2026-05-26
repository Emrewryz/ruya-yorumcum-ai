"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export interface PersonalizationData {
  yasam_evreni?: string;
  buyuk_degisim?: string;
  ruh_hali?: string;
  zihin_mesgul?: string;
  completed_at?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  personalization_data: PersonalizationData;
  created_at: string;
}

export type ActionResult<T = null> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Profili çek ─────────────────────────────────────────────────────────────

export async function getProfile(): Promise<ActionResult<UserProfile>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Oturum bulunamadı." };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, credits, personalization_data, created_at")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return { success: false, error: "Profil yüklenemedi." };
  }

  return {
    success: true,
    data: {
      ...data,
      personalization_data: (data.personalization_data ?? {}) as PersonalizationData,
    },
  };
}

// ─── Kişiselleştirme verisini kaydet ─────────────────────────────────────────

export async function savePersonalization(
  personalizationData: PersonalizationData
): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Oturum bulunamadı." };
  }

  const dataWithTimestamp: PersonalizationData = {
    ...personalizationData,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      personalization_data: dataWithTimestamp,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/profile");
  return { success: true, data: null };
}

// ─── Profil bilgilerini güncelle (isim) ───────────────────────────────────────

export async function updateProfileName(
  fullName: string
): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Oturum bulunamadı." };

  const trimmed = fullName?.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: false, error: "İsim en az 2 karakter olmalıdır." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: trimmed, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { success: false, error: "Güncellenemedi." };

  revalidatePath("/profile");
  return { success: true, data: null };
}