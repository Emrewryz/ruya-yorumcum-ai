"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileJson, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminTestJsonPage() {
  const router = useRouter();
  const [rawJson, setRawJson]   = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]   = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const jsonValid = (() => {
    if (!rawJson.trim()) return null;
    try { JSON.parse(rawJson); return true; }
    catch { return false; }
  })();

  async function handleSubmit() {
    if (!rawJson.trim() || jsonValid === false) {
      setStatus("error");
      setMessage("Geçerli bir JSON girin.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    let parsed: any;
    try { parsed = JSON.parse(rawJson); }
    catch { setStatus("error"); setMessage("JSON parse hatası."); return; }

    // Zorunlu alan kontrolü
    if (!parsed.title?.trim())  { setStatus("error"); setMessage("'title' alanı zorunlu."); return; }
    if (!parsed.slug?.trim())   { setStatus("error"); setMessage("'slug' alanı zorunlu."); return; }
    if (!parsed.content?.questions?.length) { setStatus("error"); setMessage("'content.questions' dizisi boş veya eksik."); return; }
    if (!parsed.content?.results?.length)   { setStatus("error"); setMessage("'content.results' dizisi boş veya eksik."); return; }

    const supabase = createClient();

    const { error } = await supabase.from("viral_tests").insert({
      title:        parsed.title.trim(),
      slug:         parsed.slug.trim(),
      description:  parsed.description ?? null,
      is_published: parsed.is_published ?? false,
      content: {
        questions: parsed.content.questions,
        results:   parsed.content.results,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message.includes("duplicate")
        ? `'${parsed.slug}' slug'ı zaten kullanımda.`
        : error.message
      );
      return;
    }

    setCreatedSlug(parsed.slug.trim());
    setStatus("success");
    setMessage(`Test başarıyla eklendi → /testler/${parsed.slug.trim()}`);
    setRawJson("");
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">

      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Test Ekle (JSON)</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Aşağıdaki formata uygun JSON'u yapıştırın ve kaydedin.
        </p>
      </div>

      <div className="space-y-5">

        {/* JSON alanı */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              <FileJson className="h-3.5 w-3.5" strokeWidth={1.5} />
              Raw JSON
            </label>
            {jsonValid === true  && <span className="text-xs font-medium text-emerald-400">✓ Geçerli JSON</span>}
            {jsonValid === false && <span className="text-xs font-medium text-red-400">✗ Geçersiz JSON</span>}
          </div>

          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            spellCheck={false}
            rows={22}
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
            placeholder={EXAMPLE_JSON}
          />
        </div>

        {/* Bildirim */}
        {status === "success" && message && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-700 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <div>
              <p>{message}</p>
              {createdSlug && (
                <a
                  href={`/testler/${createdSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs underline underline-offset-2 text-emerald-500"
                >
                  Testi görüntüle →
                </a>
              )}
            </div>
          </div>
        )}

        {status === "error" && message && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{message}</span>
          </div>
        )}

        {/* Kaydet */}
        <button
          onClick={handleSubmit}
          disabled={status === "loading" || jsonValid === false}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-zinc-900 hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading"
            ? <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> Kaydediliyor...</>
            : <><Send className="h-4 w-4" strokeWidth={2} /> Testi Kaydet</>
          }
        </button>

      </div>
    </div>
  );
}

// ─── Format Örneği ────────────────────────────────────────────────────────────

const EXAMPLE_JSON = `{
  "title": "Test Başlığı",
  "slug": "test-basligi",
  "description": "Kısa açıklama (opsiyonel)",
  "is_published": true,
  "content": {
    "questions": [
      {
        "id": 1,
        "question": "Soru metni buraya gelir",
        "options": [
          { "label": "Birinci şık", "value": "a", "score": 0 },
          { "label": "İkinci şık",  "value": "b", "score": 1 },
          { "label": "Üçüncü şık", "value": "c", "score": 2 },
          { "label": "Dördüncü şık","value": "d", "score": 3 }
        ]
      }
    ],
    "results": [
      {
        "min": 0,
        "max": 4,
        "title": "Sonuç Başlığı",
        "description": "Bu sonuç için açıklama metni."
      }
    ]
  }
}`;