import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ArrowRight } from "lucide-react";

const SITE_URL = "https://www.ruyayorumcum.com.tr";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Psikoloji Testleri — Rüya Yorumcum",
  description:
    "Bilinçaltını keşfet. Rüya psikolojisi ve bilinçaltı örüntüleri üzerine ücretsiz testler.",
alternates: {
    canonical: "https://www.ruyayorumcum.com.tr/testler",
  },  openGraph: {
    title: "Psikoloji Testleri — Rüya Yorumcum",
    description: "Bilinçaltını keşfet. Ücretsiz psikoloji testleri.",
    url: `${SITE_URL}/testler`,
    type: "website",
  },
};

interface ViralTest {
  slug:        string;
  title:       string;
  description: string | null;
  created_at:  string;
  content: {
    questions: { id: number }[];
  };
}

export default async function TestlerPage() {
  const supabase = createClient();

  const { data: tests } = await supabase
    .from("viral_tests")
    .select("slug, title, description, created_at, content")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">

      {/* Başlık */}
      <div className="mb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-2">
          Psikoloji Testleri
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Bilinçaltını keşfet.
        </h1>
        <p className="mt-3 text-base text-zinc-500 leading-relaxed">
          Rüya psikolojisi ve bilinçaltı örüntüleri üzerine kısa, ücretsiz testler.
          Her test yaklaşık 3 dakika sürer.
        </p>
      </div>

      {/* Liste */}
      {!tests || tests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
          <p className="text-sm text-zinc-400">Henüz yayınlanmış test yok.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(tests as ViralTest[]).map((test) => {
            const questionCount = test.content?.questions?.length ?? 0;
            return (
              <Link
                key={test.slug}
                href={`/testler/${test.slug}`}

                className="group flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                    {test.title}
                  </h2>
                  {test.description && (
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                      {test.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {questionCount > 0 && (
                      <span className="text-xs text-zinc-400">
                        {questionCount} soru
                      </span>
                    )}
                    <span className="text-xs text-zinc-300">·</span>
                    <span className="text-xs text-zinc-400">~3 dakika</span>
                    <span className="text-xs text-zinc-300">·</span>
                    <span className="text-xs text-emerald-600 font-medium">Ücretsiz</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center pt-0.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Alt CTA */}
      <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
        <p className="text-sm font-semibold text-zinc-900 mb-1">
          Rüyanı yapay zeka ile analiz et
        </p>
        <p className="text-xs text-zinc-500 mb-4">
          İslami ve psikolojik yorum. İlk analiz ücretsiz.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
        >
          Rüyamı Analiz Et
        </Link>
      </div>

    </div>
  );
}