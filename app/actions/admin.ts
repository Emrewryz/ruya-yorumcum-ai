"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// ADMIN İŞLEMLERİ İÇİN SERVICE ROLE KEY KULLANIYORUZ
// Bu key ASLA client tarafına sızmamalı.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. GENEL İSTATİSTİKLER
export async function getAdminStats() {
  // Toplam Kullanıcı
  const { count: userCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  
  // İşlem İstatistikleri
  const { data: transactions } = await supabaseAdmin
    .from('credit_transactions')
    .select('amount, process_type');

  let totalCreditsInCirculation = 0;
  let totalCreditsSpent = 0;

  if (transactions) {
      transactions.forEach(t => {
        // Pozitif işlemler (Satın alma, hediye, iade)
        if (t.amount > 0) {
            totalCreditsInCirculation += t.amount;
        }
        // Negatif işlemler (Harcama)
        else {
            totalCreditsSpent += Math.abs(t.amount);
        }
      });
  }

  return {
    userCount: userCount || 0,
    totalCreditsInCirculation,
    totalCreditsSpent
  };
}

// 2. KULLANICI LİSTESİ
export async function getUsersList(searchQuery: string = "") {
  let query = supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, credits, created_at, subscription_tier')
    .order('created_at', { ascending: false })
    .limit(50);

  if (searchQuery) {
    query = query.ilike('email', `%${searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// 3. İŞLEM GEÇMİŞİ
export async function getRecentTransactions() {
  const { data, error } = await supabaseAdmin
    .from('credit_transactions')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) throw new Error(error.message);
  return data;
}

// 4. ASKIDAKİ SORUNLAR (Webhook Logs)
export async function getPendingOrders() {
  const { data, error } = await supabaseAdmin
    .from('webhook_logs')
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
}

// 5. MANUEL KREDİ YÖNETİMİ (RPC Çağırır)
export async function adminManageCredits(userId: string, amount: number, reason: string) {
  const { data, error } = await supabaseAdmin.rpc('handle_credit_transaction', {
    p_user_id: userId,
    p_amount: amount, 
    p_process_type: amount > 0 ? 'gift' : 'correction', 
    p_description: `Admin: ${reason}`
  });

  if (error) throw new Error(error.message);
  
  revalidatePath('/dashboard/admin'); // Sayfayı yenile
  return { success: true, data };
}

// 6. SORUN ÇÖZME (Log Arşivleme)
export async function resolvePendingOrder(id: string) {
  const { error } = await supabaseAdmin
    .from('webhook_logs')
    .update({ is_resolved: true })
    .eq('id', id);

  if (error) throw new Error(error.message);
  
  revalidatePath('/dashboard/admin');
  return { success: true };
}