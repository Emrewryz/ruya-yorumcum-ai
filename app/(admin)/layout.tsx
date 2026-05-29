"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Users, CreditCard, FileText, LogOut,
  ChevronLeft, ChevronRight, Shield, BarChart2, Calendar, Newspaper // ← ekle
} from "lucide-react";

// ─── Nav Linkleri ─────────────────────────────────────────────────────────────

const NAV = [
  { href: "/admin",           icon: Shield,    label: "Genel Bakış"    },
  { href: "/admin/users",     icon: Users,     label: "Kullanıcılar"   },
  { href: "/admin/epins",     icon: CreditCard,label: "E-Pin İstasyonu"},
  { href: "/admin/analytics", icon: BarChart2, label: "Analitik & Loglar"},
  { href: "/admin/cms",       icon: FileText,  label: "İçerik (CMS)"  },
  { href: "/admin/blog-ekle", icon: Newspaper, label: "Blog Ekle"      }, // ← ekle
  { href: "/admin/takvim",    icon: Calendar,  label: "Yayın Takvimi" },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function AdminSidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();
  const [collapsed, setCollapsed] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAdminEmail(user?.email ?? "");
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside
      className={`
        flex h-screen flex-col border-r border-zinc-800 bg-zinc-950
        transition-[width] duration-200 ease-in-out shrink-0
        ${collapsed ? "w-16" : "w-56"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400 shrink-0" strokeWidth={1.5} />
            <span className="text-sm font-bold text-white">Admin Panel</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors
                ${isActive
                  ? "bg-amber-400/10 text-amber-400 font-medium"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Alt */}
      <div className="border-t border-zinc-800 px-2 py-3 space-y-1">
        {!collapsed && (
          <p className="px-3 py-1.5 text-xs text-zinc-600 truncate">{adminEmail}</p>
        )}
        <button
          onClick={handleSignOut}
          title={collapsed ? "Çıkış" : undefined}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>Çıkış</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900 text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}