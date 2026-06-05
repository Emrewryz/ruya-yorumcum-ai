"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  Plus, Search, RefreshCw, Pencil, Trash2, Loader2,
  Eye, EyeOff, CheckCircle, Clock, Send, FileJson,
  AlertCircle, Bot, Library, FileText, FlaskConical, Sparkles
} from "lucide-react";
import { getDreamEntries, deleteDreamEntry } from "@/app/actions/cms-actions";
import { createBlogPost } from "@/app/actions/admin-blog-actions";
import { generateDictionaryContent } from "@/app/actions/admin-dictionary-actions";

// ─── Tipler ───────────────────────────────────────────────────────────────────

type MainTab    = "sozluk" | "blog" | "testler";
type DictFilter = "bekliyor" | "taslak" | "yayinda";

interface DictEntry {
  id: string; term: string; slug: string;
  is_published: boolean; published_at: string | null;
  search_count: number; updated_at: string;
  content: any;
}

interface BlogPost {
  id: string; title: string; slug: string;
  is_published: boolean; published_at: string | null;
  created_at: string;
}

interface ViralTest {
  id: string; title: string; slug: string;
  is_published: boolean; created_at: string;
}

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

function isLive(published: boolean, publishedAt: string | null): boolean {
  if (!published || !publishedAt) return false;
  return new Date(publishedAt) <= new Date();
}

function hasContent(entry: DictEntry): boolean {
  return !!entry.content && Object.keys(entry.content).length > 0;
}

