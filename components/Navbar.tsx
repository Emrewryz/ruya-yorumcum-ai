"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Menu, X, ChevronDown, 
  Sparkles, Palette, Layers, Hash, BrainCircuit, Compass, 
  LayoutDashboard, User, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const supabase = createClient();
  const pathname = usePathname();

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
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // --- MENU DATA ---
  const services = [
    { name: "Rüya Analizi", href: "/ruya-tabiri", icon: <Sparkles className="w-4 h-4 text-amber-400" />, desc: "Yapay zeka ile rüya yorumu" },
    { name: "Doğum Haritası", href: "/astroloji", icon: <Compass className="w-4 h-4 text-indigo-400" />, desc: "Yükselen burç ve transitler" },
    { name: "Görselleştirme", href: "/ruya-gorsellestirme", icon: <Palette className="w-4 h-4 text-purple-400" />, desc: "Rüyanızı resme dökün" },
    { name: "Tarot Falı", href: "/tarot", icon: <Layers className="w-4 h-4 text-pink-400" />, desc: "Kartların rehberliği" },
    { name: "Numeroloji", href: "/numeroloji", icon: <Hash className="w-4 h-4 text-emerald-400" />, desc: "İsim ve tarih analizi" },
    { name: "Duygu Analizi", href: "/duygu-analizi", icon: <BrainCircuit className="w-4 h-4 text-blue-400" />, desc: "Psikolojik durum tespiti" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled || mobileMenuOpen 
          ? "py-3 bg-[#020617]/50 backdrop-blur-xl border-b border-white/5 shadow-sm" // BURASI DÜZELDİ: Daha şeffaf ve blurlu
          : "py-5 bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* --- 1. LOGO (Sadece İkon & Küçültüldü) --- */}
        <Link href="/" className="flex items-center gap-2 group z-50">
           {/* İkon Kutusu: w-10 yerine w-9 yapıldı, daha kibar */}
           <div className="w-9 h-9 rounded-xl border border-[#fbbf24]/20 flex items-center justify-center bg-[#fbbf24]/5 group-hover:bg-[#fbbf24]/10 transition-all shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <Moon className="w-5 h-5 text-[#fbbf24] fill-[#fbbf24]/20 -rotate-12" strokeWidth={1.5} />
           </div>
           
           <div className="flex flex-col">
              <span className="font-serif font-bold text-lg text-white leading-none tracking-wide group-hover:text-[#fbbf24] transition-colors">RüyaYorumcum</span>
           </div> 
           
        </Link>

        {/* --- 2. ORTA MENÜ --- */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
           <Link href="/" className={`text-sm font-medium transition-colors hover:text-[#fbbf24] ${pathname === '/' ? 'text-white' : 'text-gray-400'}`}>
              Anasayfa
           </Link>

           {/* HİZMETLER DROPDOWN */}
           <div 
             className="relative group"
             onMouseEnter={() => setServicesOpen(true)}
             onMouseLeave={() => setServicesOpen(false)}
           >
              <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#fbbf24] py-4 ${servicesOpen ? 'text-white' : 'text-gray-400'}`}>
                 Hizmetler <ChevronDown className={`w-3 h-3 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {servicesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[340px] bg-[#020617]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 grid grid-cols-1 gap-1"
                  >
                     {services.map((service) => (
                        <Link 
                          key={service.name} 
                          href={service.href}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group/item"
                        >
                           <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5 group-hover/item:border-white/10 transition-colors">
                              {service.icon}
                           </div>
                           <div>
                              <div className="text-sm font-medium text-slate-200 group-hover/item:text-white">{service.name}</div>
                              <div className="text-[10px] text-slate-500">{service.desc}</div>
                           </div>
                        </Link>
                     ))}
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <Link href="/sozluk" className={`text-sm font-medium transition-colors hover:text-[#fbbf24] ${pathname === '/sozluk' ? 'text-white' : 'text-gray-400'}`}>
              Sözlük
           </Link>
           <Link href="/blog" className={`text-sm font-medium transition-colors hover:text-[#fbbf24] ${pathname === '/blog' ? 'text-white' : 'text-gray-400'}`}>
              Blog
           </Link>
        </div>

        {/* --- 3. SAĞ TARAF --- */}
        <div className="hidden lg:flex items-center gap-4">
           {user ? (
              <div className="flex items-center gap-3">
                 <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/10 text-white font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                 </Link>
              </div>
           ) : (
              <div className="flex items-center gap-4">
                 <Link href="/auth?mode=login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                    Giriş
                 </Link>
                 {/* KAYIT OL BUTONU: Altın Rengi */}
                 <Link href="/auth?mode=signup" className="px-6 py-2.5 rounded-full bg-[#fbbf24] text-[#020617] text-xs font-bold hover:bg-[#f59e0b] hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all">
                    Kayıt Ol
                 </Link>
              </div>
           )}
        </div>

        {/* MOBİL BUTON */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-white bg-white/5 rounded-full border border-white/10">
           {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </nav>

      {/* MOBİL MENÜ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#020617]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
             <div className="px-6 py-6 space-y-6">
                <div className="space-y-4">
                   <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-slate-200">Anasayfa</Link>
                   <div>
                      <button onClick={() => setMobileServicesOpen(!mobileServicesOpen)} className="flex items-center justify-between w-full text-lg font-medium text-slate-200">
                         Hizmetler <ChevronDown className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                         {mobileServicesOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-4 pt-4 space-y-3">
                               {services.map((service) => (
                                  <Link key={service.name} href={service.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-400">
                                     {service.icon} <span className="text-sm">{service.name}</span>
                                  </Link>
                               ))}
                            </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                   <Link href="/sozluk" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-slate-200">Sözlük</Link>
                   <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-slate-200">Blog</Link>
                </div>
                
                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                   <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)} className="py-3 bg-white/5 rounded-xl text-center font-bold text-sm text-gray-300">Giriş Yap</Link>
                   <Link href="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)} className="py-3 bg-[#fbbf24] text-[#020617] rounded-xl text-center font-bold text-sm">Kayıt Ol</Link>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}