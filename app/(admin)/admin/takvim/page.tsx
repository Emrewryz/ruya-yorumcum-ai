import { createClient } from "@/utils/supabase/server";
import { Calendar, Clock } from "lucide-react";

export default async function AdminTakvimPage() {
  const supabase = createClient();

  const { data: entries } = await supabase
    .from("dream_dictionary")
    .select("id, term, slug, is_published, published_at, created_at")
    .order("published_at", { ascending: false })
    .limit(100);

  const now = new Date();

  const planned   = (entries ?? []).filter((e) => e.published_at && new Date(e.published_at) > now);
  const published = (entries ?? []).filter((e) => !e.published_at || new Date(e.published_at) <= now);

  return (
    <div className="p-6 lg:p-8">

      {/* Başlık */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-white">Yayın Takvimi</h1>
        <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {planned.length} planlandı
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {published.length} yayında
          </span>
        </div>
      </div>

      {/* ── Planlanmış İçerikler ── */}
      {planned.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-white">Planlanmış</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <Table entries={planned} now={now} />
          </div>
        </section>
      )}

      {/* ── Yayındaki İçerikler ── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-white">Yayında</h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <Table entries={published} now={now} />
        </div>
      </section>

    </div>
  );
}

// ─── Tablo ────────────────────────────────────────────────────────────────────

function Table({
  entries, now,
}: {
  entries: any[];
  now: Date;
}) {
  if (entries.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-zinc-600 bg-zinc-900/50">
        İçerik yok.
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="border-b border-zinc-800 bg-zinc-900">
        <tr>
          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Sembol</th>
          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Yayın Tarihi</th>
          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Durum</th>
          <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kalan / Geçen</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
        {entries.map((entry) => {
          const pubDate   = entry.published_at ? new Date(entry.published_at) : null;
          const isPlanned = pubDate ? pubDate > now : false;
          const diffMs    = pubDate ? Math.abs(pubDate.getTime() - now.getTime()) : 0;
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays  = Math.floor(diffHours / 24);

          const diffLabel = diffDays > 0
            ? `${diffDays} gün ${isPlanned ? "sonra" : "önce"}`
            : diffHours > 0
            ? `${diffHours} saat ${isPlanned ? "sonra" : "önce"}`
            : isPlanned ? "Az kaldı" : "Bugün";

          return (
            <tr key={entry.id} className="hover:bg-zinc-800/40 transition-colors">
              <td className="px-5 py-3.5">
                <p className="font-medium text-white">{entry.term}</p>
                <p className="text-xs text-zinc-600">/ruya-tabirleri/{entry.slug}</p>
              </td>
              <td className="px-5 py-3.5 text-sm text-zinc-400">
                {pubDate
                  ? pubDate.toLocaleString("tr-TR", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })
                  : "—"}
              </td>
              <td className="px-5 py-3.5">
                {isPlanned ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-700 bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    Planlandı
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700 bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Yayında
                  </span>
                )}
              </td>
              <td className="px-5 py-3.5 text-xs text-zinc-600">
                {diffLabel}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}