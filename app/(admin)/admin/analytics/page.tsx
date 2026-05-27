import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { TrendingUp, MessageSquare } from "lucide-react";
import { AnalyticsSkeleton } from "@/components/Skeleton";

// ─── Sembol Tablosu — async ───────────────────────────────────────────────────

async function TopSymbols() {
  const supabase = createClient();

  const { data: topSymbols } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, search_count, is_published")
    .order("search_count", { ascending: false })
    .limit(20);

  const totalSearches = (topSymbols ?? []).reduce(
    (sum, s) => sum + (s.search_count ?? 0), 0
  );
  const maxCount = topSymbols?.[0]?.search_count ?? 1;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-white">En Çok Aranan Semboller</h2>
        <span className="ml-auto text-xs text-zinc-600">
          {totalSearches.toLocaleString("tr-TR")} toplam arama
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 min-h-[400px]">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="w-8 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Sembol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Popülerlik</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">Arama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {!topSymbols?.length ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-zinc-600">Veri yok.</td>
              </tr>
            ) : (
              topSymbols.map((symbol, i) => {
                const pct = Math.round(((symbol.search_count ?? 0) / maxCount) * 100);
                return (
                  <tr key={symbol.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-xs text-zinc-600 tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{symbol.term}</span>
                        {!symbol.is_published && (
                          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">taslak</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* min-w ile CLS önlenir */}
                        <div className="h-1.5 w-32 min-w-[128px] overflow-hidden rounded-full bg-zinc-800">
                          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-zinc-600">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-amber-400">
                        {(symbol.search_count ?? 0).toLocaleString("tr-TR")}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── AI Logları — async ───────────────────────────────────────────────────────

async function RecentChats() {
  const supabase = createClient();
  const { data: recentChats } = await supabase
    .from("dream_chat_messages")
    .select("id, content, role, created_at")
    .eq("role", "user")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-violet-400" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-white">Son Yapay Zeka Sorguları</h2>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 min-h-[160px]">
        {!recentChats?.length ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <MessageSquare className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
            <p className="text-sm text-zinc-600">Henüz sorgulama yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentChats.map((chat) => (
              <div key={chat.id} className="min-h-[56px] px-5 py-3.5 hover:bg-zinc-800/30 transition-colors">
                <p className="text-sm text-zinc-300 line-clamp-2">{chat.content}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  {new Date(chat.created_at).toLocaleString("tr-TR", {
                    day: "numeric", month: "short",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Başlık — anında render */}
      <div className="min-h-[52px]">
        <h1 className="text-xl font-bold text-white">Analitik & Loglar</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Sistem kullanım özeti</p>
      </div>

      {/* Semboller — bağımsız stream */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <TopSymbols />
      </Suspense>

      {/* AI Logları — bağımsız stream */}
      <Suspense fallback={
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 min-h-[160px] animate-pulse" />
      }>
        <RecentChats />
      </Suspense>

    </div>
  );
}