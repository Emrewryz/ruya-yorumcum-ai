"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Sparkles, Download, Share2, 
  Loader2, Check, Lock, Wand2, Paintbrush, 
  Quote, Coins, PenTool
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateDreamImage } from "@/app/actions/generate-image";
import { toast } from "sonner";

export default function ImageStudioPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  // --- State Yönetimi ---
  const [loading, setLoading] = useState(true); 
  const [generating, setGenerating] = useState(false); 
  const [dream, setDream] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // YENİ: Mod Seçimi ve Manuel Prompt
  const [mode, setMode] = useState<'auto' | 'custom'>('auto');
  const [customPrompt, setCustomPrompt] = useState("");

  const loadingMessages = [
    "Bilinçaltının renkleri taranıyor...",
    "Rüya atmosferi kurgulanıyor...",
    "Işık ve gölge ayarları yapılıyor...",
    "Yapay zeka fırçasını eline aldı...",
    "Son dokunuşlar yapılıyor..."
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  // --- 1. Başlangıç Verilerini Çek ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: dreamData, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id) 
        .single();

      if (error || !dreamData) {
        toast.error("Rüya bulunamadı.");
        router.push('/dashboard');
        return;
      }

      setDream(dreamData);
      setLoading(false);
    };

    fetchData();
  }, [params.id, router, supabase]);

  // --- Yükleme Mesajı Döngüsü ---
  useEffect(() => {
    if (generating) {
      const interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [generating]);

  // --- GÖRSEL OLUŞTURMA İŞLEMİ ---
  const handleGenerate = async () => {
    if (!dream) return;
    
    // Prompt Belirleme Mantığı
    let finalPrompt = "";
    
    if (mode === 'auto') {
        // Otomatik Mod: Rüya metnini veya özetini kullan
        finalPrompt = dream.ai_response?.summary || dream.dream_text.substring(0, 400);
    } else {
        // Manuel Mod: Kullanıcının yazdığını kullan
        if (!customPrompt.trim()) {
            toast.warning("Lütfen hayalinizdeki sahneyi tarif edin.");
            return;
        }
        finalPrompt = customPrompt;
    }

    setGenerating(true);
    setMsgIndex(0);

    if (navigator.vibrate) navigator.vibrate(20);

    try {
      // Backend Action Çağrısı (Kredi ve Üretim orada yönetilir)
      const result = await generateDreamImage(finalPrompt, dream.id);

      if (result.success && result.imageUrl) {
        setDream((prev: any) => ({ ...prev, image_url: result.imageUrl }));
        toast.success("Eseriniz hazır! (3 Kredi düştü)");
      } else {
        // Hata Yönetimi
        const errCode = (result as any).code;
        if (errCode === 'NO_CREDIT') {
             toast.error("Yetersiz Bakiye", {
                 description: "Bu işlem için 3 krediye ihtiyacınız var.",
                 action: {
                     label: "Yükle",
                     onClick: () => router.push("/dashboard/pricing")
                 },
                 duration: 5000
             });
        } else {
             toast.error(result.error || "Bir sorun oluştu.");
        }
      }

    } catch (e) {
      toast.error("Beklenmedik bir hata oluştu.");
    } finally {
      setGenerating(false);
    }
  };

  // --- İndirme ---
  const handleDownload = async () => {
    if (!dream?.image_url) return;
    try {
        const response = await fetch(dream.image_url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ruya-sanati-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Görsel indirildi.");
    } catch (e) {
        toast.error("İndirme başarısız.");
    }
  };

  // --- Paylaşma ---
  const handleShare = async () => {
    if (!dream?.image_url) return;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Rüyam AI',
                text: 'Rüyamı yapay zeka ile sanata dönüştürdüm! ✨',
                url: dream.image_url,
            });
        } catch (err) { console.log("Paylaşım iptal."); }
    } else {
        navigator.clipboard.writeText(dream.image_url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast.success("Link kopyalandı!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#fbbf24] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden flex flex-col pb-24 md:pb-32">
      
      {/* Arkaplan Efektleri */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-purple-900/30 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-blue-900/30 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse-slow delay-1000"></div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 p-4 md:p-6 flex justify-between items-center z-30">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 p-2 -ml-2 rounded-full hover:bg-white/5 active:scale-90 transition-all text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs md:text-sm font-bold hidden md:inline">Geri Dön</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 rounded-full border border-white/10">
          <Wand2 className="w-3 h-3 md:w-4 md:h-4 text-[#fbbf24]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Görsel Stüdyosu</span>
        </div>
        <div className="w-8"></div>
      </nav>

      {/* --- ANA İÇERİK --- */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 lg:p-8 gap-8 relative z-10">
        
        {/* SOL PANEL: KONTROLLER (Sıra 2 on mobile, 1 on desktop) */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-1/3 flex flex-col gap-6 order-2 lg:order-1"
        >
          {/* Rüya Özeti Kartı */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Quote className="w-12 h-12" /></div>
             <h2 className="text-xl font-serif text-[#fbbf24] mb-2 line-clamp-1">{dream.dream_title || "Rüyanız"}</h2>
             <p className="text-gray-400 text-sm line-clamp-3 italic">"{dream.dream_text}"</p>
          </div>

          {/* KONTROL PANOSU */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex-1 flex flex-col backdrop-blur-xl">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Stüdyo Ayarları</h3>
             
             {/* SEKME (TAB) YAPISI */}
             <div className="flex p-1 bg-white/5 rounded-xl mb-6 border border-white/5">
                <button 
                  onClick={() => setMode('auto')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'auto' ? 'bg-[#fbbf24] text-black shadow-lg scale-[1.02]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                   <Sparkles className="w-3 h-3" /> Rüyadan Üret
                </button>
                <button 
                  onClick={() => setMode('custom')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'custom' ? 'bg-[#fbbf24] text-black shadow-lg scale-[1.02]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                   <PenTool className="w-3 h-3" /> Kendin Anlat
                </button>
             </div>

             {/* DİNAMİK İÇERİK ALANI */}
             <div className="flex-1 mb-6 min-h-[140px]">
                <AnimatePresence mode="wait">
                  {mode === 'auto' ? (
                    <motion.div 
                      key="auto" 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center p-6 bg-white/5 rounded-xl border border-dashed border-white/10 h-full flex flex-col items-center justify-center gap-3"
                    >
                       <Wand2 className="w-8 h-8 text-purple-400 opacity-50" />
                       <p className="text-sm text-gray-300 leading-relaxed">
                         Yapay zeka, rüyanızdaki sembolleri ve duyguları analiz ederek sahneyi <span className="text-[#fbbf24]">otomatik</span> kurgulayacak.
                       </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="custom" 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="h-full flex flex-col"
                    >
                       <textarea 
                         value={customPrompt}
                         onChange={(e) => setCustomPrompt(e.target.value)}
                         placeholder="Örn: Kristalden yapılmış bir şehirde uçan balıklar, mor gökyüzü, sinematik ışık..."
                         className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#fbbf24]/50 focus:ring-1 focus:ring-[#fbbf24]/20 transition-all resize-none mb-2"
                       />
                       <p className="text-[10px] text-gray-500 text-right italic">Ne kadar detay, o kadar sanat.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* OLUŞTUR BUTONU */}
             <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
                   <span>İşlem Maliyeti</span>
                   <div className="flex items-center gap-1 text-[#fbbf24] font-bold bg-[#fbbf24]/10 px-2 py-1 rounded">
                      <Coins className="w-3 h-3" /> 3 Kredi
                   </div>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                >
                   {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paintbrush className="w-5 h-5" />}
                   {generating ? "Sanat İşleniyor..." : "Eseri Oluştur"}
                </button>
             </div>
          </div>
        </motion.div>

        {/* SAĞ PANEL: TUVAL (CANVAS) (Sıra 1 on mobile, 2 on desktop) */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="w-full lg:w-2/3 order-1 lg:order-2"
        >
           <div className="relative w-full aspect-square md:aspect-video bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center group">
              
              {/* SENARYO 1: RESİM VAR (Tamamlandı) */}
              {dream.image_url && !generating ? (
                 <>
                   <img src={dream.image_url} alt="AI Art" className="w-full h-full object-cover animate-fade-in" />
                   
                   {/* Alt Kontrol Barı (Hover ile gelir) */}
                   <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-[2px]">
                      <div>
                         <p className="text-white font-bold text-sm drop-shadow-md">HD Çözünürlük</p>
                         <p className="text-gray-300 text-xs">Flux Model</p>
                      </div>
                      <div className="flex gap-3">
                         <button onClick={handleDownload} className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 text-white border border-white/10 transition-all active:scale-90" title="İndir">
                            <Download className="w-5 h-5" />
                         </button>
                         <button onClick={handleShare} className="p-3 bg-[#fbbf24] rounded-full text-black hover:bg-[#d97706] shadow-lg transition-all active:scale-90" title="Paylaş">
                            {isCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                         </button>
                      </div>
                   </div>
                 </>
              ) : generating ? (
                 // SENARYO 2: YÜKLENİYOR
                 <div className="text-center p-8 z-10">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                       <div className="absolute inset-0 border-4 border-[#fbbf24]/30 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-[#fbbf24] border-t-transparent rounded-full animate-spin"></div>
                       <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#fbbf24] animate-pulse" />
                    </div>
                    <motion.p 
                       key={msgIndex}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="text-[#fbbf24] font-mono text-xs md:text-sm uppercase tracking-widest"
                    >
                       {loadingMessages[msgIndex]}
                    </motion.p>
                 </div>
              ) : (
                 // SENARYO 3: BOŞ TUVAL
                 <div className="text-center opacity-30 px-6">
                    <Paintbrush className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 text-gray-500" />
                    <p className="text-lg md:text-2xl font-serif text-gray-400">Tuval Henüz Boş</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-2">Sol panelden ayarlarınızı yapıp "Oluştur"a basın.</p>
                 </div>
              )}
           </div>
           
           {/* Güvenlik Bilgisi */}
           {dream.image_url && (
             <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
               <Lock className="w-3 h-3 text-gray-500" />
               <p className="text-[10px] text-gray-500">Bu görsel size özel üretildi ve şifreli olarak saklanıyor.</p>
             </div>
           )}
        </motion.div>

      </div>
    </div>
  );
}