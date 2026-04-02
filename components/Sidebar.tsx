"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, Sun, LayoutDashboard, History, Settings, LogOut, LogIn,
  Crown, Layers, Compass, Hash, Palette, BrainCircuit, Sparkles
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    let channel: any;
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) return; 

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) {
          setProfile(prof);
          setCredits(prof.credits);
      }

      channel = supabase
        .channel('sidebar-credits')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => setCredits((payload.new as any).credits)
        )
        .subscribe();
    };

    initData();

    if (typeof window !== 'undefined') {
       setIsDarkTheme(document.documentElement.classList.contains('dark'));
    }

    return () => {
        if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.classList.toggle('dark');
  };

  const services = [
    { name: "Rüya Analizi", href: "/dashboard/ruya-analizi", icon: <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> },
    { name: "Tarot Falı", href: "/dashboard/tarot", icon: <Layers className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-500" /> },
    { name: "Astroloji", href: "/dashboard/astroloji", icon: <Compass className="w-4 h-4 text-blue-600 dark:text-blue-500" /> },
    { name: "Numeroloji", href: "/dashboard/numeroloji/genel", icon: <Hash className="w-4 h-4 text-orange-600 dark:text-orange-500" /> },
    { name: "Rüya Stüdyosu", href: "/dashboard/gorsel-olustur", icon: <Palette className="w-4 h-4 text-purple-600 dark:text-purple-500" /> },
    { name: "Duygu Analizi", href: "/dashboard/duygu-durumu", icon: <BrainCircuit className="w-4 h-4 text-teal-600 dark:text-teal-500" /> },
  ];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-20 bg-white dark:bg-[#0a0c10]/95 dark:backdrop-blur-2xl border-r border-stone-200 dark:border-white/10 z-50 flex-col shadow-sm dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] antialiased transition-colors duration-500">
      
      {/* 1. LOGO ALANI */}
      <div className="flex items-center justify-center h-20 border-b border-stone-200 dark:border-white/10 shrink-0 relative group/item transition-colors">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl border border-stone-200 dark:border-amber-500/20 flex items-center justify-center bg-stone-50 dark:bg-amber-500/10 hover:bg-stone-100 dark:hover:bg-amber-500/20 transition-colors shadow-sm dark:shadow-[0_0_15px_rgba(251,191,36,0.1)]">
          <Moon className="w-5 h-5 text-stone-900 dark:text-amber-500 dark:fill-amber-500/20 -rotate-12" strokeWidth={1.5} />
        </Link>
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 rounded-md text-stone-900 dark:text-slate-200 text-xs font-bold font-serif opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-md">
          RüyaYorumcum
        </div>
      </div>

      {/* 2. ANA MENÜ LİNKLERİ */}
      <nav className="flex-1 py-6 flex flex-col items-center space-y-3">
        
        <div className="relative group/item w-full flex justify-center">
          <Link 
            href="/dashboard" 
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${pathname === '/dashboard' ? 'bg-stone-100 dark:bg-amber-500/10 text-stone-900 dark:text-amber-500 border border-stone-200 dark:border-amber-500/20 shadow-sm' : 'text-stone-400 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-50 dark:hover:bg-white/5 border border-transparent'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-1.5 bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 rounded-md text-stone-800 dark:text-slate-200 text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-md">
            Ana Panel
          </div>
        </div>

        <div className="relative group/services w-full flex justify-center">
          <button className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${pathname.includes('/dashboard/') && pathname !== '/dashboard/gunluk' && pathname !== '/dashboard/settings' ? 'bg-stone-100 dark:bg-white/5 text-stone-900 dark:text-slate-200 border border-stone-200 dark:border-white/10 shadow-sm' : 'text-stone-400 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-50 dark:hover:bg-white/5 border border-transparent'}`}>
            <Sparkles className="w-5 h-5 dark:text-amber-500/70" />
          </button>
          
          <div className="absolute top-0 left-full ml-2 w-56 bg-white dark:bg-[#131722]/95 dark:backdrop-blur-xl border border-stone-200 dark:border-white/10 rounded-2xl opacity-0 invisible group-hover/services:opacity-100 group-hover/services:visible transition-all duration-200 z-50 overflow-hidden shadow-xl py-2">
            <div className="px-5 py-3 text-[10px] font-bold text-stone-400 dark:text-slate-500 uppercase tracking-widest border-b border-stone-100 dark:border-white/10 mb-1">
              Hizmetlerimiz
            </div>
            {services.map((service) => (
              <Link 
                key={service.name} 
                href={service.href}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${pathname === service.href ? 'text-stone-900 dark:text-slate-200 bg-stone-50 dark:bg-white/5' : 'text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-50 dark:hover:bg-white/5'}`}
              >
                {service.icon}
                <span className="text-sm font-medium">{service.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="relative group/item w-full flex justify-center">
          <Link 
            href="/dashboard/gunluk" 
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${pathname === '/dashboard/gunluk' ? 'bg-stone-100 dark:bg-amber-500/10 text-stone-900 dark:text-amber-500 border border-stone-200 dark:border-amber-500/20 shadow-sm' : 'text-stone-400 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-200 hover:bg-stone-50 dark:hover:bg-white/5 border border-transparent'}`}
          >
            <History className="w-5 h-5" />
          </Link>
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-1.5 bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 rounded-md text-stone-800 dark:text-slate-200 text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-md">
            Geçmiş
          </div>
        </div>

      </nav>

      {/* 3. ALT BÖLÜM */}
      <div className="mt-auto border-t border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-white/[0.02] py-6 flex flex-col items-center space-y-4 shrink-0 transition-colors">
        
        <div className="relative group/item w-full flex justify-center">
          <button onClick={() => router.push('/dashboard/pricing')} className="w-10 h-10 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:border dark:border-amber-500/20 text-white flex items-center justify-center transition-all group shadow-sm">
            <Crown className="w-4 h-4 dark:text-amber-500 group-hover:scale-110 transition-transform" />
          </button>
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-4 py-2 bg-white dark:bg-[#131722] border border-stone-200 dark:border-amber-500/20 rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-md flex flex-col gap-0.5">
            <span className="text-[9px] text-stone-400 dark:text-amber-500/80 font-bold uppercase tracking-widest">Kredi Bakiyesi</span>
            <span className="text-lg font-bold text-stone-900 dark:text-slate-200">
                {!user ? '1 (Hediye)' : (credits ?? '-')}
            </span>
          </div>
        </div>

        <div className="relative group/item w-full flex justify-center">
          <button onClick={toggleTheme} className="w-10 h-10 rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 text-stone-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 flex items-center justify-center transition-colors group">
            {isDarkTheme ? <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-500" />}
          </button>
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-1.5 bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 rounded-md text-stone-800 dark:text-slate-200 text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-md">
            {isDarkTheme ? "Açık Tema" : "Karanlık Tema"}
          </div>
        </div>

        <div className="relative group/item w-full flex justify-center">
          <Link href="/dashboard/settings" className="w-10 h-10 rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 text-stone-400 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-200 flex items-center justify-center transition-colors group">
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          </Link>
        </div>

        <div className="relative group/item w-full flex justify-center">
          {!user ? (
             <button onClick={() => router.push('/auth')} className="w-10 h-10 rounded-xl hover:bg-stone-100 dark:hover:bg-emerald-500/10 text-stone-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors">
               <LogIn className="w-5 h-5" />
             </button>
          ) : (
             <button onClick={handleSignOut} className="w-10 h-10 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-stone-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors">
               <LogOut className="w-5 h-5" />
             </button>
          )}
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-1.5 bg-white dark:bg-[#131722] border border-stone-200 dark:border-red-500/20 dark:text-red-400 text-stone-700 rounded-md text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-md">
            {!user ? "Kayıt Ol / Giriş Yap" : "Çıkış Yap"}
          </div>
        </div>

        <div className="relative group/item w-full flex justify-center mt-2 pt-4 border-t border-stone-200 dark:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-amber-500 border border-stone-300 dark:border-amber-500/50 flex items-center justify-center text-stone-700 dark:text-[#020617] font-bold text-sm shadow-sm dark:shadow-lg cursor-pointer hover:bg-stone-300 dark:hover:border-2 dark:hover:border-white/50 transition-all">
            {!user ? "M" : (profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U")}
          </div>
        </div>

      </div>
    </aside>
  );
}