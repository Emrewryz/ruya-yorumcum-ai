"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, Eye, Save } from "lucide-react";
import { saveDreamEntry } from "@/app/actions/cms-actions";

// ─── Türkçe → Slug ────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  const map: Record<string, string> = {
    ç:"c", Ç:"c", ğ:"g", Ğ:"g", ı:"i", İ:"i",
    ö:"o", Ö:"o", ş:"s", Ş:"s", ü:"u", Ü:"u",
  };
  return text
    .split("").map((c) => map[c] ?? c).join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── Şu anki zaman — datetime-local formatında (LOCAL saat) ──────────────────

function nowLocal(): string {
  const now = new Date();
  // datetime-local için offset düzeltmesi
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

// ─── datetime-local → UTC ISO (Timezone güvenli) ────────────────────────────
// datetime-local değeri "2026-05-27T05:00" formatında gelir — timezone bilgisi YOK.
// new Date("2026-05-27T05:00") → tarayıcı UTC olarak parse eder, yanlış!
// Çözüm: değeri yerel saat olarak yorumla, UTC'ye çevir.

function localDatetimeToUTC(localValue: string): string {
  if (!localValue) return new Date().toISOString();
  // "YYYY-MM-DDTHH:mm" → Date objesi (tarayıcı local timezone'da parse eder)
  // Bunun için sona tarayıcının offset'ini ekleyip UTC'ye çeviriyoruz
  const localDate = new Date(localValue);
  // localDate zaten local timezone'da, .toISOString() UTC'ye çevirir
  return localDate.toISOString();
}

// ─── Örnek JSON ───────────────────────────────────────────────────────────────

const EXAMPLE_JSON = `{
  "term": "Yılan",
  "description": "Rüyada yılan görmek, dönüşüm ve içgüdüsel bilgeliğin sembolüdür.",
  "tags": ["Hayvanlar", "Dönüşüm", "Tehlike"],
  "content": {
    "type": "ultimate",
    "summary": "Yılan rüyaları...",
    "psychological": "Jung'a göre yılan...",
    "traditional_wisdom": {
      "introduction": "İslami gelenekte...",
      "pillars": [
        { "title": "İbn-i Sirin", "description": "Yılan görmek..." }
      ]
    },
    "scenarios": [
      { "title": "Büyük yılan görmek", "meaning": "...", "isPositive": true }
    ],
    "faq": [
      { "question": "Yılan ısırması ne anlama gelir?", "answer": "..." }
    ]
  }
}`;

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function RuyaEklePage() {
  const router = useRouter();
  const [isPending, start]  = useTransition();
  const [jsonText, setJson] = useState("");
  const [publishedAt, setPublishedAt] = useState(nowLocal());
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [preview, setPreview] = useState<Record<string, any> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleJsonChange(val: string) {
    setJson(val);
    setParseError(null);
    setPreview(null);
    if (!val.trim()) return;
    try {
      setPreview(JSON.parse(val));
    } catch {
      setParseError("Geçersiz JSON formatı.");
    }
  }

  function handleSubmit(isPublished: boolean) {
    setResult(null);
    if (!jsonText.trim()) { setResult({ ok: false, msg: "JSON alanı boş." }); return; }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setResult({ ok: false, msg: "JSON parse hatası. Formatı kontrol edin." });
      return;
    }

    const { term, description, tags, content } = parsed;
    if (!term?.trim())        { setResult({ ok: false, msg: '"term" alanı bulunamadı.' }); return; }
    if (!description?.trim()) { setResult({ ok: false, msg: '"description" alanı bulunamadı.' }); return; }

    const slug        = toSlug(term);
    const firstLetter = term.trim().charAt(0).toUpperCase();
    const tagsArr     = Array.isArray(tags) ? tags.map(String) : [];

    // ── Timezone düzeltmesi: local datetime → UTC ISO ──
    const publishedAtUTC = localDatetimeToUTC(publishedAt);

    start(async () => {
      const res = await saveDreamEntry({
        term:         term.trim(),
        slug,
        description:  description.trim(),
        first_letter: firstLetter,
        tags:         tagsArr,
        content:      content ?? {},
        is_published: isPublished,
        published_at: publishedAtUTC,
      });

      if (res.success) {
        setResult({ ok: true, msg: `✓ Kaydedildi — slug: ${res.slug}` });
        setTimeout(() => router.push("/admin/cms"), 1800);
      } else {
        setResult({ ok: false, msg: res.error });
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl p-6 lg:p-8">

      <div className="mb-7">
        <h1 className="text-xl font-bold text-white">Master JSON ile Ekle</h1>
        <p className="mt-1 text-sm text-zinc-500">
          JSON'u yapıştırın, yayın tarihini seçin — gerisini sistem halleder.
        </p>
      </div>

      <div className="space-y-5">

        {/* ── Yayın Tarihi ── */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Yayın Tarihi & Saati (Türkiye Saati)
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none transition-colors"
          />
          <p className="mt-2 text-xs text-zinc-600">
            {publishedAt && (
              new Date(localDatetimeToUTC(publishedAt)) > new Date()
                ? `⏰ Planlandı — ${new Date(localDatetimeToUTC(publishedAt)).toLocaleString("tr-TR")} UTC'de yayına girer.`
                : "✓ Anında yayınlanır."
            )}
          </p>
        </div>

        {/* ── Master JSON ── */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Master JSON
            </label>
            <button
              type="button"
              onClick={() => handleJsonChange(EXAMPLE_JSON)}
              className="text-xs text-zinc-600 hover:text-amber-400 transition-colors"
            >
              Örnek yükle
            </button>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder={'{\n  "term": "Yılan",\n  "description": "...",\n  "tags": ["Hayvanlar"],\n  "content": { "type": "ultimate", ... }\n}'}
            rows={20}
            spellCheck={false}
            className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-xs text-zinc-300 placeholder:text-zinc-700 focus:border-amber-400/60 focus:outline-none transition-colors"
          />

          {parseError && <p className="mt-2 text-xs text-red-400">{parseError}</p>}

          {preview && !parseError && (
            <div className="mt-3 rounded-xl border border-zinc-700/50 bg-zinc-800/60 px-4 py-3">
              <p className="mb-2 text-xs font-semibold text-zinc-500">Önizleme</p>
              <div className="space-y-1 text-xs">
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-zinc-600">Term:</span>
                  <span className="font-medium text-white">{preview.term ?? "—"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-zinc-600">Slug:</span>
                  <span className="text-amber-400">{toSlug(preview.term ?? "")}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-zinc-600">Açıklama:</span>
                  <span className="line-clamp-1 text-zinc-300">{preview.description ?? "—"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-zinc-600">Etiketler:</span>
                  <span className="text-zinc-300">
                    {Array.isArray(preview.tags) ? preview.tags.join(", ") : "—"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-zinc-600">İçerik tipi:</span>
                  <span className={preview.content?.type === "ultimate" ? "text-emerald-400" : "text-zinc-500"}>
                    {preview.content?.type ?? "tanımsız"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sonuç ── */}
        {result && (
          <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
            result.ok
              ? "border border-emerald-700 bg-emerald-900/30 text-emerald-400"
              : "border border-red-700 bg-red-900/30 text-red-400"
          }`}>
            {result.ok
              ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
              : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            }
            {result.msg}
          </div>
        )}

        {/* ── Butonlar ── */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isPending || !!parseError || !jsonText.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 py-3 text-sm font-semibold text-zinc-400 hover:border-zinc-500 hover:text-white transition-all disabled:opacity-40"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
            Taslak Kaydet
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isPending || !!parseError || !jsonText.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-zinc-900 hover:bg-amber-300 transition-all disabled:opacity-40"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
            Yayına Al
          </button>
        </div>

      </div>
    </div>
  );
}