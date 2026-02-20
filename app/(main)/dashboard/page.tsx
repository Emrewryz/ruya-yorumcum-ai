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
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col min-h-screen relative z-10 font-sans">
      
      {/* ================= GÖRSELDEKİ SICAK & MİSTİK ARKA PLAN AURASI ================= */}
      <div className="fixed top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]"></div>
          <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* ================= HEADER ================= */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-slate-100 tracking-tight leading-tight mb-2">
            {greeting}, <span className="text-amber-500">{profile?.full_name?.split(' ')[0] || "Yolcu"}</span>
          </h1>
          <p className="text-slate-400 text-sm font-light flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-amber-500" /> Bilinçaltın bugün ne fısıldadı?
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-3 bg-[#131722]/80 backdrop-blur-md border border-white/5 pl-4 pr-1.5 py-1.5 rounded-full shadow-lg">
               <div className="flex flex-col">
                   <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Kredi</span>
                   <span className="text-slate-200 font-serif text-lg leading-none">{userCredits !== null ? userCredits : '...'}</span>
               </div>
               <button 
                  onClick={() => router.push('/dashboard/pricing')} 
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.4)]"
               >
                  <Crown className="w-4 h-4 text-[#0B0F19]" />
               </button>
           </div>
        </div>
      </header>

      {/* ================= AKILLI REKLAM MODÜLÜ ================= */}
      {showAds && (
         <div className="mb-10 w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative bg-[#1A1B2E]/90 backdrop-blur-xl border border-purple-500/30 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl overflow-hidden">
                <div className="absolute -left-10 -bottom-10 opacity-[0.03] pointer-events-none">
                    <PlayCircle className="w-64 h-64 text-purple-400" />
                </div>
                
                <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/10 flex items-center justify-center border border-purple-500/40 shrink-0 shadow-inner">
                        <PlayCircle className="w-7 h-7 text-purple-300" />
                    </div>
                    <div>
                        <h3 className="text-slate-100 font-bold text-lg md:text-xl mb-1">Ücretsiz Kredi Kazan</h3>
                        <p className="text-slate-400 text-sm font-light">Kısa bir reklam izle, anında yolculuğuna devam et.</p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
                    <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20">
                        3 Hakkın Kaldı
                    </span>
                    <RewardAdModal /> 
                </div>
            </div>
         </div>
      )}

      {/* ================= BENTO GRID (Daha Ferah ve Renkli) ================= */}
      {/* Satır yüksekliklerini artırarak kartlara nefes aldırdık */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. BÜYÜK KART: RÜYA ANALİZİ (Col-Span-8) */}
          <Link href="/dashboard/ruya-analizi" className="md:col-span-8 relative group bg-gradient-to-br from-[#131722]/90 to-[#0B0F19]/90 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col justify-between border border-white/5 overflow-hidden transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)] hover:-translate-y-1">
             <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/20 transition-colors pointer-events-none"></div>
             
             <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-400 shadow-[inset_0_0_20px_rgba(251,191,36,0.1)]">
                    <Moon className="w-7 h-7 fill-amber-500/20" />
                 </div>
                 <span className="bg-gradient-to-r from-amber-500 to-amber-400 text-[#0B0F19] text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <Star className="w-3 h-3 fill-[#0B0F19]" /> Ana Modül
                 </span>
             </div>

             <div className="relative z-10">
                 <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-100 mb-3 group-hover:text-amber-400 transition-colors">Yapay Zeka Rüya Laboratuvarı</h2>
                 <p className="text-slate-400 text-sm font-light max-w-md mb-6 leading-relaxed">Diyanet kaynakları ve Jung psikolojisinin eşsiz sentezi. Rüyanızı yazın, saniyeler içinde şifreleri çözelim.</p>
                 <span className="inline-flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-5 py-2.5 rounded-xl border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-[#0B0F19] transition-all">
                    Hemen Yorumla <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </span>
             </div>
          </Link>

          {/* 2. DİKEY KART: AY FAZI (Col-Span-4) */}
          <Link href="/dashboard/ay-takvimi" className="md:col-span-4 relative group bg-[#131722]/80 backdrop-blur-xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center border border-white/5 overflow-hidden transition-all duration-500 hover:border-slate-500/50 hover:-translate-y-1 hover:shadow-2xl">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-overlay"></div>
             <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-800/20 to-transparent pointer-events-none"></div>

             <div className="relative z-10 w-full flex flex-col items-center">
                 <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Gökyüzü Enerjisi</p>
                 
                 <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                   {currentMoon?.icon || "🌕"}
                 </div>
                 
                 <h3 className="text-lg md:text-xl font-bold text-slate-100 mb-2">{currentMoon?.phase || "Ay Fazı"}</h3>
                 <p className="text-slate-400 text-xs font-light">Aydınlık: <span className="text-slate-200 font-medium">%{currentMoon?.percentage || "..."}</span></p>
             </div>
          </Link>

          {/* 3. ORTA KART: TAROT (Col-Span-4) */}
          {/* Arka planda hafif mor glow */}
          <Link href="/dashboard/tarot" className="md:col-span-4 relative group bg-[#131722]/80 backdrop-blur-xl rounded-[2rem] p-7 flex flex-col justify-between border border-white/5 overflow-hidden transition-all duration-500 hover:border-fuchsia-500/40 hover:shadow-[0_0_30px_rgba(217,70,239,0.1)] hover:-translate-y-1">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[50px] pointer-events-none"></div>
             <div className="flex justify-between items-start mb-6 relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/30 text-fuchsia-400">
                    <Layers className="w-6 h-6" />
                 </div>
             </div>
             <div className="relative z-10">
                 <h2 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-fuchsia-400 transition-colors">Tarot Kahini</h2>
                 <p className="text-slate-400 text-xs font-light mb-5 leading-relaxed">Geçmiş, şimdi ve gelecek açılımıyla hayatındaki düğümleri çöz.</p>
                 <span className="inline-flex items-center gap-1.5 text-fuchsia-400 font-bold text-[10px] uppercase tracking-widest">
                    Kart Seç <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                 </span>
             </div>
          </Link>

          {/* 4. ORTA KART: ASTROLOJİ (Col-Span-4) */}
           {/* Arka planda hafif mavi glow */}
          <Link href="/dashboard/astroloji" className="md:col-span-4 relative group bg-[#131722]/80 backdrop-blur-xl rounded-[2rem] p-7 flex flex-col justify-between border border-white/5 overflow-hidden transition-all duration-500 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-y-1">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none"></div>
             <div className="flex justify-between items-start mb-6 relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                    <Compass className="w-6 h-6" />
                 </div>
             </div>
             <div className="relative z-10">
                 <h2 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">Astroloji</h2>
                 <p className="text-slate-400 text-xs font-light mb-5 leading-relaxed">Doğum haritanı ve anlık gökyüzü transitlerini keşfet.</p>
                 <span className="inline-flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                    Haritayı Çıkar <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                 </span>
             </div>
          </Link>

          {/* 5. ÖZEL KART: KREDİ & PAKETLER (Col-Span-4) */}
          <Link href="/dashboard/pricing" className="md:col-span-4 relative group bg-gradient-to-br from-[#131722] to-amber-900/20 backdrop-blur-xl rounded-[2rem] p-7 flex flex-col justify-between border border-amber-500/10 overflow-hidden transition-all duration-500 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)] hover:-translate-y-1">
             <div className="flex justify-between items-start mb-6 relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0B0F19] shadow-lg">
                    <CreditCard className="w-6 h-6" />
                 </div>
             </div>
             <div className="relative z-10">
                 <h2 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-amber-400 transition-colors">Mağaza</h2>
                 <p className="text-slate-400 text-xs font-light mb-5 leading-relaxed">Kredin mi bitti? Paketlerimizi incele, limite takılma.</p>
                 <span className="inline-flex items-center gap-1.5 text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                    Paketleri İncele <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                 </span>
             </div>
          </Link>

         
          {/* 7. KÜÇÜK KART: DUYGU ANALİZİ (Col-Span-4) */}
          <Link href="/dashboard/duygu-durumu" className="md:col-span-4 relative group bg-[#131722]/80 backdrop-blur-xl rounded-[2rem] p-6 flex flex-col justify-between border border-white/5 overflow-hidden transition-all duration-500 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:-translate-y-1">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                    <BrainCircuit className="w-5 h-5" />
                 </div>
                 <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">Psiko-Analiz</h3>
             </div>
             <div>
                 <p className="text-slate-400 text-xs font-light mb-4 leading-relaxed">Rüyalarındaki stres ve neşe oranlarını bilimsel olarak ölç.</p>
                 <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">İncele <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
             </div>
          </Link>

          {/* 8. KÜÇÜK KART: NUMEROLOJİ (Col-Span-4) */}
          <Link href="/dashboard/numeroloji" className="md:col-span-4 relative group bg-[#131722]/80 backdrop-blur-xl rounded-[2rem] p-6 flex flex-col justify-between border border-white/5 overflow-hidden transition-all duration-500 hover:border-orange-500/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:-translate-y-1">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30 text-orange-400">
                    <Hash className="w-5 h-5" />
                 </div>
                 <h3 className="text-base font-bold text-slate-100 group-hover:text-orange-400 transition-colors">Numeroloji</h3>
             </div>
             <div>
                 <p className="text-slate-400 text-xs font-light mb-4 leading-relaxed">İsminin ve doğum tarihinin sakladığı şifreyi çöz.</p>
                 <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1.5">Hesapla <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></span>
             </div>
          </Link>

      </div>

    </div>
  );
}