"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Sparkles, Image as ImageIcon, Download, Share2, 
  Loader2, Check, Lock, Wand2, Paintbrush, Quote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateDreamImage } from "@/app/actions/generate-image";
import { toast } from "sonner";

export default function ImageStudioPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  // --- State Yönetimi ---
  const [loading, setLoading] = useState(true); // Sayfa yükleniyor mu?
  const [generating, setGenerating] = useState(false); // Resim üretiliyor mu?
  const [dream, setDream] = useState<any>(null);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'elite'>('free');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Yükleme Mesajları
  const loadingMessages = [
    "Bilinçaltının renkleri taranıyor...",
    "Rüya atmosferi kurgulanıyor...",
    "Işık ve gölge ayarları yapılıyor...",
    "Yapay zeka fırçasını eline aldı...",
    "Son dokunuşlar yapılıyor..."
  ];

  // --- 1. Başlangıç Verilerini Çek ---
  useEffect(() => {
    const fetchData = async () => {
      // A) Kullanıcı Yetkisi
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      const tier = profile?.subscription_tier?.toLowerCase() || 'free';
      setUserTier(tier);

      // Yetkisiz Giriş Koruması
      if (tier === 'free') {
        toast.error("Bu stüdyoya sadece Kaşif ve Kahinler girebilir.");
        router.push('/dashboard/pricing');
        return;
      }

      // B) Rüya Verisi
      const { data: dreamData, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id) // Başkasının rüyasını görmesin
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

  // --- Yükleme Animasyonu Mesaj Döngüsü ---
  useEffect(() => {
    if (generating) {
      const interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [generating]);

  // --- Görsel Oluşturma ---
  const handleGenerate = async () => {
    if (!dream) return;
    
    setGenerating(true);
    setLoadingMsgIndex(0);

    // Haptik titreşim
    if (navigator.vibrate) navigator.vibrate(20);

    // Analizden gelen özet varsa onu, yoksa rüya metnini kullan
    const promptText = dream.ai_response?.summary || dream.dream_text.substring(0, 300);

    try {
      const result = await generateDreamImage(promptText, dream.id);

      if (result.success && result.imageUrl) {
        // State'i güncelle
        setDream((prev: any) => ({ ...prev, image_url: result.imageUrl }));
        toast.success("Eseriniz hazır! 🎨");
      } else {
        toast.error(result.error || "Bir sorun oluştu.");
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
        link.download = `ruyam-ai-studio-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Görsel cihazınıza indirildi.");
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
                title: 'Rüyam AI - Görsel Stüdyosu',
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
      <div className="min-h-[100dvh] bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#fbbf24] animate-spin" />
      </div>
    );
  }

  return (
    // APP FIX: min-h-[100dvh] ve pb-24
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-hidden flex flex-col pb-32">
      {/* Arkaplan Efektleri */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-900/30 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-900/30 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse-slow delay-1000"></div>

      {/* --- NAVBAR --- */}
      <nav className="w-full p-4 md:p-6 flex justify-between items-center relative z-20">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 p-2 -ml-2 rounded-full hover:bg-white/5 active:scale-90 transition-all text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold hidden md:inline">Panele Dön</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/5 rounded-full border border-white/10">
          <Wand2 className="w-3 h-3 md:w-4 md:h-4 text-[#fbbf24]" />
          <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Görsel Stüdyosu</span>
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </nav>

      {/* --- ANA İÇERİK --- */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 md:p-6 gap-6 md:gap-8 relative z-10">
        
        {/* SAĞ PANEL: Tuval (Mobilde Üstte Olsun -> order-1) */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ delay: 0.4 }}
          className="w-full md:w-2/3 flex flex-col order-1 md:order-2"
        >
          <div className="relative w-full aspect-square md:aspect-[16/10] bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center group touch-manipulation">
            
            {/* Durum 1: Resim Henüz Yok */}
            {!dream.image_url && !generating && (
              <div className="text-center p-6 md:p-10 max-w-md">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 border border-white/10 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
                  <Paintbrush className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white mb-2">Tuval Boş</h2>
                <p className="text-gray-400 text-xs md:text-sm mb-6 md:mb-8">
                  Yapay zeka, rüyanızın atmosferini analiz ederek benzersiz bir eser ortaya çıkaracak.
                </p>
                <button 
                  onClick={handleGenerate}
                  className="px-6 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.3)] mx-auto text-sm md:text-base"
                >
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" /> 
                  <span>Eseri Oluştur</span>
                </button>
              </div>
            )}

            {/* Durum 2: Yükleniyor */}
            {generating && (
              <div className="flex flex-col items-center justify-center p-10 text-center z-10">
                <div className="relative mb-8">
                  <div className="w-16 h-16 md:w-24 md:h-24 border-t-2 border-l-2 border-[#fbbf24] rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#fbbf24] animate-pulse" />
                  </div>
                </div>
                <motion.p 
                  key={loadingMsgIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[#fbbf24] font-mono text-xs md:text-sm tracking-widest uppercase"
                >
                  {loadingMessages[loadingMsgIndex]}
                </motion.p>
              </div>
            )}

            {/* Durum 3: Resim Hazır */}
            {dream.image_url && !generating && (
              <>
                <img 
                  src={dream.image_url} 
                  alt="Rüya Görseli" 
                  className="w-full h-full object-cover animate-fade-in"
                />
                
                {/* Alt Kontrol Barı (Mobilde her zaman görünür, Masaüstünde hover ile) */}
                <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col md:flex-row items-center justify-between gap-4 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-500">
                  <div className="text-center md:text-left">
                    <p className="text-[#fbbf24] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Rüya Görseli Hazır</p>
                    <p className="text-gray-300 text-[10px] md:text-xs hidden md:block">Yüksek çözünürlükte oluşturuldu.</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                    <button 
                      onClick={handleDownload} 
                      className="flex-1 md:flex-none px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-bold hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> İndir
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex-1 md:flex-none px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-[#fbbf24] text-black text-xs md:text-sm font-bold hover:bg-[#d97706] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} Paylaş
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bilgilendirme */}
          <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 opacity-50">
            <Lock className="w-3 h-3 text-gray-500" />
            <p className="text-[10px] text-gray-500 text-center">
              Bu görsel size özel üretilmiştir.
            </p>
          </div>
        </motion.div>

        {/* SOL PANEL: Rüya Detayı (Mobilde Altta Olsun -> order-2) */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="w-full md:w-1/3 flex flex-col gap-6 order-2 md:order-1"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex-1 flex flex-col">
            <h1 className="text-xl md:text-2xl font-serif text-[#fbbf24] mb-4 leading-tight line-clamp-2">
              {dream.dream_title || "İsimsiz Rüya"}
            </h1>
            <div className="relative pl-4 border-l-2 border-purple-500/30 mb-6">
              <Quote className="w-4 h-4 text-purple-400 absolute -top-2 -left-2 bg-[#020617]" />
              <p className="text-gray-300 text-xs md:text-sm italic line-clamp-4 md:line-clamp-6">
                {dream.dream_text}
              </p>
            </div>
            
            <div className="mt-auto">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Stüdyo Ayarları</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] md:text-xs text-gray-500 block mb-1">Model</span>
                  <span className={`text-xs md:text-sm font-bold ${userTier === 'elite' ? 'text-amber-400' : 'text-blue-400'}`}>
                    {userTier === 'elite' ? 'FLUX (Ultra HD)' : 'Turbo (Standart)'}
                  </span>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] md:text-xs text-gray-500 block mb-1">Stil</span>
                  <span className="text-xs md:text-sm font-bold text-white">Mistik Sürrealizm</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}