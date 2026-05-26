"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// ─── Service Role Client (RLS bypass) ────────────────────────────────────────

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Admin Kontrolü ───────────────────────────────────────────────────────────

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Yetkisiz erişim.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Yetkisiz erişim.");
  return user;
}

// ─── Kullanıcı Listesi ────────────────────────────────────────────────────────

export async function getUsers(search = "") {
  await requireAdmin();
  const supabase = getServiceClient();

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, credits, role, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (search.trim()) {
    query = query.ilike("email", `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Kullanıcıya Kredi Ekle ───────────────────────────────────────────────────

export type AddCreditsResult =
  | { success: true; newCredits: number }
  | { success: false; error: string };

export async function addCreditsToUser(
  userId: string,
  amount: number
): Promise<AddCreditsResult> {
  try {
    await requireAdmin();
    if (!userId || amount <= 0 || amount > 1000) {
      return { success: false, error: "Geçersiz değer." };
    }

    const supabase = getServiceClient();

    // Mevcut krediye ekle
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    const currentCredits = profile?.credits ?? 0;
    const newCredits = currentCredits + amount;

    const { error } = await supabase
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    // Transaction kaydı
    await supabase.from("credit_transactions").insert({
      user_id:      userId,
      amount,
      process_type: "admin_grant",
      description:  "Admin tarafından eklendi",
      metadata:     { previous: currentCredits, new: newCredits },
    });

    revalidatePath("/admin/users");
    return { success: true, newCredits };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── Promosyon E-Pin Üret ─────────────────────────────────────────────────────

export type GenerateEPinResult =
  | { success: true; orderId: string; credits: number }
  | { success: false; error: string };

function generateEPinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Karışık karakterler hariç (0,O,1,I)
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generatePromoEPin(
  credits: number,
  note = ""
): Promise<GenerateEPinResult> {
  try {
    await requireAdmin();

    if (credits <= 0 || credits > 100) {
      return { success: false, error: "Kredi miktarı 1-100 arasında olmalı." };
    }

    const supabase = getServiceClient();
    const orderId = generateEPinCode();

    // Duplicate kontrolü (çok düşük ihtimal ama güvenli olalım)
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing) {
      // Tekrar üret
      return generatePromoEPin(credits, note);
    }

    const { error } = await supabase.from("payments").insert({
      user_id:       null,
      order_id:      orderId,
      amount:        0,
      currency:      "TRY",
      plan_type:     "promo",
      credit_amount: credits,
      status:        "unclaimed",
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/epins");
    return { success: true, orderId, credits };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ─── E-Pin Listesi ────────────────────────────────────────────────────────────

export async function getEPins() {
  await requireAdmin();
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("payments")
    .select("id, order_id, amount, credit_amount, plan_type, status, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);
  return data ?? [];
}