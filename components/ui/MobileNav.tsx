"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Moon, Eye, User, MessageCircle } from "lucide-react"; 

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Ana Sayfa", href: "/", icon: Home },
    { name: "Burçlar", href: "/dashboard/ay-takvimi", icon: Moon },
    { name: "Yorumla", href: "/dashboard", icon: Eye, isMain: true }, // Orta Buton
    { name: "Sohbet", href: "/dashboard/sohbet", icon: MessageCircle },
    { name: "Profil", href: "/dashboard/settings", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glassmorphism Arkaplan */}
      <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl border-t border-white/10" />
      
      <div className="relative flex justify-around items-center h-20 pb-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link key={item.name} href={item.href} className="relative -top-5 group">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.4)] border-4 border-[#020617] group-active:scale-90 transition-transform">
                  <Icon className="w-7 h-7 text-black fill-black/20" />
                </div>
              </Link>
            );
          }

          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex flex-col items-center justify-center w-12 transition-all duration-300 active:scale-90 ${isActive ? "text-[#fbbf24]" : "text-gray-500"}`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "fill-current" : ""}`} strokeWidth={1.5} />
              <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}