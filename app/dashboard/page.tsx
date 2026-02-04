"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Moon, Sparkles, Crown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { analyzeDream } from "@/app/actions/analyze-dream";
import { getMoonPhase } from "@/utils/moon"; 
import { toast } from "sonner"; 

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

  // --- ANALİZ FONKSİYONU (YENİ SİSTEM) ---
  const handleAnalyze = async () => {
    if (!dreamText.trim()) return;
    setStatus('LOADING');
    
    // Server Action'ı çağır
    const result = await analyzeDream(dreamText);
    
    if (result.success) {
      setAnalysisResult(result.data.ai_response);
      setCurrentDreamId(result.data.id);
      setStatus('COMPLETED');
      localStorage.setItem('saved_dream_id', result.data.id);
      setGeneratedImage(null); // Yeni rüya olduğu için eski resmi temizle
      
      // Kredi düştüğü için Sidebar otomatik güncellenecek (Realtime)
      toast.success("Rüyanız başarıyla yorumlandı! (1 Kredi düştü)");
      
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      // --- HATA YÖNETİMİ ---
      // TypeScript Hatası Çözümü: (result as any).code diyerek TS'i zorluyoruz.
      const errorCode = (result as any).code;

      if (errorCode === "NO_CREDIT") {
         // Kredi yetersizse özel mesaj ve yönlendirme butonu
         toast.error("Yetersiz Bakiye", {
            description: "Bu analiz için 1 krediye ihtiyacınız var.",
            action: {
                label: "Yükle",
                onClick: () => router.push("/dashboard/pricing")
            },
            duration: 5000, 
         });
      } else {
         // Diğer hatalar (Sunucu hatası vs.)
         toast.error(result.error || "Bir hata oluştu.");
      }
      setStatus('IDLE');
    }
  };

  const handleReset = () => {
    setDreamText(""); setAnalysisResult(null); setStatus('IDLE');
    localStorage.removeItem('saved_dream_id');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative flex flex-col md:flex-row">
      
      {/* SİDEBAR */}
      <Sidebar />

      {/* İÇERİK ALANI */}
      <main className="flex-1 relative z-10 w-full min-h-screen md:pl-24 pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-12 py-6 md:py-8 flex flex-col min-h-screen">
          
          {/* HEADER */}
          <header className="flex justify-between items-start md:items-center mb-6 md:mb-10">
            <div>
              <h1 className="font-serif text-2xl md:text-4xl text-white tracking-tight leading-tight">
                {greeting}, <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]">
                    {profile?.full_name?.split(' ')[0] || "Yolcu"}
                </span>
              </h1>
              <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#fbbf24]" /> Bilinçaltın bugün ne fısıldadı?
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
               
               {/* HIZLI KREDİ YÜKLEME BUTONU (Header) */}
               <button 
                  onClick={() => router.push('/dashboard/pricing')} 
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] hover:scale-105 transition-all font-bold text-xs text-black uppercase shadow-[0_0_15px_rgba(251,191,36,0.3)]"
               >
                  <Crown className="w-4 h-4" /> Kredi Yükle
               </button>
               
               {/* AY BUTONU */}
               <button 
                 onClick={() => router.push('/dashboard/ay-takvimi')}
                 className="flex items-center gap-0 md:gap-4 bg-white/5 border border-white/10 p-2 md:px-5 md:py-2 rounded-full backdrop-blur-md hover:bg-white/10 hover:border-[#fbbf24]/50 transition-all group"
               >
                 <div className="text-lg md:text-2xl group-hover:scale-110 transition-transform">
                   {currentMoon?.icon || "🌕"}
                 </div>
                 <div className="hidden md:flex flex-col items-start text-left">
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
                  // userTier prop'u kaldırıldı çünkü artık kredi sistemi var
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