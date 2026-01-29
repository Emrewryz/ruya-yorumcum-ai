"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Mantık: Eğer adres "/auth" ise YA DA "/dashboard" ile başlıyorsa Navbar'ı GİZLE.
  // Bu sayede dashboard'un alt sayfaları (günlük, tarot vs.) otomatik dahil olur.
  const shouldHide = pathname === '/auth' || pathname?.startsWith('/dashboard');

  if (shouldHide) {
    return null;
  }

  // Diğer tüm sayfalarda (Ana sayfa, Blog, Sözlük) GÖSTER
  return <Navbar />;
}