"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, RefreshCw, Pencil, Trash2,
  Loader2, Eye, EyeOff, CheckCircle, Clock
} from "lucide-react";
import { getDreamEntries, deleteDreamEntry } from "@/app/actions/cms-actions";
import { createClient } from "@/utils/supabase/client";

interface Entry {
  id:           string;
  term:         string;
  slug:         string;
  is_published: boolean;
  published_at: string | null;
  search_count: number;
  updated_at:   string;
}

type Tab = "all" | "pending";

export default function AdminCmsPage() {
  const [entries, setEntries]   = useState<Entry[]>([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending"); // Önce bekleyenleri göster
  const [, start]               = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  const fetchEntries = (q = search) => {
    setLoading(true);
    start(async () => {
      try {
        const data = await getDreamEntries(q);
        setEntries(data as Entry[]);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    const t = setTimeout(() => fetchEntries(), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleDelete(id: string, term: string) {
    if (!confirm(`"${term}" silinsin mi?`)) return;
    setDeleting(id);
    const res = await deleteDreamEntry(id);
    if (res.success) setEntries((e) => e.filter((x) => x.id !== id));
    setDeleting(null);
  }

  // ── Yayınla / Geri al ──
  async function handleTogglePublish(entry: Entry) {
    setPublishing(entry.id);
    const supabase = createClient();

    const { error } = await supabase
      .from("dream_dictionary")
      .update({
        is_published: !entry.is_published,
        published_at: !entry.is_published ? new Date().toISOString() : null,
      })
      .eq("id", entry.id);

    if (!error) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? { ...e, is_published: !e.is_published, published_at: !e.is_published ? new Date().toISOString() : null }
            : e
        )
      );
    }
    setPublishing(null);
  }

  function isLive(entry: Entry): boolean {
    if (!entry.is_published || !entry.published_at) return false;
    return new Date(entry.published_at) <= new Date();
  }

  // ── Sekme filtresi ──
  const filtered = entries.filter((e) =>
    activeTab === "pending" ? !isLive(e) : true
  );

  const pendingCount   = entries.filter((e) => !isLive(e)).length;
  const publishedCount = entries.filter((e) => isLive(e)).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">İçerik Yönetimi</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {entries.length} kayıt —{" "}
            <span className="text-emerald-400">{publishedCount} yayında</span>,{" "}
            <span className="text-amber-400">{pendingCount} onay bekliyor</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEntries()}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <Link
            href="/admin/cms/ruya-ekle"
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-amber-300 transition-colors"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Yeni Ekle
          </Link>
        </div>
      </div>

      {/* ── Sekmeler ── */}
      <div className="mb-5 flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "pending"
              ? "bg-amber-400 text-zinc-900"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          Onay Bekleyenler
          {pendingCount > 0 && (
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              activeTab === "pending" ? "bg-zinc-900 text-amber-400" : "bg-amber-400/20 text-amber-400"
            }`}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "all"
              ? "bg-zinc-700 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Tümü ({entries.length})
        </button>
      </div>

      {/* ── Arama ── */}
      <div className="relative mb-5 max-w-sm">
        <Search
          className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-zinc-600"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sembol ara..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none transition-colors"
        />
      </div>

      {/* ── Onay Bekleyenler Uyarısı ── */}
      {activeTab === "pending" && pendingCount > 0 && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-800/50 bg-amber-900/20 px-4 py-3 text-xs text-amber-400">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          <span>
            Bu maddeler AI tarafından otomatik üretildi. İçeriği kontrol edip onaylayın veya silin.
            Onaylanana kadar Google'a sızmaz.
          </span>
        </div>
      )}

      {/* ── Tablo ── */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Sembol</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Durum</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Yayın Tarihi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Arama</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-600" strokeWidth={1.5} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-600">
                  {activeTab === "pending"
                    ? "Onay bekleyen madde yok. "
                    : search ? "Sonuç bulunamadı." : "Henüz içerik yok."
                  }
                </td>
              </tr>
            ) : (
              filtered.map((entry) => {
                const live = isLive(entry);
                return (
                  <tr key={entry.id} className="hover:bg-zinc-800/40 transition-colors">

                    {/* Sembol */}
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">{entry.term}</p>
                      <p className="text-xs text-zinc-600">{entry.slug}</p>
                    </td>

                    {/* Durum */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        live
                          ? "border-emerald-700 bg-emerald-900/30 text-emerald-400"
                          : "border-amber-700/50 bg-amber-900/20 text-amber-400"
                      }`}>
                        {live
                          ? <><Eye className="h-3 w-3" strokeWidth={1.5} />Yayında</>
                          : <><Clock className="h-3 w-3" strokeWidth={1.5} />Onay Bekliyor</>
                        }
                      </span>
                    </td>

                    {/* Yayın tarihi */}
                    <td className="px-5 py-3.5 text-xs text-zinc-500">
                      {entry.published_at
                        ? new Date(entry.published_at).toLocaleString("tr-TR", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })
                        : "—"}
                    </td>

                    {/* Arama sayısı */}
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-amber-400">{entry.search_count ?? 0}</span>
                    </td>

                    {/* İşlemler */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">

                        {/* Yayınla / Geri al */}
                        <button
                          onClick={() => handleTogglePublish(entry)}
                          disabled={publishing === entry.id}
                          title={live ? "Yayından kaldır" : "Yayınla"}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors disabled:opacity-50 ${
                            live
                              ? "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-white"
                              : "border-emerald-800 text-emerald-500 hover:border-emerald-500 hover:bg-emerald-900/20"
                          }`}
                        >
                          {publishing === entry.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                            : live
                            ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                            : <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                          }
                        </button>

                        {/* Düzenle */}
                        <Link
                          href={`/admin/cms/ruya-ekle?id=${entry.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-white transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Link>

                        {/* Sil */}
                        <button
                          onClick={() => handleDelete(entry.id, entry.term)}
                          disabled={deleting === entry.id}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 hover:border-red-700 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          {deleting === entry.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                            : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          }
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}