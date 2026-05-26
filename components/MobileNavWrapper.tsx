"use client";

import { useRouter } from "next/navigation";
import MobileNav from "@/components/MobileNav";

// Server Component layout'larında kullanmak için
// onNewChat prop'unu router ile halleder

export default function MobileNavWrapper() {
  const router = useRouter();
  return (
    <MobileNav
      onNewChat={() => router.push("/")}
      activeChatId={null}
    />
  );
}