"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Home, Book, User, Sparkles } from "lucide-react"; 

export default function MobileNav() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  // Sayfa yüklendiğinde kullanıcının giriş yapıp yapmadığını kontrol et
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const navItems = [
    // 1. Ana Sayfa (Herkes girebilir)
    { 
      name: "Ana Sayfa", 
      href: "/", 
      icon: Home,
      isMain: false 
    },
    // 2. Rüya Sözlüğü (Herkes girebilir)
    { 
      name: "Sözlük", 
      href: "/sozluk", // File tree'deki 'sozluk' klasörü
      icon: Book,
      isMain: false 
    },
    // 3. RÜYA YORUMLA (Özel Buton - Giriş Şart)
    { 
      name: "Yorumla", 
      href: user ? "/dashboard" : "/auth", // Giriş yoksa -> Auth sayfasına
      icon: Sparkles, 
      isMain: true 
    }, 
    // 4. Profil (Giriş Şart)
    { 
      name: "Profil", 
      href: user ? "/dashboard/settings" : "/auth", // Giriş yoksa -> Auth sayfasına
      icon: User,
      isMain: false 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Arka Plan (Glassmorphism) */}
      <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" />
      
      <div className="relative flex justify-around items-end h-20 pb-4 px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          // ORTA BUTON (RÜYA YORUMLA) TASARIMI
          if (item.isMain) {
            return (
              <Link key={item.name} href={item.href} className="relative -top-6 group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.4)] border-[6px] border-[#020617] group-active:scale-90 transition-transform duration-200">
                  <Icon className="w-8 h-8 text-black fill-black/10" strokeWidth={2} />
                </div>
                {/* Altındaki Parlama Efekti */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#fbbf24] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  YORUMLA
                </div>
              </Link>
            );
          }

          // DİĞER BUTONLAR (Ana Sayfa, Sözlük, Profil)
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-90 ${isActive ? "text-[#fbbf24]" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}