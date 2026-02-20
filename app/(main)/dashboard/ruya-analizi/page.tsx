"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowLeft, Moon, PlayCircle } from "lucide-react"; 
import { AnimatePresence } from "framer-motion";
import { analyzeDream } from "@/app/actions/analyze-dream";
import { toast } from "sonner"; 

// --- BİLEŞEN IMPORTLARI ---
import DreamInputSection from "./DreamInputSection";
import AnalysisResults from "./AnalysisResults";
import RewardAdModal from "@/components/RewardAdModal";

export default function RuyaAnaliziPage() {
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
      if (!user) return;
      
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);

      // Yarım kalan rüya var mı diye bak (Sadece sayfa ilk açıldığında)
      const isPending = searchParams.get('pending');
      if (isPending === 'true') {
         const savedDream = localStorage.getItem("pending_dream");
         if (savedDream) {
             setDreamText(savedDream);
         }
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
    if (!dreamText.trim()) return;
    setStatus('LOADING');
    
    const result = await analyzeDream(dreamText);
    
    if (result.success) {
      setAnalysisResult(result.data.ai_response);
      setCurrentDreamId(result.data.id);
      setStatus('COMPLETED');
      localStorage.setItem('saved_dream_id', result.data.id);
      localStorage.removeItem("pending_dream"); // Pending varsa sil
      setGeneratedImage(null); 
      
      // Analiz başarılı olunca profil kredisini lokal olarak 1 azalt (reklamı tetikleyebilmek için)
      if (profile) {
         setProfile({ ...profile, credits: profile.credits - 1 });
      }

      toast.success("Rüyanız başarıyla yorumlandı! (1 Kredi düştü)");
      
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      const errorCode = (result as any).code;

      if (errorCode === "NO_CREDIT") {
         toast.error("Yetersiz Bakiye", {
            description: "Bu analiz için 1 krediye ihtiyacınız var.",
            action: {
                label: "Yükle",
                onClick: () => router.push("/dashboard/pricing")
            },
            duration: 5000, 
         });
      } else {
         toast.error(result.error || "Bir hata oluştu.");
      }
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setDreamText(""); 
    setAnalysisResult(null); 
    setStatus('IDLE');
    localStorage.removeItem('saved_dream_id');
  };

  // Kredi kontrolü: Profil yüklendiyse ve kredi 1'den küçükse reklamı göster
  const showAds = profile !== null && profile.credits < 1;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10 flex flex-col min-h-screen relative z-10 font-sans">
      
      {/* ================= ARKA PLAN AURASI ================= */}
      <div className="fixed top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-5%] left-[10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[150px]"></div>
          <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]"></div>
      </div>

      {/* ================= ÜST MENÜ & GERİ DÖN ================= */}
      <nav className="flex items-center justify-between mb-10">
         <button 
            onClick={() => router.push('/dashboard')}
            className="group flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/5 shadow-sm"
         >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">Ana Menü</span>
         </button>

         <div className="flex items-center gap-3">
             <div className="bg-[#131722]/80 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                 <Moon className="w-4 h-4 text-amber-500" />
                 <span className="text-slate-200 text-xs font-bold uppercase tracking-widest">Rüya Laboratuvarı</span>
             </div>
         </div>
      </nav>

      {/* ================= HEADER ================= */}
      <header className="mb-10">
         <h1 className="font-serif text-4xl md:text-5xl text-white tracking-tight leading-tight mb-4">
           Rüyalarınızın Gizli Dilini <br className="hidden md:block" />
           <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
             Keşfedin
           </span>
         </h1>
         <p className="text-slate-400 text-sm md:text-base font-light max-w-2xl leading-relaxed">
           Sembolleri, duyguları ve detayları eksiksiz bir şekilde kelimelere dökün. Unutmayın, en önemsiz görünen detay bile büyük bir şifreyi barındırabilir.
         </p>
      </header>

      {/* ================= İNCE REKLAM BANNER'I (SADECE KREDİ BİTİNCE ÇIKAR) ================= */}
      {showAds && (
        <div className="mb-10 w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-[#131722]/80 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/30 shrink-0 shadow-inner">
                       <PlayCircle className="w-6 h-6 text-indigo-400" />
                   </div>
                   <div>
                       <h4 className="text-slate-100 font-bold text-base mb-0.5">Krediniz mi bitti?</h4>
                       <p className="text-slate-400 text-xs font-light">Kısa bir video izleyerek anında yolculuğuna devam et.</p>
                   </div>
               </div>
               <div className="w-full md:w-auto relative z-10">
                  <RewardAdModal />
               </div>
            </div>
        </div>
      )}

      {/* ================= RÜYA GİRİŞ (INPUT) ================= */}
      <DreamInputSection 
        dreamText={dreamText} setDreamText={setDreamText} 
        status={status} onAnalyze={handleAnalyze} onReset={handleReset}
        isRecording={isRecording} setIsRecording={setIsRecording}
      />

      {/* ================= SONUÇLAR ================= */}
      <div ref={resultRef}>
        <AnimatePresence>
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

    </div>
  );
}