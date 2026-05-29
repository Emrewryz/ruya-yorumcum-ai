"use client";

import { useState } from "react";
import {
  Send, CheckCircle, AlertCircle, Loader2, Calendar, FileJson,
} from "lucide-react";
import { createBlogPost } from "@/app/actions/admin-blog-actions";

// Türkiye saatini datetime-local input için formatla
// datetime-local, "YYYY-MM-DDTHH:mm" formatı ister — timezone-aware değil,
// bu yüzden yerel saati manuel offset ile hesaplıyoruz.
function getLocalDateTimeString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

const EXAMPLE_JSON = `{
  "title": "Yazı Başlığı",
  "slug": "yazi-basligi",
  "excerpt": "Kısa açıklama (160 karakter önerilir).",
  "image_url": "https://...",
  "is_published": true,
  "content": {
    "blocks": [
      { "type": "heading",   "content": "Bölüm Başlığı" },
      { "type": "paragraph", "content": "Paragraf metni buraya." },
      { "type": "quote",     "content": "Alıntı metni." }
    ]
  }
}`;

export default function AdminBlogEklePage() {
  const [rawJson, setRawJson]         = useState("");
  const [publishDate, setPublishDate] = useState(getLocalDateTimeString);
  const [status, setStatus]           = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage]         = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  // JSON formatını validate et (ön kontrol — submit öncesi)
  const jsonValid = (() => {
    if (!rawJson.trim()) return null; // henüz girilmedi
    try { JSON.parse(rawJson); return true; }
    catch { return false; }
  })();

  async function handleSubmit() {
    if (!rawJson.trim()) {
      setStatus("error");
      setMessage("JSON alanı boş bırakılamaz.");
      return;
    }
    if (jsonValid === false) {
      setStatus("error");
      setMessage("JSON formatı geçersiz. Lütfen düzeltin.");
      return;
    }

    setStatus("loading");
    setMessage(null);
    setCreatedSlug(null);

    // Yerel saati UTC'ye çevir
    const utcIso = new Date(publishDate).toISOString();
    const result = await createBlogPost(rawJson, utcIso);

    if (result.success) {
      setStatus("success");
      setMessage(`Yazı başarıyla eklendi → /blog/${result.slug}`);
      setCreatedSlug(result.slug);
      setRawJson("");
      setPublishDate(getLocalDateTimeString());
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">

      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-900">Blog Yazısı Ekle</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Raw JSON yapıştırın ve yayınlanma tarihini seçin.
        </p>
      </div>

      <div className="space-y-6">

        {/* Yayınlanma Tarihi */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
            Yayınlanma Tarihi (Yerel Saat)
          </label>
          <input
            type="datetime-local"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-0"
          />
          <p className="mt-1.5 text-xs text-zinc-400">
            Seçilen yerel saat UTC'ye otomatik çevrilir ve veritabanına yazılır.
          </p>
        </div>

        {/* Raw JSON */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <FileJson className="h-3.5 w-3.5" strokeWidth={1.5} />
              Raw JSON
            </label>
            {/* Canlı doğrulama badge */}
            {jsonValid === true  && <span className="text-xs font-medium text-emerald-500">✓ Geçerli JSON</span>}
            {jsonValid === false && <span className="text-xs font-medium text-red-400">✗ Geçersiz JSON</span>}
          </div>

          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            placeholder={EXAMPLE_JSON}
            spellCheck={false}
            className={`
              h-[420px] w-full resize-none rounded-xl border bg-zinc-50 px-4 py-3 font-mono
              text-[13px] leading-relaxed text-zinc-800 focus:outline-none focus:ring-0
              placeholder:text-zinc-300
              ${jsonValid === false
                ? "border-red-200 focus:border-red-300"
                : "border-zinc-200 focus:border-zinc-400"
              }
            `}
          />
          <p className="mt-1.5 text-xs text-zinc-400">
            Zorunlu alanlar: <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-600">title</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-600">slug</code>,{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-zinc-600">content</code>
          </p>
        </div>

        {/* Bildirim */}
        {status === "success" && message && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <div>
              <p>{message}</p>
              {createdSlug && (
                <a
                  href={`/blog/${createdSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs underline underline-offset-2 text-emerald-600 hover:text-emerald-800"
                >
                  Yazıyı görüntüle →
                </a>
              )}
            </div>
          </div>
        )}

        {status === "error" && message && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
            <span>{message}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={status === "loading" || jsonValid === false}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-300"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              Ekleniyor...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" strokeWidth={1.5} />
              Yazıyı Kaydet
            </>
          )}
        </button>

      </div>
    </div>
  );
}