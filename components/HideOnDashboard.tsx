"use client";

import { usePathname } from "next/navigation";

export default function HideOnDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Eğer adres "/dashboard" ile başlıyorsa HİÇBİR ŞEY gösterme
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  // Değilse içeriği (Footer ve Bar'ı) göster
  return <>{children}</>;
}