"use client";

import { useState, useEffect } from "react";
import { 
  Moon, LogOut, PenLine, FileText, Settings, 
  Plus, Layers, Hash, Activity, Grid, Wand2, Gem, ChevronRight, X 
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  const [credits, setCredits] = useState<number | null>(null);
  const [isServicesHovered, setIsServicesHovered] = useState(false); // Masaüstü Hover
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);   // Mobil Tıklama

  // --- Realtime Kredi Takibi ---
  useEffect(() => {
    let channel: any;
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // İlk yükleme
      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
      if (profile) setCredits(profile.credits);

      // Canlı dinleme (Realtime)
      channel = supabase
        .channel('sidebar-credits')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => setCredits((payload.new as any).credits)
        )
        .subscribe();
    };
    initData();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // --- HİZMET LİSTESİ VE MATCH MANTIĞI ---
  // match: Bu fonksiyon, şu anki URL'in bu servise ait olup olmadığını kontrol eder.
  const services = [
    { 
        id: 'dream', 
        label: 'Rüya', 
        fullLabel: 'Rüya Yorumu',
        icon: PenLine, 
        path: '/dashboard', 
        match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard/ruya'), // Anasayfa
        desc: 'Yapay zeka analizi', 
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-400/10'
    },
    { 
        id: 'tarot', 
        label: 'Tarot', 
        fullLabel: 'Tarot Falı',
        icon: Layers, 
        path: '/dashboard/tarot', 
        match: (p: string) => p.startsWith('/dashboard/tarot'),
        desc: '3 kartlık açılım', 
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/10'
    },
    { 
        id: 'astro', 
        label: 'Astroloji', 
        fullLabel: 'Natal Harita',
        icon: Moon, 
        path: '/dashboard/astroloji', 
        match: (p: string) => p.startsWith('/dashboard/astroloji'),
        desc: 'Natal ve transit', 
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10'
    },
    { 
        id: 'numerology', 
        label: 'Numeroloji', 
        fullLabel: 'Numeroloji',
        icon: Hash, 
        path: '/dashboard/numeroloji', 
        match: (p: string) => p.startsWith('/dashboard/numeroloji'),
        desc: 'Sayıların gizemi', 
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10'
    },
    { 
        id: 'image', 
        label: 'Görsel', 
        fullLabel: 'Rüya Görseli',
        icon: Wand2, 
        path: '/dashboard/gorsel-olustur/yeni', // Varsayılan yeni görsel sayfası
        match: (p: string) => p.startsWith('/dashboard/gorsel-olustur'),
        desc: 'AI Sanat Stüdyosu', 
        color: 'text-pink-400',
        bgColor: 'bg-pink-400/10'
    },
    { 
        id: 'mood', 
        label: 'Ruh Hali', 
        fullLabel: 'Duygu Analizi',
        icon: Activity, 
        path: '/dashboard/duygu-durumu', 
        match: (p: string) => p.startsWith('/dashboard/duygu-durumu'),
        desc: 'Psikolojik analiz', 
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10'
    },
  ];

  // --- AKTİF SERVİSİ BUL ---
  // Şu anki URL hangi servise aitse onu bul, yoksa varsayılan olarak Rüya (Dream) getir.
  const activeService = services.find(s => s.match(pathname)) || services[0];

  return (
    <>
      {/* MOBİL MENÜ OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col p-6 md:hidden"
          >
            <div className="flex justify-between items-center mb-8">
               <span className="text-white font-serif text-xl">Tüm Hizmetler</span>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full text-white"><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {services.map((item) => (
                  <button key={item.id} onClick={() => { router.push(item.path); setIsMobileMenuOpen(false); }} className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5 active:scale-95 transition-all">
                     <item.icon className={`w-8 h-8 mb-3 ${item.color}`} />
                     <span className="text-sm font-bold text-white">{item.fullLabel}</span>
                  </button>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="
        fixed z-50 bg-[#020617]/90 backdrop-blur-xl border-white/5
        /* MOBİL (Alt Bar) */
        bottom-0 left-0 right-0 w-full h-20 flex flex-row items-center justify-around border-t
        /* MASAÜSTÜ (Sol Bar) */
        md:top-0 md:bottom-0 md:left-0 md:w-20 md:h-full md:flex-col md:py-6 md:border-r md:border-t-0 md:justify-start
      ">
        
        {/* --- LOGO (Masaüstü) --- */}
        <Link href="/" className="hidden md:flex mb-8 items-center justify-center w-full">
          <div className="w-10 h-10 rounded-xl bg-[#fbbf24] flex items-center justify-center text-black shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-105 transition-transform">
            <Moon className="w-6 h-6" />
          </div>
        </Link>

        {/* --- KREDİ GÖSTERGESİ --- */}
        <button 
          onClick={() => router.push('/dashboard/pricing')}
          className="hidden md:flex flex-col items-center gap-1 mb-6 group w-full px-2"
        >
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg group-hover:border-[#fbbf24]/50 transition-colors w-full justify-center">
             <Gem className="w-3.5 h-3.5 text-[#fbbf24]" />
             <span className="text-xs font-bold text-white">{credits ?? '-'}</span>
           </div>
           <span className="text-[9px] text-gray-500 group-hover:text-[#fbbf24] transition-colors flex items-center gap-1">
              YÜKLE <Plus className="w-2 h-2" />
           </span>
        </button>

        {/* --- NAVİGASYON --- */}
        <nav className="flex flex-row md:flex-col gap-1 md:gap-4 w-full px-2 justify-around md:justify-start items-center">
          
          {/* 1. DİNAMİK ANA BUTON (AKTİF SERVİS) */}
          {/* Bu buton kullanıcının o an hangi modülde olduğunu gösterir */}
          <button 
            onClick={() => router.push(activeService.path)} 
            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${activeService.color}`}
          >
             {/* Aktif olduğunu belirten arka plan (sadece o anki sayfadaysa daha belirgin) */}
             <div className={`p-2 rounded-lg ${activeService.bgColor} border border-white/5 shadow-[0_0_10px_rgba(255,255,255,0.05)]`}>
                <activeService.icon className="w-5 h-5 md:w-5 md:h-5" />
             </div>
             <span className="text-[9px] font-bold uppercase tracking-wider hidden md:block">{activeService.label}</span>
             
             {/* Aktif İşaretçisi (Nokta) */}
             <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-current rounded-full animate-pulse md:hidden"></span>
          </button>

          {/* 2. HİZMETLER MENÜSÜ (DİĞERLERİNE GEÇİŞ İÇİN) */}
          <div 
            className="relative flex flex-col items-center group"
            onMouseEnter={() => setIsServicesHovered(true)}
            onMouseLeave={() => setIsServicesHovered(false)}
          >
             <button 
                onClick={() => window.innerWidth < 768 && setIsMobileMenuOpen(true)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-gray-500 hover:text-white`}
             >
                <div className="p-2 rounded-lg group-hover:bg-white/5">
                   <Grid className="w-5 h-5 md:w-5 md:h-5" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider">Menü</span>
             </button>

             {/* MASAÜSTÜ FLYOUT MENU */}
             <AnimatePresence>
               {isServicesHovered && (
                 <motion.div 
                   initial={{ opacity: 0, x: -10, scale: 0.95 }} 
                   animate={{ opacity: 1, x: 0, scale: 1 }} 
                   exit={{ opacity: 0, x: -10, scale: 0.95 }}
                   transition={{ duration: 0.15 }}
                   className="hidden md:flex absolute left-full top-0 ml-4 w-64 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-2 flex-col gap-1 z-50 overflow-hidden"
                 >
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1">
                       Mistik Araçlar
                    </div>
                    {services.map((service) => (
                       <Link 
                         key={service.id} 
                         href={service.path}
                         className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group/item ${activeService.id === service.id ? 'bg-white/5' : ''}`}
                       >
                          <div className={`p-2 rounded-lg bg-black/40 ${service.color}`}>
                             <service.icon className="w-4 h-4" />
                          </div>
                          <div>
                             <div className={`text-sm font-bold ${activeService.id === service.id ? 'text-white' : 'text-gray-200'} group-hover/item:text-white`}>{service.fullLabel}</div>
                             <div className="text-[10px] text-gray-500">{service.desc}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-600 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                       </Link>
                    ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* 3. ARŞİV */}
          <button 
            onClick={() => router.push('/dashboard/gunluk')} 
            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname.includes('/gunluk') ? 'text-[#fbbf24]' : 'text-gray-500 hover:text-white'}`}
          >
             <div className={`p-2 rounded-lg ${pathname.includes('/gunluk') ? 'bg-[#fbbf24]/10' : 'group-hover:bg-white/5'}`}>
                <FileText className="w-5 h-5 md:w-5 md:h-5" />
             </div>
             <span className="text-[9px] font-bold uppercase tracking-wider hidden md:block">Arşiv</span>
          </button>

          {/* 4. AYARLAR */}
          <button 
            onClick={() => router.push('/dashboard/settings')} 
            className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${pathname === '/dashboard/settings' ? 'text-[#fbbf24]' : 'text-gray-500 hover:text-white'}`}
          >
             <div className={`p-2 rounded-lg ${pathname === '/dashboard/settings' ? 'bg-[#fbbf24]/10' : 'group-hover:bg-white/5'}`}>
                <Settings className="w-5 h-5 md:w-5 md:h-5" />
             </div>
             <span className="text-[9px] font-bold uppercase tracking-wider hidden md:block">Ayarlar</span>
          </button>

        </nav>

        {/* ÇIKIŞ BUTONU */}
        <button onClick={handleSignOut} className="hidden md:flex flex-col items-center p-3 text-gray-600 hover:text-red-500 transition-colors mt-auto mb-4">
          <LogOut className="w-5 h-5" />
        </button>

      </aside>
    </>
  );
}