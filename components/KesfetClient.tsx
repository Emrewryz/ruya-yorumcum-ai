"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Download } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import MobileNavWrapper from "@/components/MobileNavWrapper";

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface PublicDream {
  id:          string;
  dream_title: string | null;
  dream_text:  string;
  image_url:   string;
  category:    string | null;
  tags:        string[] | null;
  slug:        string | null;
  created_at:  string;
}

const CATEGORIES = ["Tümü", "Mistik", "Korku", "Kabus", "Fantastik", "Günlük", "Romantik", "Macera"];

const CATEGORY_COLORS: Record<string, string> = {
  Mistik:    "bg-violet-100 text-violet-700",
  Korku:     "bg-red-100 text-red-700",
  Kabus:     "bg-orange-100 text-orange-700",
  Fantastik: "bg-sky-100 text-sky-700",
  Günlük:    "bg-zinc-100 text-zinc-600",
  Romantik:  "bg-pink-100 text-pink-700",
  Macera:    "bg-amber-100 text-amber-700",
};

// ─── Kart — Lightbox yok, Link ile detay sayfasına git ───────────────────────

function DreamCard({ dream }: { dream: PublicDream }) {
  const color = CATEGORY_COLORS[dream.category ?? ""] ?? "bg-zinc-100 text-zinc-600";
  const href  = dream.slug ? `/kesfet/${dream.slug}` : null;

  function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const a    = document.createElement("a");
    a.href     = dream.image_url;
    a.target   = "_blank";
    a.download = `ruya-${dream.id}.webp`;
    a.click();
  }

  const CardContent = (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">

      {/* Görsel */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 min-h-[200px]">
        <Image
          src={dream.image_url}
          alt={`${dream.dream_title ?? dream.dream_text.slice(0, 50)} - ${dream.category ?? "Rüya"} Görseli | Rüya Yorumcum`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
          loading="lazy"
          decoding="async"
        />

        {/* Kategori */}
        {dream.category && (
          <div className="absolute left-3 top-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>
              {dream.category}
            </span>
          </div>
        )}

        {/* İndir */}
        <button
          onClick={handleDownload}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/70"
          title="İndir"
        >
          <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Bilgi */}
      <div className="p-4">
        <p className="mb-2 line-clamp-2 text-sm font-medium text-zinc-800 leading-snug">
          {dream.dream_title || dream.dream_text.slice(0, 60)}
        </p>
        {dream.tags && dream.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {dream.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-500">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-zinc-400">
          {new Date(dream.created_at).toLocaleDateString("tr-TR", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </p>
      </div>
    </div>
  );

  // Slug varsa Link, yoksa div
  if (href) {
    return <Link href={href}>{CardContent}</Link>;
  }
  return <div>{CardContent}</div>;
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export default function KesfetClient({ dreams }: { dreams: PublicDream[] }) {
  const router                              = useRouter();
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [sort, setSort]                     = useState<"yeni" | "eski">("yeni");

  const filtered = dreams
    .filter((d) => activeCategory === "Tümü" ? true : d.category === activeCategory)
    .sort((a, b) =>
      sort === "yeni"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  return (
    <div className="flex overflow-hidden bg-white" style={{ height: "100dvh" }}>
      <AppSidebar
        activeChatId={null}
        onSelectChat={(id) => router.push(`/?chat=${id}`)}
        onNewChat={() => router.push("/")}
        refreshTrigger={0}
      />
      <MobileNavWrapper />

      <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="mx-auto max-w-5xl px-5 py-8 pb-28 md:pb-10">

          {/* Başlık */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-2">
              <Compass className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Rüyaları Keşfet</h1>
            </div>
            <p className="text-sm text-zinc-500">
              Topluluktan yapay zeka ile görselleştirilmiş rüyalar.
              {dreams.length > 0 && ` ${dreams.length} görsel mevcut.`}
            </p>
          </div>

          {/* Filtre + Sıralama */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
              <div className="flex min-w-max gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      activeCategory === cat
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-zinc-400">Sırala:</span>
              {(["yeni", "eski"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    sort === s
                      ? "bg-zinc-900 text-white"
                      : "border border-zinc-200 text-zinc-500 hover:border-zinc-400"
                  }`}
                >
                  {s === "yeni" ? "En Yeni" : "En Eski"}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Compass className="h-10 w-10 text-zinc-200" strokeWidth={1} />
              <p className="font-medium text-zinc-600">
                {activeCategory === "Tümü"
                  ? "Henüz paylaşılmış rüya yok."
                  : `${activeCategory} kategorisinde paylaşılan rüya yok.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((dream) => (
                <DreamCard key={dream.id} dream={dream} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}