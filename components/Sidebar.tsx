"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, LayoutDashboard, History, Settings, LogOut, 
  Crown, Layers, Compass, Hash, Palette, BrainCircuit, Sparkles
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    let channel: any;
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

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

    return () => {
        if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const services = [
    { name: "Rüya Analizi", href: "/dashboard/ruya-analizi", icon: <Moon className="w-4 h-4 text-amber-400" /> },
    { name: "Tarot Falı", href: "/dashboard/tarot", icon: <Layers className="w-4 h-4 text-rose-400" /> },
    { name: "Astroloji", href: "/dashboard/astroloji", icon: <Compass className="w-4 h-4 text-indigo-400" /> },
    { name: "Numeroloji", href: "/dashboard/numeroloji/genel", icon: <Hash className="w-4 h-4 text-orange-400" /> },
    { name: "Rüya Stüdyosu", href: "/dashboard/gorsel-olustur", icon: <Palette className="w-4 h-4 text-fuchsia-400" /> },
    { name: "Duygu Analizi", href: "/dashboard/duygu-durumu", icon: <BrainCircuit className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    // Sabit 80px (w-20) genişliğinde, overflow serbest (yanda menü açılabilmesi için)
    <aside className="fixed left-0 top-0 h-screen w-20 bg-[#0B0F19]/95 backdrop-blur-2xl border-r border-white/5 z-50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      
      {/* 1. LOGO ALANI */}
      <div className="flex items-center justify-center h-20 border-b border-white/5 shrink-0 relative group/item">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl border border-amber-500/20 flex items-center justify-center bg-amber-500/5 hover:bg-amber-500/10 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.1)]">
          <Moon className="w-5 h-5 text-amber-500 fill-amber-500/20 -rotate-12" strokeWidth={1.5} />
        </Link>
        {/* Logo Tooltip */}
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#131722] border border-white/10 rounded-md text-slate-200 text-xs font-bold font-serif opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-xl">
          RüyaYorumcum
        </div>
      </div>

      {/* 2. ANA MENÜ LİNKLERİ */}
      <nav className="flex-1 py-4 flex flex-col items-center space-y-2">
        
        {/* Ana Panel */}
        <div className="relative group/item w-full flex justify-center">
          <Link 
            href="/dashboard" 
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${pathname === '/dashboard' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-1.5 bg-[#131722] border border-white/10 rounded-md text-slate-200 text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-xl">
            Ana Panel
          </div>
        </div>

        {/* Hizmetler Yandan Açılır Menü (Pop-out) */}
        <div className="relative group/services w-full flex justify-center">
          <button className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${pathname.includes('/dashboard/') && pathname !== '/dashboard/gunluk' && pathname !== '/dashboard/settings' ? 'bg-white/5 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            <Sparkles className="w-5 h-5 text-amber-400/70" />
          </button>
          
          {/* Hizmetler Hover Alt Menüsü */}
          <div className="absolute top-0 left-full ml-2 w-52 bg-[#131722]/95 backdrop-blur-xl border border-white/10 rounded-2xl opacity-0 invisible group-hover/services:opacity-100 group-hover/services:visible transition-all duration-200 z-50 overflow-hidden shadow-2xl py-2">
            <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">
              Hizmetlerimiz
            </div>
            {services.map((service) => (
              <Link 
                key={service.name} 
                href={service.href}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${pathname === service.href ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {service.icon}
                <span className="text-sm font-medium">{service.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Geçmiş */}
        <div className="relative group/item w-full flex justify-center">
          <Link 
            href="/dashboard/gunluk" 
            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${pathname === '/dashboard/gunluk' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
          >
            <History className="w-5 h-5" />
          </Link>
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-1.5 bg-[#131722] border border-white/10 rounded-md text-slate-200 text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-xl">
            Geçmiş
          </div>
        </div>

      </nav>

      {/* 3. ALT BÖLÜM (Kredi, Ayarlar, Çıkış, Profil) */}
      <div className="mt-auto border-t border-white/5 bg-white/[0.02] py-4 flex flex-col items-center space-y-4 shrink-0">
        
        {/* Kredi Bilgisi (Yanda Tooltip Olarak Sayı Çıkar) */}
        <div className="relative group/item w-full flex justify-center">
          <button onClick={() => router.push('/dashboard/pricing')} className="w-10 h-10 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center transition-all group">
            <Crown className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </button>
          {/* Kredi Tooltip */}
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-2 bg-[#131722] border border-amber-500/20 rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-xl flex flex-col gap-0.5">
            <span className="text-[9px] text-amber-500/80 font-bold uppercase tracking-widest">Kredi Bakiyesi</span>
            <span className="text-base font-bold text-white">{credits ?? '-'}</span>
          </div>
        </div>

        {/* Ayarlar */}
        <div className="relative group/item w-full flex justify-center">
          <Link href="/dashboard/settings" className="w-10 h-10 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors group">
            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          </Link>
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-1.5 bg-[#131722] border border-white/10 rounded-md text-slate-200 text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-xl">
            Ayarlar
          </div>
        </div>

        {/* Çıkış */}
        <div className="relative group/item w-full flex justify-center">
          <button onClick={handleSignOut} className="w-10 h-10 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
          <div className="absolute top-1/2 -translate-y-1/2 left-full ml-4 px-3 py-1.5 bg-[#131722] border border-red-500/20 text-red-400 rounded-md text-xs font-medium opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-xl">
            Çıkış Yap
          </div>
        </div>

        {/* Profil */}
        <div className="relative group/item w-full flex justify-center mt-2 pt-4 border-t border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#020617] font-bold text-sm shadow-lg cursor-pointer">
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "E"}
          </div>
          {/* Profil Tooltip */}
          <div className="absolute bottom-0 left-full ml-4 px-4 py-3 bg-[#131722] border border-white/10 rounded-xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 shadow-xl flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-200">{profile?.full_name || "Kullanıcı"}</span>
            <span className="text-[10px] text-slate-500">{user?.email}</span>
          </div>
        </div>

      </div>

    </aside>
  );
}