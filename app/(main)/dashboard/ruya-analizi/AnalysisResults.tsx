"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  Brain, Moon, Check, ImageIcon, Heart, Star, 
  ChevronRight, Layers, MessageCircle, Sparkles, ArrowRight, BookOpen,
  Lock, Unlock, Loader2, Clock
} from "lucide-react";

// --- TYPEWRITER (İki Temaya Uyumlu) ---
const TypewriterText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-stone-700 dark:text-slate-300 leading-[1.8] text-base md:text-lg font-light text-justify transition-colors"
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
  
  const [user, setUser] = useState<any>(null);
  const [hasNumerologyProfile, setHasNumerologyProfile] = useState<boolean | null>(null);
  
  const [unlockedPsych, setUnlockedPsych] = useState(false);
  const [unlockedIslamic, setUnlockedIslamic] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState<'psychological' | 'islamic' | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       setUser(user);
       if (!user) return;
       const { data } = await supabase.from('personal_numerology').select('id').eq('user_id', user.id).single();
       setHasNumerologyProfile(!!data);
    };
    checkProfile();
  }, [supabase]);

  useEffect(() => {
    if (currentDreamId) {
       const isPsychUnlocked = localStorage.getItem(`unlocked_psych_${currentDreamId}`);
       const isIslamicUnlocked = localStorage.getItem(`unlocked_islamic_${currentDreamId}`);
       
       setUnlockedPsych(isPsychUnlocked === 'true');
       setUnlockedIslamic(isIslamicUnlocked === 'true');
    }
  }, [currentDreamId]);

  const isGuest = !user;

  const handleUnlock = async (type: 'psychological' | 'islamic') => {
    if (isGuest) {
       toast.info("Detaylı analiz için ücretsiz kayıt olun.");
       router.push('/auth?mode=signup&redirect=/dashboard/ruya-analizi');
       return;
    }

    setIsUnlocking(type);
    try {
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
    if (isGuest) {
      toast.info("Numeroloji için ücretsiz kayıt olun.");
      router.push('/auth?mode=signup');
      return;
    }
    if (hasNumerologyProfile === null) return;
    if (hasNumerologyProfile) {
        const numbersParam = result.lucky_numbers?.join(',') || "";
        router.push(`/dashboard/numeroloji/ruya?dreamId=${currentDreamId}&numbers=${numbersParam}`);
    } else {
        toast.info("Önce Numeroloji Haritanızı Çıkarmalıyız");
        router.push('/dashboard/numeroloji/genel');
    }
  };

  const handleGuestRedirect = (featureName: string) => {
    toast.info(`${featureName} özelliği için ücretsiz kayıt olun.`);
    router.push('/auth?mode=signup');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="pb-32 space-y-8 md:space-y-12 antialiased w-full"
    >
      
      {/* ================= 1. ÖZET BÖLÜMÜ (HERKESE AÇIK) ================= */}
      <div className="text-center px-4 w-full">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm transition-colors">
            <Check className="w-3 h-3" /> Analiz Başarıyla Tamamlandı
        </div>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 dark:text-white mb-8 md:mb-10 leading-tight transition-colors">
            {result.title || "Rüyanın Gizli Mesajı"}
        </h2>
        
        {/* Özet Kutusu */}
        <div className="max-w-4xl mx-auto p-6 md:p-12 rounded-[2rem] bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl border border-stone-200 dark:border-white/10 shadow-lg dark:shadow-2xl text-left relative overflow-hidden transition-colors">
           <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none">
              <Moon className="w-32 h-32 text-stone-900 dark:text-white" />
           </div>
           
           <h3 className="text-emerald-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-stone-100 dark:border-white/10 pb-4 transition-colors">
             <Sparkles className="w-4 h-4" /> Genel Rüya Özeti
           </h3>
           <div className="relative z-10">
              <TypewriterText text={result.summary} />
           </div>
        </div>
      </div>

      {/* ================= 2. ANA ANALİZLER (KİLİTLİ ALANLAR) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4 w-full">
         
         {/* İSLAMİ TABİR */}
         <div className={`relative p-6 md:p-10 rounded-[2rem] bg-emerald-50/50 dark:bg-[#064e3b]/20 border border-emerald-100 dark:border-emerald-500/20 shadow-md overflow-hidden min-h-[300px] flex flex-col transition-colors ${!unlockedIslamic ? 'group' : ''}`}>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-emerald-900 dark:text-emerald-400 mb-6 flex items-center gap-3 transition-colors">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-colors">
                   <BookOpen className="w-5 h-5" /> 
                </div>
                İslami Tabir
            </h3>
            
            {unlockedIslamic ? (
                <div className="relative z-10"><TypewriterText text={result.islamic || result.spiritual} /></div>
            ) : (
                <div className="flex-1 relative">
                   <div className="absolute inset-0 blur-[6px] opacity-50 dark:opacity-30 text-emerald-800 dark:text-emerald-200 font-serif leading-[1.8] select-none pointer-events-none transition-colors">
                      İmam Nablusi ve İbni Sirin gibi büyük alimlerin kadim eserlerine göre bu rüya, hayatınızda yaşanacak çok önemli bir manevi değişimin habercisidir. Rüyanın ince detayları, alınacak yeni kararların ailevi bağlarınızı nasıl etkileyeceğini ve rızkınızla ilgili...
                   </div>
                   
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-emerald-50/60 dark:bg-[#064e3b]/40 backdrop-blur-[1px] z-10 transition-colors">
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-full border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-all">
                         <Lock className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <p className="text-emerald-900 dark:text-emerald-100 text-sm mb-6 max-w-[220px] font-medium leading-relaxed transition-colors">
                         {isGuest ? "Diyanet kaynaklı derin tabiri okumak için ücretsiz kayıt olun." : "Diyanet kaynaklı derin tabiri okumak için kilidi açın."}
                      </p>
                      <button 
                        onClick={() => handleUnlock('islamic')}
                        disabled={isUnlocking === 'islamic'}
                        className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                         {isUnlocking === 'islamic' ? <Loader2 className="w-4 h-4 animate-spin" /> : (isGuest ? <ArrowRight className="w-4 h-4" /> : <Unlock className="w-4 h-4" />)}
                         {isGuest ? "Kayıt Ol ve Oku" : "Kilidi Aç (1 Kredi)"}
                      </button>
                   </div>
                </div>
            )}
         </div>

         {/* PSİKOLOJİK ANALİZ */}
         <div className={`relative p-6 md:p-10 rounded-[2rem] bg-blue-50/50 dark:bg-[#1e293b]/40 border border-blue-100 dark:border-blue-500/20 shadow-md overflow-hidden min-h-[300px] flex flex-col transition-colors ${!unlockedPsych ? 'group' : ''}`}>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-blue-900 dark:text-blue-400 mb-6 flex items-center gap-3 transition-colors">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 transition-colors">
                   <Brain className="w-5 h-5" /> 
                </div>
                Bilinçaltı Analizi
            </h3>
            
            {unlockedPsych ? (
                <div className="relative z-10"><TypewriterText text={result.psychological} /></div>
            ) : (
                <div className="flex-1 relative">
                   <div className="absolute inset-0 blur-[6px] opacity-50 dark:opacity-30 text-blue-800 dark:text-blue-200 font-serif leading-[1.8] select-none pointer-events-none transition-colors">
                      Modern analitik psikolojiye (Jung) göre bu rüyanızdaki temel arketipler, günlük hayatta bastırdığınız bir korkunun veya kontrolü kaybetme endişesinin dışavurumudur. Zihniniz, uyanıkken yüzleşmekten kaçındığınız o gerçeği...
                   </div>
                   
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-blue-50/60 dark:bg-[#1e293b]/40 backdrop-blur-[1px] z-10 transition-colors">
                      <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 rounded-full border border-blue-200 dark:border-blue-500/30 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-all">
                         <Lock className="w-6 h-6 text-blue-700 dark:text-blue-400" />
                      </div>
                      <p className="text-blue-900 dark:text-blue-100 text-sm mb-6 max-w-[220px] font-medium leading-relaxed transition-colors">
                         {isGuest ? "Bilinçaltınızın mesajlarını çözmek için ücretsiz kayıt olun." : "Bilinçaltınızın size gönderdiği mesajları okumak için kilidi açın."}
                      </p>
                      <button 
                        onClick={() => handleUnlock('psychological')}
                        disabled={isUnlocking === 'psychological'}
                        className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                         {isUnlocking === 'psychological' ? <Loader2 className="w-4 h-4 animate-spin" /> : (isGuest ? <ArrowRight className="w-4 h-4" /> : <Unlock className="w-4 h-4" />)}
                         {isGuest ? "Kayıt Ol ve Oku" : "Kilidi Aç (1 Kredi)"}
                      </button>
                   </div>
                </div>
            )}
         </div>
      </div>

      {/* ================= 3. EKSTRA HİZMETLER ================= */}
      <div className="max-w-4xl mx-auto px-4 mt-12 md:mt-16 border-t border-stone-200 dark:border-white/10 pt-10 md:pt-12 w-full transition-colors">
         <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 dark:text-white mb-8 text-center transition-colors">Bilinçaltınızda Daha Derine İnin</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* MOOD & DUYGU DURUMU (AKTİFLEŞTİ VE LİNKLENDİ) */}
            <div 
               onClick={() => isGuest ? handleGuestRedirect('Duygu Analizi') : router.push('/dashboard/duygu-durumu')}
               className="bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 hover:shadow-lg dark:hover:border-rose-500/30 transition-all flex flex-col justify-between cursor-pointer group min-h-[260px]"
            >
               <div>
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 border border-rose-100 dark:border-rose-500/20 transition-colors">
                            <Heart className="w-5 h-5" />
                         </div>
                         <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Rüya Duygusu</h3>
                     </div>
                     {isGuest && <Lock className="w-4 h-4 text-stone-400 dark:text-slate-600" />}
                  </div>
                  <h4 className="text-3xl font-serif text-rose-600 dark:text-rose-400 mb-3 transition-colors">{result.mood}</h4>
                  <p className="text-stone-500 dark:text-slate-400 text-sm mb-6 leading-relaxed transition-colors">Rüyanızın genel stres ve neşe oranlarını bilimsel olarak haritalandırın.</p>
               </div>
               <div className="w-full mt-auto py-3 rounded-xl bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-stone-200 dark:border-white/10 transition-colors group-hover:bg-rose-50 dark:group-hover:bg-rose-500/10 group-hover:text-rose-700 dark:group-hover:text-rose-400">
                   {isGuest ? "Kayıt Ol" : "Detaylı Analiz (1 Kredi)"}
               </div>
            </div>

            {/* NUMEROLOJİ */}
            <div 
               onClick={handleNumerologyNavigation}
               className="bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between hover:shadow-lg dark:hover:border-sky-500/30 transition-all cursor-pointer group min-h-[260px]"
            >
               <div>
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-500 border border-sky-100 dark:border-sky-500/20 transition-colors">
                            <Star className="w-5 h-5" />
                         </div>
                         <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Kozmik Şifre</h3>
                     </div>
                     {isGuest && <Lock className="w-4 h-4 text-stone-400 dark:text-slate-600" />}
                  </div>
                  <p className="text-stone-500 dark:text-slate-400 text-sm mb-6 leading-relaxed transition-colors">Rüyanızdaki sayıların yaşam yolunuzla olan uyumunu keşfedin.</p>
                  
                  <div className="flex gap-3 mb-6">
                     {result.lucky_numbers?.slice(0, 3).map((num: any, i: number) => (
                        <div key={i} className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/5 flex items-center justify-center font-mono text-xl font-bold text-sky-600 dark:text-sky-400 shadow-sm transition-colors">
                          {num}
                        </div>
                     ))}
                  </div>
               </div>
               <div className="w-full mt-auto py-3 rounded-xl bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-stone-200 dark:border-white/10 transition-colors group-hover:bg-sky-50 dark:group-hover:bg-sky-500/10 group-hover:text-sky-700 dark:group-hover:text-sky-400">
                   {isGuest ? "Kayıt Ol ve İncele" : (hasNumerologyProfile ? "Uyum Haritasını Aç" : "Profil Oluştur ve Aç")}
               </div>
            </div>

            {/* SOHBET */}
            <div 
               onClick={() => isGuest ? handleGuestRedirect('Kahin ile Sohbet') : router.push(`/dashboard/sohbet/${currentDreamId}`)}
               className="bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between hover:shadow-lg dark:hover:border-orange-500/30 transition-all cursor-pointer group min-h-[260px]"
            >
               <div>
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-100 dark:border-orange-500/20 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                         </div>
                         <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Kahin ile Konuş</h3>
                     </div>
                     {isGuest && <Lock className="w-4 h-4 text-stone-400 dark:text-slate-600" />}
                  </div>
                  <p className="text-stone-500 dark:text-slate-400 text-sm mb-6 leading-relaxed transition-colors">Rüyanızın detayları hakkında uzman yapay zeka ile hemen sohbete başlayın.</p>
               </div>
               <div className="w-full mt-auto py-3 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-black font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:bg-stone-800 dark:hover:bg-slate-200 shadow-sm">
                   {isGuest ? "Kayıt Ol" : "Sohbeti Başlat (1 Kredi)"}
               </div>
            </div>

            {/* TAROT */}
            <div 
               onClick={() => isGuest ? handleGuestRedirect('Mistik Tarot') : router.push('/dashboard/tarot')}
               className="bg-white dark:bg-[#131722] border border-stone-200 dark:border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between hover:shadow-lg dark:hover:border-purple-500/30 transition-all cursor-pointer group min-h-[260px]"
            >
               <div>
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500 border border-purple-100 dark:border-purple-500/20 transition-colors">
                            <Layers className="w-5 h-5" />
                         </div>
                         <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Mistik Rehber</h3>
                     </div>
                     {isGuest && <Lock className="w-4 h-4 text-stone-400 dark:text-slate-600" />}
                  </div>
                  <p className="text-stone-500 dark:text-slate-400 text-sm mb-6 leading-relaxed transition-colors">Rüyanızın enerjisine en uygun Tarot kartını ve arkasındaki mesajı açın.</p>
               </div>
               <div className="w-full mt-auto py-3 rounded-xl bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border border-stone-200 dark:border-white/10 transition-colors group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10 group-hover:text-purple-700 dark:group-hover:text-purple-400">
                   {isGuest ? "Kayıt Ol" : "Mistik Kartı Aç"}
               </div>
            </div>

         </div>

         {/* GÖRSEL STUDIO (YAKINDA GELECEK - Tıklama İptal) */}
         <div 
            className="mt-6 bg-stone-900 dark:bg-[#0a0c10] border border-stone-800 dark:border-white/5 rounded-[2rem] overflow-hidden flex flex-col sm:flex-row shadow-sm opacity-80 cursor-default relative"
         >
            {/* Geliyor Overlay */}
            <div className="absolute inset-0 bg-stone-900/60 dark:bg-[#0a0c10]/70 backdrop-blur-[1px] z-20 flex items-center justify-center">
               <div className="bg-white/10 border border-white/20 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-300" />
                  <span className="text-white font-bold tracking-widest uppercase text-xs">Yakında Gelecek</span>
               </div>
            </div>

            <div className="p-6 md:p-10 flex flex-col justify-center flex-1 z-10">
               <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                       <div className="p-2.5 rounded-xl bg-white/10 text-white border border-white/20">
                          <ImageIcon className="w-5 h-5" />
                       </div>
                       <h3 className="font-serif text-xl md:text-2xl text-white">Rüyanın Sanat Hali</h3>
                   </div>
               </div>
               <p className="text-stone-400 text-sm mb-10 leading-relaxed max-w-sm">Bilinçaltınızdaki soyut görüntüleri, yapay zeka ile yüksek çözünürlüklü dijital bir tabloya dönüştürün.</p>
               
               <div className="w-fit px-8 py-3.5 rounded-full bg-white/20 text-white/50 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-auto shadow-sm">
                  <ImageIcon className="w-4 h-4" /> Görseli Oluştur (3 Kredi)
               </div>
            </div>
            <div className="w-full sm:w-[320px] h-48 sm:h-auto bg-stone-950 relative overflow-hidden shrink-0 border-l border-stone-800 z-10">
               <img src="../images/kale.jpg" className="w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale" alt="Rüya Örneği" />
            </div>
         </div>

      </div>
    </motion.div>
  );
}