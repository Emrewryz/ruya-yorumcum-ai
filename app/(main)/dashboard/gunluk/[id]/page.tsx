"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Lock, Sparkles, Brain, Moon, 
  MessageCircle, Layers, Share2, Heart, ChevronLeft, ChevronRight, Calendar, 
  Image as ImageIcon, Palette, Star, Download
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Tier = 'free' | 'pro' | 'elite';

interface DreamData {
  id: string;
  dream_text: string;
  dream_title: string;
  created_at: string;
  image_url: string | null;
  ai_response: any; 
}

interface TarotReading {
  card_name: string;
  interpretation: string;
  card_image_url?: string;
}

interface NumerologyReport {
  lucky_numbers: number[];
  analysis: any;
}

export default function DreamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [dream, setDream] = useState<DreamData | null>(null);
  const [tarot, setTarot] = useState<TarotReading | null>(null);
  const [numerology, setNumerology] = useState<NumerologyReport | null>(null);
  const [allDreams, setAllDreams] = useState<DreamData[]>([]);
  const [userTier, setUserTier] = useState<Tier>('free'); 
  const [loading, setLoading] = useState(true);

  // 1. VERİLERİ ÇEK
  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      if (profile?.subscription_tier) {
          let tier = profile.subscription_tier.toLowerCase();
          if (tier === 'explorer') tier = 'pro';
          if (tier === 'seer') tier = 'elite';
          setUserTier(tier as Tier);
      }

      const { data: dreamsData } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dreamsData) {
        setAllDreams(dreamsData);
        const current = dreamsData.find(d => d.id === params.id);
        
        if (current) {
            setDream(current);
            
            const { data: tarotData } = await supabase
                .from('tarot_readings')
                .select('*')
                .eq('dream_id', current.id)
                .single(); 
            
            if (tarotData) setTarot(tarotData);

            const { data: numData } = await supabase
                .from('numerology_reports')
                .select('*')
                .eq('dream_id', current.id)
                .single();
            
            if (numData) setNumerology(numData);
        }
      }
      setLoading(false);
    };

    getData();
  }, [params.id, router, supabase]);

  // Navigasyon
  const navigateDream = (direction: 'prev' | 'next') => {
    if (!dream || allDreams.length === 0) return;
    const currentIndex = allDreams.findIndex(d => d.id === dream.id);
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < allDreams.length) {
       router.push(`/dashboard/gunluk/${allDreams[newIndex].id}`);
    }
  };

  const hasAccess = (requiredTier: 'pro' | 'elite') => {
    const levels = { free: 0, pro: 1, elite: 2 };
    return (levels[userTier] || 0) >= levels[requiredTier];
  };

  const LockedFeature = ({ title }: { title: string }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0c10]/90 backdrop-blur-md p-4 md:p-6 text-center group cursor-pointer transition-all rounded-[2rem]">
       <div className="p-3 md:p-4 rounded-full bg-white/5 border border-white/10 mb-3 md:mb-4 group-hover:bg-white/10 transition-all">
          <Lock className="w-5 h-5 text-amber-500/80" />
       </div>
       <h3 className="text-white font-serif text-base md:text-lg mb-2 tracking-wide">{title}</h3>
       <button onClick={(e) => { e.stopPropagation(); router.push('/dashboard/pricing'); }} className="px-6 py-2.5 rounded-full border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-[#0a0c10] transition-all">
         Kilidi Aç
       </button>
    </div>
  );

  const handleDownloadImage = async () => {
    if (!dream?.image_url) return;
    try {
        const response = await fetch(dream.image_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ruya-gorseli-${dream.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Görsel indirildi");
    } catch (e) { toast.error("İndirme başarısız"); }
  };

  if (loading) return (
     <div className="w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
           <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
           <p className="text-slate-500 text-xs uppercase tracking-widest font-mono">Arşiv Taranıyor...</p>
        </div>
     </div>
  );

  if (!dream) return (
     <div className="w-full flex items-center justify-center min-h-[60vh] text-red-500">Rüya bulunamadı.</div>
  );

  const currentIndex = allDreams.findIndex(d => d.id === dream.id);
  const displayNumbers = numerology?.lucky_numbers || dream.ai_response?.lucky_numbers || [];

  return (
    // İÇ İÇE GEÇMEYİ ENGELLEYEN YENİ LAYOUT (Sidebar'sız, relative)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-amber-500/30">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>

      {/* MOBİL NAVİGASYON (Önceki/Sonraki Rüya) */}
      <div className="fixed bottom-20 md:bottom-10 left-0 right-0 px-4 md:px-10 flex justify-between items-center z-40 pointer-events-none max-w-[1400px] mx-auto">
         {currentIndex > 0 ? (
            <button onClick={() => navigateDream('prev')} className="pointer-events-auto p-3 md:p-4 rounded-full bg-[#131722]/90 backdrop-blur-xl border border-white/10 shadow-2xl active:scale-90 transition-all text-slate-300 hover:text-white hover:border-amber-500/30">
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
         ) : <div></div>}
         {currentIndex < allDreams.length - 1 ? (
            <button onClick={() => navigateDream('next')} className="pointer-events-auto p-3 md:p-4 rounded-full bg-[#131722]/90 backdrop-blur-xl border border-white/10 shadow-2xl active:scale-90 transition-all text-slate-300 hover:text-white hover:border-amber-500/30">
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
         ) : <div></div>}
      </div>

      {/* HEADER (Arşive Dön) */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex items-center justify-between mt-2 md:mt-4 z-30">
        <button 
           onClick={() => router.push('/dashboard/gunluk')} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Arşive Dön</span>
        </button>
        
        <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-[#131722]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/5 shadow-sm">
           <Calendar className="w-3.5 h-3.5 text-amber-500" />
           {new Date(dream.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-0 pt-4 relative z-10 flex flex-col space-y-6 md:space-y-8">
         
         {/* 1. GÖRSEL STÜDYOSU / RÜYA METNİ */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full rounded-[2.5rem] overflow-hidden bg-[#080808] border border-white/5 group shadow-2xl min-h-[400px]">
            <div className="grid md:grid-cols-2 h-full relative z-10">
                {/* Metin Alanı */}
                <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1 relative bg-[#131722]/40 backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-transparent pointer-events-none"></div>
                    
                    <div className="flex items-center gap-2 md:gap-3 mb-6 relative z-10">
                        <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400"><Palette className="w-4 h-4" /></div>
                        <span className="text-violet-300/80 text-[10px] md:text-xs font-bold uppercase tracking-widest">Rüya Detayı</span>
                    </div>
                    
                    <h1 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-tight relative z-10">
                        {dream.dream_title || "İsimsiz Rüya"}
                    </h1>
                    
                    <p className="text-slate-400 mb-8 leading-relaxed text-sm md:text-base border-l border-violet-500/30 pl-4 italic relative z-10 font-light">
                        "{dream.dream_text.length > 250 ? dream.dream_text.substring(0, 250) + "..." : dream.dream_text}"
                    </p>
                    
                    {hasAccess('pro') && !dream.image_url && (
                        <button onClick={() => router.push(`/dashboard/gorsel-olustur/${dream.id}`)} className="self-start px-6 py-3.5 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 font-bold text-xs uppercase tracking-widest hover:bg-violet-600/30 transition-all flex items-center gap-2 w-full md:w-auto justify-center relative z-10">
                            <ImageIcon className="w-4 h-4" /> Görsel Oluştur
                        </button>
                    )}
                </div>
                
                {/* Görsel Alanı */}
                <div className="relative h-[300px] md:h-full bg-[#050505] border-b md:border-b-0 md:border-l border-white/5 overflow-hidden order-1 md:order-2">
                    {hasAccess('pro') ? (
                        dream.image_url ? (
                            <>
                                <img src={dream.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Rüya Görseli" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <button onClick={handleDownloadImage} className="absolute bottom-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-colors shadow-lg border border-white/10">
                                   <Download className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
                        )
                    ) : (
                        <>
                            <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094" className="w-full h-full object-cover blur-md opacity-30" alt="Kilitli Görsel" />
                            <LockedFeature title="Görsel Stüdyosu Kilidi" />
                        </>
                    )}
                    
                    {/* Görsel yoksa ortada duracak ikon */}
                    {(!dream.image_url && hasAccess('pro')) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <ImageIcon className="w-12 h-12 text-slate-600 mb-3 opacity-50" />
                            <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold opacity-50">Sanat Eseri Bekleniyor</span>
                        </div>
                    )}
                </div>
            </div>
         </motion.div>

         {/* 2. ANALİZ ÖZETİ */}
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#131722]/80 backdrop-blur-xl border border-white/5 overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"><Sparkles className="w-5 h-5 text-amber-400" /></div>
                <h3 className="font-serif text-amber-500 text-sm md:text-base tracking-[0.2em] uppercase font-bold">Rüyanın Özü</h3>
            </div>
            <p className="text-base md:text-xl leading-[1.8] text-slate-300 font-light text-justify">
                {dream.ai_response?.summary}
            </p>
         </motion.div>

         {/* 3. PSİKOLOJİK & MANEVİ (Mat Siyah Tema) */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Psikolojik Yorum */}
            <div className="relative p-8 rounded-[2rem] bg-[#131722]/60 backdrop-blur-md border border-white/5 hover:border-blue-500/30 transition-all overflow-hidden group min-h-[250px]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
                {!hasAccess('pro') && <LockedFeature title="Psikolojik Derinlik" />}
                
                <h3 className="font-serif text-xl md:text-2xl text-blue-400 mb-6 flex items-center gap-3 relative z-10">
                   <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><Brain className="w-5 h-5" /></div> 
                   Psikolojik Yorum
                </h3>
                <p className={`text-slate-300 leading-relaxed text-sm font-light relative z-10 ${!hasAccess('pro') ? 'blur-sm select-none opacity-50' : ''}`}>
                    {dream.ai_response?.psychological}
                </p>
            </div>

            {/* Manevi İşaretler */}
            <div className="relative p-8 rounded-[2rem] bg-[#131722]/60 backdrop-blur-md border border-white/5 hover:border-emerald-500/30 transition-all overflow-hidden group min-h-[250px]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
                {!hasAccess('pro') && <LockedFeature title="Manevi Tabir" />}
                
                <h3 className="font-serif text-xl md:text-2xl text-emerald-400 mb-6 flex items-center gap-3 relative z-10">
                   <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Moon className="w-5 h-5" /></div>
                   Manevi İşaretler
                </h3>
                <p className={`text-slate-300 leading-relaxed text-sm font-light relative z-10 ${!hasAccess('pro') ? 'blur-sm select-none opacity-50' : ''}`}>
                    {dream.ai_response?.spiritual}
                </p>
            </div>
         </div>

         {/* 4. WIDGET GRID (Bento Alt Modüller) */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            {/* A. DUYGU DURUMU */}
            <div 
               onClick={() => router.push('/dashboard/duygu-durumu')} 
               className="relative p-8 rounded-[2rem] bg-[#0a0c10] border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[240px] group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                       <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400"><Heart className="w-4 h-4" /></div>
                       <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Ruh Hali</span>
                    </div>
                    <div className="text-3xl font-serif text-rose-400 mb-2">{dream.ai_response?.mood}</div>
                </div>
                <div className="relative z-10 mt-auto">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-bold">
                        <span>Yoğunluk</span>
                        <span>%{dream.ai_response?.mood_score || 0}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#131722] rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: `${dream.ai_response?.mood_score}%` }}></div>
                    </div>
                </div>
            </div>

            {/* B. ŞANSLI SAYILAR (Numeroloji) */}
            <div 
               className="relative p-8 rounded-[2rem] bg-[#0a0c10] border border-white/5 hover:border-sky-500/30 transition-all overflow-hidden flex flex-col min-h-[240px] group"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-sky-500/10 transition-colors"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                   <div className="p-2 bg-sky-500/10 rounded-lg border border-sky-500/20 text-sky-400"><Star className="w-4 h-4" /></div>
                   <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">İşaretler</span>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3 relative z-10 mt-auto">
                    {displayNumbers.length > 0 ? (
                        displayNumbers.slice(0, 3).map((num: any, i: number) => (
                            <div key={i} className="w-12 h-14 rounded-xl bg-[#131722] border border-sky-500/20 flex items-center justify-center font-mono text-xl font-bold text-sky-400 shadow-inner group-hover:bg-sky-500/5 transition-colors">
                                {num}
                            </div>
                        ))
                    ) : (
                        <span className="text-slate-600 text-xs italic">Hesaplanmadı</span>
                    )}
                </div>
            </div>

            {/* C. TAROT */}
            <div 
               onClick={() => { if(hasAccess('pro')) router.push('/dashboard/tarot') }}
               className="relative p-8 rounded-[2rem] bg-[#0a0c10] border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer overflow-hidden min-h-[240px] flex flex-col group"
            >
                {!hasAccess('pro') && <LockedFeature title="Tarot" />}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                   <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400"><Layers className="w-4 h-4" /></div>
                   <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Rüya Tarotu</span>
                </div>
                
                <div className="flex items-center gap-4 relative z-10 mt-auto bg-[#131722] p-3 rounded-2xl border border-white/5 shadow-inner">
                    {tarot ? (
                        <div className="w-12 h-16 rounded-lg overflow-hidden border border-amber-500/30 shrink-0">
                            {tarot.card_image_url ? (
                                <img src={tarot.card_image_url} alt="Tarot Card" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-amber-800 to-amber-950 flex items-center justify-center">
                                    <span className="text-amber-500 font-serif text-xs">?</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-12 h-16 bg-[#0a0c10] rounded-lg border border-white/5 flex items-center justify-center shrink-0">
                            <span className="text-slate-600 text-lg opacity-50">?</span>
                        </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-amber-400 font-serif text-sm truncate mb-0.5">
                            {tarot ? tarot.card_name : "Bakılmadı"}
                        </h3>
                        <p className="text-slate-500 text-[9px] uppercase tracking-widest font-bold">
                            {tarot ? "Arşivde" : "Veri Yok"}
                        </p>
                    </div>
                </div>
            </div>

         </div>

         {/* 5. SOHBET BUTONU (Tam Genişlik) */}
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative rounded-[2rem] bg-gradient-to-r from-[#131722] to-[#0a0c10] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-orange-500/30 transition-all shadow-xl">
            {!hasAccess('elite') && <LockedFeature title="Kahin Sohbet" />}
            
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none"></div>
            
            <div className="flex items-center gap-5 relative z-10 w-full md:w-auto text-center md:text-left">
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hidden md:flex shrink-0 shadow-inner">
                    <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="font-serif text-2xl text-white mb-1">Rüya Kahini</h3>
                    <p className="text-slate-400 text-sm font-light">Rüyanızdaki sembolleri yapay zeka ile tartışın ve derinleştirin.</p>
                </div>
            </div>
            
            <button onClick={() => router.push(`/dashboard/sohbet/${dream.id}`)} className="w-full md:w-auto px-8 py-4 rounded-xl bg-white text-[#0a0c10] font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(255,255,255,0.1)] relative z-10 active:scale-95">
                Sohbete Başla <MessageCircle className="w-4 h-4" />
            </button>
         </motion.div>

      </main>
    </div>
  );
}