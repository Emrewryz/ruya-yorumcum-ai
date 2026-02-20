"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // <-- useParams EKLENDİ
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Sparkles, Download, Share2, 
  Loader2, Check, Lock, Wand2, Paintbrush, 
  Quote, Coins, PenTool
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateDreamImage } from "@/app/actions/generate-image";
import { toast } from "sonner";

// props kısmındaki { params } kaldırıldı, yerine içeride useParams() kullanılacak
export default function ImageStudioPage() {
  const router = useRouter();
  const params = useParams(); // <-- URL'deki [id] değerini güvenle almak için
  const dreamId = params?.id as string; // String'e çeviriyoruz

  const supabase = createClient();
  
  // --- State Yönetimi ---
  const [loading, setLoading] = useState(true); 
  const [generating, setGenerating] = useState(false); 
  const [dream, setDream] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // Mod Seçimi ve Manuel Prompt
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
      // Eğer ID yoksa direkt iptal et (Dashboard'dan genel tıklanmış olabilir)
      if (!dreamId) {
         toast.error("Geçerli bir rüya kimliği bulunamadı.");
         router.push('/dashboard');
         return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: dreamData, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('id', dreamId) // <-- Güvenli ID kullanımı
        .eq('user_id', user.id) 
        .single();

      if (error || !dreamData) {
        toast.error("Rüya bulunamadı veya erişim yetkiniz yok.");
        router.push('/dashboard');
        return;
      }

      setDream(dreamData);
      setLoading(false);
    };

    fetchData();
  }, [dreamId, router, supabase]); // Dependency array düzeltildi

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
    
    let finalPrompt = "";
    
    if (mode === 'auto') {
        finalPrompt = dream.ai_response?.summary || dream.dream_text.substring(0, 400);
    } else {
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
      const result = await generateDreamImage(finalPrompt, dream.id);

      if (result.success && result.imageUrl) {
        setDream((prev: any) => ({ ...prev, image_url: result.imageUrl }));
        toast.success("Eseriniz hazır! (3 Kredi düştü)");
      } else {
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
      <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#fbbf24] animate-spin mb-4" />
        <p className="text-slate-500 text-xs tracking-widest uppercase animate-pulse">Tuval Hazırlanıyor...</p>
      </div>
    );
  }

  // --- UI KISMI (Değiştirilmedi, sadece arkaplan zemin rengi "Midnight Pro" koduna (#0a0c10) eşitlendi) ---
  return (
    <div className="min-h-screen relative w-full flex flex-col items-center z-10 pb-20 bg-[#0a0c10] font-sans selection:bg-[#fbbf24]/30">
      
      {/* Arkaplan Efektleri */}
      <div className="bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] fixed inset-0 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* --- NAVBAR --- */}
      <nav className="w-full px-4 md:px-6 py-6 flex justify-between items-center z-30 max-w-[1200px] mx-auto mt-2">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden md:inline">Geri Dön</span>
        </button>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#131722]/80 backdrop-blur-md rounded-xl border border-white/5 shadow-sm">
          <Wand2 className="w-4 h-4 text-[#fbbf24]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-white">Görsel Stüdyosu</span>
        </div>
      </nav>

      {/* --- ANA İÇERİK --- */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1200px] mx-auto w-full p-4 lg:p-8 gap-8 relative z-10">
        
        {/* SOL PANEL: KONTROLLER */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-1/3 flex flex-col gap-6 order-2 lg:order-1"
        >
          {/* Rüya Özeti Kartı */}
          <div className="bg-[#131722]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-xl">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Quote className="w-16 h-16 text-white" /></div>
             <h2 className="text-2xl font-serif text-[#fbbf24] mb-3 line-clamp-1">{dream.dream_title || "Rüyanız"}</h2>
             <p className="text-slate-300 text-sm leading-relaxed font-light line-clamp-4 italic">"{dream.dream_text}"</p>
          </div>

          {/* KONTROL PANOSU */}
          <div className="bg-[#131722]/80 border border-white/5 rounded-3xl p-8 flex-1 flex flex-col backdrop-blur-xl shadow-xl">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Stüdyo Ayarları</h3>
             
             {/* SEKME (TAB) YAPISI */}
             <div className="flex p-1.5 bg-[#0a0c10] rounded-xl mb-6 border border-white/5 shadow-inner">
                <button 
                  onClick={() => setMode('auto')}
                  className={`flex-1 py-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'auto' ? 'bg-[#fbbf24] text-[#0a0c10] shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'text-slate-400 hover:text-white'}`}
                >
                   <Sparkles className="w-4 h-4" /> Rüyadan Üret
                </button>
                <button 
                  onClick={() => setMode('custom')}
                  className={`flex-1 py-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === 'custom' ? 'bg-[#fbbf24] text-[#0a0c10] shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'text-slate-400 hover:text-white'}`}
                >
                   <PenTool className="w-4 h-4" /> Kendin Anlat
                </button>
             </div>

             {/* DİNAMİK İÇERİK ALANI */}
             <div className="flex-1 mb-8 min-h-[140px]">
                <AnimatePresence mode="wait">
                  {mode === 'auto' ? (
                    <motion.div 
                      key="auto" 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center p-8 bg-[#0a0c10] rounded-2xl border border-dashed border-white/10 h-full flex flex-col items-center justify-center gap-4"
                    >
                       <Wand2 className="w-10 h-10 text-[#fbbf24] opacity-30" />
                       <p className="text-sm text-slate-300 leading-relaxed font-light">
                         Yapay zeka, rüyanızdaki sembolleri ve duyguları analiz ederek sahneyi <span className="text-[#fbbf24] font-medium">otomatik</span> kurgulayacak.
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
                         className="w-full h-36 bg-[#0a0c10] border border-white/10 rounded-2xl p-5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#fbbf24]/50 focus:ring-1 focus:ring-[#fbbf24]/20 transition-all resize-none mb-3 shadow-inner"
                       />
                       <p className="text-[10px] text-slate-500 text-right uppercase tracking-widest font-bold">Ne kadar detay, o kadar sanat.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* OLUŞTUR BUTONU */}
             <div className="mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
                   <span className="uppercase tracking-widest font-bold">İşlem Maliyeti</span>
                   <div className="flex items-center gap-1.5 text-[#fbbf24] font-bold bg-[#fbbf24]/10 px-3 py-1.5 rounded-md border border-[#fbbf24]/20">
                      <Coins className="w-3.5 h-3.5" /> 3 Kredi
                   </div>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-4.5 rounded-2xl bg-[#fbbf24] hover:bg-[#d97706] text-[#0a0c10] font-bold uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(251,191,36,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paintbrush className="w-5 h-5" />}
                   {generating ? "Sanat İşleniyor..." : "Eseri Oluştur"}
                </button>
             </div>
          </div>
        </motion.div>

        {/* SAĞ PANEL: TUVAL (CANVAS) */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="w-full lg:w-2/3 order-1 lg:order-2 flex"
        >
           <div className="relative w-full aspect-square md:aspect-video bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center justify-center group flex-1">
             
             {/* SENARYO 1: RESİM VAR (Tamamlandı) */}
             {dream.image_url && !generating ? (
                 <>
                   <img src={dream.image_url} alt="AI Art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                   
                   {/* Alt Kontrol Barı (Hover ile gelir) */}
                   <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/80 to-transparent flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <div>
                         <p className="text-white font-serif text-xl drop-shadow-lg mb-1">Rüya Tablosu</p>
                         <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Yüksek Çözünürlük</p>
                      </div>
                      <div className="flex gap-4">
                         <button onClick={handleDownload} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 text-white border border-white/10 transition-all shadow-xl" title="İndir">
                            <Download className="w-5 h-5" />
                         </button>
                         <button onClick={handleShare} className="p-4 bg-[#fbbf24] rounded-2xl text-[#0a0c10] hover:bg-[#d97706] shadow-[0_5px_20px_rgba(251,191,36,0.3)] transition-all" title="Paylaş">
                            {isCopied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                         </button>
                      </div>
                   </div>
                 </>
             ) : generating ? (
                 // SENARYO 2: YÜKLENİYOR
                 <div className="text-center p-8 z-10">
                    <div className="relative w-28 h-28 mx-auto mb-10">
                       <div className="absolute inset-0 border-[4px] border-[#fbbf24]/20 rounded-full"></div>
                       <div className="absolute inset-0 border-[4px] border-[#fbbf24] border-t-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
                       <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-[#fbbf24] animate-pulse" />
                    </div>
                    <motion.p 
                       key={msgIndex}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="text-[#fbbf24] font-serif text-lg md:text-xl tracking-wide"
                    >
                       {loadingMessages[msgIndex]}
                    </motion.p>
                 </div>
             ) : (
                 // SENARYO 3: BOŞ TUVAL
                 <div className="text-center opacity-40 px-6">
                    <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                       <Paintbrush className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-2xl md:text-3xl font-serif text-white mb-2">Tuval Henüz Boş</p>
                    <p className="text-sm text-slate-400 font-light">Sol panelden ayarlarınızı yapıp sanat eserini oluşturun.</p>
                 </div>
             )}
           </div>
           
        </motion.div>

      </div>
    </div>
  );
}