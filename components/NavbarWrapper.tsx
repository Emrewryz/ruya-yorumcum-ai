"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Mantık: 
  // 1. /auth (Giriş/Kayıt)
  // 2. /dashboard ve alt sayfaları (Panel)
  // 3. /bio ve alt sayfaları (TikTok Link Sayfası) -> EKLENDİ
  // Bu sayfalarda Navbar GİZLENİR.
  
  const shouldHide = 
    pathname === '/auth' || 
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/bio');

  if (shouldHide) {
    return null;
  }

  // Diğer tüm sayfalarda (Anasayfa, Blog, Sözlük vb.) GÖSTER
  return <Navbar />;
}