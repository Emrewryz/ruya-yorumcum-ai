"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  ArrowLeft, Lock, Sparkles, Brain, Moon, 
  MessageCircle, Layers, Share2, Heart, ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [allDreams, setAllDreams] = useState<DreamData[]>([]); // Kaydırma için tüm liste
  const [userTier, setUserTier] = useState<Tier>('free'); 
  const [loading, setLoading] = useState(true);

  // 1. VERİLERİ ÇEK VE HAZIRLA
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

      // C. Tüm Rüyaları Çek (Sıralı - Kaydırma İçin)
      const { data: dreamsData, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error("Hata:", error);
      
      if (dreamsData) {
        setAllDreams(dreamsData);
        // Şu anki URL'deki ID'ye sahip rüyayı bul
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
    
    const currentIndex = allDreams.findIndex(d => d.id === dream.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    // Sınır Kontrolü
    if (newIndex < 0) return; // Daha yeni rüya yok
    if (newIndex >= allDreams.length) return; // Daha eski rüya yok

    const nextDream = allDreams[newIndex];
    router.push(`/dashboard/gunluk/${nextDream.id}`);
  };

  // Yetki Kontrolü
  const hasAccess = (requiredTier: 'pro' | 'elite') => {
    const levels = { free: 0, pro: 1, elite: 2 };
    const currentLevel = levels[userTier] || 0; 
    const requiredLevel = levels[requiredTier];
    return currentLevel >= requiredLevel;
  };

  // Kilit Bileşeni
  const LockedFeature = ({ title }: { title: string }) => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 text-center group cursor-pointer transition-all hover:bg-black/70">
       <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.2)]">
          <Lock className="w-5 h-5 text-[#fbbf24]" />
       </div>
       <h3 className="text-white font-serif text-sm mb-2">{title}</h3>
       <button 
         onClick={() => router.push('/dashboard/pricing')}
         className="px-4 py-2 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
       >
         Yükselt
       </button>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-purple-500 animate-pulse">Anılar çağırılıyor...</div>;
  if (!dream) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-red-500">Rüya bulunamadı.</div>;

  // Şu anki indeks (Butonları gizlemek için)
  const currentIndex = allDreams.findIndex(d => d.id === dream.id);
  const hasNext = currentIndex < allDreams.length - 1; // Daha eski var mı?
  const hasPrev = currentIndex > 0; // Daha yeni var mı?

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden flex justify-center">
      
      {/* Atmosfer */}
      <div className="bg-noise"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none"></div>

      {/* --- KAYDIRMA BUTONLARI (SOL/SAĞ) --- */}
      {hasPrev && (
        <button 
          onClick={() => navigateDream('prev')}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md group hidden md:block transition-all hover:scale-110"
          title="Sonraki (Daha Yeni) Rüya"
        >
           <ChevronLeft className="w-8 h-8 text-gray-400 group-hover:text-white" />
        </button>
      )}

      {hasNext && (
        <button 
          onClick={() => navigateDream('next')}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md group hidden md:block transition-all hover:scale-110"
          title="Önceki (Daha Eski) Rüya"
        >
           <ChevronRight className="w-8 h-8 text-gray-400 group-hover:text-white" />
        </button>
      )}

      {/* --- ANA İÇERİK --- */}
      <main className="w-full max-w-4xl px-6 py-8 relative z-10 pb-32">
         
         {/* Header */}
         <nav className="flex justify-between items-center mb-8">
            <button onClick={() => router.push('/dashboard/gunluk')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
               <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/10">
                  <ArrowLeft className="w-4 h-4" />
               </div>
               <span className="text-sm font-bold">Grimoire'a Dön</span>
            </button>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <Calendar className="w-3 h-3" />
               {new Date(dream.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
         </nav>

         {/* --- GÖRSEL ve PAYLAŞ --- */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl group bg-black/40"
         >
            {/* Kaşif ve Üstü Görür */}
            {hasAccess('pro') ? (
               dream.image_url ? (
                  <img src={dream.image_url} className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                     <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                     <span className="text-xs">Bu rüya için görsel oluşturulmamış.</span>
                  </div>
               )
            ) : (
               <>
                  <img src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094" className="w-full h-full object-cover blur-2xl opacity-20" />
                  <LockedFeature title="Rüya Vizyonu" />
               </>
            )}
            
            {/* Paylaş Butonu */}
            <button className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/70 transition-all">
               <Share2 className="w-4 h-4" />
            </button>
         </motion.div>

         {/* --- 2. RÜYANIN METNİ VE ÖZETİ --- */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-12 relative overflow-hidden"
         >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#fbbf24]"></div>
            
            <h1 className="text-2xl md:text-3xl font-serif text-white mb-6 leading-tight">
               {dream.ai_response?.title || "İsimsiz Rüya"}
            </h1>
            
            <p className="text-gray-400 italic mb-8 border-l-2 border-white/10 pl-4 text-sm leading-relaxed">
               "{dream.dream_text}"
            </p>

            <div className="bg-[#fbbf24]/5 rounded-2xl p-6 border border-[#fbbf24]/10">
               <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                  <h3 className="font-serif text-[#fbbf24] text-sm tracking-widest uppercase font-bold">Rüyanın Derin Özü</h3>
               </div>
               <p className="text-lg leading-loose text-gray-200 font-light text-justify">
                  {dream.ai_response?.summary}
               </p>
            </div>
         </motion.div>

         {/* --- 3. DETAYLI ANALİZLER --- */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
         >
            {/* Psikolojik */}
            <div className="relative p-8 rounded-3xl bg-[#0f172a] border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] overflow-hidden">
               {!hasAccess('pro') && <LockedFeature title="Psikolojik Derinlik" />}
               <h3 className="font-serif text-xl text-blue-400 mb-4 flex items-center gap-3"><Brain className="w-6 h-6" /> Psikolojik Yorum</h3>
               <p className={`text-gray-400 leading-relaxed text-sm ${!hasAccess('pro') ? 'blur-sm select-none opacity-50' : ''}`}>
                  {dream.ai_response?.psychological}
               </p>
            </div>

            {/* Manevi */}
            <div className="relative p-8 rounded-3xl bg-[#022c22] border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] overflow-hidden">
               {!hasAccess('pro') && <LockedFeature title="Manevi Tabir" />}
               <h3 className="font-serif text-xl text-emerald-400 mb-4 flex items-center gap-3"><Moon className="w-6 h-6" /> Manevi İşaretler</h3>
               <p className={`text-gray-400 leading-relaxed text-sm ${!hasAccess('pro') ? 'blur-sm select-none opacity-50' : ''}`}>
                  {dream.ai_response?.spiritual}
               </p>
            </div>
         </motion.div>

         {/* --- 4. WIDGETLAR (Tarot, Sayılar, Duygu) --- */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
         >
            {/* A. Duygu Durumu */}
            <div 
               onClick={() => router.push('/dashboard/duygu-durumu')}
               className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#fbbf24]/50 cursor-pointer transition-all group relative overflow-hidden"
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
               className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#fbbf24]/50 cursor-pointer transition-all group text-center"
            >
               <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-4">Şanslı İşaretler</h4>
               <div className="flex justify-center gap-3">
                  {dream.ai_response?.lucky_numbers?.slice(0, 3).map((num: any, i: number) => (
                     <div key={i} className="w-10 h-12 bg-black border border-orange-500/50 rounded-lg flex items-center justify-center text-orange-400 font-mono font-bold shadow-lg group-hover:scale-110 transition-transform">
                        {num}
                     </div>
                  ))}
               </div>
            </div>

            {/* C. Tarot Kartı */}
            <div 
               onClick={() => router.push('/dashboard/tarot')}
               className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all group relative overflow-hidden flex flex-col justify-between"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <h4 className="text-gray-500 text-xs uppercase tracking-widest mb-2">Tarot Rehberliği</h4>
               <div className="flex items-center justify-between">
                  <span className="text-purple-400 text-sm font-bold">Kart Çek</span>
                  <Layers className="w-8 h-8 text-purple-500 group-hover:rotate-12 transition-transform" />
               </div>
            </div>
         </motion.div>

         {/* --- 5. SOHBET BUTONU (En Altta) --- */}
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            {hasAccess('elite') ? (
                <button onClick={() => router.push(`/dashboard/sohbet/${dream.id}`)} // BURAYI GÜNCELLE
    className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg" >
                   <MessageCircle className="w-5 h-5" /> Bu Rüya Hakkında Sohbet Et
                </button>
            ) : (
                <div className="w-full mt-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-bold flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                   <Lock className="w-4 h-4" /> Rüya Sohbeti (Kahin Paketi)
                   
                </div>
            )}
         </motion.div>

      </main>
    </div>
  );
}