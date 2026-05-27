import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { DashboardSkeleton, StatCardSkeleton } from "@/components/Skeleton";

// ─── Stat Kartları — ayrı async component ────────────────────────────────────

async function StatCards() {
  const supabase = createClient();

  const [
    { count: totalUsers },
    { count: totalDreams },
    { count: unclaimedPins },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("dreams").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "unclaimed"),
  ]);

  const stats = [
    { label: "Toplam Kullanıcı", value: totalUsers ?? 0, color: "text-blue-400" },
    { label: "Toplam Analiz",    value: totalDreams ?? 0, color: "text-violet-400" },
    { label: "Bekleyen E-Pin",   value: unclaimedPins ?? 0, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 min-h-[96px]">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {stat.label}
          </p>
          <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
            {stat.value.toLocaleString("tr-TR")}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Son Kayıtlar — ayrı async component ─────────────────────────────────────

async function RecentUsers() {
  const supabase = createClient();
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("email, credits, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 min-h-[200px]">
      <h2 className="mb-4 text-sm font-semibold text-white">Son Kayıt Olan Kullanıcılar</h2>
      {!recentUsers?.length ? (
        <p className="text-sm text-zinc-600">Henüz kullanıcı yok.</p>
      ) : (
        <div className="space-y-3">
          {recentUsers.map((u: any) => (
            <div key={u.email} className="flex items-center justify-between min-h-[24px]">
              <span className="text-sm text-zinc-400 truncate max-w-[250px]">{u.email}</span>
              <div className="flex items-center gap-4 text-xs text-zinc-600 shrink-0">
                <span className="font-medium text-amber-400">{u.credits} kredi</span>
                <span>{new Date(u.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sayfa — iskelet anında, veri stream ile gelir ───────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Başlık — veri beklemiyor, anında render */}
      <div className="min-h-[52px]">
        <h1 className="text-xl font-bold text-white">Genel Bakış</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Sistem özeti</p>
      </div>

      {/* Stat kartları — veri gelene kadar skeleton */}
      <Suspense fallback={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1,2,3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <StatCards />
      </Suspense>

      {/* Son kayıtlar — bağımsız stream */}
      <Suspense fallback={
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 min-h-[200px]">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-48 rounded bg-zinc-800" />
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-48 rounded bg-zinc-800" />
                <div className="h-3 w-16 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
        </div>
      }>
        <RecentUsers />
      </Suspense>

    </div>
  );
}