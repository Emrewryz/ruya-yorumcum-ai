// app/page.tsx
// Ana sayfa — HomeClient SPA wrapper
// Suspense ile ilk render anında shell gösterilir,
// HomeClient hydrate olana kadar skeleton görünür.

import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import { ChatMessageSkeleton } from "@/components/Skeleton";

// ISR — 60sn cache, yeni içerikler görünür
export const revalidate = 60;

// Shell Skeleton — HomeClient yüklenene kadar gösterilir
function HomeShell() {
  return (
    <div className="flex bg-white" style={{ height: "100dvh", overflow: "hidden" }}>
      {/* Sidebar placeholder — CLS önlenir */}
      <div className="hidden w-14 shrink-0 border-r border-zinc-100 bg-white md:block" />

      {/* Ana alan */}
      <div className="flex flex-1 flex-col">
        {/* İçerik */}
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="w-full max-w-2xl space-y-4">

            {/* Logo placeholder */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-100" />
              <div className="h-5 w-40 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-4 w-64 animate-pulse rounded-lg bg-zinc-100" />
            </div>

            {/* Textarea placeholder — min-h ile CLS önlenir */}
            <div className="min-h-[120px] w-full animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50" />

            {/* Buton placeholder */}
            <div className="flex justify-end">
              <div className="h-10 w-32 animate-pulse rounded-xl bg-zinc-100" />
            </div>
          </div>
        </div>

        {/* Bottom input placeholder — CLS önlenir */}
        <div className="shrink-0 border-t border-zinc-100 px-4 py-3">
          <div className="mx-auto h-12 w-full max-w-2xl animate-pulse rounded-xl bg-zinc-50" />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<HomeShell />}>
      <HomeClient />
    </Suspense>
  );
}