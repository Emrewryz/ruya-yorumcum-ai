"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "next-themes";
import { 
  Menu, X, ChevronDown, 
  Sparkles, Palette, Layers, Hash, BrainCircuit, Compass, 
  Moon, Sun, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  // TEMA YÖNETİMİ
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true); 
    
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
  }, [supabase]);

  // Tema Değiştirme Fonksiyonu
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // --- MENU DATA ---
  const services = [
    { name: "Rüya Analizi", href: "/ruya-tabiri", icon: <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />, desc: "Yapay zeka ile rüya yorumu" },
    { name: "Doğum Haritası", href: "/astroloji", icon: <Compass className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />, desc: "Yükselen burç ve transitler" },
    { name: "Görselleştirme", href: "/ruya-gorsellestirme", icon: <Palette className="w-4 h-4 text-purple-500 dark:text-purple-400" />, desc: "Rüyanızı resme dökün" },
    { name: "Tarot Falı", href: "/tarot", icon: <Layers className="w-4 h-4 text-pink-500 dark:text-pink-400" />, desc: "Kartların rehberliği" },
    { name: "Numeroloji", href: "/numeroloji", icon: <Hash className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />, desc: "İsim ve tarih analizi" },
    { name: "Duygu Analizi", href: "/duygu-analizi", icon: <BrainCircuit className="w-4 h-4 text-blue-500 dark:text-blue-400" />, desc: "Psikolojik durum tespiti" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled || mobileMenuOpen 
          ? "py-3 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm" 
          : "py-5 bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* --- 1. LOGO --- */}
        <Link href="/" className="flex items-center gap-2 group z-50">
           <div className="w-9 h-9 rounded-xl border border-amber-500/20 flex items-center justify-center bg-amber-500/5 group-hover:bg-amber-500/10 transition-all shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <Moon className="w-5 h-5 text-amber-500 fill-amber-500/20 -rotate-12" strokeWidth={1.5} />
           </div>
           <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-slate-900 dark:text-white leading-none tracking-wide group-hover:text-amber-500 transition-colors">
                RüyaYorumcum
              </span>
           </div> 
        </Link>

        {/* --- 2. ORTA MENÜ --- */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
           <Link href="/" className={`text-sm font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-500 ${pathname === '/' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
              Anasayfa
           </Link>

           {/* HİZMETLER DROPDOWN */}
           <div 
             className="relative group"
             onMouseEnter={() => setServicesOpen(true)}
             onMouseLeave={() => setServicesOpen(false)}
           >
              <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-500 py-4 ${servicesOpen ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                 Hizmetler <ChevronDown className={`w-3 h-3 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[340px] bg-white dark:bg-[#131722] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 grid grid-cols-1 gap-1"
                  >
                     {services.map((service) => (
                        <Link 
                          key={service.name} 
                          href={service.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group/item"
                        >
                           <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-black/40 flex items-center justify-center border border-slate-200 dark:border-white/5 group-hover/item:border-amber-500/30 transition-colors">
                              {service.icon}
                           </div>
                           <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400">{service.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">{service.desc}</div>
                           </div>
                        </Link>
                     ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <Link href="/sozluk" className={`text-sm font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-500 ${pathname === '/sozluk' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
              Sözlük
           </Link>
           <Link href="/blog" className={`text-sm font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-500 ${pathname === '/blog' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
              Blog
           </Link>
        </div>

        {/* --- 3. SAĞ TARAF --- */}
        <div className="hidden lg:flex items-center gap-4">
           
           {/* TEMA DEĞİŞTİRME BUTONU (MASAÜSTÜ) */}
           <div className="w-9 h-9 flex items-center justify-center">
             {mounted && (
               <button 
                 onClick={toggleTheme} 
                 className="w-full h-full flex items-center justify-center rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                 aria-label="Temayı Değiştir"
               >
                 {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
               </button>
             )}
           </div>

           {/* KULLANICI PROFİLİ VEYA GİRİŞ BUTONLARI */}
           {user ? (
              <div className="flex items-center gap-3">
                 {/* Profil Simgesi: Sabit Altın Rengi ve Tam Siyah Yazı ile her iki temada okunaklı */}
                 <Link href="/dashboard" className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition-colors shadow-lg shadow-amber-500/20 text-[#020617] font-bold text-sm border-2 border-transparent hover:border-white/20">
                    {user.user_metadata?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                 </Link>
              </div>
           ) : (
              <div className="flex items-center gap-4">
                 <Link href="/auth?mode=login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-white transition-colors">
                    Giriş
                 </Link>
                 <Link href="/auth?mode=signup" className="px-6 py-2.5 rounded-full bg-[#fbbf24] text-[#020617] text-xs font-bold hover:bg-[#f59e0b] hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all">
                    Kayıt Ol
                 </Link>
              </div>
           )}
        </div>

        {/* MOBİL BUTONLAR (Tema Değiştirici + Hamburger Menü) */}
        <div className="flex lg:hidden items-center gap-3">
          
          <div className="w-9 h-9 flex items-center justify-center">
            {mounted && (
               <button 
                 onClick={toggleTheme} 
                 className="w-full h-full flex items-center justify-center text-slate-600 dark:text-white bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10"
               >
                 {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
               </button>
            )}
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-white bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10"
          >
             {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </nav>

      {/* MOBİL AÇILIR MENÜ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 overflow-hidden shadow-xl"
          >
             <div className="px-6 py-6 space-y-6">
                <div className="space-y-4">
                   <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors">Anasayfa</Link>
                   <div>
                      <button onClick={() => setMobileServicesOpen(!mobileServicesOpen)} className="flex items-center justify-between w-full text-lg font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors">
                         Hizmetler <ChevronDown className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                         {mobileServicesOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-4 pt-4 space-y-4">
                               {services.map((service) => (
                                  <Link key={service.name} href={service.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium">
                                     {service.icon} <span className="text-sm">{service.name}</span>
                                  </Link>
                               ))}
                            </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                   <Link href="/sozluk" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors">Sözlük</Link>
                   <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors">Blog</Link>
                </div>
                
                <div className="pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-4">
                   {user ? (
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="col-span-2 py-3 bg-amber-500 rounded-xl text-center font-bold text-sm text-[#020617] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                        <User className="w-4 h-4" /> Paneline Git
                      </Link>
                   ) : (
                      <>
                        <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="py-3 bg-slate-100 dark:bg-white/5 rounded-xl text-center font-bold text-sm text-slate-800 dark:text-white border border-slate-200 dark:border-transparent">Giriş Yap</Link>
                        <Link href="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)} className="py-3 bg-[#fbbf24] text-[#020617] rounded-xl text-center font-bold text-sm shadow-lg shadow-amber-500/20">Kayıt Ol</Link>
                      </>
                   )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}