"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Moon, Sparkles, Crown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { analyzeDream } from "@/app/actions/analyze-dream";
import { getMoonPhase } from "@/utils/moon"; 
import { toast } from "sonner"; 

// DOSYA YOLLARINI GÖRSELE GÖRE DÜZELTTİM
import Sidebar from "./Sidebar"; 
import DreamInputSection from "./DreamInputSection";
import AnalysisResults from "./AnalysisResults";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const resultRef = useRef<HTMLDivElement>(null); 

  // State
  const [profile, setProfile] = useState<any>(null);
  const [dreamText, setDreamText] = useState("");
  const [greeting, setGreeting] = useState("Merhaba"); 
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'COMPLETED'>('IDLE');
  const [analysisResult, setAnalysisResult] = useState<any>(null); 
  const [currentDreamId, setCurrentDreamId] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMoon, setCurrentMoon] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      setCurrentMoon(getMoonPhase());
      const h = new Date().getHours();
      setGreeting(h < 12 ? "Günaydın" : h < 17 ? "Tünaydın" : "İyi Akşamlar");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) setProfile(prof);

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
  }, [supabase]);

  const handleAnalyze = async () => {
    if (!dreamText.trim()) return;
    setStatus('LOADING');
    const result = await analyzeDream(dreamText);
    if (result.success) {
      setAnalysisResult(result.data.ai_response);
      setCurrentDreamId(result.data.id);
      setStatus('COMPLETED');
      localStorage.setItem('saved_dream_id', result.data.id);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      toast.error(result.error);
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setDreamText(""); setAnalysisResult(null); setStatus('IDLE');
    localStorage.removeItem('saved_dream_id');
  };

  const userTier = profile?.subscription_tier?.toLowerCase() || 'free';

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative flex">
      {/* SİDEBAR BURADA */}
      <Sidebar activeTab="dream" />

      {/* İÇERİK ALANI - md:pl-20 sidebar için boşluk bırakır */}
      <main className="flex-1 relative z-10 w-full min-h-screen md:pl-20">
        <div className="max-w-6xl mx-auto px-4 md:px-12 py-8 flex flex-col min-h-screen">
          
          {/* HEADER */}
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-white tracking-tight">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]">{profile?.full_name?.split(' ')[0] || "Yolcu"}</span>
              </h1>
              <p className="text-gray-400 text-sm mt-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#fbbf24]" /> Bilinçaltın bugün ne fısıldadı?</p>
            </div>
            
            <div className="flex items-center gap-3">
               <button onClick={() => router.push('/dashboard/pricing')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold text-xs uppercase">
                 <Crown className="w-4 h-4 text-[#fbbf24]" /> {userTier}
               </button>
               
               {/* AY BUTONU - TIKLANABİLİR VE ESKİSİ GİBİ */}
               <button 
                  onClick={() => router.push('/dashboard/ay-takvimi')}
                  className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md hover:bg-white/10 hover:border-[#fbbf24]/50 transition-all group"
               >
                  <div className="text-2xl group-hover:scale-110 transition-transform">{currentMoon?.icon || "🌕"}</div>
                  <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-bold text-[#fbbf24] uppercase group-hover:text-[#fcd34d] transition-colors">{currentMoon?.phase || "Ay Fazı"}</span>
                      <span className="text-[10px] text-gray-400">Enerji: %{currentMoon?.percentage || "..."}</span>
                  </div>
               </button>
            </div>
          </header>

          {/* RÜYA GİRİŞ */}
          <DreamInputSection 
            dreamText={dreamText} setDreamText={setDreamText} 
            status={status} onAnalyze={handleAnalyze} onReset={handleReset}
            isRecording={isRecording} setIsRecording={setIsRecording}
          />

          {/* SONUÇLAR */}
          <div ref={resultRef}>
            <AnimatePresence>
              {status === 'COMPLETED' && analysisResult && (
                <AnalysisResults 
                  result={analysisResult} 
                  userTier={userTier} 
                  currentDreamId={currentDreamId} 
                  generatedImage={generatedImage}
                  onDownloadImage={() => {}} 
                />
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}