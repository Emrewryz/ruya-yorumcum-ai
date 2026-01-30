"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, FileText, Settings, Mic, Sparkles, 
  Crown, PenLine, PauseCircle, 
  MessageCircle, Layers, Brain, Lock, Heart, Trash2, 
  Image as ImageIcon, Eye, Loader2, Download, Check, Share2, Palette,
  Star, ChevronRight, LogOut, RefreshCw,Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeDream } from "@/app/actions/analyze-dream";
import { getMoonPhase } from "@/utils/moon"; 
import { toast } from "sonner"; 

type Tier = 'free' | 'pro' | 'elite';

// --- DAKTİLO EFEKTİ ---
const TypewriterText = ({ text, speed = 15 }: { text: string, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    if (!text) { setDisplayedText(""); return; }
    setDisplayedText(""); 
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <p className="text-gray-300 leading-relaxed text-sm md:text-base font-light text-justify">{displayedText}</p>;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const resultRef = useRef<HTMLDivElement>(null); 

  // --- UI State'leri ---
  const [dreamText, setDreamText] = useState("");
  const [userName, setUserName] = useState("Yolcu");
  const [greeting, setGreeting] = useState("Merhaba"); 
  const [isRecording, setIsRecording] = useState(false);
  const [currentMoon, setCurrentMoon] = useState<any>(null);
  
  // --- Analiz State'leri ---
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'COMPLETED'>('IDLE');
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null); 
  const [userTier, setUserTier] = useState<Tier>('free'); 
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  
  // --- Görsel State'leri ---
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // 1. BAŞLANGIÇ: VERİTABANI SENKRONİZASYONU
  useEffect(() => {
    const initDashboard = async () => {
        // Ay Fazı
        setCurrentMoon(getMoonPhase());

        // Selamlama
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Günaydın");
        else if (hour >= 12 && hour < 17) setGreeting("Tünaydın");
        else if (hour >= 17 && hour < 23) setGreeting("İyi Akşamlar");
        else setGreeting("İyi Geceler");

        // Kullanıcı Bilgisi
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; 

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, subscription_tier')
            .eq('id', user.id)
            .single();
        
        if (profile) {
            setUserName(profile.full_name ? profile.full_name.split(' ')[0] : "Yolcu");
            let tier = profile.subscription_tier?.toLowerCase() || 'free';
            if (tier === 'explorer') tier = 'pro';
            if (tier === 'seer') tier = 'elite';
            setUserTier(tier as Tier);
        }

        // Rüyayı Geri Yükle (Varsa)
        const savedDreamId = localStorage.getItem('saved_dream_id');
        if (savedDreamId) {
            const { data: dreamData, error } = await supabase
                .from('dreams')
                .select('*')
                .eq('id', savedDreamId)
                .single();

            if (dreamData && !error) {
                setDreamText(dreamData.dream_text);
                setAnalysisResult(dreamData.ai_response);
                setCurrentDreamId(dreamData.id);
                setStatus('COMPLETED');
                if (dreamData.image_url) setGeneratedImage(dreamData.image_url);
            } else {
                clearLocalStorage();
            }
        } else {
            const savedDraft = localStorage.getItem('saved_dream_text');
            if (savedDraft) setDreamText(savedDraft);
        }
    };

    initDashboard();
  }, [supabase]);

  // 2. STATE KAYDET
  useEffect(() => {
    if (dreamText && status !== 'COMPLETED') localStorage.setItem('saved_dream_text', dreamText);
    if (status === 'COMPLETED' && currentDreamId) {
        localStorage.setItem('saved_status', 'COMPLETED');
        localStorage.setItem('saved_dream_id', currentDreamId);
    }
  }, [dreamText, status, currentDreamId]);

  const clearLocalStorage = () => {
      localStorage.removeItem('saved_dream_text');
      localStorage.removeItem('saved_analysis_result');
      localStorage.removeItem('saved_status');
      localStorage.removeItem('saved_dream_id');
  };

  const clearDashboard = () => {
      setDreamText("");
      setAnalysisResult(null);
      setCurrentDreamId(null);
      setStatus("IDLE");
      setGeneratedImage(null);
      clearLocalStorage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!dreamText.trim() || status === 'LOADING') return;
    
    setStatus('LOADING');
    setLoadingStep(0);
    setGeneratedImage(null);

    const loadingInterval = setInterval(() => {
       setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2000);

    try {
       const result = await analyzeDream(dreamText);
       clearInterval(loadingInterval);

       if (result.error) {
          toast.error(result.error);
          setStatus('IDLE');
          return;
       }

       if (result.success && result.data) {
          setAnalysisResult(result.data.ai_response);
          setCurrentDreamId(result.data.id);
          setStatus('COMPLETED');
          toast.success("Kahinler rüyanı yorumladı! ✨");
          
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
       }
    } catch (e) {
       toast.error("Kahinlerle bağlantı kurulamadı.");
       setStatus('IDLE');
    }
  };

  // --- Yardımcı Fonksiyonlar ---
  const handleDownloadImage = async () => { /* ... İndirme Kodu ... */ };
  const handleShareImage = async () => { /* ... Paylaşma Kodu ... */ };
  const hasAccess = (requiredTier: 'pro' | 'elite') => {
    const levels = { free: 0, pro: 1, elite: 2 };
    const currentLevel = levels[userTier] || 0; 
    const requiredLevel = levels[requiredTier];
    return currentLevel >= requiredLevel;
  };

  // --- Kilitli Özellik Bileşenleri ---
 // --- Premium Siyah/Beyaz Kilit Bileşeni ---
  const LockedFeature = ({ title }: { title: string }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center group cursor-pointer transition-all" onClick={(e) => { e.stopPropagation(); router.push('/dashboard/pricing'); }}>
       <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500">
          <Lock className="w-5 h-5 text-gray-300" />
       </div>
       <h3 className="text-white font-serif text-lg mb-2 tracking-wide">{title}</h3>
       <p className="text-gray-500 text-xs mb-6 max-w-[180px] font-light">Bu premium analize erişmek için kilidi açın.</p>
       <button className="px-6 py-2 rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300">
         Yükselt
       </button>
    </div>
  );

  const loadingMessages = [
    "Bilinçaltı taranıyor...", 
    "Semboller analiz ediliyor...", 
    "Yıldız haritası hizalanıyor...", 
    "Kader işaretleri okunuyor...", 
    "Analiz tamamlanıyor..." 
  ];

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden flex pb-0">
      
      {/* --- ATMOSFER --- */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none z-0"></div>
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#4c1d95]/20 to-transparent pointer-events-none z-0"></div>

     {/* --- SIDEBAR (MASAÜSTÜ) --- */}
    


<aside className="fixed left-0 top-0 bottom-0 z-50 w-20 hidden md:flex flex-col items-center py-8 bg-[#020617]/80 backdrop-blur-xl border-r border-white/5">
    {/* LOGO */}
    <div className="mb-10 cursor-pointer" onClick={() => router.push('/')}>
       <div className="w-10 h-10 rounded-xl bg-[#fbbf24] flex items-center justify-center text-black shadow-[0_0_20px_rgba(251,191,36,0.4)]">
          <Moon className="w-6 h-6" />
       </div>
    </div>
    
    <nav className="flex-1 flex flex-col gap-4 w-full px-2 overflow-y-auto no-scrollbar pb-4">
       
       {/* --- 1. RÜYA BÖLÜMÜ --- */}
       <button onClick={clearDashboard} className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${status !== 'COMPLETED' ? 'text-[#fbbf24] bg-white/5' : 'text-gray-500 hover:text-white'}`}>
           <div className={`p-2 rounded-lg ${status !== 'COMPLETED' ? 'bg-[#fbbf24]/20' : 'group-hover:bg-white/10'}`}>
               <PenLine className="w-5 h-5" />
           </div>
           <span className="text-[9px] font-bold uppercase tracking-wider">Yorumla</span>
       </button>
       
       <button onClick={() => router.push('/dashboard/gunluk')} className="group flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-white transition-all">
           <div className="p-2 rounded-lg group-hover:bg-white/10">
               <FileText className="w-5 h-5" />
           </div>
           <span className="text-[9px] font-bold uppercase tracking-wider">Arşiv</span>
       </button>

      
       <div className="w-full h-px bg-white/10 my-1"></div>

       {/* --- 2. MİSTİK ARAÇLAR --- */}
       
       {/* TAROT */}
       <button onClick={() => router.push('/dashboard/tarot')} className="group flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-pink-400 transition-all">
           <div className="p-2 rounded-lg group-hover:bg-pink-500/10">
               <Sparkles className="w-5 h-5" />
           </div>
           <span className="text-[9px] font-bold uppercase tracking-wider">Tarot</span>
       </button>

       

       

       {/* --- 3. PREMIUM VE AYARLAR --- */}
       
      

       {/* AYARLAR (SETTINGS) - EN SONA EKLENDİ */}
       <button onClick={() => router.push('/dashboard/settings')} className="group flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-white transition-all">
           <div className="p-2 rounded-lg group-hover:bg-white/10">
               <Settings className="w-5 h-5" />
           </div>
           <span className="text-[9px] font-bold uppercase tracking-wider">Ayarlar</span>
       </button>

    </nav>
</aside>
      <main className="flex-1 flex flex-col relative z-10 w-full min-h-screen md:pl-20">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-12 py-8 flex flex-col min-h-screen">

            {/* HEADER */}
{/* ... önceki kodlar ... */}

{/* HEADER */}
{/* HEADER */}
<header className="flex justify-between items-center mb-10">
    <div>
        <h1 className="font-serif text-3xl md:text-4xl text-white tracking-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]">{userName}</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fbbf24]" /> 
            Bilinçaltın bugün sana ne fısıldadı?
        </p>
    </div>

    {/* SAĞ ÜST BUTON GRUBU */}
    <div className="flex items-center gap-3">
        
        {/* --- DİNAMİK PAKET BUTONU --- */}
        {(() => {
            const tierStyles = {
                free: {
                    label: "Premium'a Geç",
                    mobileLabel: "Yükselt",
                    bg: "bg-gradient-to-r from-gray-800 to-gray-700 border border-white/10", // Free için daha sade, premium'a teşvik edici
                    text: "text-white",
                    icon: Crown,
                    animation: "animate-pulse-slow hover:border-[#fbbf24]/50"
                },
                pro: {
                    label: "Pro Üyelik",
                    mobileLabel: "Pro",
                    bg: "bg-blue-600", // Mavi (İstediğin gibi)
                    text: "text-white",
                    icon: Star,
                    animation: "hover:bg-blue-500 shadow-lg shadow-blue-900/20"
                },
                elite: {
                    label: "Elite Kahin",
                    mobileLabel: "Elite",
                    bg: "bg-[#fbbf24]", // Sarı Sade (İstediğin gibi)
                    text: "text-black",
                    icon: Sparkles,
                    animation: "hover:bg-[#fcd34d] shadow-lg shadow-amber-500/20"
                }
            };

            const currentStyle = tierStyles[userTier] || tierStyles.free;
            const TierIcon = currentStyle.icon;

            return (
                <button 
                    onClick={() => router.push('/dashboard/pricing')} 
                    className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 rounded-full ${currentStyle.bg} ${currentStyle.text} font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 ${currentStyle.animation}`}
                >
                    <TierIcon className="w-4 h-4" />
                    <span className="hidden md:inline">{currentStyle.label}</span>
                    <span className="md:hidden">{currentStyle.mobileLabel}</span>
                </button>
            );
        })()}
        {/* ------------------------------------ */}

        {/* Ay Durumu Butonu */}
        <button 
            onClick={() => router.push('/dashboard/ay-takvimi')}
            className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md hover:bg-white/10 hover:border-[#fbbf24]/50 transition-all group"
        >
            <div className="text-2xl group-hover:scale-110 transition-transform">{currentMoon ? currentMoon.icon : "🌕"}</div>
            <div className="flex flex-col items-start">
                <span className="text-xs font-bold text-[#fbbf24] uppercase group-hover:text-[#fcd34d] transition-colors">{currentMoon ? currentMoon.phase : "Ay Fazı"}</span>
                <span className="text-[10px] text-gray-400">Enerji: {currentMoon ? `%${currentMoon.percentage} Aydınlık` : "..."}</span>
            </div>
        </button>

    </div>
</header>

            {/* --- RÜYA GİRİŞ ALANI (CENTER STAGE) --- */}
            <div className="flex-1 flex flex-col w-full relative transition-all duration-700 mb-12">
                
                {/* Bilgilendirme Metni */}
                <div className="mb-4 flex items-center gap-2 px-1">
                   <div className="w-1 h-8 bg-gradient-to-b from-[#8b5cf6] to-transparent rounded-full"></div>
                   <p className="text-sm text-gray-400 leading-snug max-w-2xl">
                      <span className="text-white font-bold">İpucu:</span> Rüyanı ne kadar detaylı anlatırsan (renkler, duygular, kişiler), yapay zeka analizimiz o kadar keskin ve doğru sonuçlar verir.
                   </p>
                </div>

                {/* Textarea Container */}
                <div className="w-full relative group rounded-[2rem] p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-2xl">
                   <div className="relative bg-[#0a0a0a] rounded-[2rem] overflow-hidden min-h-[300px] flex flex-col">
                       
                       {/* TEXT AREA */}
                       <textarea 
                         value={dreamText}
                         onChange={(e) => setDreamText(e.target.value)}
                         disabled={status !== 'IDLE'} 
                         placeholder="Dün gece gördüklerini buraya dök... (Örn: Eski bir evdeydim, pencerelerden mor bir ışık sızıyordu...)"
                         className={`w-full flex-1 bg-transparent text-lg md:text-xl text-white placeholder-gray-600 font-medium font-sans border-none outline-none resize-none leading-relaxed tracking-wide p-8 pb-20 scrollbar-thin scrollbar-thumb-[#8b5cf6]/20 scrollbar-track-transparent selection:bg-[#8b5cf6]/30 transition-all ${status === 'COMPLETED' ? 'blur-sm opacity-50' : 'opacity-100'}`}
                       ></textarea>
                       
                       {/* KONTROLLER (İÇERİDE - ALTTA) */}
                       {status === 'IDLE' && (
                           <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/5">
                              {/* Sol: Mikrofon */}
                              <button onClick={() => setIsRecording(!isRecording)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
                                 {isRecording ? <PauseCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                 <span className="hidden md:inline">{isRecording ? "Dinleniyor..." : "Sesli Anlat"}</span>
                              </button>

                              {/* Karakter Sayacı */}
                              <span className="text-[10px] text-gray-600 font-mono hidden md:block">{dreamText.length} karakter</span>

                              {/* Sağ: Analiz Butonu */}
                              <button 
                                onClick={handleAnalyze} 
                                disabled={!dreamText.trim()}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-violet-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                 Yorumla <Sparkles className="w-4 h-4" />
                              </button>
                           </div>
                       )}

                       {/* YÜKLENİYOR DURUMU */}
                       {status === 'LOADING' && (
                           <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                               <div className="flex flex-col items-center gap-4">
                                   <Loader2 className="w-10 h-10 text-[#fbbf24] animate-spin" />
                                   <p className="text-[#fbbf24] text-sm font-bold animate-pulse uppercase tracking-widest">{loadingMessages[loadingStep]}</p>
                               </div>
                           </div>
                       )}

                       {/* TAMAMLANDI - KİLİTLİ DURUM OVERLAY */}
                       {status === 'COMPLETED' && (
                           <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                               <motion.button 
                                 initial={{ scale: 0.9, opacity: 0 }}
                                 animate={{ scale: 1, opacity: 1 }}
                                 onClick={clearDashboard}
                                 className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold backdrop-blur-md shadow-2xl hover:bg-white/20 hover:scale-105 transition-all flex items-center gap-3"
                               >
                                   <RefreshCw className="w-5 h-5" /> Rüyadan Çık / Yeni Rüya
                               </motion.button>
                           </div>
                       )}
                   </div>
                </div>
            </div>

            {/* --- ANALİZ SONUÇLARI --- */}
            <div ref={resultRef} className="w-full">
               <AnimatePresence>
                  {status === 'COMPLETED' && analysisResult && (
                     <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="pb-32 space-y-12">
                        
                        {/* Başlık ve Özet */}
                        <div className="text-center mb-16">
                           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-xs font-bold uppercase tracking-widest mb-6">
                              <Check className="w-4 h-4" /> Analiz Tamamlandı
                           </div>
                           <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                              {analysisResult.title || "Rüyanın Gizli Mesajı"}
                           </h2>
                           <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative text-left">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#fbbf24] to-transparent"></div>
                              <TypewriterText text={analysisResult.summary} speed={20} />
                           </div>
                        </div>

                        {/* 2 Sütunlu Detay Analiz */}
                        <div className="grid md:grid-cols-2 gap-8">
                           {/* Psikolojik (Sol) */}
                           <div className="relative p-8 rounded-[2.5rem] bg-[#0f172a] border border-blue-500/10 hover:border-blue-500/30 transition-colors shadow-2xl overflow-hidden group">
                              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                 <Brain className="w-32 h-32 text-blue-500" />
                              </div>
                              <h3 className="font-serif text-2xl text-blue-400 mb-6 flex items-center gap-3">
                                 <Brain className="w-6 h-6" /> Bilinçaltı Analizi
                              </h3>
                              {!hasAccess('pro') ? <LockedFeature title="Psikolojik Derinlik" /> : (
                                 <div className="prose prose-invert text-gray-300 text-sm leading-relaxed">
                                    <TypewriterText text={analysisResult.psychological} speed={10} />
                                 </div>
                              )}
                           </div>

                           {/* Manevi (Sağ) */}
                           <div className="relative p-8 rounded-[2.5rem] bg-[#022c22] border border-emerald-500/10 hover:border-emerald-500/30 transition-colors shadow-2xl overflow-hidden group">
                              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                 <Moon className="w-32 h-32 text-emerald-500" />
                              </div>
                              <h3 className="font-serif text-2xl text-emerald-400 mb-6 flex items-center gap-3">
                                 <Moon className="w-6 h-6" /> Manevi Mesaj
                              </h3>
                              {!hasAccess('pro') ? <LockedFeature title="Manevi Tabir" /> : (
                                 <div className="prose prose-invert text-gray-300 text-sm leading-relaxed">
                                    <TypewriterText text={analysisResult.spiritual} speed={10} />
                                 </div>
                              )}
                           </div>
                        </div>

    {/* --- PREMIUM RENKLİ GRID --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           
                           {/* 1. GÖRSEL STÜDYOSU (Geniş Kart) */}
                           <div className="relative col-span-1 md:col-span-2 rounded-[2rem] overflow-hidden bg-[#080808] border border-white/10 group shadow-2xl min-h-[450px]">
                              {/* Arkaplan Glow Efekti (Mor) */}
                              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                              
                              <div className="grid md:grid-cols-2 h-full relative z-10">
                                 {/* Sol: Metin ve Kontroller */}
                                 <div className="p-10 md:p-14 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-6">
                                       <div className="p-2 rounded-lg bg-violet-500/20 text-violet-300">
                                          <Palette className="w-5 h-5" />
                                       </div>
                                       <span className="text-violet-200/60 text-xs font-bold uppercase tracking-[0.2em]">Dream Studio v2.0</span>
                                    </div>
                                    
                                    <h3 className="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">
                                       Rüyanın <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Sanat Hali</span>
                                    </h3>
                                    
                                    <p className="text-gray-400 mb-10 leading-relaxed text-sm border-l-2 border-violet-500/30 pl-4">
                                       Bilinçaltındaki silik görüntüleri, yüksek çözünürlüklü dijital bir sanat eserine dönüştür. Her detay, yapay zeka fırçasıyla yeniden çizilir.
                                    </p>
                                    
                                    {hasAccess('pro') ? (
                                       <button 
                                          onClick={() => router.push(`/dashboard/gorsel-olustur/${currentDreamId}`)} 
                                          className="self-start px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                                       >
                                          <ImageIcon className="w-5 h-5" /> Görseli Oluştur
                                       </button>
                                    ) : (
                                       <div className="self-start px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-bold text-sm flex items-center gap-3 cursor-not-allowed">
                                          <Lock className="w-4 h-4" /> Studio Erişimi Kilitli
                                       </div>
                                    )}
                                 </div>
                                 
                                 {/* Sağ: Görsel Alanı */}
                                 <div className="relative h-[300px] md:h-full bg-[#050505] border-t md:border-t-0 md:border-l border-white/10 overflow-hidden group-hover:border-violet-500/30 transition-colors">
                                    {generatedImage ? (
                                       <>
                                          <img src={generatedImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Oluşturulan Rüya" />
                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                                             <div className="flex items-center justify-between">
                                                <span className="text-white text-xs font-bold">Oluşturuldu</span>
                                                <button onClick={handleDownloadImage} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><Download className="w-4 h-4" /></button>
                                             </div>
                                          </div>
                                       </>
                                    ) : (
                                       /* Placeholder Durumu */
                                       <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
                                          
                                          {/* Placeholder Image Layer */}
                                          <div className="w-full h-full absolute inset-0 opacity-40 mix-blend-overlay">
                                              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Placeholder" />
                                          </div>

                                          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                                              <div className="w-16 h-16 rounded-2xl bg-black/50 border border-violet-500/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                                                  <Sparkles className="w-8 h-8 text-violet-400" />
                                              </div>
                                              <div>
                                                  <h4 className="text-white font-bold text-lg">AI Canvas Boş</h4>
                                                  <p className="text-violet-200/50 text-xs mt-1">Rüyanız görselleştirilmeyi bekliyor.</p>
                                              </div>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>

                           {/* 2. DUYGU ANALİZİ (Gelişmiş) */}
                           <div onClick={() => hasAccess('pro') && router.push('/dashboard/duygu-durumu')} className="relative group rounded-[2rem] bg-[#080808] border border-white/10 p-8 overflow-hidden hover:border-rose-500/30 transition-all duration-500 cursor-pointer min-h-[320px] flex flex-col justify-between">
                               {!hasAccess('pro') && <LockedFeature title="Duygu Analizi" />}
                               {/* Kırmızı/Pembe Glow */}
                               <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-rose-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                               <div>
                                  <div className="flex items-center gap-3 mb-6">
                                     <div className={`p-2 rounded-lg ${analysisResult.mood_score > 50 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                        <Heart className="w-5 h-5" />
                                     </div>
                                     <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Duygu Sismografı</span>
                                  </div>
                                  
                                  <div className="flex items-baseline gap-2 mb-2">
                                     <h3 className={`font-serif text-4xl ${analysisResult.mood_score > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                         {analysisResult.mood || "Nötr"}
                                     </h3>
                                  </div>
                                  <p className="text-gray-500 text-sm leading-snug max-w-[200px]">
                                      Bu rüyada bilinçaltınızın baskın duygu frekansı.
                                  </p>
                               </div>

                               <div className="mt-8 bg-white/5 rounded-2xl p-5 border border-white/5">
                                  <div className="flex justify-between items-center mb-3">
                                     <span className="text-xs text-gray-400 uppercase font-bold">Yoğunluk</span>
                                     <span className={`text-lg font-mono font-bold ${analysisResult.mood_score > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>%{analysisResult.mood_score || 0}</span>
                                  </div>
                                  {/* Wave/Bar Visual */}
                                  <div className="flex items-end gap-1 h-12 w-full">
                                      {[...Array(12)].map((_, i) => (
                                          <div 
                                            key={i} 
                                            className={`w-full rounded-t-sm transition-all duration-700 ${analysisResult.mood_score > 50 ? 'bg-emerald-500/40' : 'bg-rose-500/40'}`}
                                            style={{ 
                                                height: `${Math.max(20, Math.random() * (analysisResult.mood_score || 50) + 10)}%`,
                                                opacity: (i + 1) / 12 
                                            }}
                                          ></div>
                                      ))}
                                  </div>
                               </div>
                           </div>

                           {/* 3. NUMEROLOJİ VE İŞARETLER */}
                           <div className="relative group rounded-[2rem] bg-[#080808] border border-white/10 p-8 overflow-hidden hover:border-sky-500/30 transition-all duration-500 min-h-[320px] flex flex-col justify-between">
                              {!hasAccess('pro') && <LockedFeature title="Numeroloji" />}
                              {/* Mavi Glow */}
                              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-sky-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                              
                              <div>
                                  <div className="flex items-center gap-3 mb-6">
                                     <div className="p-2 rounded-lg bg-sky-500/20 text-sky-300">
                                        <Star className="w-5 h-5" />
                                     </div>
                                     <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Kozmik İşaretler</span>
                                  </div>
                                  
                                  <h3 className="font-serif text-3xl text-white mb-2">Şanslı Sayılar</h3>
                                  <p className="text-sky-200/50 text-sm mb-6">Evrenin rüyanızla rezonansa girdiği sayı dizileri.</p>
                                  
                                  <div className="flex flex-wrap gap-3">
                                     {analysisResult.lucky_numbers?.map((num: any, i: number) => (
                                         <div key={i} className="flex flex-col items-center gap-1">
                                             <div className="w-12 h-14 rounded-xl bg-[#0f172a] border border-sky-500/20 flex items-center justify-center font-mono text-xl text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                                                {num}
                                             </div>
                                             <span className="text-[9px] text-gray-600 uppercase">Ref {i+1}</span>
                                         </div>
                                     )) || <span className="text-xs text-gray-500">Veri hesaplanıyor...</span>}
                                  </div>
                              </div>

                              <button onClick={() => hasAccess('pro') && router.push('/dashboard/numeroloji')} className="w-full mt-6 py-3 rounded-xl bg-sky-900/20 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                 Detaylı Analiz <ChevronRight className="w-3 h-3" />
                              </button>
                           </div>

                           {/* 4. TAROT (Mistik) */}
                           <div className="relative group rounded-[2rem] bg-[#080808] border border-white/10 p-8 overflow-hidden hover:border-amber-500/30 transition-all duration-500 min-h-[320px] flex flex-col justify-between">
                              {!hasAccess('pro') && <LockedFeature title="Tarot" />}
                              {/* Amber Glow */}
                              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                              
                              <div>
                                  <div className="flex items-center gap-3 mb-6">
                                     <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                                        <Layers className="w-5 h-5" />
                                     </div>
                                     <span className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Mistik Rehber</span>
                                  </div>
                                  <h3 className="font-serif text-3xl text-white mb-2">Tarot Kartı</h3>
                                  <p className="text-amber-200/50 text-sm mb-4">Bu rüyanın enerjisi bir karta işaret ediyor.</p>

                                  <div className="flex items-center gap-4 bg-amber-900/10 p-4 rounded-2xl border border-amber-500/10">
                                      <div className="w-12 h-16 bg-gradient-to-br from-amber-700 to-amber-900 rounded border border-amber-500/40"></div>
                                      <div>
                                          <div className="text-amber-400 font-serif text-lg">Gizli Kart</div>
                                          <div className="text-amber-200/40 text-xs">Arkanajör / Tılsım</div>
                                      </div>
                                  </div>
                              </div>

                              <button onClick={() => hasAccess('pro') && router.push('/dashboard/tarot')} className="w-full mt-6 py-3 rounded-xl bg-amber-900/20 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-2">
                                 Kartı Aç <ChevronRight className="w-3 h-3" />
                              </button>
                           </div>

                           {/* 5. KAHİN SOHBET (Full Width - Alt) */}
                           <div className="relative col-span-1 md:col-span-2 rounded-[2rem] bg-[#0c0a09] border border-white/10 p-8 md:p-10 overflow-hidden group hover:border-orange-500/30 transition-all">
                              {!hasAccess('elite') && <LockedFeature title="Kahin Sohbet" />}
                              <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-orange-600/5 to-transparent"></div>
                              
                              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                  <div className="flex items-start gap-4">
                                      <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
                                          <MessageCircle className="w-6 h-6 text-white" />
                                      </div>
                                      <div>
                                          <h3 className="font-serif text-2xl text-white mb-2">Rüya Kahini ile Konuş</h3>
                                          <p className="text-gray-400 text-sm max-w-lg">
                                              "Bu rüyadaki kedi ne anlama geliyor?", "Neden sürekli düşüyorum?" gibi spesifik sorular sorarak analizi derinleştir.
                                          </p>
                                      </div>
                                  </div>
                                  
                                  <button onClick={() => hasAccess('elite') && currentDreamId && router.push(`/dashboard/sohbet/${currentDreamId}`)} className="px-8 py-4 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-orange-50 transition-colors flex items-center gap-3 whitespace-nowrap">
                                      Sohbeti Başlat <MessageCircle className="w-4 h-4" />
                                  </button>
                              </div>
                           </div>

                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

          </div>
      </main>
    </div>
  );
}