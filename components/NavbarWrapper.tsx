"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

/**
 * Navbar'ı bazı sayfalarda gizlemek için wrapper.
 *
 * GİZLENDİĞİ DURUMLAR:
 * - /auth (Giriş/Kayıt sayfası)
 * - /ruya-tabiri/[id] — sonuç sayfasının kendi düzeni var, navbar sidebar gibi çalışabilir
 *   (isteğe bağlı: sonuç sayfasında görmek istersen bu satırı kaldır)
 */
export default function NavbarWrapper() {
  const pathname = usePathname();

  const shouldHide =
    pathname === "/auth" ||
    pathname?.startsWith("/auth/");

  if (shouldHide) return null;

  return <Navbar />;
}