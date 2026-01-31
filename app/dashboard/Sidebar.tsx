"use client";

import { Moon, Star, LogOut, PenLine, FileText, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface SidebarProps {
  activeTab: 'dream' | 'astro' | 'archive' | 'settings';
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 w-20 hidden md:flex flex-col items-center py-8 bg-[#020617]/80 backdrop-blur-xl border-r border-white/5">
      <Link href="/" className="mb-10">
        <div className="w-10 h-10 rounded-xl bg-[#fbbf24] flex items-center justify-center text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]">
          <Moon className="w-6 h-6" />
        </div>
      </Link>
      <nav className="flex-1 flex flex-col gap-6 w-full px-2">
        <button onClick={() => router.push('/dashboard')} className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'dream' ? 'text-[#fbbf24] bg-[#fbbf24]/10' : 'text-gray-500 hover:text-white'}`}>
           <PenLine className="w-5 h-5" /><span className="text-[9px] font-bold uppercase tracking-wider">Rüya</span>
        </button>
        <button onClick={() => router.push('/dashboard/astroloji')} className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'astro' ? 'text-[#fbbf24] bg-[#fbbf24]/10' : 'text-gray-500 hover:text-white'}`}>
           <Star className="w-5 h-5" /><span className="text-[9px] font-bold uppercase tracking-wider">Astro</span>
        </button>
        <button onClick={() => router.push('/dashboard/gunluk')} className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'archive' ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:text-white'}`}>
           <FileText className="w-5 h-5" /><span className="text-[9px] font-bold uppercase tracking-wider">Arşiv</span>
        </button>
        <div className="w-full h-px bg-white/10 my-2 px-2"></div>
        <button onClick={() => router.push('/dashboard/settings')} className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'text-white bg-white/10' : 'text-gray-500 hover:text-white'}`}>
           <Settings className="w-5 h-5" /><span className="text-[9px] font-bold uppercase tracking-wider">Ayarlar</span>
        </button>
      </nav>
      <button onClick={handleSignOut} className="p-3 text-gray-500 hover:text-red-500 transition-colors"><LogOut className="w-5 h-5" /></button>
    </aside>
  );
}