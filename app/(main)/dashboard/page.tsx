"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { 
  Moon, Sparkles, Layers, Compass, Hash, 
  ArrowRight, BrainCircuit, PlayCircle, Star,
  CreditCard, Crown
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
    // dark:bg-transparent ekledik ki arkadaki layout'un karanlık rengi (gece) buraya yansısın
    <div className="min-h-screen bg-[#faf9f6] dark:bg-transparent text-stone-800 dark:text-slate-200 font-sans pb-24 selection:bg-stone-200 dark:selection:bg-white/20 antialiased transition-colors duration-500">
      
      <main className="max-w-5xl mx-auto px-5 pt-24 md:pt-32">
        
        {/* ================= HEADER ================= */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-stone-900 dark:text-white tracking-tight leading-tight mb-3 transition-colors">
              {greeting}, <span className="text-stone-500 dark:text-amber-500">{profile?.full_name?.split(' ')[0] || "Yolcu"}</span>
            </h1>
            <p className="text-stone-500 dark:text-slate-400 text-base md:text-lg font-serif italic flex items-center gap-2 transition-colors">
               <Sparkles className="w-4 h-4 text-emerald-600 dark:text-amber-400" /> Bilinçaltın bugün ne fısıldadı?
            </p>
          </div>
          
          <div className="flex items-center">
             <div className="flex items-center gap-4 bg-white dark:bg-[#131722]/80 dark:backdrop-blur-md border border-stone-200 dark:border-white/10 pl-5 pr-2 py-2 rounded-full shadow-sm hover:shadow dark:shadow-xl transition-all">
                 <div className="flex flex-col">
                     <span className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-widest font-bold">Kredi Bakiyesi</span>
                     <span className="text-stone-900 dark:text-white font-serif text-xl leading-none font-bold">
                       {userCredits !== null ? userCredits : '...'}
                     </span>
                 </div>
                 <button 
                    onClick={() => router.push('/dashboard/pricing')} 
                    className="w-10 h-10 rounded-full bg-stone-900 hover:bg-stone-700 dark:bg-gradient-to-tr dark:from-amber-600 dark:to-amber-400 dark:hover:from-amber-500 dark:hover:to-amber-300 transition-all flex items-center justify-center shadow-sm dark:shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                 >
                    <Crown className="w-4 h-4 text-white dark:text-[#0B0F19]" />
                 </button>
             </div>
          </div>
        </header>

        {/* ================= AKILLI REKLAM MODÜLÜ ================= */}
        {showAds && (
           <div className="mb-12 bg-indigo-50/50 dark:bg-[#1A1B2E]/90 dark:backdrop-blur-xl border border-indigo-100 dark:border-purple-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm dark:shadow-2xl transition-all">
                <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left w-full md:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-purple-500/30 dark:to-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-purple-500/40 shadow-sm dark:shadow-inner shrink-0 transition-colors">
                        <PlayCircle className="w-8 h-8 text-indigo-500 dark:text-purple-300" />
                    </div>
                    <div>
                        <h3 className="text-indigo-950 dark:text-slate-100 font-serif font-bold text-xl md:text-2xl mb-1 transition-colors">Ücretsiz Kredi Kazan</h3>
                        <p className="text-indigo-700/70 dark:text-slate-400 text-sm font-medium transition-colors">Kısa bir reklam izle, analiz yolculuğuna anında devam et.</p>
                    </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-center gap-3">
                    <span className="text-xs font-bold text-indigo-500 dark:text-purple-300 bg-white dark:bg-purple-500/10 px-4 py-2 rounded-full border border-indigo-100 dark:border-purple-500/20 shadow-sm transition-colors">
                        Günlük 3 Hak
                    </span>
                    <RewardAdModal /> 
                </div>
           </div>
        )}

        {/* ================= BENTO GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(200px,auto)]">
            
            {/* 1. BÜYÜK KART: RÜYA ANALİZİ */}
            <Link href="/dashboard/ruya-analizi" className="md:col-span-8 group bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between border border-stone-200 dark:border-white/5 transition-all duration-300 hover:border-emerald-600/30 dark:hover:border-amber-500/50 hover:shadow-lg dark:hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] opacity-0 dark:opacity-100 dark:group-hover:bg-amber-500/20 transition-colors pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-10 relative z-10">
                   <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-amber-500/10 border border-emerald-100 dark:border-amber-500/30 flex items-center justify-center group-hover:bg-emerald-600 dark:group-hover:bg-amber-500/20 transition-colors duration-300 shadow-[inset_0_0_20px_rgba(251,191,36,0.0)] dark:shadow-[inset_0_0_20px_rgba(251,191,36,0.1)]">
                      <Moon className="w-7 h-7 text-emerald-600 dark:fill-amber-500/20 dark:text-amber-400 group-hover:text-white dark:group-hover:text-amber-400 transition-colors duration-300" />
                   </div>
                   <span className="bg-stone-100 dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-400 text-stone-600 dark:text-[#0B0F19] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:group-hover:text-[#0B0F19] transition-colors dark:shadow-lg">
                      <Star className="w-3 h-3 dark:fill-[#0B0F19]" /> Ana Modül
                   </span>
               </div>

               <div className="relative z-10">
                   <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-slate-100 mb-3 group-hover:text-emerald-700 dark:group-hover:text-amber-400 transition-colors">Yapay Zeka Rüya Laboratuvarı</h2>
                   <p className="text-stone-500 dark:text-slate-400 text-base md:text-lg font-light max-w-md mb-8 leading-relaxed transition-colors">
                     Diyanet kaynakları ve modern psikolojinin eşsiz sentezi. Rüyanızı yazın, saniyeler içinde şifreleri çözelim.
                   </p>
                   <span className="inline-flex items-center gap-2 text-stone-900 dark:text-amber-500 font-bold text-xs uppercase tracking-widest group-hover:text-emerald-600 dark:group-hover:text-amber-400 transition-colors dark:bg-amber-500/10 dark:px-5 dark:py-2.5 dark:rounded-xl dark:border dark:border-amber-500/20 dark:group-hover:bg-amber-500 dark:group-hover:text-[#0B0F19]">
                      Hemen Yorumla <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </span>
               </div>
            </Link>

            {/* 2. DİKEY KART: AY FAZI */}
            <Link href="/dashboard/ay-takvimi" className="md:col-span-4 group bg-stone-900 dark:bg-[#131722]/80 dark:backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-stone-800 dark:border-white/5 transition-all duration-300 hover:bg-stone-800 dark:hover:border-slate-500/50 hover:shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-0 dark:opacity-[0.05] mix-blend-overlay transition-opacity"></div>
                <div className="relative z-10 flex flex-col items-center">
                   <p className="text-[10px] font-medium text-stone-400 dark:text-slate-400 uppercase tracking-widest mb-8 border-b border-stone-700 dark:border-white/10 pb-2 transition-colors">Gökyüzü Enerjisi</p>
                   <div className="text-7xl mb-8 group-hover:scale-110 transition-transform duration-500 dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                     {currentMoon?.icon || "🌕"}
                   </div>
                   <h3 className="text-xl md:text-2xl font-serif font-bold text-white dark:text-slate-100 mb-2 transition-colors">{currentMoon?.phase || "Ay Fazı"}</h3>
                   <p className="text-stone-400 dark:text-slate-400 text-sm transition-colors">Aydınlık: <span className="text-white dark:text-slate-200 font-medium">%{currentMoon?.percentage || "..."}</span></p>
                </div>
            </Link>

            {/* 3. ORTA KART: TAROT */}
            <Link href="/dashboard/tarot" className="md:col-span-4 group bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between border border-stone-200 dark:border-white/5 transition-all duration-300 hover:border-fuchsia-600/30 dark:hover:border-fuchsia-500/40 hover:shadow-md dark:hover:shadow-[0_0_30px_rgba(217,70,239,0.1)] relative overflow-hidden">
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[50px] opacity-0 dark:opacity-100 pointer-events-none transition-opacity"></div>
               <div className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-fuchsia-500/10 border border-stone-100 dark:border-fuchsia-500/30 flex items-center justify-center mb-8 group-hover:bg-fuchsia-50 dark:group-hover:bg-fuchsia-500/20 transition-colors relative z-10">
                  <Layers className="w-6 h-6 text-stone-400 dark:text-fuchsia-400 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300 transition-colors" />
               </div>
               <div className="relative z-10">
                   <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-slate-100 mb-2 group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-400 transition-colors">Tarot Kahini</h2>
                   <p className="text-stone-500 dark:text-slate-400 text-sm mb-6 leading-relaxed transition-colors">Geçmiş, şimdi ve gelecek açılımıyla hayatındaki düğümleri çöz.</p>
                   <span className="inline-flex items-center gap-2 text-stone-400 dark:text-fuchsia-400 font-bold text-[10px] uppercase tracking-widest group-hover:text-fuchsia-600 transition-colors">
                      Kart Seç <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                   </span>
               </div>
            </Link>

            {/* 4. ORTA KART: ASTROLOJİ */}
            <Link href="/dashboard/astroloji" className="md:col-span-4 group bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between border border-stone-200 dark:border-white/5 transition-all duration-300 hover:border-blue-600/30 dark:hover:border-indigo-500/40 hover:shadow-md dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] relative overflow-hidden">
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[50px] opacity-0 dark:opacity-100 pointer-events-none transition-opacity"></div>
               <div className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-indigo-500/10 border border-stone-100 dark:border-indigo-500/30 flex items-center justify-center mb-8 group-hover:bg-blue-50 dark:group-hover:bg-indigo-500/20 transition-colors relative z-10">
                  <Compass className="w-6 h-6 text-stone-400 dark:text-indigo-400 group-hover:text-blue-600 dark:group-hover:text-indigo-300 transition-colors" />
               </div>
               <div className="relative z-10">
                   <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-slate-100 mb-2 group-hover:text-blue-700 dark:group-hover:text-indigo-400 transition-colors">Astroloji</h2>
                   <p className="text-stone-500 dark:text-slate-400 text-sm mb-6 leading-relaxed transition-colors">Doğum haritanı ve anlık gökyüzü transitlerini keşfet.</p>
                   <span className="inline-flex items-center gap-2 text-stone-400 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                      Haritayı Çıkar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                   </span>
               </div>
            </Link>

            {/* 5. ÖZEL KART: KREDİ & PAKETLER */}
            <Link href="/dashboard/pricing" className="md:col-span-4 group bg-white dark:bg-gradient-to-br dark:from-[#131722] dark:to-amber-900/20 dark:backdrop-blur-xl rounded-3xl p-8 flex flex-col justify-between border border-stone-200 dark:border-amber-500/10 transition-all duration-300 hover:border-amber-600/30 dark:hover:border-amber-500/40 hover:shadow-md dark:hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]">
               <div className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-gradient-to-br dark:from-amber-400 dark:to-amber-600 border border-stone-100 dark:border-none flex items-center justify-center mb-8 group-hover:bg-amber-50 transition-colors dark:shadow-lg relative z-10">
                  <CreditCard className="w-6 h-6 text-stone-400 dark:text-[#0B0F19] group-hover:text-amber-600 dark:group-hover:text-[#0B0F19] transition-colors" />
               </div>
               <div className="relative z-10">
                   <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-slate-100 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Mağaza</h2>
                   <p className="text-stone-500 dark:text-slate-400 text-sm mb-6 leading-relaxed transition-colors">Kredin mi bitti? Paketlerimizi incele, analiz limitine takılma.</p>
                   <span className="inline-flex items-center gap-2 text-stone-400 dark:text-amber-500 font-bold text-[10px] uppercase tracking-widest group-hover:text-amber-600 transition-colors">
                      Paketleri İncele <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                   </span>
               </div>
            </Link>

            {/* 6. KÜÇÜK KART: DUYGU ANALİZİ */}
            <Link href="/dashboard/duygu-durumu" className="md:col-span-6 group bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-stone-200 dark:border-white/5 transition-all duration-300 hover:border-teal-600/30 dark:hover:border-emerald-500/40 hover:shadow-md dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] gap-6">
               <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-emerald-500/10 border border-stone-100 dark:border-emerald-500/30 flex items-center justify-center group-hover:bg-teal-50 dark:group-hover:bg-emerald-500/20 transition-colors shrink-0">
                      <BrainCircuit className="w-6 h-6 text-stone-400 dark:text-emerald-400 group-hover:text-teal-600 transition-colors" />
                   </div>
                   <div>
                       <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-slate-100 mb-1 group-hover:text-teal-700 dark:group-hover:text-emerald-400 transition-colors">Psiko-Analiz</h3>
                       <p className="text-stone-500 dark:text-slate-400 text-sm transition-colors">Rüyalarındaki stres oranlarını bilimsel olarak ölç.</p>
                   </div>
               </div>
               <ArrowRight className="w-5 h-5 text-stone-300 dark:text-emerald-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>

            {/* 7. KÜÇÜK KART: NUMEROLOJİ */}
            <Link href="/dashboard/numeroloji" className="md:col-span-6 group bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-stone-200 dark:border-white/5 transition-all duration-300 hover:border-orange-600/30 dark:hover:border-orange-500/40 hover:shadow-md dark:hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] gap-6">
               <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-orange-500/10 border border-stone-100 dark:border-orange-500/30 flex items-center justify-center group-hover:bg-orange-50 dark:group-hover:bg-orange-500/20 transition-colors shrink-0">
                      <Hash className="w-6 h-6 text-stone-400 dark:text-orange-400 group-hover:text-orange-600 transition-colors" />
                   </div>
                   <div>
                       <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-slate-100 mb-1 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">Numeroloji</h3>
                       <p className="text-stone-500 dark:text-slate-400 text-sm transition-colors">İsminin ve doğum tarihinin sakladığı şifreyi çöz.</p>
                   </div>
               </div>
               <ArrowRight className="w-5 h-5 text-stone-300 dark:text-orange-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>

        </div>

      </main>
    </div>
  );
}