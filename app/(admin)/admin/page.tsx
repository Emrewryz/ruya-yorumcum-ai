import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Özet istatistikler
  const [
    { count: totalUsers },
    { count: totalDreams },
    { count: unclaimedPins },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("dreams").select("*", { count: "exact", head: true }),
    supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "unclaimed"),
    supabase.from("profiles").select("email, credits, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Toplam Kullanıcı", value: totalUsers ?? 0, color: "text-blue-400" },
    { label: "Toplam Analiz", value: totalDreams ?? 0, color: "text-violet-400" },
    { label: "Bekleyen E-Pin", value: unclaimedPins ?? 0, color: "text-amber-400" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Genel Bakış</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Sistem özeti</p>
      </div>

      {/* İstatistik kartları */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color}`}>
              {stat.value.toLocaleString("tr-TR")}
            </p>
          </div>
        ))}
      </div>

      {/* Son kayıtlar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Son Kayıt Olan Kullanıcılar</h2>
        <div className="space-y-3">
          {(recentUsers ?? []).map((u: any) => (
            <div key={u.email} className="flex items-center justify-between">
              <span className="text-sm text-zinc-400 truncate max-w-[250px]">{u.email}</span>
              <div className="flex items-center gap-4 text-xs text-zinc-600">
                <span className="text-amber-400 font-medium">{u.credits} kredi</span>
                <span>{new Date(u.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}