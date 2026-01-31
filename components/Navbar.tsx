"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, Eye, Sparkles, LayoutDashboard, Menu, X, ChevronDown, 
  Layers, BrainCircuit, Palette, LogOut, Hash, Compass // Compass ikonunu ekledik
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  // Kullanıcı Durumunu ve Scroll'u Takip Et
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Çıkış Yapma Fonksiyonu
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Menü Linkleri (Astroloji Eklendi)
  const navLinks = [
    { name: "Anasayfa", href: "/" },
    { name: "Sözlük", href: "/sozluk" },
    { name: "Astroloji", href: "/astroloji" }, // YENİ LİNK
    { name: "Blog", href: "/blog" },
    { name: "Paketler", href: "/dashboard/pricing" },
  ];

  // Hizmetler Alt Menüsü (Astroloji En Üste Eklendi)
  const services = [
    { name: "Doğum Haritası & Burç", href: "/astroloji", icon: <Compass className="w-4 h-4 text-indigo-400" /> }, // YENİ
    { name: "Rüya Analizi", href: "/ruya-tabiri", icon: <Sparkles className="w-4 h-4 text-[#fbbf24]" /> },
    { name: "Rüya Görselleştirme", href: "/ruya-gorsellestirme", icon: <Palette className="w-4 h-4 text-purple-400" /> },
    { name: "Tarot Falı", href: "/tarot", icon: <Layers className="w-4 h-4 text-pink-400" /> },
    { name: "Numeroloji", href: "/numeroloji", icon: <Hash className="w-4 h-4 text-amber-500" /> }, 
    { name: "Duygu Analizi", href: "/duygu-analizi", icon: <BrainCircuit className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen ? "py-4" : "py-6"
      }`}
    >
      <nav 
        className={`max-w-7xl mx-auto px-6 py-3 flex items-center justify-between border transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? "bg-[#020617]/90 backdrop-blur-xl border-white/10 rounded-none md:rounded-full shadow-2xl" 
            : "bg-transparent border-transparent"
        }`}
      >
        {/* --- 1. LOGO --- */}
        <Link href="/" className="flex items-center gap-3 group z-50">
          <div className="relative w-10 h-10 flex items-center justify-center bg-white/5 rounded-full border border-white/5 group-hover:border-[#fbbf24]/50 transition-colors">
             <Moon className="w-6 h-6 text-[#fbbf24] fill-[#fbbf24]" />
             <Eye className="w-3 h-3 text-black absolute top-[14px] left-[14px]" />
          </div>
          <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-wide text-white leading-none">RüyaYorumcum</span>
              <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase">AI Rehber</span>
          </div>
        </Link>

        {/* --- 2. MASAÜSTÜ MENÜ --- */}
        <div className="hidden lg:flex items-center gap-8">
          {/* Standart Linkler */}
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`text-sm font-medium transition-colors hover:text-[#fbbf24] ${
                pathname === link.href ? "text-[#fbbf24]" : "text-gray-300"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Hizmetler Dropdown */}
          <div 
            className="relative group"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-gray-300 group-hover:text-[#fbbf24] transition-colors py-2">
              Hizmetler <ChevronDown className="w-4 h-4" />
            </button>
            
            {/* Açılır Menü Kutusu */}
            <AnimatePresence>
              {servicesOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-[#0f172a] border border-white/10 rounded-2xl shadow-xl overflow-hidden p-2"
                >
                  {services.map((service) => (
                    <Link 
                      key={service.name} 
                      href={service.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group/item"
                    >
                      <div className="bg-black/30 p-2 rounded-lg border border-white/5 group-hover/item:border-white/20 transition-colors">
                        {service.icon}
                      </div>
                      <span className="text-sm text-gray-300 group-hover/item:text-white">{service.name}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- 3. SAĞ TARAF (GİRİŞ/PANEL) --- */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
               {/* Kullanıcı Bilgisi */}
               <div className="text-right hidden xl:block">
                  <div className="text-xs text-gray-400">Hoş geldin,</div>
                  <div className="text-sm font-bold text-[#fbbf24] max-w-[120px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </div>
               </div>
               
               <Link href="/dashboard" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold transition-all uppercase tracking-wider">
                  <LayoutDashboard className="w-4 h-4" /> Panel
               </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <Link href="/auth?mode=login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                 Giriş Yap
               </Link>
               <Link href="/auth?mode=signup" className="px-6 py-2.5 rounded-full bg-[#fbbf24] text-black text-xs font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                 Kayıt Ol
               </Link>
            </div>
          )}
        </div>

        {/* --- 4. MOBİL MENÜ BUTONU --- */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-white bg-white/5 rounded-full border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* --- 5. MOBİL MENÜ AÇILIR ALANI --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#020617] border-b border-white/10 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-medium text-gray-300 hover:text-[#fbbf24]"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="py-4 border-t border-white/10">
                <div className="text-xs font-bold text-gray-500 uppercase mb-3">Hizmetler</div>
                <div className="grid grid-cols-1 gap-3">
                  {services.map((service) => (
                    <Link 
                      key={service.name} 
                      href={service.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      {service.icon} {service.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                {user ? (
                   <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#fbbf24] text-black flex items-center justify-center font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{user.email}</div>
                          <div className="text-xs text-[#fbbf24]">Premium Üye</div>
                        </div>
                      </div>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 bg-white/10 rounded-xl text-center font-bold text-sm">
                        Panele Git
                      </Link>
                      <button onClick={handleSignOut} className="w-full py-3 text-red-400 text-sm flex items-center justify-center gap-2">
                        <LogOut className="w-4 h-4" /> Çıkış Yap
                      </button>
                   </div>
                ) : (
                   <div className="grid grid-cols-2 gap-4">
                      <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="py-3 bg-white/5 rounded-xl text-center font-bold text-sm text-gray-300">
                        Giriş Yap
                      </Link>
                      <Link href="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)} className="py-3 bg-[#fbbf24] text-black rounded-xl text-center font-bold text-sm">
                        Kayıt Ol
                      </Link>
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}