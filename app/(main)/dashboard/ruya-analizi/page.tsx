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

// 1. ASIL İÇERİK BİLEŞENİ (useSearchParams burada kullanılır)
function RuyaAnaliziContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const resultRef = useRef<HTMLDivElement>(null); 

  // State
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
      if (!user) { router.push('/auth'); return; }
      
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);

      // Yarım kalan rüya kontrolü
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
  }, [supabase, searchParams, router]);

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
          
          if (profile) setProfile({ ...profile, credits: profile.credits - 1 });

          toast.success("Rüyanız başarıyla yorumlandı! (1 Kredi düştü)");
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

  const showAds = profile !== null && profile.credits < 1;

  return (
    // Dış kapsayıcı layout.tsx'e tam uyum sağlar (relative, pb-20)
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-amber-500/30">
      
      {/* LOKAL ARKAPLAN EFEKTLERİ (Performans dostu transform-gpu) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>

      {/* HEADER & NAV */}
      <nav className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex items-center justify-between mt-2 md:mt-4">
        <button 
           onClick={() => router.push('/dashboard')} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md transform-gpu"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Ana Menü</span>
        </button>
        
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#131722]/80 backdrop-blur-md rounded-xl border border-white/5 shadow-sm transform-gpu">
           <Moon className="w-4 h-4 text-amber-500" />
           <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white">Rüya Laboratuvarı</span>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-0 pt-6 relative z-10 flex flex-col items-center">
        
        {/* HEADER TEXT */}
        <header className="text-center mb-12 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">
                Rüyaların Gizli <span className="text-amber-500">Dilini Çöz</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light">
                Sembolleri ve duyguları kelimelere dökün. Kadim rüya ilmi ve modern psikoloji senteziyle bilinçaltınızın kapılarını aralayalım.
            </p>
          </motion.div>
        </header>

        {/* REKLAM BANNER (SADECE KREDİ BİTİNCE) */}
        {showAds && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10 w-full relative group transform-gpu">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 rounded-[2.5rem] blur-xl opacity-50"></div>
              <div className="relative bg-[#131722]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110">
                          <PlayCircle className="w-7 h-7 text-amber-400" />
                      </div>
                      <div>
                          <h3 className="text-slate-100 font-bold text-lg mb-1 font-serif">Krediniz mi bitti?</h3>
                          <p className="text-slate-400 text-xs font-light">Kısa bir video izleyerek anında yorum hakkı kazan.</p>
                      </div>
                  </div>
                  <div className="w-full md:w-auto relative z-10">
                     <RewardAdModal />
                  </div>
              </div>
          </motion.div>
        )}

        {/* RÜYA GİRİŞ (INPUT) */}
        <div className="w-full">
            <DreamInputSection 
              dreamText={dreamText} setDreamText={setDreamText} 
              status={status} onAnalyze={handleAnalyze} onReset={handleReset}
              isRecording={isRecording} setIsRecording={setIsRecording}
            />
        </div>

        {/* SONUÇLAR */}
        <div ref={resultRef} className="w-full mt-12">
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

// 2. ANA EXPORT (Suspense ile sarmalanmış)
export default function RuyaAnaliziPage() {
  return (
    <Suspense fallback={
       <div className="w-full flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
       </div>
    }>
       <RuyaAnaliziContent />
    </Suspense>
  );
}