"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Brain, Moon, Check, ImageIcon, Download, Heart, Star, 
  ChevronRight, Layers, MessageCircle, Sparkles, ArrowRight, Zap, Map, BookOpen,
  Lock, Unlock, Loader2
} from "lucide-react";

// --- TYPEWRITER (Sade ve Sorunsuz) ---
const TypewriterText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-gray-200 leading-relaxed text-sm md:text-base font-light"
    >
      {text}
    </motion.div>
  );
};

interface Props {
  result: any;
  currentDreamId: string | null;
  generatedImage: string | null;
  onDownloadImage: () => void;
}

export default function AnalysisResults({ result, currentDreamId, generatedImage, onDownloadImage }: Props) {
  const router = useRouter();
  const supabase = createClient();
  
  const [hasNumerologyProfile, setHasNumerologyProfile] = useState<boolean | null>(null);
  
  // Kilit Stateleri
  const [unlockedPsych, setUnlockedPsych] = useState(false);
  const [unlockedIslamic, setUnlockedIslamic] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState<'psychological' | 'islamic' | null>(null);

  // Profil kontrolü
  useEffect(() => {
    const checkProfile = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
       const { data } = await supabase.from('personal_numerology').select('id').eq('user_id', user.id).single();
       setHasNumerologyProfile(!!data);
    };
    checkProfile();
  }, [supabase]);

  // Yeni rüya geldiğinde veya sayfa yüklendiğinde kilit durumunu hafızadan kontrol et
  useEffect(() => {
    if (currentDreamId) {
       const isPsychUnlocked = localStorage.getItem(`unlocked_psych_${currentDreamId}`);
       const isIslamicUnlocked = localStorage.getItem(`unlocked_islamic_${currentDreamId}`);
       
       setUnlockedPsych(isPsychUnlocked === 'true');
       setUnlockedIslamic(isIslamicUnlocked === 'true');
    }
  }, [currentDreamId]);

  // Kilidi Açma ve Kredi Düşme İşlemi
  const handleUnlock = async (type: 'psychological' | 'islamic') => {
    setIsUnlocking(type);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Oturum bulunamadı."); setIsUnlocking(null); return; }

      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();

      if (!profile || profile.credits < 1) {
        toast.error("Yetersiz kredi!", {
          action: { label: "Yükle", onClick: () => router.push("/dashboard/pricing") }
        });
        setIsUnlocking(null); return;
      }

      const { error } = await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);
      if (error) throw error;

      toast.success("Analiz kilidi açıldı!");
      
      // Kilidi aç ve o rüya için hafızaya kaydet
      if (type === 'psychological') {
         setUnlockedPsych(true);
         if (currentDreamId) localStorage.setItem(`unlocked_psych_${currentDreamId}`, 'true');
      }
      if (type === 'islamic') {
         setUnlockedIslamic(true);
         if (currentDreamId) localStorage.setItem(`unlocked_islamic_${currentDreamId}`, 'true');
      }
      
    } catch (error) { toast.error("İşlem hatası."); }
    setIsUnlocking(null);
  };

  const handleNumerologyNavigation = () => {
    if (hasNumerologyProfile === null) return;
    if (hasNumerologyProfile) {
        const numbersParam = result.lucky_numbers?.join(',') || "";
        router.push(`/dashboard/numeroloji/ruya?dreamId=${currentDreamId}&numbers=${numbersParam}`);
    } else {
        toast.info("Önce Numeroloji Haritanızı Çıkarmalıyız");
        router.push('/dashboard/numeroloji/genel');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="pb-32 space-y-8"
    >
      
      {/* 1. ÖZET BÖLÜMÜ */}
      <div className="text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
            <Sparkles className="w-3 h-3" /> Analiz Başarıyla Tamamlandı
        </div>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            {result.title || "Rüyanın Gizli Mesajı"}
        </h2>
        
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-[#131722] border border-white/5 backdrop-blur-sm text-left shadow-2xl">
           <h3 className="text-[#fbbf24] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
             <Moon className="w-4 h-4" /> Genel Rüya Özeti
           </h3>
           <TypewriterText text={result.summary} />
        </div>
      </div>

      {/* 2. ANA ANALİZLER (İSLAMİ VE PSİKOLOJİK - KİLİTLİ) */}
      <div className="grid md:grid-cols-2 gap-6">
         
         {/* İSLAMİ TABİR */}
         <div className="relative p-8 rounded-3xl bg-[#064e3b]/30 border border-emerald-500/20 shadow-xl overflow-hidden min-h-[300px] flex flex-col transition-all">
            <h3 className="font-serif text-xl text-emerald-400 mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6" /> İslami Rüya Tabiri
            </h3>
            
            {unlockedIslamic ? (
                <TypewriterText text={result.islamic || result.spiritual} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                   <Lock className="w-8 h-8 text-emerald-500/50 mb-4" />
                   <p className="text-emerald-200/60 text-xs mb-6 max-w-[200px]">Diyanet ve Nablusi kaynaklı derin tabiri okuyun.</p>
                   <button 
                     onClick={() => handleUnlock('islamic')}
                     disabled={isUnlocking === 'islamic'}
                     className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-2"
                   >
                      {isUnlocking === 'islamic' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                      Kilidi Aç (1 Kredi)
                   </button>
                </div>
            )}
         </div>

         {/* PSİKOLOJİK ANALİZ */}
         <div className="relative p-8 rounded-3xl bg-[#1e293b]/40 border border-blue-500/20 shadow-xl overflow-hidden min-h-[300px] flex flex-col transition-all">
            <h3 className="font-serif text-xl text-blue-400 mb-6 flex items-center gap-3">
                <Brain className="w-6 h-6" /> Psikolojik Analiz
            </h3>
            
            {unlockedPsych ? (
                <TypewriterText text={result.psychological} />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                   <Lock className="w-8 h-8 text-blue-500/50 mb-4" />
                   <p className="text-blue-200/60 text-xs mb-6 max-w-[200px]">Bilinçaltınızın size gönderdiği mesajları keşfedin.</p>
                   <button 
                     onClick={() => handleUnlock('psychological')}
                     disabled={isUnlocking === 'psychological'}
                     className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-2"
                   >
                      {isUnlocking === 'psychological' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                      Kilidi Aç (1 Kredi)
                   </button>
                </div>
            )}
         </div>
      </div>

      {/* 3. EKSTRA HİZMETLER (YENİ SIRALAMA VE BÜYÜTÜLMÜŞ KUTULAR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* MOOD */}
         <div 
            onClick={() => router.push('/dashboard/duygu-durumu')} 
            className="bg-[#080808] border border-white/10 rounded-3xl p-8 hover:border-rose-500/30 transition-all cursor-pointer flex flex-col justify-between group min-h-[280px]"
         >
            <div>
               <div className="flex justify-between items-start mb-6">
                   <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <Heart className="w-5 h-5" />
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-rose-500 transition-colors" />
               </div>
               <h3 className="font-serif text-2xl text-rose-400 mb-2">{result.mood}</h3>
               <p className="text-gray-400 text-xs mb-4 leading-relaxed">Rüyanızdaki temel duygu durumunu ve bilinçaltı yoğunluğunu analiz eder.</p>
            </div>
            
            <div className="mt-auto">
               <p className="text-gray-500 text-[10px] font-medium uppercase tracking-tighter mb-2">Yoğunluk: %{result.mood_score}</p>
               <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${result.mood_score}%` }}></div>
               </div>
            </div>
         </div>

         {/* NUMEROLOJİ */}
         <div 
            onClick={handleNumerologyNavigation}
            className="bg-[#080808] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-sky-500/30 transition-all cursor-pointer group min-h-[280px]"
         >
            <div>
               <div className="flex justify-between items-start mb-6">
                   <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      <Star className="w-5 h-5" />
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-sky-500 transition-colors" />
               </div>
               <h3 className="font-serif text-xl text-white mb-2">Kozmik Şifre</h3>
               <p className="text-gray-400 text-xs mb-6 leading-relaxed">Rüyanızdaki sembolik sayıların yaşam yolunuzla olan uyumunu keşfedin.</p>
               
               <div className="flex gap-2 mb-6">
                  {result.lucky_numbers?.slice(0, 3).map((num: any, i: number) => (
                     <div key={i} className="w-10 h-10 rounded-xl bg-[#111] border border-white/5 flex items-center justify-center font-mono text-lg font-bold text-sky-400 shadow-inner">
                       {num}
                     </div>
                  ))}
               </div>
            </div>
            <div className="w-full mt-auto py-3 rounded-xl bg-sky-500/5 text-sky-400 text-[10px] font-bold uppercase flex items-center justify-center gap-2 border border-sky-500/10 transition-colors group-hover:bg-sky-500/10">
                {hasNumerologyProfile ? "Uyum Haritası" : "Profil Oluştur"}
            </div>
         </div>

         {/* TAROT */}
         <div 
            onClick={() => router.push('/dashboard/tarot')}
            className="bg-[#080808] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-amber-500/30 transition-all cursor-pointer group min-h-[280px]"
         >
            <div>
               <div className="flex justify-between items-start mb-6">
                   <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Layers className="w-5 h-5" />
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-amber-500 transition-colors" />
               </div>
               <h3 className="font-serif text-xl text-white mb-2">Mistik Rehber</h3>
               <p className="text-gray-400 text-xs mb-6 leading-relaxed">Rüyanızın enerjisine en uygun Tarot kartını ve arkasındaki kadim mesajı açın.</p>
            </div>

            <div className="flex flex-col mt-auto">
               <div className="flex items-center gap-4 bg-[#111] p-4 rounded-2xl mb-4 border border-white/5">
                  <div className="w-8 h-12 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center justify-center">
                     <Star className="w-4 h-4 text-amber-500/30" />
                  </div>
                  <div className="text-slate-300 font-serif text-sm">Günün Kartı</div>
               </div>
               <div className="w-full py-3 rounded-xl bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase flex items-center justify-center gap-2 border border-amber-500/20 transition-colors group-hover:bg-amber-500/20">
                   Mistik Kartı Aç
               </div>
            </div>
         </div>

         {/* SOHBET */}
         <div 
            onClick={() => router.push(`/dashboard/sohbet/${currentDreamId}`)}
            className="bg-[#080808] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-orange-500/30 transition-all cursor-pointer group min-h-[280px]"
         >
            <div>
               <div className="flex justify-between items-start mb-6">
                   <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                      <MessageCircle className="w-5 h-5" />
                   </div>
                   <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-orange-500 transition-colors" />
               </div>
               <h3 className="font-serif text-xl text-white mb-2">Kahin ile Konuş</h3>
               <p className="text-gray-400 text-xs mb-6 leading-relaxed">Rüyanızın detayları veya aklınıza takılan herhangi bir soru hakkında uzman yapay zeka ile sohbete başlayın.</p>
            </div>

            <div className="w-full mt-auto py-3 rounded-xl bg-white text-black font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition-colors group-hover:bg-slate-200">
                Sohbeti Başlat (1 Kredi)
            </div>
         </div>

         {/* GÖRSEL STUDIO (ALTTA VE GENİŞ - SOHBETİN YANINDAKİ 2 KOLONU KAPLAR) */}
         <div 
            onClick={() => router.push(`/dashboard/gorsel-olustur/${currentDreamId}`)}
            className="md:col-span-2 lg:col-span-2 bg-[#080808] border border-white/10 rounded-3xl overflow-hidden group shadow-2xl flex flex-col sm:flex-row min-h-[280px] hover:border-violet-500/30 transition-all cursor-pointer"
         >
            <div className="p-8 flex flex-col justify-center flex-1">
               <div className="flex items-center gap-3 mb-4">
                   <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
                      <ImageIcon className="w-5 h-5" />
                   </div>
                   <h3 className="font-serif text-2xl text-white">Rüyanın <span className="text-violet-400">Sanat Hali</span></h3>
               </div>
               <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm">Bilinçaltınızdaki soyut görüntüleri, yapay zeka ile yüksek çözünürlüklü dijital bir tabloya dönüştürün.</p>
               
               <div className="w-fit px-6 py-3.5 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center gap-2 group-hover:bg-violet-500 transition-all mt-auto">
                  <ImageIcon className="w-4 h-4" /> Görseli Oluştur (3 Kredi)
               </div>
            </div>
            <div className="w-full sm:w-[280px] h-56 sm:h-auto bg-[#050505] relative overflow-hidden shrink-0 border-l border-white/5">
               <img src="../images/kale.jpg" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105" alt="Rüya Örneği" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
               {generatedImage && (
                 <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onDownloadImage();
                  }} 
                  className="absolute bottom-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 z-10 transition-colors shadow-lg"
                >
                    <Download className="w-4 h-4" />
                 </button>
               )}
            </div>
         </div>

      </div>
    </motion.div>
  );
}