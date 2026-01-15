"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Lock, Sparkles, Brain, Moon, 
  MessageCircle, Layers, Share2, Heart, ChevronLeft, ChevronRight, Calendar, Image as ImageIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Tier = 'free' | 'pro' | 'elite';

interface DreamData {
  id: string;
  dream_text: string;
  dream_title: string;
  created_at: string;
  image_url: string | null;
  ai_response: any; 
}

export default function DreamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [dream, setDream] = useState<DreamData | null>(null);
  const [allDreams, setAllDreams] = useState<DreamData[]>([]);
  const [userTier, setUserTier] = useState<Tier>('free'); 
  const [loading, setLoading] = useState(true);

  // 1. VERİLERİ ÇEK
  useEffect(() => {
    const getData = async () => {
      // A. Kullanıcı
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      // B. Paket Bilgisi
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      if (profile && profile.subscription_tier) {
          let tier = profile.subscription_tier.toLowerCase();
          if (tier === 'explorer') tier = 'pro';
          if (tier === 'seer') tier = 'elite';
          setUserTier(tier as Tier);
      }

      // C. Tüm Rüyaları Çek (Navigasyon İçin)
      const { data: dreamsData, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); // En yeniden en eskiye

      if (dreamsData) {
        setAllDreams(dreamsData);
        const current = dreamsData.find(d => d.id === params.id);
        if (current) setDream(current);
      }
      setLoading(false);
    };

    getData();
  }, [params.id, router, supabase]);

  // SONRAKİ / ÖNCEKİ RÜYAYA GİT
  const navigateDream = (direction: 'prev' | 'next') => {
    if (!dream || allDreams.length === 0) return;
    
    // allDreams [Yeni, Orta, Eski] şeklinde sıralı
    const currentIndex = allDreams.findIndex(d => d.id === dream.id);
    
    // "Next" (İleri/Sonraki) aslında dizide geriye (daha eskiye) gitmek demek olabilir veya tam tersi.
    // Kullanıcı mantığı: Sol ok = Daha Yeni Rüya, Sağ Ok = Daha Eski Rüya
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < allDreams.length) {
       const targetDream = allDreams[newIndex];
       router.push(`/dashboard/gunluk/${targetDream.id}`);
    }
  };

  const hasAccess = (requiredTier: 'pro' | 'elite') => {
    const levels = { free: 0, pro: 1, elite: 2 };
    const currentLevel = levels[userTier] || 0; 
    const requiredLevel = levels[requiredTier];
    return currentLevel >= requiredLevel;
  };

  const LockedFeature = ({ title }: { title: string }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 text-center group cursor-pointer transition-all hover:bg-black/70 active:scale-95">
       <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.2)]">
          <Lock className="w-5 h-5 text-[#fbbf24]" />
       </div>
       <h3 className="text-white font-serif text-sm mb-2">{title}</h3>
       <button 
         onClick={(e) => { e.stopPropagation(); router.push('/dashboard/pricing'); }}
         className="px-4 py-2 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
       >
         Yükselt
       </button>
    </div>
  );

  const handleShare = async () => {
     if (navigator.share) {
        try {
           await navigator.share({
              title: dream?.dream_title || 'Rüyam',
              text: dream?.ai_response?.summary || 'Rüya Analizim',
              url: window.location.href
           });
        } catch (err) {}
     } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link kopyalandı");
     }
  };

  if (loading) return <div className="min-h-[100dvh] bg-[#020617] flex items-center justify-center text-[#fbbf24] animate-pulse">Anılar çağırılıyor...</div>;
  if (!dream) return <div className="min-h-[100dvh] bg-[#020617] flex items-center justify-center text-red-500">Rüya bulunamadı.</div>;

  const currentIndex = allDreams.findIndex(d => d.id === dream.id);
  const hasNewer = currentIndex > 0; // Listede daha yukarıda (daha yeni) eleman var mı?
  const hasOlder = currentIndex < allDreams.length - 1; // Listede daha aşağıda (daha eski) eleman var mı?

  return (
    // APP FIX: min-h-[100dvh] ve pb-32 (Alt menü + Navigasyon butonları için boşluk)
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden flex justify-center pb-32">
      
      {/* Atmosfer */}
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-purple-900/20 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>

      {/* --- MOBİL NAVİGASYON BUTONLARI (Bottom Floating) --- */}
      {/* Mobilde alt menünün hemen üzerinde dururlar (bottom-24) */}
      <div className="fixed bottom-24 left-0 right-0 px-4 flex justify-between items-center z-40 pointer-events-none">
         {hasNewer ? (
            <button 
              onClick={() => navigateDream('prev')}
              className="pointer-events-auto p-3 rounded-full bg-[#0f172a]/90 backdrop-blur-xl border border-white/20 shadow-lg active:scale-90 transition-all text-white"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
         ) : <div></div>}

         {hasOlder ? (
            <button 
              onClick={() => navigateDream('next')}
              className="pointer-events-auto p-3 rounded-full bg-[#0f172a]/90 backdrop-blur-xl border border-white/20 shadow-lg active:scale-90 transition-all text-white"
            >
               <ChevronRight className="w-6 h-6" />
            </button>
         ) : <div></div>}
      </div>

      {/* --- ANA İÇERİK --- */}
      <main className="w-full max-w-4xl relative z-10">
         
         {/* STICKY HEADER */}
         <nav className="sticky top-0 z-30 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 md:py-6 flex justify-between items-center mb-6">
            <button onClick={() => router.push('/dashboard/gunluk')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group p-2 -ml-2 active:scale-95">
               <ArrowLeft className="w-5 h-5" />
               <span className="text-sm font-bold hidden md:inline">Grimoire'a Dön</span>
            </button>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
               <Calendar className="w-3 h-3" />
               {new Date(dream.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
         </nav>

         <div className="px-4 md:px-6">
            {/* --- GÖRSEL ve PAYLAŞ --- */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl group bg-black/40"
            >
               {/* Kaşif ve Üstü Görür */}
               {hasAccess('pro') ? (
                  dream.image_url ? (
                     <img src={dream.image_url} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-white/5">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs">Bu rüya için görsel oluşturulmamış.</span>
                        <button onClick={() => router.push(`/dashboard/gorsel-olustur/${dream.id}`)} className="mt-4 px-4 py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-bold hover:bg-purple-600/30 transition-colors">
                           Görsel Oluştur
                        </button>
                     </div>
                  )
               ) : (
                  <>
                     <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094" className="w-full h-full object-cover blur-md opacity-30" />
                     <LockedFeature title="Rüya Vizyonu" />
                  </>
               )}
               
               {/* Paylaş Butonu */}
               <button onClick={handleShare} className="absolute bottom-4 right-4 p-2 md:p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-white active:scale-90 transition-all z-30">
                  <Share2 className="w-4 h-4" />
               </button>
            </motion.div>

            {/* --- 2. RÜYANIN METNİ VE ÖZETİ --- */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
               className="p-6 md:p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-8 relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-1 h-full bg-[#fbbf24]"></div>
               
               <h1 className="text-2xl md:text-3xl font-serif text-white mb-4 md:mb-6 leading-tight">
                  {dream.ai_response?.title || "İsimsiz Rüya"}
               </h1>
               
               <p className="text-gray-400 italic mb-6 md:mb-8 border-l-2 border-white/10 pl-4 text-sm leading-relaxed">
                  "{dream.dream_text}"
               </p>

               <div className="bg-[#fbbf24]/5 rounded-2xl p-4 md:p-6 border border-[#fbbf24]/10">
                  <div className="flex items-center gap-2 md:gap-3 mb-3">
                     <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#fbbf24]" />
                     <h3 className="font-serif text-[#fbbf24] text-xs md:text-sm tracking-widest uppercase font-bold">Rüyanın Derin Özü</h3>
                  </div>
                  <p className="text-base md:text-lg leading-relaxed text-gray-200 font-light text-justify">
                     {dream.ai_response?.summary}
                  </p>
               </div>
            </motion.div>

            {/* --- 3. DETAYLI ANALİZLER --- */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8"
            >
               {/* Psikolojik */}
               <div className="relative p-6 md:p-8 rounded-3xl bg-[#0f172a] border border-blue-500/20 shadow-lg overflow-hidden">
                  {!hasAccess('pro') && <LockedFeature title="Psikolojik Derinlik" />}
                  <h3 className="font-serif text-lg md:text-xl text-blue-400 mb-4 flex items-center gap-3"><Brain className="w-5 h-5" /> Psikolojik Yorum</h3>
                  <p className={`text-gray-400 leading-relaxed text-sm ${!hasAccess('pro') ? 'blur-sm select-none opacity-50' : ''}`}>
                     {dream.ai_response?.psychological}
                  </p>
               </div>

               {/* Manevi */}
               <div className="relative p-6 md:p-8 rounded-3xl bg-[#022c22] border border-emerald-500/20 shadow-lg overflow-hidden">
                  {!hasAccess('pro') && <LockedFeature title="Manevi Tabir" />}
                  <h3 className="font-serif text-lg md:text-xl text-emerald-400 mb-4 flex items-center gap-3"><Moon className="w-5 h-5" /> Manevi İşaretler</h3>
                  <p className={`text-gray-400 leading-relaxed text-sm ${!hasAccess('pro') ? 'blur-sm select-none opacity-50' : ''}`}>
                     {dream.ai_response?.spiritual}
                  </p>
               </div>
            </motion.div>

            {/* --- 4. WIDGETLAR --- */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
               className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8"
            >
               {/* A. Duygu Durumu */}
               <div 
                  onClick={() => router.push('/dashboard/duygu-durumu')}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#fbbf24]/50 cursor-pointer active:scale-95 transition-all group relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-4">Ruh Hali</h4>
                  <div className="flex items-end justify-between mb-2">
                     <span className="text-xl font-bold text-white">{dream.ai_response?.mood}</span>
                     <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-red-500 to-pink-500" style={{ width: `${dream.ai_response?.mood_score}%` }}></div>
                  </div>
               </div>

               {/* B. Şanslı Sayılar */}
               <div 
                  onClick={() => router.push('/dashboard/numeroloji')}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#fbbf24]/50 cursor-pointer active:scale-95 transition-all group text-center"
               >
                  <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-4">Şanslı İşaretler</h4>
                  <div className="flex justify-center gap-3">
                     {dream.ai_response?.lucky_numbers?.slice(0, 3).map((num: any, i: number) => (
                        <div key={i} className="w-10 h-12 bg-black border border-orange-500/50 rounded-lg flex items-center justify-center text-orange-400 font-mono font-bold shadow-lg">
                           {num}
                        </div>
                     ))}
                  </div>
               </div>

               {/* C. Tarot Kartı */}
               <div 
                  onClick={() => router.push('/dashboard/tarot')}
                  className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 cursor-pointer active:scale-95 transition-all group relative overflow-hidden flex flex-col justify-between"
               >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-2">Tarot Rehberliği</h4>
                  <div className="flex items-center justify-between">
                     <span className="text-purple-400 text-sm font-bold">Kart Çek</span>
                     <Layers className="w-8 h-8 text-purple-500 group-hover:rotate-12 transition-transform" />
                  </div>
               </div>
            </motion.div>

            {/* --- 5. SOHBET BUTONU --- */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
               {hasAccess('elite') ? (
                  <button 
                     onClick={() => router.push(`/dashboard/sohbet/${dream.id}`)}
                     className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold flex items-center justify-center gap-3 active:scale-95 hover:scale-[1.02] transition-transform shadow-lg shadow-amber-500/20"
                  >
                     <MessageCircle className="w-5 h-5" /> Bu Rüya Hakkında Sohbet Et
                  </button>
               ) : (
                  <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-bold flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                     <Lock className="w-4 h-4" /> Rüya Sohbeti (Kahin Paketi)
                  </div>
               )}
            </motion.div>
         </div>
      </main>
    </div>
  );
}