function TabBtn({
  active, onClick, icon: Icon, label, badge,
}: {
  active: boolean; onClick: () => void;
  icon: React.ElementType; label: string; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-amber-400 text-zinc-900"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
          active ? "bg-zinc-900 text-amber-400" : "bg-amber-400/20 text-amber-400"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SÖZLÜK SEKMESİ
// ═══════════════════════════════════════════════════════════════════════════════

function SozlukTab() {
  const [entries, setEntries]       = useState<DictEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<DictFilter>("bekliyor");
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [genError, setGenError]     = useState<Record<string, string>>({});
  const [, start]                   = useTransition();

  const fetchEntries = (q = search) => {
    setLoading(true);
    start(async () => {
      const data = await getDreamEntries(q);
      setEntries(data as DictEntry[]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchEntries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchEntries(), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // bekliyor = içerik yok + yayında değil (AI trigger'dan geldi)
  // taslak   = içerik var + yayında değil (admin üretti, henüz yayınlamadı)
  // yayinda  = yayında

  const filtered = entries.filter((e) => {
    const live = isLive(e.is_published, e.published_at);
    if (filter === "bekliyor") return !live && !hasContent(e);
    if (filter === "taslak")   return !live && hasContent(e);
    if (filter === "yayinda")  return live;
    return true;
  });

  const bekliyorCount = entries.filter((e) => !isLive(e.is_published, e.published_at) && !hasContent(e)).length;
  const taslakCount   = entries.filter((e) => !isLive(e.is_published, e.published_at) && hasContent(e)).length;
  const yayindaCount  = entries.filter((e) => isLive(e.is_published, e.published_at)).length;

  async function handleDelete(id: string, term: string) {
    if (!confirm(`"${term}" silinsin mi?`)) return;
    setDeleting(id);
    const res = await deleteDreamEntry(id);
    if (res.success) setEntries((p) => p.filter((x) => x.id !== id));
    setDeleting(null);
  }

  async function handleTogglePublish(entry: DictEntry) {
    setPublishing(entry.id);
    const supabase = createClient();
    const next = !entry.is_published;
    await supabase
      .from("dream_dictionary")
      .update({ is_published: next, published_at: next ? new Date().toISOString() : null })
      .eq("id", entry.id);
    setEntries((p) => p.map((e) =>
      e.id === entry.id
        ? { ...e, is_published: next, published_at: next ? new Date().toISOString() : null }
        : e
    ));
    setPublishing(null);
  }

  async function handleGenerate(entry: DictEntry) {
    setGenerating(entry.id);
    setGenError((prev) => { const n = { ...prev }; delete n[entry.id]; return n; });

    const result = await generateDictionaryContent(entry.id);

    if (!result.success) {
      setGenError((prev) => ({ ...prev, [entry.id]: result.error }));
      setGenerating(null);
    } else {
      // İçerik üretildi — listeyi yenile
      fetchEntries();
      setGenerating(null);
    }
  }

  const filterBtns: { key: DictFilter; label: string; count: number }[] = [
    { key: "bekliyor", label: "İçerik Bekliyor", count: bekliyorCount },
    { key: "taslak",   label: "Taslak",          count: taslakCount   },
    { key: "yayinda",  label: "Yayında",         count: yayindaCount  },
  ];

  return (
    <div>
      {/* Üst bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
          {filterBtns.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === key
                  ? "bg-amber-400 text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${
                  filter === key ? "bg-zinc-900/30 text-zinc-900" : "bg-zinc-700 text-zinc-400"
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchEntries()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <Link
            href="/admin/cms/ruya-ekle"
            className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-zinc-900 hover:bg-amber-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Yeni Madde
          </Link>
        </div>
      </div>

      {/* Açıklama */}
      {filter === "bekliyor" && bekliyorCount > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-800/50 bg-amber-900/20 px-4 py-2.5 text-xs text-amber-400">
          <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          Kullanıcı rüyalarından otomatik oluşturuldu. "AI ile İçerik Üret" ile detay ekleyin, ardından yayınlayın.
        </div>
      )}

      {/* Arama */}
      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-3.5 w-3.5 text-zinc-600" strokeWidth={1.5} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sembol ara..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2 pl-8 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none"
        />
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Sembol</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">İçerik</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Arama</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-600" strokeWidth={1.5} />
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-sm text-zinc-600">
                Bu filtrede içerik yok.
              </td></tr>
            ) : filtered.map((entry) => {
              const live  = isLive(entry.is_published, entry.published_at);
              const hasC  = hasContent(entry);
              const isGen = generating === entry.id;

              return (
                <tr key={entry.id} className="hover:bg-zinc-800/40 transition-colors">

                  {/* Sembol */}
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{entry.term}</p>
                    <p className="text-xs text-zinc-600">{entry.slug}</p>
                  </td>

                  {/* İçerik durumu */}
                  <td className="px-5 py-3.5">
                    {hasC ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800 bg-emerald-900/30 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                        <CheckCircle className="h-3 w-3" strokeWidth={1.5} />
                        Hazır
                      </span>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          onClick={() => handleGenerate(entry)}
                          disabled={isGen}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-amber-400 hover:bg-amber-400 hover:text-zinc-900 transition-all disabled:opacity-50"
                        >
                          {isGen
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />Üretiliyor...</>
                            : <><Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />AI ile İçerik Üret</>
                          }
                        </button>
                        {genError[entry.id] && (
                          <p className="flex items-center gap-1 text-[11px] text-red-400">
                            <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
                            {genError[entry.id]}
                          </p>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Arama sayısı */}
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-amber-400">{entry.search_count ?? 0}</span>
                  </td>

                  {/* İşlemler */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleTogglePublish(entry)}
                        disabled={publishing === entry.id || (!live && !hasC)}
                        title={!hasC ? "Önce içerik üretin" : live ? "Yayından kaldır" : "Yayınla"}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors disabled:opacity-30 ${
                          live
                            ? "border-zinc-700 text-zinc-500 hover:text-white"
                            : "border-emerald-800 text-emerald-500 hover:bg-emerald-900/20"
                        }`}
                      >
                        {publishing === entry.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                          : live
                          ? <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                          : <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                        }
                      </button>
                      <Link
                        href={`/admin/cms/ruya-ekle?id=${entry.id}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-white transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </Link>
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG SEKMESİ
// ═══════════════════════════════════════════════════════════════════════════════

function BlogTab() {
  const [posts, setPosts]             = useState<BlogPost[]>([]);
  const [loading, setLoading]         = useState(true);
  const [rawJson, setRawJson]         = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [status, setStatus]           = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage]         = useState<string | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [, start]                     = useTransition();

  function getLocalNow() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  useEffect(() => {
    setPublishDate(getLocalNow());
    fetchPosts();
  }, []);

  function fetchPosts() {
    setLoading(true);
    start(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, is_published, published_at, created_at")
        .order("created_at", { ascending: false });
      setPosts((data ?? []) as BlogPost[]);
      setLoading(false);
    });
  }

  const jsonValid = (() => {
    if (!rawJson.trim()) return null;
    try { JSON.parse(rawJson); return true; }
    catch { return false; }
  })();

  async function handleSave() {
    if (!rawJson.trim() || jsonValid === false) { setStatus("error"); setMessage("Geçerli JSON girin."); return; }
    setStatus("loading"); setMessage(null);
    const utcIso = new Date(publishDate).toISOString();
    const result = await createBlogPost(rawJson, utcIso);
    if (result.success) {
      setStatus("success"); setMessage(`Eklendi → /blog/${result.slug}`);
      setRawJson(""); setShowForm(false); fetchPosts();
    } else {
      setStatus("error"); setMessage(result.error);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-zinc-500">{posts.length} yazı</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-zinc-900 hover:bg-amber-300 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Blog Ekle
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Yeni Blog Yazısı (JSON)</p>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Yayın Tarihi</label>
            <input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-500">Raw JSON</label>
              {jsonValid === true  && <span className="text-xs text-emerald-400">✓ Geçerli</span>}
              {jsonValid === false && <span className="text-xs text-red-400">✗ Geçersiz</span>}
            </div>
            <textarea value={rawJson} onChange={(e) => setRawJson(e.target.value)} spellCheck={false} rows={10}
              style={{ resize: "none" }}
              className={`w-full rounded-xl border bg-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 focus:outline-none ${
                jsonValid === false ? "border-red-800" : "border-zinc-700 focus:border-zinc-500"
              }`}
              placeholder={`{\n  "title": "Yazı Başlığı",\n  "slug": "yazi-basligi",\n  "excerpt": "Kısa açıklama",\n  "is_published": true,\n  "content": { "blocks": [] }\n}`}
            />
          </div>
          {status === "success" && message && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-900/30 px-4 py-2.5 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />{message}
            </div>
          )}
          {status === "error" && message && (
            <div className="flex items-center gap-2 rounded-xl border border-red-800 bg-red-900/30 px-4 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />{message}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={status === "loading" || jsonValid === false}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-900 hover:bg-amber-300 disabled:opacity-50">
              {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} /> : <Send className="h-3.5 w-3.5" strokeWidth={2} />}
              Kaydet
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors">
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Başlık</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Durum</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {loading ? (
              <tr><td colSpan={3} className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-600" strokeWidth={1.5} /></td></tr>
            ) : posts.map((post) => {
              const live = isLive(post.is_published, post.published_at);
              return (
                <tr key={post.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-white">{post.title}</p>
                    <p className="text-xs text-zinc-600">{post.slug}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                      live ? "border-emerald-700 bg-emerald-900/30 text-emerald-400" : "border-zinc-700 bg-zinc-800 text-zinc-500"
                    }`}>
                      {live ? <Eye className="h-3 w-3" strokeWidth={1.5} /> : <Clock className="h-3 w-3" strokeWidth={1.5} />}
                      {live ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-500">
                    {new Date(post.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTLER SEKMESİ
// ═══════════════════════════════════════════════════════════════════════════════

function TestlerTab() {
  const [tests, setTests]       = useState<ViralTest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [rawJson, setRawJson]   = useState("");
  const [status, setStatus]     = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage]   = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchTests(); }, []);

  function fetchTests() {
    setLoading(true);
    const supabase = createClient();
    supabase.from("viral_tests")
      .select("id, title, slug, is_published, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTests((data ?? []) as ViralTest[]);
        setLoading(false);
      });
  }

  const jsonValid = (() => {
    if (!rawJson.trim()) return null;
    try { JSON.parse(rawJson); return true; }
    catch { return false; }
  })();

  async function handleSave() {
    if (!rawJson.trim() || jsonValid === false) { setStatus("error"); setMessage("Geçerli JSON girin."); return; }
    setStatus("loading"); setMessage(null);
    let parsed: any;
    try { parsed = JSON.parse(rawJson); } catch { setStatus("error"); setMessage("JSON parse hatası."); return; }
    if (!parsed.title || !parsed.slug || !parsed.content?.questions?.length) {
      setStatus("error"); setMessage("title, slug ve content.questions zorunlu."); return;
    }
    const supabase = createClient();
    const { error } = await supabase.from("viral_tests").insert({
      title: parsed.title.trim(), slug: parsed.slug.trim(),
      description: parsed.description ?? null,
      is_published: parsed.is_published ?? false,
      content: { questions: parsed.content.questions, results: parsed.content.results ?? [] },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message.includes("duplicate") ? `'${parsed.slug}' slug'ı zaten var.` : error.message);
    } else {
      setStatus("success"); setMessage(`Test eklendi → /testler/${parsed.slug}`);
      setRawJson(""); setShowForm(false); fetchTests();
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-zinc-500">{tests.length} test</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-zinc-900 hover:bg-amber-300 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Test Ekle
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Yeni Viral Test (JSON)</p>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                <FileJson className="h-3.5 w-3.5" strokeWidth={1.5} /> Raw JSON
              </label>
              {jsonValid === true  && <span className="text-xs text-emerald-400">✓ Geçerli</span>}
              {jsonValid === false && <span className="text-xs text-red-400">✗ Geçersiz</span>}
            </div>
            <textarea value={rawJson} onChange={(e) => setRawJson(e.target.value)} spellCheck={false} rows={12}
              style={{ resize: "none" }}
              className={`w-full rounded-xl border bg-zinc-800 px-4 py-3 font-mono text-xs text-zinc-300 focus:outline-none ${
                jsonValid === false ? "border-red-800" : "border-zinc-700 focus:border-zinc-500"
              }`}
              placeholder={`{\n  "title": "Test Adı",\n  "slug": "test-adi",\n  "is_published": true,\n  "content": {\n    "questions": [],\n    "results": []\n  }\n}`}
            />
          </div>
          {status === "success" && message && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-900/30 px-4 py-2.5 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.5} />{message}
            </div>
          )}
          {status === "error" && message && (
            <div className="flex items-center gap-2 rounded-xl border border-red-800 bg-red-900/30 px-4 py-2.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} />{message}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={status === "loading" || jsonValid === false}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-900 hover:bg-amber-300 disabled:opacity-50">
              {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} /> : <Send className="h-3.5 w-3.5" strokeWidth={2} />}
              Kaydet
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:text-white transition-colors">
              İptal
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Test</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Durum</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {loading ? (
              <tr><td colSpan={3} className="py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-600" strokeWidth={1.5} /></td></tr>
            ) : tests.map((test) => (
              <tr key={test.id} className="hover:bg-zinc-800/40 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{test.title}</p>
                  <p className="text-xs text-zinc-600">{test.slug}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                    test.is_published ? "border-emerald-700 bg-emerald-900/30 text-emerald-400" : "border-zinc-700 bg-zinc-800 text-zinc-500"
                  }`}>
                    {test.is_published ? <Eye className="h-3 w-3" strokeWidth={1.5} /> : <Clock className="h-3 w-3" strokeWidth={1.5} />}
                    {test.is_published ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-zinc-500">
                  {new Date(test.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANA HUB SAYFASI
// ═══════════════════════════════════════════════════════════════════════════════

export default function IcerikMerkeziPage() {
  const [tab, setTab] = useState<MainTab>("sozluk");

  const tabs = [
    { key: "sozluk"  as MainTab, icon: Library,     label: "Rüya Sözlüğü" },
    { key: "blog"    as MainTab, icon: FileText,     label: "Blog"          },
    { key: "testler" as MainTab, icon: FlaskConical, label: "Testler"       },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">İçerik Merkezi</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Sözlük, blog yazıları ve testleri tek yerden yönet.</p>
      </div>

      <div className="mb-7 flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 w-fit">
        {tabs.map(({ key, icon, label }) => (
          <TabBtn
            key={key}
            active={tab === key}
            onClick={() => setTab(key)}
            icon={icon}
            label={label}
          />
        ))}
      </div>

      {tab === "sozluk"  && <SozlukTab  />}
      {tab === "blog"    && <BlogTab    />}
      {tab === "testler" && <TestlerTab />}
    </div>
  );
}