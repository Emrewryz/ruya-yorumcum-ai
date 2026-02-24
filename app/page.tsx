"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  Moon, Sparkles, Layers, Compass, Hash, 
  ArrowRight, BrainCircuit, Palette, Crown, PlayCircle, Star,
  CreditCard
} from "lucide-react";
import { getMoonPhase } from "@/utils/moon"; 
import RewardAdModal from "@/components/RewardAdModal"; 

export default function DashboardHubPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [greeting, setGreeting] = useState("Merhaba"); 
  const [currentMoon, setCurrentMoon] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      setCurrentMoon(getMoonPhase());
      
      const h = new Date().getHours();
      setGreeting(h < 12 ? "Günaydın" : h < 18 ? "Tünaydın" : "İyi Akşamlar");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) {
          setProfile(prof);
          setUserCredits(prof.credits);
      }
    };
    init();
  }, [supabase]);

  const showAds = userCredits !== null && userCredits < 1;

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col min-h-screen relative z-10 font-sans">
      
      {/* ================= ARKA PLAN AURASI (PERFORMANS OPTİMİZE) ================= */}
      <div className="fixed top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none -z-10 transform-gpu">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] dark:opacity-100 opacity-60"></div>
          <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] dark:opacity-100 opacity-70"></div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 px-2">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-[var(--text-main)] tracking-tight leading-tight mb-2">
            {greeting}, <span className="text-amber-600 dark:text-amber-500">{profile?.full_name?.split(' ')[0] || "Yolcu"}</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-light flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-amber-500" /> Bilinçaltın bugün ne fısıldadı?
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-3 bg-[var(--bg-card)]/80 backdrop-blur-md border border-[var(--border-color)] pl-4 pr-1.5 py-1.5 rounded-full shadow-lg">
                <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Kredi</span>
                    <span className="text-[var(--text-main)] font-serif text-lg leading-none">{userCredits !== null ? userCredits : '...'}</span>
                </div>
                <button 
                  onClick={() => router.push('/dashboard/pricing')} 
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 transition-all flex items-center justify-center shadow-lg active:scale-95"
                >
                   <Crown className="w-4 h-4 text-white dark:text-[#0B0F19]" />
                </button>
            </div>
        </div>
      </header>

      {/* ================= AKILLI REKLAM MODÜLÜ ================= */}
      {showAds && (
         <div className="mb-10 w-full relative group px-2">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative bg-[var(--bg-card)]/90 backdrop-blur-xl border border-purple-500/30 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0 shadow-inner">
                        <PlayCircle className="w-7 h-7 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                        <h3 className="text-[var(--text-main)] font-bold text-lg md:text-xl mb-1">Ücretsiz Kredi Kazan</h3>
                        <p className="text-[var(--text-muted)] text-sm font-light">Kısa bir reklam izle, anında yolculuğuna devam et.</p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
                    <span className="text-xs font-mono text-purple-600 dark:text-purple-300 bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
                        3 Hakkın Kaldı
                    </span>
                    <RewardAdModal /> 
                </div>
            </div>
         </div>
      )}

      {/* ================= BENTO GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)] px-2 mb-10">
          
          {/* 1. RÜYA ANALİZİ */}
          <Link href="/dashboard/ruya-analizi" className="md:col-span-8 relative group bg-[var(--bg-card)] backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col justify-between border border-[var(--border-color)] overflow-hidden transition-all duration-500 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1">
             <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/15 transition-colors pointer-events-none"></div>
             
             <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm">
                    <Moon className="w-7 h-7" />
                 </div>
                 <span className="bg-amber-500 text-white dark:text-[#0B0F19] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <Star className="w-3 h-3 fill-current" /> Ana Modül
                 </span>
             </div>

             <div className="relative z-10">
                 <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--text-main)] mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Yapay Zeka Rüya Laboratuvarı</h2>
                 <p className="text-[var(--text-muted)] text-sm font-light max-w-md mb-6 leading-relaxed">Diyanet kaynakları ve Jung psikolojisinin eşsiz sentezi. Rüyanızı yazın, şifreleri çözelim.</p>
                 <span className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold text-xs uppercase tracking-widest bg-amber-500/5 dark:bg-amber-500/10 px-5 py-2.5 rounded-xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    Hemen Yorumla <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </span>
             </div>
          </Link>

          {/* 2. AY FAZI */}
          <Link href="/dashboard/ay-takvimi" className="md:col-span-4 relative group bg-[var(--bg-card)] backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center border border-[var(--border-color)] overflow-hidden transition-all duration-500 hover:border-slate-400 hover:-translate-y-1 hover:shadow-2xl">
             <div className="relative z-10 w-full flex flex-col items-center">
                 <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest mb-6 border-b border-[var(--border-color)] pb-2">Gökyüzü Enerjisi</p>
                 <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-700 drop-shadow-xl">
                    {currentMoon?.icon || "🌕"}
                 </div>
                 <h3 className="text-lg md:text-xl font-bold text-[var(--text-main)] mb-2">{currentMoon?.phase || "Ay Fazı"}</h3>
                 <p className="text-[var(--text-muted)] text-xs font-light">Aydınlık: <span className="text-[var(--text-main)] font-medium">%{currentMoon?.percentage || "..."}</span></p>
             </div>
          </Link>

          {/* 3. TAROT */}
          <Link href="/dashboard/tarot" className="md:col-span-4 relative group bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] p-7 flex flex-col justify-between border border-[var(--border-color)] overflow-hidden transition-all duration-500 hover:border-rose-500/40 hover:shadow-2xl hover:-translate-y-1">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-[50px] pointer-events-none"></div>
             <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-600 dark:text-rose-400 mb-6 relative z-10">
                <Layers className="w-6 h-6" />
             </div>
             <div className="relative z-10">
                 <h2 className="text-lg font-bold text-[var(--text-main)] mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Tarot Kahini</h2>
                 <p className="text-[var(--text-muted)] text-xs font-light mb-5 leading-relaxed">Geçmiş, şimdi ve gelecek açılımıyla hayatındaki düğümleri çöz.</p>
                 <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-widest">
                    Kart Seç <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                 </span>
             </div>
          </Link>

          {/* 4. ASTROLOJİ */}
          <Link href="/dashboard/astroloji" className="md:col-span-4 relative group bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] p-7 flex flex-col justify-between border border-[var(--border-color)] overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-2xl hover:-translate-y-1">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none"></div>
             <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-6 relative z-10">
                <Compass className="w-6 h-6" />
             </div>
             <div className="relative z-10">
                 <h2 className="text-lg font-bold text-[var(--text-main)] mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Astroloji</h2>
                 <p className="text-[var(--text-muted)] text-xs font-light mb-5 leading-relaxed">Doğum haritanı ve anlık gökyüzü transitlerini keşfet.</p>
                 <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                    Haritayı Çıkar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                 </span>
             </div>
          </Link>

          {/* 5. MAĞAZA */}
          <Link href="/dashboard/pricing" className="md:col-span-4 relative group bg-gradient-to-br from-[var(--bg-card)] to-amber-500/5 backdrop-blur-xl rounded-[2rem] p-7 flex flex-col justify-between border border-amber-500/10 overflow-hidden transition-all duration-500 hover:border-amber-500/40 hover:shadow-2xl hover:-translate-y-1">
             <div className="w-12 h-12 rounded-xl bg-amber-500 text-white dark:text-[#0B0F19] flex items-center justify-center mb-6 relative z-10 shadow-lg">
                <CreditCard className="w-6 h-6" />
             </div>
             <div className="relative z-10">
                 <h2 className="text-lg font-bold text-[var(--text-main)] mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">Mağaza</h2>
                 <p className="text-[var(--text-muted)] text-xs font-light mb-5 leading-relaxed">Kredin mi bitti? Paketlerimizi incele, limite takılma.</p>
                 <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                    Paketleri İncele <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                 </span>
             </div>
          </Link>

          {/* 6. DUYGU ANALİZİ */}
          <Link href="/dashboard/duygu-durumu" className="md:col-span-6 relative group bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] p-6 flex flex-col justify-between border border-[var(--border-color)] overflow-hidden transition-all duration-500 hover:border-emerald-500/40 hover:-translate-y-1">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <BrainCircuit className="w-5 h-5" />
                 </div>
                 <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Psiko-Analiz</h3>
             </div>
             <div>
                 <p className="text-[var(--text-muted)] text-xs font-light mb-4 leading-relaxed">Rüyalarındaki stres ve neşe oranlarını bilimsel olarak ölç.</p>
                 <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">İncele <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" /></span>
             </div>
          </Link>

          {/* 7. NUMEROLOJİ */}
          <Link href="/dashboard/numeroloji" className="md:col-span-6 relative group bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] p-6 flex flex-col justify-between border border-[var(--border-color)] overflow-hidden transition-all duration-500 hover:border-orange-500/40 hover:-translate-y-1">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-600 dark:text-orange-400">
                    <Hash className="w-5 h-5" />
                 </div>
                 <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Numeroloji</h3>
             </div>
             <div>
                 <p className="text-[var(--text-muted)] text-xs font-light mb-4 leading-relaxed">İsminin ve doğum tarihinin sakladığı şifreyi çöz.</p>
                 <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1.5">Hesapla <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" /></span>
             </div>
          </Link>

      </div>

    </div>
  );
}