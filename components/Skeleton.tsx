// components/Skeleton.tsx
// Genel amaçlı pulse skeleton bileşenleri

// ─── Temel Skeleton Bloğu ─────────────────────────────────────────────────────

export function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`animate-pulse rounded-xl bg-zinc-100 ${className}`} />
  );
}

// ─── Stat Kartı Skeleton ──────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 min-h-[96px]">
      <SkeletonBlock className="mb-3 h-3 w-24" />
      <SkeletonBlock className="h-8 w-16" />
    </div>
  );
}

// ─── Tablo Satırı Skeleton ────────────────────────────────────────────────────

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <SkeletonBlock className={`h-4 ${i === 0 ? "w-32" : "w-20"}`} />
        </td>
      ))}
    </tr>
  );
}

// ─── Tablo Skeleton ───────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 min-h-[320px]">
      <table className="w-full">
        <thead className="border-b border-zinc-800 bg-zinc-900">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-5 py-3">
                <SkeletonBlock className="h-3 w-16 bg-zinc-800" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Kullanıcı Satırı Skeleton ────────────────────────────────────────────────

export function UserRowSkeleton() {
  return (
    <tr>
      <td className="px-5 py-4">
        <SkeletonBlock className="mb-1.5 h-4 w-32" />
        <SkeletonBlock className="h-3 w-44" />
      </td>
      <td className="px-5 py-4"><SkeletonBlock className="h-4 w-8" /></td>
      <td className="px-5 py-4"><SkeletonBlock className="h-5 w-12 rounded-full" /></td>
      <td className="px-5 py-4"><SkeletonBlock className="h-4 w-20" /></td>
      <td className="px-5 py-4 text-right">
        <SkeletonBlock className="ml-auto h-7 w-16 rounded-lg" />
      </td>
    </tr>
  );
}

// ─── Dashboard Genel Bakış Skeleton ──────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Başlık */}
      <div>
        <SkeletonBlock className="mb-2 h-6 w-40 bg-zinc-800" />
        <SkeletonBlock className="h-4 w-24 bg-zinc-800" />
      </div>
      {/* Stat kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 min-h-[96px]">
            <SkeletonBlock className="mb-3 h-3 w-24 bg-zinc-800" />
            <SkeletonBlock className="h-8 w-16 bg-zinc-800" />
          </div>
        ))}
      </div>
      {/* Son kayıtlar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 min-h-[200px]">
        <SkeletonBlock className="mb-4 h-4 w-40 bg-zinc-800" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <SkeletonBlock className="h-3 w-48 bg-zinc-800" />
              <SkeletonBlock className="h-3 w-16 bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dream Card Skeleton ──────────────────────────────────────────────────────

export function DreamCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 min-h-[120px]">
      {/* Görsel alanı */}
      <SkeletonBlock className="mb-3 h-8 w-8 rounded-lg" />
      {/* Başlık */}
      <SkeletonBlock className="mb-2 h-4 w-3/4" />
      {/* Açıklama satır 1 */}
      <SkeletonBlock className="mb-1.5 h-3 w-full" />
      {/* Açıklama satır 2 */}
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  );
}

// ─── Dream List Skeleton ──────────────────────────────────────────────────────

export function DreamListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-h-[600px]">
      {Array.from({ length: count }).map((_, i) => (
        <DreamCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Chat Message Skeleton ────────────────────────────────────────────────────

export function ChatMessageSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6 min-h-[200px]">
      {/* AI mesajı */}
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-3 w-16" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>
      {/* Kullanıcı mesajı */}
      <div className="flex flex-col items-end gap-2">
        <SkeletonBlock className="h-3 w-12" />
        <SkeletonBlock className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <SkeletonBlock className="mb-2 h-6 w-40 bg-zinc-800" />
        <SkeletonBlock className="h-4 w-32 bg-zinc-800" />
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-800 min-h-[400px]">
        <div className="border-b border-zinc-800 bg-zinc-900 px-5 py-3">
          <SkeletonBlock className="h-4 w-48 bg-zinc-800" />
        </div>
        <div className="divide-y divide-zinc-800 bg-zinc-900/50">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <SkeletonBlock className="h-3 w-4 bg-zinc-800" />
              <SkeletonBlock className="h-4 w-32 bg-zinc-800" />
              <div className="flex flex-1 items-center gap-2">
                <SkeletonBlock className="h-1.5 flex-1 bg-zinc-800" />
              </div>
              <SkeletonBlock className="h-4 w-10 bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}