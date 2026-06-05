"use client";

import { useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import {
  Users, Brain, Unlock, ImageIcon,
  TrendingUp, TrendingDown, Coins, BarChart2,
  Clock, UserPlus,
} from "lucide-react";
import type { DashboardData } from "./page";

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

function safeDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return "—"; }
}

function safeTime(d: string) {
  try {
    return new Date(d).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

// ─── Stat Kartı ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  today,
  todayLabel = "bugün",
  suffix = "",
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  today?: number;
  todayLabel?: string;
  suffix?: string;
  highlight?: boolean;
}) {
  const isUp = (today ?? 0) > 0;

  return (
    <div className={`rounded-2xl border p-5 transition-colors ${
      highlight
        ? "border-amber-500/30 bg-amber-500/5"
        : "border-zinc-800 bg-zinc-900"
    }`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800">
          <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
        </div>
        {today !== undefined && (
          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isUp
              ? "bg-emerald-900/30 text-emerald-400"
              : "bg-zinc-800 text-zinc-600"
          }`}>
            {isUp
              ? <TrendingUp className="h-3 w-3" strokeWidth={2} />
              : <TrendingDown className="h-3 w-3" strokeWidth={2} />
            }
            +{today} {todayLabel}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">
        {value}{suffix}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl text-xs">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="font-bold text-amber-400">{payload[0].value} analiz</p>
    </div>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export default function AdminDashboardClient({ data }: { data: DashboardData }) {
  const [activityTab, setActivityTab] = useState<"users" | "dreams">("dreams");

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Başlık */}
      <div>
        <h1 className="text-xl font-bold text-white">Komuta Merkezi</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── Stat Kartları ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Toplam Kullanıcı"
          value={data.totalUsers.toLocaleString("tr-TR")}
          today={data.todayUsers}
        />
        <StatCard
          icon={Brain}
          label="Toplam Analiz"
          value={data.totalDreams.toLocaleString("tr-TR")}
          today={data.todayDreams}
        />
        <StatCard
          icon={Unlock}
          label="Kilit Açma Oranı"
          value={data.unlockRate}
          suffix="%"
          highlight={data.unlockRate > 20}
        />
        <StatCard
          icon={ImageIcon}
          label="Üretilen Görsel"
          value={data.totalImages.toLocaleString("tr-TR")}
        />
      </div>

      {/* ── Kredi Ekonomisi ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-1 flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Kredi Ekonomisi
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {data.totalCredits.toLocaleString("tr-TR")}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">Dolaşımdaki toplam kredi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {data.avgCredits}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">Kullanıcı başı ortalama</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-1 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Dönüşüm
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {data.totalDreams > 0
                  ? Math.round((data.totalImages / data.totalDreams) * 100)
                  : 0}%
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">Görsel üretim oranı</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">
                {data.totalUsers > 0
                  ? Math.round((data.totalDreams / data.totalUsers) * 10) / 10
                  : 0}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">Kullanıcı başı analiz</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Haftalık Trend Grafiği ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-white">Son 7 Gün — Analiz Trendi</p>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data.weeklyChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#71717a" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#71717a" }}
              axisLine={false} tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#fbbf24"
              strokeWidth={2}
              fill="url(#amberGrad)"
              dot={{ fill: "#fbbf24", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#fbbf24" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Son Aktivite ── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {/* Sekmeler */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActivityTab("dreams")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-colors ${
              activityTab === "dreams"
                ? "border-b-2 border-amber-400 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Brain className="h-3.5 w-3.5" strokeWidth={1.5} />
            Son Analizler
          </button>
          <button
            onClick={() => setActivityTab("users")}
            className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition-colors ${
              activityTab === "users"
                ? "border-b-2 border-amber-400 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Son Kayıtlar
          </button>
        </div>

        {/* Son Analizler */}
        {activityTab === "dreams" && (
          <div className="divide-y divide-zinc-800">
            {data.recentDreams.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">Henüz analiz yok.</p>
            ) : data.recentDreams.map((dream) => (
              <div key={dream.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  dream.has_image ? "bg-amber-500/10" : "bg-zinc-800"
                }`}>
                  {dream.has_image
                    ? <ImageIcon className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.5} />
                    : <Brain     className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.5} />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-300">
                    {dream.dream_text?.slice(0, 50) ?? "—"}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-zinc-500">{safeDate(dream.created_at)}</p>
                  <p className="text-[11px] text-zinc-700">{safeTime(dream.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Son Kullanıcılar */}
        {activityTab === "users" && (
          <div className="divide-y divide-zinc-800">
            {data.recentUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">Henüz kullanıcı yok.</p>
            ) : data.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-zinc-400 select-none">
                  {(user.email ?? "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-300">{user.email ?? "—"}</p>
                  <p className="text-[11px] text-zinc-600">{user.credits ?? 0} kredi</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-zinc-500">{safeDate(user.created_at)}</p>
                  <p className="flex items-center gap-1 justify-end text-[11px] text-zinc-700">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    {safeTime(user.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}