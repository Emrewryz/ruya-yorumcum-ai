"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, X, BarChart2 } from "lucide-react";

interface OruntuKartiProps {
  dreamCount?: number;
}

export default function OruntuKarti({ dreamCount = 1 }: OruntuKartiProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

        {/* Kapat */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-200 hover:text-zinc-500 transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>

        {/* İkon + Başlık */}
        <div className="mb-3 flex items-start gap-3 pr-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white">
            <BarChart2 className="h-5 w-5 text-zinc-700" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 text-sm leading-snug">
              Bilinçaltının sadece %10'unu gördün.
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Rüyaların birbiriyle konuşur.
            </p>
          </div>
        </div>

        {/* Açıklama */}
        <p className="mb-4 text-xs leading-relaxed text-zinc-500">
          {dreamCount >= 2
            ? `${dreamCount} rüyan var. Bilinçaltının haftalık örüntüsünü ve psikolojik haritanı analiz edelim.`
            : "Rüyalarını kaydetmeye devam et. Bilinçaltının örüntülerini birlikte haritalandıralım ve sana özel haftalık psikolojik analiz suналım."
          }
        </p>

        {/* CTA */}
        {dreamCount >= 2 ? (
          <Link
            href="/oruntu-analizi"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 transition-all hover:border-zinc-400 hover:bg-zinc-50"
          >
            Haftalık Analizimi Gör
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i < Math.min(dreamCount, 5) ? "bg-zinc-700" : "bg-zinc-200"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-zinc-400">{dreamCount} rüya</span>
            </div>
            <span className="text-xs font-medium text-zinc-500">Ücretsiz</span>
          </div>
        )}
      </div>
    </div>
  );
}