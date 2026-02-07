"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Hash, Binary, ArrowRight, Sparkles, 
  Crown, Star, Fingerprint, Lock, Zap
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
            router.push('/dashboard/ruya-tabiri');
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 flex flex-col relative overflow-hidden">
      
      {/* Arkaplan Efektleri */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none -z-10"></div>
      <div className="fixed -top-20 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* HEADER */}
      <div className="max-w-5xl mx-auto w-full mb-12 mt-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">
           <Hash className="w-3 h-3" /> Numeroloji Merkezi
        </div>
        <h1 className="text-3xl md:text-5xl font-serif text-white mb-4 leading-tight">
           Sayıların Gizli Dili
        </h1>
        <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
           Evren matematiktir ve isminiz bir tesadüf değildir. Pisagor ve Ebcet sistemleriyle ruhunuzun şifrelerini çözün veya rüyalarınızın sayısal mesajlarını keşfedin.
        </p>
      </div>

      {/* KARTLAR GRID */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* KART 1: GENEL / KİŞİSEL ANALİZ (Her zaman açık) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          onClick={() => handleNavigation('genel')}
          className="group relative cursor-pointer bg-[#0f172a]/60 border border-emerald-500/20 hover:border-emerald-500/50 rounded-[2rem] p-8 overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-emerald-900/20"
        >
           {/* Arkaplan Glow */}
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/10">
                    <Fingerprint className="w-7 h-7" />
                 </div>
                 <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Temel Analiz
                 </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">Kişisel Harita</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                 Doğum tarihiniz ve isminizle <strong>Yaşam Yolu</strong> ve <strong>Kader Sayınızı</strong> hesaplayın. Ruhsal potansiyelinizi keşfedin.
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:translate-x-2 transition-transform">
                 <span className="bg-white/10 p-2 rounded-full"><ArrowRight className="w-4 h-4" /></span>
                 <span>Analizi Başlat</span>
              </div>
           </div>
        </motion.div>

        {/* KART 2: RÜYA NUMEROLOJİSİ (Duruma göre aktif/pasif) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
          onClick={() => handleNavigation('ruya')}
          className={`group relative rounded-[2rem] p-8 overflow-hidden transition-all duration-300 shadow-2xl border ${
             dreamId 
             ? "cursor-pointer bg-[#0f172a]/60 border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-indigo-900/20" 
             : "cursor-default bg-[#0f172a]/30 border-white/5 opacity-80"
          }`}
        >
           {/* Arkaplan Glow */}
           {dreamId && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>}
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 border ${dreamId ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/10 group-hover:scale-110" : "bg-white/5 text-gray-500 border-white/5"}`}>
                    {dreamId ? <Sparkles className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                 </div>
                 
                 {dreamId ? (
                    <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                       <Zap className="w-3 h-3" /> Rüya Bağlı
                    </div>
                 ) : (
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                       Önce Rüya Yorumla
                    </div>
                 )}
              </div>

              <h2 className={`text-2xl font-bold mb-3 transition-colors ${dreamId ? "text-white group-hover:text-indigo-300" : "text-gray-400"}`}>
                 Rüya & Uyum
              </h2>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-8 flex-1">
                 {dreamId 
                   ? "Son gördüğünüz rüyadaki sayıların, kendi Yaşam Yolu sayınızla uyumunu analiz edin." 
                   : "Bu analizi yapabilmek için önce bir rüya yorumlatmalısınız. Sistem rüyanızdan sayıları otomatik çekecektir."}
              </p>

              <div className={`flex items-center gap-2 text-sm font-bold transition-transform ${dreamId ? "text-white group-hover:translate-x-2" : "text-gray-500"}`}>
                 <span className={`p-2 rounded-full ${dreamId ? "bg-white/10" : "bg-white/5"}`}><ArrowRight className="w-4 h-4" /></span>
                 <span>{dreamId ? "Uyumu Keşfet" : "Rüya Tabirine Git"}</span>
              </div>
           </div>
        </motion.div>

      </div>

      {/* FOOTER INFO */}
      <div className="max-w-5xl mx-auto w-full mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
            { icon: Crown, label: "2 Kredi", sub: "İşlem Başına" },
            { icon: Star, label: "Pisagor", sub: "Batı Sistemi" },
            { icon: Binary, label: "Ebcet", sub: "Doğu Sistemi" },
            { icon: Lock, label: "Gizli", sub: "%100 Kişisel" },
         ].map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 flex items-center gap-3 border border-white/5">
               <item.icon className="w-5 h-5 text-gray-400" />
               <div>
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <div className="text-[10px] text-gray-500 uppercase">{item.sub}</div>
               </div>
            </div>
         ))}
      </div>

    </div>
  );
}

// Suspense Wrapper (useSearchParams için gerekli)
export default function NumerologyHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Yükleniyor...</div>}>
       <NumerologyHubContent />
    </Suspense>
  );
}