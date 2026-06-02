"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Loader2, CheckCircle, AlertCircle, FileJson } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// ─── İç Bileşen ───────────────────────────────────────────────────────────────

function RuyaEkleForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const editId       = searchParams.get("id"); // Düzenleme modunda dolu olur

  const [rawJson, setRawJson]   = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]   = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  const isEdit = !!editId;

  // ── Düzenleme modunda mevcut veriyi yükle ──
  useEffect(() => {
    if (!editId) return;
    setFetching(true);

    const supabase = createClient();
    supabase
      .from("dream_dictionary")
      .select("term, slug, description, content, is_published, published_at, tags")
      .eq("id", editId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus("error");
          setMessage("İçerik yüklenemedi.");
          setFetching(false);
          return;
        }

        // Mevcut veriyi JSON formatında textarea'ya yaz
        const formatted = {
          term:         data.term,
          slug:         data.slug,
          description:  data.description ?? "",
          is_published: data.is_published,
          published_at: data.published_at ?? null,
          tags:         data.tags ?? [],
          content:      data.content ?? {},
        };

        setRawJson(JSON.stringify(formatted, null, 2));
        setFetching(false);
      });
  }, [editId]);

  const jsonValid = (() => {
    if (!rawJson.trim()) return null;
    try { JSON.parse(rawJson); return true; }
    catch { return false; }
  })();

  async function handleSave() {
    if (!rawJson.trim() || jsonValid === false) {
      setStatus("error"); setMessage("Geçerli bir JSON girin."); return;
    }

    let parsed: any;
    try { parsed = JSON.parse(rawJson); }
    catch { setStatus("error"); setMessage("JSON parse hatası."); return; }

    if (!parsed.term?.trim() && !parsed.title?.trim()) {
      setStatus("error"); setMessage("'term' veya 'title' alanı zorunlu."); return;
    }
    if (!parsed.slug?.trim()) {
      setStatus("error"); setMessage("'slug' alanı zorunlu."); return;
    }
    if (!parsed.content) {
      setStatus("error"); setMessage("'content' alanı zorunlu."); return;
    }

    setStatus("loading"); setMessage(null);
    const supabase = createClient();

    const payload = {
      term:         (parsed.term ?? parsed.title).trim(),
      slug:         parsed.slug.trim(),
      description:  parsed.description?.trim() ?? "",
      content:      parsed.content,
      is_published: parsed.is_published ?? false,
      published_at: parsed.published_at ?? null,
      tags:         parsed.tags ?? [],
      first_letter: (parsed.term ?? parsed.title)
                      .replace(/^Rüyada\s+/i, "")
                      .charAt(0)
                      .toUpperCase() || "R",
    };

    if (isEdit) {
      // ── Güncelle ──
      const { error } = await supabase
        .from("dream_dictionary")
        .update(payload)
        .eq("id", editId);

      if (error) {
        setStatus("error"); setMessage(error.message);
      } else {
        setStatus("success");
        setMessage(`Güncellendi → /ruya-tabirleri/${payload.slug}`);
        setTimeout(() => router.push("/admin/icerik"), 1500);
      }
    } else {
      // ── Yeni ekle ──
      const { error } = await supabase
        .from("dream_dictionary")
        .insert({ ...payload, search_count: 0 });

      if (error) {
        setStatus("error");
        setMessage(
          error.message.includes("duplicate")
            ? `'${payload.slug}' slug'ı zaten kullanımda.`
            : error.message
        );
      } else {
        setStatus("success");
        setMessage(`Eklendi → /ruya-tabirleri/${payload.slug}`);
        setRawJson("");
        setTimeout(() => router.push("/admin/icerik"), 1500);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 max-w-2xl">

      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">
          {isEdit ? "İçeriği Düzenle" : "Yeni İçerik Ekle"}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {isEdit
            ? "Mevcut içerik yüklendi. Düzenleyip kaydedin."
            : "JSON formatında rüya tabiri içeriği ekleyin."
          }
        </p>
      </div>

      {fetching ? (
        <div className="flex items-center gap-2 py-8 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          İçerik yükleniyor...
        </div>
      ) : (
        <div className="space-y-5">

          {/* JSON alanı */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                <FileJson className="h-3.5 w-3.5" strokeWidth={1.5} />
                {isEdit ? "İçerik JSON" : "Raw JSON"}
              </label>
              {jsonValid === true  && <span className="text-xs font-medium text-emerald-400">✓ Geçerli JSON</span>}
              {jsonValid === false && <span className="text-xs font-medium text-red-400">✗ Geçersiz JSON</span>}
            </div>

            <textarea
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              spellCheck={false}
              rows={28}
              style={{ resize: "none" }}
              className={`
                w-full rounded-xl border bg-zinc-900 px-4 py-3 font-mono
                text-[12px] leading-relaxed text-zinc-300
                placeholder:text-zinc-700 focus:outline-none
                ${jsonValid === false
                  ? "border-red-800 focus:border-red-600"
                  : "border-zinc-700 focus:border-zinc-500"
                }
              `}
              placeholder={PLACEHOLDER}
            />
          </div>

          {/* Bildirim */}
          {status === "success" && message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-400">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
              {message}
            </div>
          )}
          {status === "error" && message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
              {message}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={status === "loading" || jsonValid === false}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-zinc-900 hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading"
                ? <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> Kaydediliyor...</>
                : <><Save className="h-4 w-4" strokeWidth={2} /> {isEdit ? "Güncelle" : "Kaydet"}</>
              }
            </button>
            <button
              onClick={() => router.push("/admin/icerik")}
              className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Geri
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Wrapper ─────────────────────────────────────────────────────────────────

export default function RuyaEklePage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-600" strokeWidth={1.5} />
      </div>
    }>
      <RuyaEkleForm />
    </Suspense>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

const PLACEHOLDER = `{
  "term": "Rüyada Yılan Görmek",
  "slug": "ruyada-yilan-gormek",
  "description": "Kısa meta açıklama (160 karakter)",
  "is_published": false,
  "tags": ["hayvan", "korku"],
  "content": {
    "type": "ultimate",
    "psychological": "Psikolojik analiz metni...",
    "traditional_wisdom": {
      "introduction": "İslami giriş metni...",
      "pillars": [
        { "title": "Olumlu Yorum", "description": "Açıklama..." },
        { "title": "Olumsuz Yorum", "description": "Açıklama..." }
      ]
    },
    "scenarios": [
      { "title": "Senaryo başlığı", "meaning": "Anlam..." }
    ],
    "faq": [
      { "question": "Soru?", "answer": "Cevap." }
    ]
  }
}`;