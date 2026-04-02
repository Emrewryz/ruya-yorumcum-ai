"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowLeft, Moon, PlayCircle, Loader2 } from "lucide-react"; 
import { AnimatePresence, motion } from "framer-motion";
import { analyzeDream } from "@/app/actions/analyze-dream";
import { toast } from "sonner"; 

// --- BİLEŞEN IMPORTLARI ---
import DreamInputSection from "./DreamInputSection";
import AnalysisResults from "./AnalysisResults";
import RewardAdModal from "@/components/RewardAdModal";

// 1. ASIL İÇERİK BİLEŞENİ
function RuyaAnaliziContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const resultRef = useRef<HTMLDivElement>(null); 

  // State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dreamText, setDreamText] = useState("");
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'COMPLETED'>('IDLE');
  const [analysisResult, setAnalysisResult] = useState<any>(null); 
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
         const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
         if (prof) setProfile(prof);
      }

      const isPending = searchParams.get('pending');
      if (isPending === 'true') {
          const savedDream = localStorage.getItem("pending_dream");
          if (savedDream) setDreamText(savedDream);
      }

      const savedId = localStorage.getItem('saved_dream_id');
      if (savedId) {
        const { data: d } = await supabase.from('dreams').select('*').eq('id', savedId).single();
        if (d) {
          setDreamText(d.dream_text);
          setAnalysisResult(d.ai_response);
          setCurrentDreamId(d.id);
          setStatus('COMPLETED');
          setGeneratedImage(d.image_url);
        }
      }
    };
    init();
  }, [supabase, searchParams]);

  // --- ANALİZ FONKSİYONU ---
  const handleAnalyze = async () => {
    if (!dreamText.trim()) {
        toast.error("Lütfen rüyanızı kısaca anlatın.");
        return;
    }
    
    setStatus('LOADING');
    
    try {
        const result = await analyzeDream(dreamText);
        
        if (result.success) {
          setAnalysisResult(result.data.ai_response);
          setCurrentDreamId(result.data.id);
          setStatus('COMPLETED');
          localStorage.setItem('saved_dream_id', result.data.id);
          localStorage.removeItem("pending_dream");
          setGeneratedImage(null); 
          
          if (profile) {
              setProfile({ ...profile, credits: profile.credits - 1 });
              toast.success("Rüyanız başarıyla yorumlandı! (1 Kredi düştü)");
          } else {
              toast.success("Rüyanızın genel analizi tamamlandı!");
          }

          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
        } else {
          const errorCode = (result as any).code;
          if (errorCode === "NO_CREDIT") {
              toast.error("Yetersiz Bakiye", {
                description: "Bu analiz için 1 krediye ihtiyacınız var.",
                action: { label: "Yükle", onClick: () => router.push("/dashboard/pricing") },
                duration: 5000, 
              });
          } else {
              toast.error(result.error || "Bir hata oluştu.");
          }
          setStatus('IDLE');
        }
    } catch (err) {
        toast.error("Bağlantı hatası.");
        setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setDreamText(""); 
    setAnalysisResult(null); 
    setStatus('IDLE');
    localStorage.removeItem('saved_dream_id');
  };

  const showAds = user && profile !== null && profile.credits < 1;

  return (
    // dark:bg-transparent ile layout'un siyah rengini devralıyor
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-stone-200 dark:selection:bg-emerald-500/30 antialiased bg-[#faf9f6] dark:bg-transparent transition-colors duration-500">
      
      {/* HEADER & NAV */}
      <nav className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex items-center justify-between mt-2 md:mt-4">
        <button 
           onClick={() => router.push('/dashboard')} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#131722]/80 dark:backdrop-blur-md border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors text-xs font-bold text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-200 uppercase tracking-widest shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Ana Menü</span>
        </button>
        
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#131722]/80 dark:backdrop-blur-md rounded-xl border border-stone-200 dark:border-white/10 shadow-sm transition-colors">
           <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
           <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-stone-900 dark:text-slate-200">Rüya Laboratuvarı</span>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-0 pt-6 relative z-10 flex flex-col items-center">
        
        <header className="text-center mb-12 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-serif text-stone-900 dark:text-white mb-4 font-bold tracking-tight transition-colors">
                Rüyaların Gizli <span className="text-emerald-600 dark:text-emerald-400">Dilini Çöz</span>
            </h1>
            <p className="text-stone-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light transition-colors">
                Sembolleri ve duyguları kelimelere dökün. Kadim rüya ilmi ve modern psikoloji senteziyle bilinçaltınızın kapılarını aralayalım.
            </p>
          </motion.div>
        </header>

        {showAds && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10 w-full relative group">
              <div className="relative bg-white dark:bg-[#1A1B2E]/90 dark:backdrop-blur-xl border border-stone-200 dark:border-purple-500/30 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm dark:shadow-2xl overflow-hidden hover:shadow-md transition-all">
                  <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-gradient-to-br dark:from-purple-500/30 dark:to-indigo-500/10 border border-indigo-100 dark:border-purple-500/40 flex items-center justify-center shrink-0 transition-colors">
                          <PlayCircle className="w-7 h-7 text-indigo-500 dark:text-purple-300" />
                      </div>
                      <div>
                          <h3 className="text-stone-900 dark:text-slate-100 font-bold text-lg mb-1 font-serif transition-colors">Krediniz mi bitti?</h3>
                          <p className="text-stone-500 dark:text-slate-400 text-xs font-medium transition-colors">Kısa bir video izleyerek anında yorum hakkı kazan.</p>
                      </div>
                  </div>
                  <div className="w-full md:w-auto relative z-10">
                     <RewardAdModal />
                  </div>
              </div>
          </motion.div>
        )}

        <div className="w-full">
            <DreamInputSection 
              dreamText={dreamText} setDreamText={setDreamText} 
              status={status} onAnalyze={handleAnalyze} onReset={handleReset}
              isRecording={isRecording} setIsRecording={setIsRecording}
            />
        </div>

        <div ref={resultRef} className="w-full mt-12 md:mt-16">
          <AnimatePresence mode="wait">
            {status === 'COMPLETED' && analysisResult && (
              <AnalysisResults 
                result={analysisResult} 
                currentDreamId={currentDreamId} 
                generatedImage={generatedImage}
                onDownloadImage={() => {}} 
              />
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}

export default function RuyaAnaliziPage() {
  return (
    <Suspense fallback={
       <div className="w-full flex items-center justify-center min-h-[60vh] bg-[#faf9f6] dark:bg-transparent transition-colors duration-500">
          <Loader2 className="w-8 h-8 text-stone-400 dark:text-slate-600 animate-spin" />
       </div>
    }>
       <RuyaAnaliziContent />
    </Suspense>
  );
}