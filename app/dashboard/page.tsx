"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, FileText, User, Mic, Sparkles, 
  Crown, PenLine, PauseCircle, 
  Share2, MessageCircle, Layers, Brain, Lock, Heart, Trash2, Image as ImageIcon, Eye, Loader2, Download, Check, Palette
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeDream } from "@/app/actions/analyze-dream"; 
import { getMoonPhase } from "@/utils/moon"; 
import { toast } from "sonner"; 

type Tier = 'free' | 'pro' | 'elite';

// Daktilo Efekti
const TypewriterText = ({ text, speed = 20 }: { text: string, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    if (!text) return;
    setDisplayedText("");
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index === text.length) clearInterval(interval);
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
  
  // --- Görsel State'leri (Sadece Gösterim İçin) ---
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // --- Görünürlük (Kalıcı) ---
  const [showPsychological, setShowPsychological] = useState(false);
  const [showSpiritual, setShowSpiritual] = useState(false);

  // 1. BAŞLANGIÇ: VERİTABANI SENKRONİZASYONU
  useEffect(() => {
    const initDashboard = async () => {
        // A) Ay Fazı
        setCurrentMoon(getMoonPhase());

        // B) Selamlama
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setGreeting("Günaydın");
        else if (hour >= 12 && hour < 17) setGreeting("Tünaydın");
        else if (hour >= 17 && hour < 23) setGreeting("İyi Akşamlar");
        else setGreeting("İyi Geceler");

        // C) Kullanıcı ve Paket Bilgisi
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

        // D) RÜYAYI VE RESMİ GERİ GETİRME
        const savedDreamId = localStorage.getItem('saved_dream_id');
        
        if (savedDreamId) {
            // Veritabanından en güncel halini çek
            const { data: dreamData, error } = await supabase
                .from('dreams')
                .select('*')
                .eq('id', savedDreamId)
                .single();

            if (dreamData && !error) {
                // Metin ve Analizi Doldur
                setDreamText(dreamData.dream_text);
                setAnalysisResult(dreamData.ai_response);
                setCurrentDreamId(dreamData.id);
                setStatus('COMPLETED');
                
                // Resim URL'si varsa State'e at
                if (dreamData.image_url) {
                    setGeneratedImage(dreamData.image_url);
                } else {
                    setGeneratedImage(null);
                }
            } else {
                clearLocalStorage();
            }
        } else {
            const savedDraft = localStorage.getItem('saved_dream_text');
            if (savedDraft) setDreamText(savedDraft);
        }

        // Buton Durumlarını Geri Yükle
        if (localStorage.getItem('show_psychological') === 'true') setShowPsychological(true);
        if (localStorage.getItem('show_spiritual') === 'true') setShowSpiritual(true);
    };

    initDashboard();
  }, [supabase]);

  // 2. STATE DEĞİŞİKLİKLERİNİ KAYDET
  useEffect(() => {
    if (dreamText) localStorage.setItem('saved_dream_text', dreamText);
    
    if (status === 'COMPLETED' && currentDreamId) {
        localStorage.setItem('saved_status', 'COMPLETED');
        localStorage.setItem('saved_dream_id', currentDreamId);
    }

    localStorage.setItem('show_psychological', String(showPsychological));
    localStorage.setItem('show_spiritual', String(showSpiritual));
  }, [dreamText, status, currentDreamId, showPsychological, showSpiritual]);

  const clearLocalStorage = () => {
      localStorage.removeItem('saved_dream_text');
      localStorage.removeItem('saved_analysis_result');
      localStorage.removeItem('saved_status');
      localStorage.removeItem('saved_dream_id');
      localStorage.removeItem('show_psychological');
      localStorage.removeItem('show_spiritual');
  };

  const clearDashboard = () => {
      setDreamText("");
      setAnalysisResult(null);
      setCurrentDreamId(null);
      setStatus("IDLE");
      setGeneratedImage(null);
      setShowPsychological(false);
      setShowSpiritual(false);
      clearLocalStorage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async () => {
    if (!dreamText.trim() || status === 'LOADING') return;
    
    setStatus('LOADING');
    setLoadingStep(0);
    setShowPsychological(false);
    setShowSpiritual(false);
    setGeneratedImage(null);

    const loadingInterval = setInterval(() => {
       setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1500);

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
          
          toast.success("Rüyanız başarıyla analiz edildi! ✨");
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
       }
    } catch (e) {
       toast.error("Bir bağlantı hatası oluştu.");
       setStatus('IDLE');
    }
  };

  const handleDownloadImage = async () => {
    if (!generatedImage) return;
    try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ruyam-ai-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Resim indirildi.");
    } catch (error) {
        toast.error("Resim indirilemedi.");
    }
  };

  const handleShareImage = async () => {
    if (!generatedImage) return;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Rüyam AI',
                text: 'Yapay zeka ile rüyamı görselleştirdim! ✨',
                url: generatedImage,
            });
        } catch (err) { console.log("Paylaşım iptal."); }
    } else {
        try {
            await navigator.clipboard.writeText(generatedImage);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            toast.success("Link kopyalandı!");
        } catch (err) { toast.error("Kopyalama başarısız."); }
    }
  };

  const handleNavigation = (path: string) => { router.push(path); };
  
  // Yetki Kontrolü
  const hasAccess = (requiredTier: 'pro' | 'elite') => {
    const levels = { free: 0, pro: 1, elite: 2 };
    const currentLevel = levels[userTier] || 0; 
    const requiredLevel = levels[requiredTier];
    return currentLevel >= requiredLevel;
  };

  // Kilitli Özellik Bileşeni (Büyük Alanlar İçin)
  const LockedFeature = ({ title }: { title: string }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 text-center group cursor-pointer transition-all hover:bg-black/70">
       <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.2)]">
          <Lock className="w-5 h-5 text-[#fbbf24]" />
       </div>
       <h3 className="text-white font-serif text-sm mb-2">{title}</h3>
       <button onClick={() => router.push('/dashboard/pricing')} className="px-4 py-2 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">
         Yükselt
       </button>
    </div>
  );

  // Kilitli Widget Bileşeni (Küçük Kutular İçin)
  const LockedWidgetOverlay = ({ title }: { title: string }) => (
    <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 rounded-3xl border border-white/10 group-hover:border-[#fbbf24]/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/pricing')}>
       <div className="p-2 rounded-full bg-white/10 mb-2">
          <Lock className="w-4 h-4 text-gray-400" />
       </div>
       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">{title}</p>
       <span className="text-[10px] text-[#fbbf24] border border-[#fbbf24]/30 px-2 py-0.5 rounded-full">Pro Özellik</span>
    </div>
  );

  const loadingMessages = [ "Bilinçaltı taranıyor...", "Semboller çözülüyor...", "Yıldız haritası hizalanıyor...", "Gizli mesajlar okunuyor...", "Analiz Tamamlandı." ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden flex flex-col md:flex-row">
      <div className="bg-noise"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#4c1d95] rounded-full blur-[150px] opacity-10 animate-pulse-slow pointer-events-none z-0"></div>

      {/* SIDEBAR */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
        className="fixed left-4 md:left-8 top-[40%] -translate-y-1/2 z-50 hidden md:flex flex-col gap-6 p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/5 shadow-2xl"
      >
          <button onClick={clearDashboard} className="relative p-3 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-110 transition-transform group" title="Yeni Rüya Yaz / Temizle">
             <PenLine className="w-6 h-6" />
             <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">Yeni Rüya Yaz</span>
          </button>
          {[
            { icon: FileText, label: "Rüya Arşivi", path: "/dashboard/gunluk" },
            { icon: User, label: "Profil & Ayarlar", path: "/dashboard/settings" }
          ].map((item, idx) => (
            <button key={idx} onClick={() => handleNavigation(item.path)} className="p-3 text-gray-500 hover:text-white transition-colors relative group">
              <item.icon className="w-6 h-6" />
              <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">{item.label}</span>
            </button>
          ))}
          {status === 'COMPLETED' && (
              <button onClick={clearDashboard} className="p-3 text-red-500/70 hover:text-red-500 transition-colors relative group border-t border-white/10 mt-2" title="Ekranı Temizle">
                 <Trash2 className="w-5 h-5" />
              </button>
          )}
      </motion.aside>

      <main className="flex-1 flex flex-col relative z-10 w-full min-h-screen overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col min-h-screen">

            {/* HEADER */}
            <header className="relative w-full h-auto mb-8 flex justify-between items-center">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="z-20">
                    <h1 className="font-serif text-3xl text-white tracking-wide">
                      {greeting}, <span className="text-[#fbbf24]">{userName}</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-light">Bilinçaltın bugün neler fısıldadı?</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 z-20">
                    {userTier !== 'free' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                           <span className={`w-2 h-2 rounded-full ${userTier === 'elite' ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                           <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{userTier === 'pro' ? 'KAŞİF' : 'KAHİN'}</span>
                        </div>
                    )}
                    {userTier === 'free' && (
                        <button onClick={() => router.push('/dashboard/pricing')} className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#b45309] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 transition-all">
                           <span className="flex items-center gap-2 relative z-10"><Crown className="w-4 h-4" /> YÜKSELT</span>
                        </button>
                    )}
                </motion.div>
            </header>

            {/* RÜYA GİRİŞ ALANI */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto relative transition-all duration-700 mb-12">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 cursor-pointer group" onClick={() => router.push('/dashboard/ay-takvimi')}>
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/5 shadow-lg group-hover:border-[#fbbf24]/30 transition-all group-hover:scale-105">
                       <div className="w-6 h-6 flex items-center justify-center text-lg filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{currentMoon ? currentMoon.icon : "🌕"}</div>
                       <div className="flex flex-col items-start">
                           <span className="text-[10px] text-[#fbbf24] font-bold uppercase tracking-widest leading-none mb-0.5">{currentMoon ? currentMoon.phase : "Yükleniyor..."}</span>
                           <span className="text-[10px] text-gray-400 font-serif italic leading-none">{currentMoon ? `Bugün %${currentMoon.percentage} aydınlık` : "Evre hesaplanıyor..."}</span>
                       </div>
                    </div>
                </motion.div>

                <div className="w-full relative group">
                    <textarea 
                      value={dreamText}
                      onChange={(e) => setDreamText(e.target.value)}
                      disabled={status === 'LOADING'} 
                      placeholder="Dün gece ne gördün? Detayları hatırla..."
                      className={`w-full bg-transparent text-lg md:text-xl text-white placeholder-gray-600 font-medium font-sans border-none outline-none resize-none h-[220px] leading-relaxed tracking-wide scrollbar-thin scrollbar-thumb-[#8b5cf6]/20 scrollbar-track-transparent p-4 selection:bg-[#8b5cf6]/30 transition-all duration-500 ${status !== 'IDLE' ? 'opacity-50 blur-[1px]' : 'opacity-100'}`}
                      autoFocus
                    ></textarea>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5"></div>
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#8b5cf6] shadow-[0_0_25px_#8b5cf6] transition-all duration-700 ease-out ${dreamText ? "w-full opacity-100" : "w-0 opacity-0 group-focus-within:w-full group-focus-within:opacity-100"}`}></div>
                    <button onClick={() => setIsRecording(!isRecording)} className={`absolute right-0 bottom-4 p-3 rounded-full transition-all duration-500 border ${isRecording ? "bg-red-500/10 border-red-500/50 text-red-500" : "bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20"}`}>
                       {isRecording ? <PauseCircle className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                    </button>
                </div>

                <AnimatePresence>
                  {(status === 'IDLE' || (status === 'COMPLETED' && dreamText !== localStorage.getItem('last_analyzed_text')) || status === 'LOADING') && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="mt-10">
                        <button onClick={handleAnalyze} disabled={(!dreamText && !isRecording) || status === 'LOADING'} className="relative group px-10 py-4 rounded-full bg-gradient-to-r from-violet-700 via-fuchsia-600 to-amber-500 text-white font-bold tracking-[0.2em] uppercase text-xs shadow-[0_0_40px_rgba(124,58,237,0.3)] hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden flex items-center gap-3">
                           {status === 'LOADING' ? (<>ANALİZ EDİLİYOR... <span className="animate-spin">⏳</span></>) : (<>YORUMLA VE ANALİZ ET <Sparkles className="w-4 h-4" /></>)}
                        </button>
                     </motion.div>
                  )}
                </AnimatePresence>
            </div>
         </div>

         <div ref={resultRef} className="w-full">
            <AnimatePresence>
               {status === 'LOADING' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full bg-black/40 backdrop-blur-md border-t border-white/10 py-32 flex flex-col items-center justify-center">
                      <div className="w-24 h-24 border-2 border-t-[#8b5cf6] border-r-transparent border-b-[#fbbf24] border-l-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(139,92,246,0.2)]"></div>
                      <p className="text-[#8b5cf6] font-mono text-base animate-pulse tracking-widest uppercase">{loadingMessages[loadingStep]}</p>
                   </motion.div>
               )}
            </AnimatePresence>

            {status === 'COMPLETED' && analysisResult && (
               <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="w-full bg-gradient-to-b from-black/40 to-[#020617] border-t border-white/10 pb-32">
                  <div className="w-full max-w-4xl mx-auto px-6 py-16">
                      
                      <div className="flex items-center justify-center gap-4 mb-12 opacity-60">
                          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#fbbf24]"></div>
                          <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#fbbf24]"></div>
                      </div>

                      {/* 1. ÖZET (HERKESE AÇIK) */}
                      <div className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-12 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#fbbf24]"></div>
                          <div className="flex items-center gap-3 mb-6">
                             <Sparkles className="w-6 h-6 text-[#fbbf24]" />
                             <h3 className="font-serif text-[#fbbf24] text-lg tracking-widest uppercase">Rüyanın Derin Özü</h3>
                          </div>
                          <TypewriterText text={analysisResult.summary} speed={10} />
                      </div>

                      {/* 2. DETAYLAR (PSİKOLOJİK & MANEVİ) - FREE İÇİN KİLİTLİ */}
                      <div className="grid md:grid-cols-2 gap-8 mb-12">
                          <div className="relative p-8 rounded-3xl bg-[#0f172a] border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] overflow-hidden min-h-[300px] flex flex-col">
                             <h3 className="font-serif text-xl text-blue-400 mb-4 flex items-center gap-3"><Brain className="w-6 h-6" /> Bilinçaltı Analizi</h3>
                             {!hasAccess('pro') && <LockedFeature title="Psikolojik Derinlik" />}
                             {hasAccess('pro') && (
                                showPsychological ? (
                                   <TypewriterText text={analysisResult.psychological} speed={15} />
                                ) : (
                                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                                      <p className="text-gray-500 text-xs mb-4 blur-[2px] line-clamp-3 select-none">{analysisResult.psychological}</p>
                                      <button onClick={() => setShowPsychological(true)} className="px-6 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-2 text-xs font-bold">
                                         <Eye className="w-3 h-3" /> Analizi Oku
                                      </button>
                                   </div>
                                )
                             )}
                          </div>

                          <div className="relative p-8 rounded-3xl bg-[#022c22] border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] overflow-hidden min-h-[300px] flex flex-col">
                             <h3 className="font-serif text-xl text-emerald-400 mb-4 flex items-center gap-3"><Moon className="w-6 h-6" /> Manevi Mesaj</h3>
                             {!hasAccess('pro') && <LockedFeature title="Manevi Tabir" />}
                             {hasAccess('pro') && (
                                showSpiritual ? (
                                   <TypewriterText text={analysisResult.spiritual} speed={15} />
                                ) : (
                                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                                      <p className="text-gray-500 text-xs mb-4 blur-[2px] line-clamp-3 select-none">{analysisResult.spiritual}</p>
                                      <button onClick={() => setShowSpiritual(true)} className="px-6 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 text-xs font-bold">
                                         <Eye className="w-3 h-3" /> İşareti Çöz
                                      </button>
                                   </div>
                                )
                             )}
                          </div>
                      </div>

                      {/* 3. YENİ GÖRSEL STÜDYOSU KARTI - FREE İÇİN KİLİTLİ */}
                      <div className="relative w-full rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-[#0a0a0a] group">
                          {/* Eğer Resim Varsa */}
                          {generatedImage ? (
                             <div className="relative w-full aspect-video md:aspect-[21/9]">
                                <img src={generatedImage} className="w-full h-full object-cover" alt="Rüya Görseli" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-left">
                                   <h3 className="text-white font-serif text-2xl md:text-4xl mb-2 flex items-center gap-3">
                                      <ImageIcon className="w-8 h-8 text-[#fbbf24]" /> Rüya Görselin
                                   </h3>
                                   <p className="text-gray-300 text-sm md:text-base max-w-xl">
                                      Bilinçaltının derinliklerinden çıkan bu kareyi sakla.
                                   </p>
                                </div>
                                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex gap-3">
                                   <button onClick={handleDownloadImage} className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/20 transition-all flex items-center gap-2">
                                      <Download className="w-4 h-4" /> İndir
                                   </button>
                                   <button onClick={handleShareImage} className="px-6 py-3 rounded-full bg-[#fbbf24] text-black font-bold hover:bg-[#d97706] transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20">
                                      {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} Paylaş
                                   </button>
                                </div>
                             </div>
                          ) : (
                            // Resim Yoksa (Tanıtım & Yönlendirme)
                            <div className="relative w-full p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                               <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 opacity-50"></div>
                               
                               {/* Sol Taraf: Metin */}
                               <div className="relative z-10 flex-1 text-center md:text-left">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest mb-4">
                                     <Palette className="w-3 h-3" /> Görsel Stüdyosu
                                  </div>
                                  <h3 className="text-2xl md:text-4xl font-serif text-white mb-4">Rüyanı Görselleştir</h3>
                                  <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg">
                                     Yapay zeka ile rüyanın en çarpıcı anını bir sanat eserine dönüştür. 
                                     Bu özellik rüyanın atmosferini ve gizli renklerini ortaya çıkarır.
                                  </p>
                                  
                                  {hasAccess('pro') ? (
                                     <button 
                                        onClick={() => router.push(`/dashboard/gorsel-olustur/${currentDreamId}`)} 
                                        className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-purple-500/30 flex items-center gap-3 mx-auto md:mx-0"
                                     >
                                        <ImageIcon className="w-5 h-5" /> Stüdyoya Git & Oluştur
                                     </button>
                                  ) : (
                                     <div className="flex flex-col items-center md:items-start gap-4">
                                        <button disabled className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-gray-500 font-bold flex items-center gap-3 cursor-not-allowed mx-auto md:mx-0">
                                           <Lock className="w-4 h-4" /> Kilitli Özellik
                                        </button>
                                        <p className="text-xs text-gray-500">
                                           Görsel oluşturmak için <span onClick={() => router.push('/dashboard/pricing')} className="text-purple-400 cursor-pointer hover:underline">paketinizi yükseltin.</span>
                                        </p>
                                     </div>
                                  )}
                               </div>

                               {/* Sağ Taraf: Örnek Görsel */}
                               <div className="relative z-10 w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 group-hover:scale-105">
                                  <img 
                                     src="https://images.unsplash.com/photo-1634901336040-af2092302326?q=80&w=800&auto=format&fit=crop" 
                                     alt="Örnek Rüya" 
                                     className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                                     <span className="text-white/60 text-xs font-mono">Örnek Çıktı #FLUX</span>
                                  </div>
                               </div>
                            </div>
                          )}
                      </div>

                      {/* 4. WIDGETLAR (RUH HALİ, ŞANS, TAROT) - FREE İÇİN KİLİTLİ */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* RUH HALİ WIDGET */}
                          <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#fbbf24]/50 cursor-pointer transition-all group overflow-hidden">
                             {!hasAccess('pro') && <LockedWidgetOverlay title="Ruh Hali" />}
                             <div onClick={() => hasAccess('pro') && router.push('/dashboard/duygu-durumu')}>
                                 <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                 <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-4">Ruh Hali</h4>
                                 <div className="flex items-end justify-between mb-2">
                                    <span className="text-xl font-bold text-white">{analysisResult.mood}</span>
                                    <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
                                 </div>
                                 <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-red-500 to-pink-500" style={{ width: `${analysisResult.mood_score}%` }}></div>
                                 </div>
                             </div>
                          </div>

                          {/* ŞANSLI İŞARETLER WIDGET */}
                          <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#fbbf24]/50 cursor-pointer transition-all group text-center overflow-hidden">
                             {!hasAccess('pro') && <LockedWidgetOverlay title="Şanslı Sayılar" />}
                             <div onClick={() => hasAccess('pro') && router.push('/dashboard/numeroloji')}>
                                 <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-4">Şanslı İşaretler</h4>
                                 <div className="flex justify-center gap-3">
                                    {analysisResult.lucky_numbers?.slice(0, 3).map((num: any, i: number) => (
                                       <div key={i} className="w-10 h-12 bg-black border border-orange-500/50 rounded-lg flex items-center justify-center text-orange-400 font-mono font-bold shadow-lg group-hover:scale-110 transition-transform">{num}</div>
                                    ))}
                                 </div>
                             </div>
                          </div>

                          {/* TAROT WIDGET */}
                          <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all group overflow-hidden flex flex-col justify-between">
                             {!hasAccess('pro') && <LockedWidgetOverlay title="Tarot Falı" />}
                             <div onClick={() => hasAccess('pro') && router.push('/dashboard/tarot')}>
                                 <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                 <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-2">Tarot Rehberliği</h4>
                                 <div className="flex items-center justify-between">
                                    <span className="text-purple-400 text-sm font-bold">Kart Çek</span>
                                    <Layers className="w-8 h-8 text-purple-500 group-hover:rotate-12 transition-transform" />
                                 </div>
                             </div>
                          </div>
                      </div>

                      {/* 5. SOHBET BUTONU (ELITE) */}
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
                        {hasAccess('elite') ? (
                           <button onClick={() => currentDreamId && router.push(`/dashboard/sohbet/${currentDreamId}`)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg relative overflow-hidden group">
                              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                              <MessageCircle className="w-5 h-5" /> <span>Kahin ile Bu Rüyayı Konuş</span>
                           </button>
                        ) : (
                           <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-bold flex items-center justify-center gap-3 opacity-50 cursor-not-allowed group relative">
                              <Lock className="w-4 h-4" /> <span>Rüya Sohbeti (Kahin Paketi)</span>
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Rüyanızla ilgili sorular sormak için yükseltin.</div>
                           </div>
                        )}
                      </motion.div>
                  </div>
               </motion.div>
            )}
         </div>
      </main>
    </div>
  );
}