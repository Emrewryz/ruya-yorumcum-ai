"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { Search, Plus, X, Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { getUsers, addCreditsToUser } from "@/app/actions/admin-actions";

// ─── Tipler ───────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  credits: number;
  role: string;
  created_at: string;
}

// ─── Kredi Ekle Modal ─────────────────────────────────────────────────────────

function AddCreditsModal({
  user,
  onClose,
  onSuccess,
}: {
  user: UserRow;
  onClose: () => void;
  onSuccess: (userId: string, newCredits: number) => void;
}) {
  const [amount, setAmount]     = useState(1);
  const [isPending, start]      = useTransition();
  const [result, setResult]     = useState<{ ok: boolean; msg: string } | null>(null);

  function handleSubmit() {
    if (amount < 1 || isPending) return;
    setResult(null);
    start(async () => {
      const res = await addCreditsToUser(user.id, amount);
      if (res.success) {
        setResult({ ok: true, msg: `${amount} kredi eklendi. Yeni bakiye: ${res.newCredits}` });
        setTimeout(() => {
          onSuccess(user.id, res.newCredits);
          onClose();
        }, 1200);
      } else {
        setResult({ ok: false, msg: res.error });
      }
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-white">Kredi Ekle</h3>
            <p className="mt-0.5 text-xs text-zinc-500 truncate max-w-[220px]">
              {user.email}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-zinc-400">
            Eklenecek Kredi
          </label>
          <div className="flex items-center gap-2">
            {[1, 3, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => setAmount(n)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  amount === n
                    ? "bg-amber-400 text-zinc-900"
                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={1000}
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {result && (
          <div className={`mb-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs ${
            result.ok
              ? "border border-emerald-700 bg-emerald-900/30 text-emerald-400"
              : "border border-red-700 bg-red-900/30 text-red-400"
          }`}>
            {result.ok
              ? <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
              : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
            }
            {result.msg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-sm font-semibold text-zinc-900 transition-all hover:bg-amber-300 disabled:opacity-50"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Ekleniyor..." : `+${amount} Kredi Ekle`}
        </button>
      </div>
    </>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [selectedUser, setSelected] = useState<UserRow | null>(null);
  const [isPending, start]          = useTransition();

  const fetchUsers = useCallback(() => {
    setLoading(true);
    start(async () => {
      try {
        const data = await getUsers(search);
        setUsers(data as UserRow[]);
      } finally {
        setLoading(false);
      }
    });
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  function handleCreditSuccess(userId: string, newCredits: number) {
    setUsers((prev) =>
      prev.map((u) => u.id === userId ? { ...u, credits: newCredits } : u)
    );
  }

  return (
    <div className="p-6 lg:p-8">

      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Kullanıcılar</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{users.length} kullanıcı</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
          Yenile
        </button>
      </div>

      {/* Arama */}
      <div className="relative mb-5 max-w-sm">
        <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-zinc-600" strokeWidth={1.5} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="E-posta ile ara..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-amber-400/50 focus:outline-none transition-colors"
        />
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kullanıcı</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kredi</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Rol</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Kayıt</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-900/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-zinc-600" strokeWidth={1.5} />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-zinc-600">
                  {search ? "Sonuç bulunamadı." : "Kullanıcı yok."}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-zinc-800/40">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{user.full_name || "—"}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-amber-400">{user.credits}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500">
                    {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelected(user)}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-amber-400/50 hover:text-amber-400 ml-auto"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      Kredi
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedUser && (
        <AddCreditsModal
          user={selectedUser}
          onClose={() => setSelected(null)}
          onSuccess={handleCreditSuccess}
        />
      )}
    </div>
  );
}