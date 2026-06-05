import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import AdminDashboardClient from "./AdminDashboardClient";

// ─── Tipler ───────────────────────────────────────────────────────────────────

export interface DashboardData {
  // Stat kartları
  totalUsers:       number;
  todayUsers:       number;
  totalDreams:      number;
  todayDreams:      number;
  unlockRate:       number;
  totalImages:      number;
  // Kredi ekonomisi
  totalCredits:     number;
  avgCredits:       number;
  // 7 günlük grafik
  weeklyChart:      { date: string; count: number }[];
  // Son aktivite
  recentUsers:      { id: string; email: string; created_at: string; credits: number }[];
  recentDreams:     { id: string; dream_text: string; created_at: string; has_image: boolean }[];
}

// ─── Veri Çekme ───────────────────────────────────────────────────────────────

async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  const weekAgoISO = weekAgo.toISOString();

  const [
    usersRes, todayUsersRes,
    dreamsRes, todayDreamsRes,
    unlockedRes, imagesRes,
    creditsRes,
    weeklyRes,
    recentUsersRes, recentDreamsRes,
  ] = await Promise.all([
    // Toplam kullanıcı
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    // Bugün kayıt
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
    // Toplam analiz
    supabase.from("dreams").select("id", { count: "exact", head: true }).eq("status", "completed"),
    // Bugün analiz
    supabase.from("dreams").select("id", { count: "exact", head: true }).eq("status", "completed").gte("created_at", todayISO),
    // Kilit açılan
    supabase.from("dreams").select("id", { count: "exact", head: true })
      .or("detay_unlocked.eq.true,islami_unlocked.eq.true"),
    // Görsel üretilen
    supabase.from("dreams").select("id", { count: "exact", head: true }).not("image_url", "is", null),
    // Kredi ekonomisi
    supabase.from("profiles").select("credits"),
    // Son 7 gün analiz (grafik)
    supabase.from("dreams").select("created_at").eq("status", "completed").gte("created_at", weekAgoISO).order("created_at"),
    // Son kullanıcılar
    supabase.from("profiles").select("id, email, created_at, credits").order("created_at", { ascending: false }).limit(5),
    // Son rüyalar
    supabase.from("dreams").select("id, dream_text, created_at, image_url").eq("status", "completed").order("created_at", { ascending: false }).limit(5),
  ]);

  // Kilit açma oranı
  const totalD   = dreamsRes.count ?? 0;
  const unlocked = unlockedRes.count ?? 0;
  const unlockRate = totalD > 0 ? Math.round((unlocked / totalD) * 100) : 0;

  // Kredi istatistikleri
  const creditsArr  = (creditsRes.data ?? []).map((p: any) => p.credits ?? 0);
  const totalCredits = creditsArr.reduce((a: number, b: number) => a + b, 0);
  const avgCredits   = creditsArr.length > 0 ? Math.round(totalCredits / creditsArr.length) : 0;

  // 7 günlük grafik — gün gün grupla
  const days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    days.push({ date: label, count: 0 });
  }

  (weeklyRes.data ?? []).forEach((row: any) => {
    const d     = new Date(row.created_at);
    const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    const found = days.find((x) => x.date === label);
    if (found) found.count++;
  });

  return {
    totalUsers:    usersRes.count       ?? 0,
    todayUsers:    todayUsersRes.count   ?? 0,
    totalDreams:   dreamsRes.count       ?? 0,
    todayDreams:   todayDreamsRes.count  ?? 0,
    unlockRate,
    totalImages:   imagesRes.count       ?? 0,
    totalCredits,
    avgCredits,
    weeklyChart:   days,
    recentUsers:   (recentUsersRes.data  ?? []) as DashboardData["recentUsers"],
recentDreams: (recentDreamsRes.data ?? []).map((d: any) => ({
  id:         d.id,
  dream_text: d.dream_text,
  created_at: d.created_at,
  has_image:  !!d.image_url,   // ← image_url'den türet
})),  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-zinc-800" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-zinc-800" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-zinc-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl bg-zinc-800" />
        <div className="h-64 rounded-2xl bg-zinc-800" />
      </div>
    </div>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

async function DashboardContent() {
  const data = await fetchDashboardData();
  return <AdminDashboardClient data={data} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}