"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toggleDreamPublic } from "@/app/actions/dream-slug-action";
import AppSidebar from "@/components/AppSidebar";
import GlobalMobileNav from "@/components/GlobalMobileNav";

import {
  Loader2, ImageIcon, Globe, Lock,
  Download, X, ZoomIn, Gift
} from "lucide-react";

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface DreamImageRow {
  id:          string; // dream_images.id
  dream_id:    string;
  image_url:   string;
  is_public:   boolean;
  is_rewarded: boolean;
  slug:        string | null;
  category:    string | null;
  tags:        string[] | null;
  dream_title: string | null;
  dream_text:  string;
  created_at:  string;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ row, onClose }: { row: DreamImageRow; onClose: () => void }) {
  function handleDownload() {
    const a    = document.createElement("a");
    a.href     = row.image_url;
    a.target   = "_blank";
    a.download = `ruya-${row.id}.webp`;
    a.click();
  }

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-4 z-50 flex flex-col items-center justify-center gap-4 md:inset-8">
        <div className="relative w-full max-w-2xl aspect-square overflow-hidden rounded-2xl shadow-2xl">
          <Image src={row.image_url} alt={row.dream_title ?? "Rüya görseli"} fill className="object-contain" unoptimized priority />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors shadow-lg">
            <Download className="h-4 w-4" strokeWidth={1.5} /> İndir
          </button>
          <button onClick={onClose} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
            <X className="h-4 w-4" strokeWidth={1.5} /> Kapat
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Public Toggle ────────────────────────────────────────────────────────────

function PublicToggle({ row, onToggle }: { row: DreamImageRow; onToggle: (id: string, val: boolean, rewarded: boolean) => void }) {
  const [isPending, start]              = useTransition();
  const [local, setLocal]               = useState(row.is_public);
  const [justRewarded, setJustRewarded] = useState(false);
  useEffect(() => {
  setLocal(row.is_public);
}, [row.is_public]);

  function handleToggle() {
    const next = !local;
    setLocal(next);
    start(async () => {
      const res = await toggleDreamPublic(row.dream_id, next);
      if (!res.success) { setLocal(!next); return; }
      if (res.rewarded && !row.is_rewarded) {
        setJustRewarded(true);
        setTimeout(() => setJustRewarded(false), 3000);
      }
      onToggle(row.id, next, res.rewarded);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {justRewarded && (
        <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 animate-in fade-in duration-300">
          <Gift className="h-3 w-3" strokeWidth={1.5} /> +1 Kredi!
        </span>
      )}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all disabled:opacity-50 ${
          local ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
        }`}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} /> : local ? <Globe className="h-3 w-3" strokeWidth={1.5} /> : <Lock className="h-3 w-3" strokeWidth={1.5} />}
        {local ? "Herkese Açık" : "Gizli"}
      </button>
    </div>
  );
}

// ─── Kart ─────────────────────────────────────────────────────────────────────

function DreamImageCard({ row, onToggle, onOpen }: { row: DreamImageRow; onToggle: (id: string, val: boolean, rewarded: boolean) => void; onOpen: (r: DreamImageRow) => void }) {
  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    const a    = document.createElement("a");
    a.href     = row.image_url;
    a.target   = "_blank";
    a.download = `ruya-${row.id}.webp`;
    a.click();
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-md">
      <div className="relative aspect-square w-full cursor-pointer overflow-hidden bg-zinc-100" onClick={() => onOpen(row)}>
        <Image src={row.image_url} alt={row.dream_title ?? "Rüya görseli"} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized loading="lazy" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/20">
          <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
        </div>
        {row.category && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">{row.category}</span>
          </div>
        )}
        <button onClick={handleDownload} className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70" title="İndir">
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-4">
        <p className="mb-2 line-clamp-1 text-sm font-semibold text-zinc-900">
          {row.dream_title || row.dream_text.slice(0, 50)}
        </p>
        {row.tags && row.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {row.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-500">#{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-zinc-400 shrink-0">
            {new Date(row.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
          </p>
          <PublicToggle row={row} onToggle={onToggle} />
        </div>
        {!row.is_rewarded && !row.is_public && (
          <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
            <Gift className="h-3 w-3 shrink-0" strokeWidth={1.5} />
            Herkese açarsan +1 kredi kazan!
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function GalerimPage() {
  const router              = useRouter();
  const [rows, setRows]     = useState<DreamImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<DreamImageRow | null>(null);

  useEffect(() => {
    const load = async () => {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      // Önce dream_images çek
      const { data: images } = await supabase
        .from("dream_images")
        .select("id, dream_id, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!images || images.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      // Sonra ilgili dream'leri çek
      const dreamIds = [...new Set(images.map((i) => i.dream_id))];
      const { data: dreams } = await supabase
        .from("dreams")
        .select("id, dream_title, dream_text, is_public, is_rewarded, slug, category, tags")
        .in("id", dreamIds);

      const dreamMap = Object.fromEntries((dreams ?? []).map((d) => [d.id, d]));

      const mapped: DreamImageRow[] = images.map((img) => {
        const dream = dreamMap[img.dream_id] ?? {};
        return {
          id:          img.id,
          dream_id:    img.dream_id,
          image_url:   img.image_url,
          created_at:  img.created_at,
          dream_title: dream.dream_title ?? null,
          dream_text:  dream.dream_text ?? "",
          is_public:   dream?.is_public === true,  // undefined → false

          is_rewarded: dream.is_rewarded ?? false,
          slug:        dream.slug ?? null,
          category:    dream.category ?? null,
          tags:        dream.tags ?? null,
        };
      });

      setRows(mapped);
      setLoading(false);
    };
    load();
  }, []);

  function handleToggle(id: string, val: boolean, rewarded: boolean) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, is_public: val, is_rewarded: rewarded } : r));
  }

  return (
    <div className="flex overflow-hidden bg-white" style={{ height: "100dvh" }}>
      <AppSidebar activeChatId={null} onSelectChat={(id) => router.push(`/?chat=${id}`)} onNewChat={() => router.push("/")} refreshTrigger={0} />
      <GlobalMobileNav />

      <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div
    className="md:hidden shrink-0"
    style={{ height: "calc(3.5rem + env(safe-area-inset-top))" }}
  />
        <div className="mx-auto max-w-4xl px-5 py-8 pb-10 md:pb-10">

          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-1">
              <ImageIcon className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
              <h1 className="text-xl font-semibold text-zinc-900">Rüya Galerim</h1>
            </div>
            <p className="text-sm text-zinc-500">
              Görselleştirdiğiniz rüyalar. Herkese açık yaparak +1 kredi kazanın.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" strokeWidth={1.5} />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
              <ImageIcon className="h-10 w-10 text-zinc-200" strokeWidth={1} />
              <div>
                <p className="font-medium text-zinc-700">Henüz görselleştirilmiş rüya yok</p>
                <p className="mt-1 text-sm text-zinc-400">Bir rüyayı analiz et ve "Rüyayı Görselleştir" butonuna bas.</p>
              </div>
              <button onClick={() => router.push("/")} className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Rüya Analiz Et
              </button>
            </div>
          ) : (
            <>
              <p className="mb-5 text-sm text-zinc-400">
                {rows.length} görsel
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                  <DreamImageCard key={row.id} row={row} onToggle={handleToggle} onOpen={setLightbox} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {lightbox && <Lightbox row={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}