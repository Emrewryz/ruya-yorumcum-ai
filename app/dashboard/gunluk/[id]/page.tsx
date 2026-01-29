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

// Tablo yapılarına uygun interface'ler
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

      // A. Profil & Paket
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

      // B. Rüyaları Çek
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
            
            // C. Tarot Verisini Çek
            const { data: tarotData } = await supabase
                .from('tarot_readings')
                .select('*')
                .eq('dream_id', current.id)
                .single(); // Tek bir kayıt bekliyoruz
            
            if (tarotData) setTarot(tarotData);

            // D. Numeroloji Verisini Çek
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
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center group cursor-pointer transition-all">
       <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:bg-white/10 transition-all">
          <Lock className="w-5 h-5 text-gray-400" />
       </div>
       <h3 className="text-white font-serif text-lg mb-2 tracking-wide">{title}</h3>
       <button onClick={(e) => { e.stopPropagation(); router.push('/dashboard/pricing'); }} className="px-6 py-2 rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
         Yükselt
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
        toast.success("Görsel indirildi");
    } catch (e) { toast.error("İndirme başarısız"); }
  };

  if (loading) return <div className="min-h-[100dvh] bg-[#020617] flex items-center justify-center text-[#fbbf24] animate-pulse">Veriler yükleniyor...</div>;
  if (!dream) return <div className="min-h-[100dvh] bg-[#020617] flex items-center justify-center text-red-500">Rüya bulunamadı.</div>;

  const currentIndex = allDreams.findIndex(d => d.id === dream.id);
  
  // Şanslı sayıları belirle (Tablodan varsa oradan, yoksa AI response'dan)
  const displayNumbers = numerology?.lucky_numbers || dream.ai_response?.lucky_numbers || [];

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden flex justify-center pb-32">
      
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-purple-900/10 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>

      {/* MOBİL NAVİGASYON */}
      <div className="fixed bottom-24 left-0 right-0 px-4 flex justify-between items-center z-40 pointer-events-none">
         {currentIndex > 0 ? (
            <button onClick={() => navigateDream('prev')} className="pointer-events-auto p-3 rounded-full bg-[#0f172a]/90 backdrop-blur-xl border border-white/20 shadow-lg active:scale-90 transition-all text-white"><ChevronLeft className="w-6 h-6" /></button>
         ) : <div></div>}
         {currentIndex < allDreams.length - 1 ? (
            <button onClick={() => navigateDream('next')} className="pointer-events-auto p-3 rounded-full bg-[#0f172a]/90 backdrop-blur-xl border border-white/20 shadow-lg active:scale-90 transition-all text-white"><ChevronRight className="w-6 h-6" /></button>
         ) : <div></div>}
      </div>

      <main className="w-full max-w-5xl relative z-10">
         
         {/* HEADER */}
         <nav className="sticky top-0 z-30 w-full bg-[#020617]/90 backdrop-blur-md border-b border-white/5 px-4 py-4 md:py-6 flex justify-between items-center mb-8">
            <button onClick={() => router.push('/dashboard/gunluk')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group p-2 -ml-2 active:scale-95">
               <ArrowLeft className="w-5 h-5" />
               <span className="text-sm font-bold hidden md:inline tracking-wide">Arşive Dön</span>
            </button>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
               <Calendar className="w-3 h-3" />
               {new Date(dream.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
         </nav>

         <div className="px-4 md:px-8 space-y-8">

            {/* 1. GÖRSEL STÜDYOSU */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full rounded-[2rem] overflow-hidden bg-[#080808] border border-white/10 group shadow-2xl min-h-[400px]">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="grid md:grid-cols-2 h-full relative z-10">
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300"><Palette className="w-5 h-5" /></div>
                            <span className="text-violet-200/60 text-xs font-bold uppercase tracking-[0.2em]">Rüya Görseli</span>
                        </div>
                        <h1 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-tight">
                            {dream.dream_title || "İsimsiz Rüya"}
                        </h1>
                        <p className="text-gray-400 mb-8 leading-relaxed text-sm border-l-2 border-violet-500/30 pl-4 italic">
                           "{dream.dream_text.substring(0, 150)}..."
                        </p>
                        {hasAccess('pro') && !dream.image_url && (
                             <button onClick={() => router.push(`/dashboard/gorsel-olustur/${dream.id}`)} className="self-start px-6 py-3 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/30 font-bold text-xs uppercase tracking-widest hover:bg-violet-600/30 transition-all flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Görsel Oluştur
                             </button>
                        )}
                    </div>
                    <div className="relative h-[300px] md:h-full bg-[#050505] border-t md:border-t-0 md:border-l border-white/10 overflow-hidden">
                        {hasAccess('pro') ? (
                            dream.image_url ? (
                                <>
                                    <img src={dream.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <button onClick={handleDownloadImage} className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"><Download className="w-4 h-4" /></button>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30">
                                    <ImageIcon className="w-12 h-12 text-gray-600 mb-4" />
                                    <span className="text-gray-500 text-xs uppercase tracking-widest">Görsel Yok</span>
                                </div>
                            )
                        ) : (
                            <>
                                <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094" className="w-full h-full object-cover blur-md opacity-30" />
                                <LockedFeature title="Görsel Kilidi" />
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* 2. ANALİZ ÖZETİ */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative p-8 md:p-10 rounded-[2rem] bg-[#0c0a09] border border-white/10 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#fbbf24]"></div>
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                    <h3 className="font-serif text-[#fbbf24] text-sm tracking-[0.2em] uppercase font-bold">Rüyanın Özü</h3>
                </div>
                <p className="text-base md:text-lg leading-relaxed text-gray-300 font-light text-justify">
                    {dream.ai_response?.summary}
                </p>
            </motion.div>

            {/* 3. PSİKOLOJİK & MANEVİ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="relative p-8 rounded-[2rem] bg-[#0f172a] border border-blue-500/10 hover:border-blue-500/20 transition-all overflow-hidden">
                    {!hasAccess('pro') && <LockedFeature title="Psikolojik Derinlik" />}
                    <h3 className="font-serif text-xl text-blue-400 mb-6 flex items-center gap-3"><Brain className="w-5 h-5" /> Psikolojik Yorum</h3>
                    <p className={`text-gray-400 leading-relaxed text-sm font-light ${!hasAccess('pro') ? 'blur-sm select-none opacity-50' : ''}`}>
                        {dream.ai_response?.psychological}
                    </p>
                </div>
                <div className="relative p-8 rounded-[2rem] bg-[#022c22] border border-emerald-500/10 hover:border-emerald-500/20 transition-all overflow-hidden">
                    {!hasAccess('pro') && <LockedFeature title="Manevi Tabir" />}
                    <h3 className="font-serif text-xl text-emerald-400 mb-6 flex items-center gap-3"><Moon className="w-5 h-5" /> Manevi İşaretler</h3>
                    <p className={`text-gray-400 leading-relaxed text-sm font-light ${!hasAccess('pro') ? 'blur-sm select-none opacity-50' : ''}`}>
                        {dream.ai_response?.spiritual}
                    </p>
                </div>
            </div>

            {/* 4. WIDGET GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* A. DUYGU DURUMU */}
                <div className="relative p-8 rounded-[2rem] bg-[#080808] border border-white/10 overflow-hidden flex flex-col justify-between min-h-[250px]">
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-rose-600/10 rounded-full blur-[60px] pointer-events-none"></div>
                    <div>
                        <h4 className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Heart className="w-3 h-3" /> Ruh Hali</h4>
                        <div className="text-3xl font-serif text-rose-400 mb-2">{dream.ai_response?.mood}</div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1 uppercase tracking-wider">
                           <span>Yoğunluk</span>
                           <span>%{dream.ai_response?.mood_score || 0}</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${dream.ai_response?.mood_score}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* B. ŞANSLI SAYILAR (Numerology tablosundan) */}
                <div className="relative p-8 rounded-[2rem] bg-[#080808] border border-white/10 overflow-hidden min-h-[250px]">
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-sky-600/10 rounded-full blur-[60px] pointer-events-none"></div>
                    <h4 className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Star className="w-3 h-3" /> İşaretler</h4>
                    <div className="flex flex-wrap gap-3">
                        {displayNumbers.length > 0 ? (
                            displayNumbers.slice(0, 3).map((num: any, i: number) => (
                                <div key={i} className="w-12 h-14 rounded-xl bg-[#0f172a] border border-sky-500/20 flex items-center justify-center font-mono text-xl text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                                    {num}
                                </div>
                            ))
                        ) : (
                            <span className="text-gray-500 text-xs italic">Hesaplanmadı</span>
                        )}
                    </div>
                </div>

                {/* C. TAROT (Veritabanından) */}
                <div className="relative p-8 rounded-[2rem] bg-[#080808] border border-white/10 overflow-hidden min-h-[250px] flex flex-col items-center justify-center text-center">
                    {!hasAccess('pro') && <LockedFeature title="Tarot" />}
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-amber-600/10 rounded-full blur-[60px] pointer-events-none"></div>
                    
                    <div className="relative z-10 w-full">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Layers className="w-3 h-3 text-amber-500" />
                            <span className="text-gray-500 text-xs uppercase tracking-[0.2em]">Rüya Tarotu</span>
                        </div>
                        
                        <div className="flex flex-col items-center gap-3">
                            {/* Kart Görseli veya Sembolü */}
                            {tarot ? (
                                <div className="w-16 h-24 rounded-lg overflow-hidden border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                    {tarot.card_image_url ? (
                                        <img src={tarot.card_image_url} alt="Tarot Card" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-800 to-amber-950 flex items-center justify-center">
                                            <span className="text-amber-500 font-serif text-xs">?</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-16 h-24 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                                    <span className="text-gray-600 text-2xl opacity-30">?</span>
                                </div>
                            )}
                            
                            <div>
                                <h3 className="text-amber-400 font-serif text-lg">
                                    {tarot ? tarot.card_name : "Bakılmadı"}
                                </h3>
                                <p className="text-amber-200/40 text-[10px] uppercase tracking-wider line-clamp-1 max-w-[150px] mx-auto">
                                    {tarot ? "Yorum Arşivde" : "Veri Yok"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 5. SOHBET BUTONU */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative rounded-[2rem] bg-[#0c0a09] border border-white/10 p-8 overflow-hidden group hover:border-orange-500/30 transition-all">
                {!hasAccess('elite') && <LockedFeature title="Kahin Sohbet" />}
                <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-orange-600/5 to-transparent"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20 hidden md:block">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-serif text-2xl text-white mb-1">Rüya Kahini</h3>
                            <p className="text-gray-400 text-xs md:text-sm">Rüyanızdaki sembolleri yapay zeka ile tartışın.</p>
                        </div>
                    </div>
                    <button onClick={() => router.push(`/dashboard/sohbet/${dream.id}`)} className="w-full md:w-auto px-8 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
                        Sohbet Et <MessageCircle className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

         </div>
      </main>
    </div>
  );
}