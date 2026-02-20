"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Hash, Binary, ArrowRight, Sparkles, 
  Crown, Star, Fingerprint, Lock, Zap, ArrowLeft, Loader2
} from "lucide-react";

// İçerik Bileşeni
function NumerologyHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL'den parametreleri al (Rüya yorumundan gelindiyse dolu olur)
  const dreamId = searchParams.get('dreamId');
  const numbers = searchParams.get('numbers');

  // Navigasyon Yöneticisi
  const handleNavigation = (type: 'genel' | 'ruya') => {
    if (type === 'genel') {
        router.push('/dashboard/numeroloji/genel');
    } else if (type === 'ruya') {
        if (dreamId && numbers) {
            router.push(`/dashboard/numeroloji/ruya?dreamId=${dreamId}&numbers=${numbers}`);
        } else {
            // Rüya verisi yoksa rüya tabiri sayfasına yönlendir
            router.push('/dashboard/ruya-analizi'); // (Klasör yapına göre ruya-tabiri veya ruya-analizi olarak güncelleyebilirsin)
        }
    }
  };

  return (
    // İÇ İÇE GEÇMEYİ ÖNLEYEN RELATIVE LAYOUT
    <div className="relative w-full flex flex-col items-center min-h-[calc(100vh-6rem)] z-10 pb-20 font-sans selection:bg-emerald-500/30">
      
      {/* SADECE BU SAYFAYA ÖZEL LOKAL ARKAPLAN IŞIĞI (Fixed yerine absolute) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none -z-10 transform-gpu"></div>
      
      {/* HEADER (Geri Dön ve Başlık) */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex flex-col items-start mt-2 md:mt-4">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest backdrop-blur-md mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Geri Dön</span>
        </button>

        <div className="text-center md:text-left w-full max-w-4xl">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-400 mb-5 shadow-inner">
              <Hash className="w-3.5 h-3.5" /> Numeroloji Merkezi
           </div>
           <h1 className="text-4xl md:text-6xl font-serif text-white mb-4 leading-tight">
              Sayıların Gizli Dili
           </h1>
           <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed font-light mx-auto md:mx-0">
              Evren kusursuz bir matematiktir ve isminiz bir tesadüf değildir. Kadim sistemlerle ruhunuzun şifrelerini çözün veya rüyalarınızın sayısal mesajlarını keşfedin.
           </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-0 pt-6 relative z-10 flex flex-col">
          
        {/* KARTLAR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
          
          {/* KART 1: GENEL / KİŞİSEL ANALİZ (Her zaman açık) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            onClick={() => handleNavigation('genel')}
            className="group relative cursor-pointer bg-[#131722]/80 backdrop-blur-xl border border-white/5 hover:border-emerald-500/40 rounded-[2.5rem] p-8 md:p-10 overflow-hidden transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col min-h-[320px]"
          >
             {/* Arkaplan Glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-colors duration-700 pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                   <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20 shadow-inner">
                      <Fingerprint className="w-8 h-8" />
                   </div>
                   <div className="px-4 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      Temel Analiz
                   </div>
                </div>

                <h2 className="text-3xl font-serif text-white mb-3 group-hover:text-emerald-300 transition-colors">Kişisel Harita</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-light flex-1">
                   Doğum tarihiniz ve isminizle <strong>Yaşam Yolu</strong> ve <strong>Kader Sayınızı</strong> hesaplayın. Gerçek ruhsal potansiyelinizi ve hayat amacınızı keşfedin.
                </p>

                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors mt-auto w-fit">
                   Analizi Başlat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
             </div>
          </motion.div>

          {/* KART 2: RÜYA NUMEROLOJİSİ (Duruma göre aktif/pasif) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={dreamId ? { y: -5 } : {}}
            onClick={() => handleNavigation('ruya')}
            className={`group relative rounded-[2.5rem] p-8 md:p-10 overflow-hidden transition-all duration-500 shadow-xl flex flex-col min-h-[320px] ${
                dreamId 
                ? "cursor-pointer bg-[#131722]/80 backdrop-blur-xl border border-white/5 hover:border-indigo-500/40 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]" 
                : "cursor-default bg-[#0a0c10]/60 border border-white/5 opacity-70"
            }`}
          >
             {/* Arkaplan Glow */}
             {dreamId && <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] group-hover:bg-indigo-500/10 transition-colors duration-700 pointer-events-none"></div>}
             
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 border ${dreamId ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:scale-110 shadow-inner" : "bg-white/5 text-slate-500 border-white/10"}`}>
                      {dreamId ? <Sparkles className="w-8 h-8" /> : <Lock className="w-7 h-7" />}
                   </div>
                   
                   {dreamId ? (
                      <div className="px-4 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 shadow-inner">
                         <Zap className="w-3 h-3" /> Rüya Bağlı
                      </div>
                   ) : (
                      <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-inner">
                         Önce Rüya Yorumla
                      </div>
                   )}
                </div>

                <h2 className={`text-3xl font-serif mb-3 transition-colors ${dreamId ? "text-white group-hover:text-indigo-300" : "text-slate-400"}`}>
                   Rüya & Uyum
                </h2>
                
                <p className="text-slate-400 text-sm font-light leading-relaxed mb-8 flex-1">
                   {dreamId 
                     ? "Son gördüğünüz rüyadaki sayıların ve sembollerin, kendi Yaşam Yolu sayınızla olan gizli uyumunu analiz edin." 
                     : "Bu analizi yapabilmek için önce bir rüya yorumlatmalısınız. Sistem rüyanızdan sayıları otomatik olarak çekecektir."}
                </p>

                <div className={`flex items-center gap-2 text-xs uppercase tracking-widest font-bold mt-auto w-fit transition-all ${dreamId ? "text-indigo-400 group-hover:text-indigo-300" : "text-slate-500"}`}>
                   {dreamId ? (
                      <>Uyumu Keşfet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                   ) : (
                      <>Rüya Tabirine Git <ArrowRight className="w-4 h-4" /></>
                   )}
                </div>
             </div>
          </motion.div>

        </div>

        {/* FOOTER INFO (Bento Mini Cards) */}
        <div className="w-full mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           {[
              { icon: Crown, label: "2 Kredi", sub: "İşlem Başına" },
              { icon: Star, label: "Pisagor", sub: "Batı Sistemi" },
              { icon: Binary, label: "Ebcet", sub: "Doğu Sistemi" },
              { icon: Lock, label: "Gizli", sub: "%100 Kişisel" },
           ].map((item, i) => (
              <div key={i} className="bg-[#131722] rounded-2xl p-5 flex items-center gap-4 border border-white/5 hover:border-white/10 transition-colors">
                 <div className="p-3 bg-[#0a0c10] rounded-xl border border-white/5">
                    <item.icon className="w-5 h-5 text-slate-400" />
                 </div>
                 <div>
                    <div className="text-sm font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{item.sub}</div>
                 </div>
              </div>
           ))}
        </div>

      </main>
    </div>
  );
}

// Suspense Wrapper (useSearchParams için gerekli, loading kısmı da temaya uygun yapıldı)
export default function NumerologyHubPage() {
  return (
    <Suspense fallback={
       <div className="w-full flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
       </div>
    }>
       <NumerologyHubContent />
    </Suspense>
  );
}