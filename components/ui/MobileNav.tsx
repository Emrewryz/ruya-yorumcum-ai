"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Home, 
  Sparkles, 
  User, 
  Menu, 
  X, 
  Compass, 
  Layers, 
  Hash, 
  BrainCircuit, 
  Palette, 
  BookOpen,
  Feather,
  LogOut
} from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNav() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sayfa yüklendiğinde kullanıcının giriş yapıp yapmadığını kontrol et
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [supabase]);

  // Menü açıldığında scroll'u engelle
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  // Çıkış Yapma
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // --- LİSTELER ---

  // Alt Bar Sabit Linkler
  const bottomNavItems = [
    { name: "Ana Sayfa", href: "/", icon: Home },
    { name: "Sözlük", href: "/sozluk", icon: BookOpen },
    { name: "Yorumla", href: user ? "/dashboard" : "/auth", icon: Sparkles, isMain: true }, // ORTA BUTON
    { name: "Blog", href: "/blog", icon: Feather },
    { name: "Menü", action: () => setIsMenuOpen(!isMenuOpen), icon: Menu }, // MENÜ AÇMA BUTONU
  ];

  // Açılır Menüdeki Hizmetler (Tüm Sayfalar)
  const allServices = [
    { name: "Rüya Analizi", href: "/ruya-tabiri", icon: Sparkles, color: "text-amber-500" },
    { name: "Doğum Haritası", href: "/astroloji", icon: Compass, color: "text-indigo-500" },
    { name: "Tarot Falı", href: "/tarot", icon: Layers, color: "text-pink-500" },
    { name: "Numeroloji", href: "/numeroloji", icon: Hash, color: "text-blue-500" },
    { name: "Duygu Analizi", href: "/duygu-analizi", icon: BrainCircuit, color: "text-emerald-500" },
    { name: "Rüya Görselleştir", href: "/ruya-gorsellestirme", icon: Palette, color: "text-purple-500" },
  ];

  // Profil & Diğer Linkler
  const userLinks = [
    { name: "Profil & Ayarlar", href: "/dashboard/settings", icon: User },
    { name: "Paketler & Üyelik", href: "/dashboard/pricing", icon: Sparkles },
  ];

  return (
    <>
      {/* --- AÇILIR GENİŞ MENÜ (OVERLAY) --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[var(--bg-main)] pb-24 overflow-y-auto md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-main)]/95 backdrop-blur-md z-10">
              <span className="text-xl font-serif font-bold text-[var(--text-main)]">Menü & Hizmetler</span>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-main)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Kullanıcı Durumu */}
              {user ? (
                <div className="bg-gradient-to-r from-black/5 dark:from-white/10 to-transparent p-4 rounded-2xl border border-[var(--border-color)] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#fbbf24] text-black flex items-center justify-center font-bold text-xl">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                     <div className="text-sm text-[var(--text-muted)]">Hoş geldin,</div>
                     <div className="font-bold text-[var(--text-main)] truncate max-w-[150px]">{user.user_metadata?.full_name || user.email?.split('@')[0]}</div>
                  </div>
                  <Link 
                     href="/dashboard" 
                     onClick={() => setIsMenuOpen(false)}
                     className="px-4 py-2 bg-black/5 dark:bg-white/10 rounded-lg text-xs font-bold hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-[var(--text-main)]"
                  >
                    Panel
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                   <Link href="/auth?mode=login" onClick={() => setIsMenuOpen(false)} className="py-3 bg-[var(--bg-card)] rounded-xl text-center font-bold text-sm text-[var(--text-main)] border border-[var(--border-color)] shadow-sm">
                      Giriş Yap
                   </Link>
                   <Link href="/auth?mode=signup" onClick={() => setIsMenuOpen(false)} className="py-3 bg-[#fbbf24] text-[#020617] rounded-xl text-center font-bold text-sm shadow-lg shadow-amber-500/20">
                      Kayıt Ol
                   </Link>
                </div>
              )}

              {/* HİZMETLER GRID */}
              <div>
                <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Keşfet</h3>
                <div className="grid grid-cols-2 gap-3">
                  {allServices.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl hover:border-amber-500/30 transition-all group shadow-sm"
                    >
                      <service.icon className={`w-6 h-6 ${service.color}`} />
                      <span className="text-sm font-medium text-[var(--text-main)] group-hover:text-amber-600 dark:group-hover:text-amber-400">{service.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* HIZLI LİNKLER */}
              {user && (
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Hesabım</h3>
                  <div className="space-y-2">
                    {userLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm"
                      >
                         <link.icon className="w-5 h-5 text-[var(--text-muted)]" />
                         <span className="text-sm text-[var(--text-main)]">{link.name}</span>
                      </Link>
                    ))}
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shadow-sm"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ALT SABİT BAR --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Glass Effect Background */}
        <div className="absolute inset-0 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-t border-[var(--border-color)] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" />
        
        <div className="relative flex justify-around items-end h-[84px] pb-5 px-2">
          {bottomNavItems.map((item: any) => {
            const isActive = pathname === item.href && !isMenuOpen;
            const Icon = item.icon;

            // ORTA BUTON (RÜYA YORUMLA)
            if (item.isMain) {
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="relative -top-8 group"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] flex items-center justify-center shadow-lg shadow-amber-500/40 border-[6px] border-[var(--bg-main)] group-active:scale-95 transition-transform duration-200">
                    <Icon className="w-7 h-7 text-white dark:text-[#020617] fill-white/20 dark:fill-black/10" strokeWidth={2} />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-600 dark:text-amber-500 whitespace-nowrap">
                    YORUMLA
                  </div>
                </Link>
              );
            }

            // DİĞER BUTONLAR
            return (
              <button
                key={item.name}
                onClick={item.action ? item.action : undefined}
                className="flex-1"
              >
                {item.href ? (
                  <Link 
                    href={item.href} 
                    className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${isActive ? "text-amber-600 dark:text-amber-500" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? "fill-amber-600/20 dark:fill-amber-500/20" : ""}`} strokeWidth={isActive ? 2.5 : 1.5} />
                    <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                  </Link>
                ) : (
                  <div className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${isMenuOpen && item.name === "Menü" ? "text-amber-600 dark:text-amber-500" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}