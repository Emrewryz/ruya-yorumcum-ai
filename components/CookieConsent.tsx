"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasConsent = document.cookie.split(";").some((c) => c.trim().startsWith("cookie_consent="));
    if (!hasConsent) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `cookie_consent=true; expires=${expires}; path=/; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs font-semibold text-zinc-900">Çerez Bildirimi</p>
          <button onClick={() => setVisible(false)}
            className="flex h-5 w-5 items-center justify-center rounded text-zinc-300 hover:text-zinc-600 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs leading-relaxed text-zinc-500 mb-3">
          Deneyiminizi iyileştirmek için çerezler kullanıyoruz.{" "}
          <Link href="/yasal/gizlilik-politikasi" className="text-zinc-900 underline underline-offset-2">
            Gizlilik Politikası
          </Link>
        </p>
        <button onClick={handleAccept}
          className="w-full rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors">
          Kabul Et
        </button>
      </div>
    </div>
  );
}