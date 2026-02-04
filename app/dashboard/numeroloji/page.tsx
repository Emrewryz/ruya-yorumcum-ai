"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Hash, Binary, ArrowRight, User, Sparkles } from "lucide-react";
import { Suspense } from "react";

function NumerologyHub() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL'den parametreleri al (Eğer rüya analizinden gelindiyse dolu olur)
  const dreamId = searchParams.get('dreamId');
  const numbers = searchParams.get('numbers');

  const handleNavigation = (path: string) => {
    // Eğer rüya parametreleri varsa onları da taşıyalım
    if (path === 'ruya' && dreamId && numbers) {
      router.push(`/dashboard/numeroloji/ruya?dreamId=${dreamId}&numbers=${numbers}`);
    } else {
      router.push(`/dashboard/numeroloji/${path}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 flex flex-col items-center">
      
      {/* BAŞLIK */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-3xl md:text-5xl font-serif text-white mb-4">Numeroloji Merkezi</h1>
        <p className="text-gray-400">Sayıların gizemli dünyasına hoş geldiniz. Hangi kapıyı aralamak istersiniz?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        
        {/* KUTU 1: GENEL NUMEROLOJİ (Profil Analizi) */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigation('genel')}
          className="cursor-pointer group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/30 p-8 h-[300px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10 transition-all group-hover:bg-emerald-500/20"></div>
          
          <div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
              <Hash className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Kişisel Analiz</h2>
            <p className="text-gray-400 text-sm">Doğum tarihiniz ve isminizle ruhunuzun şifrelerini, Yaşam Yolu ve Kader sayınızı keşfedin.</p>
          </div>

          <div className="flex items-center text-emerald-400 text-sm font-bold uppercase tracking-wider gap-2 group-hover:gap-4 transition-all">
            Analizi Başlat <ArrowRight className="w-4 h-4" />
          </div>
        </motion.div>

        {/* KUTU 2: RÜYA NUMEROLOJİSİ (Dream Sync) */}
        <motion.div 
          whileHover={{ scale: dreamId ? 1.02 : 1 }}
          whileTap={{ scale: dreamId ? 0.98 : 1 }}
          onClick={() => dreamId ? handleNavigation('ruya') : null}
          className={`relative overflow-hidden rounded-3xl border p-8 h-[300px] flex flex-col justify-between transition-all ${
            dreamId 
              ? "cursor-pointer bg-gradient-to-br from-indigo-900/40 to-black border-indigo-500/30 group" 
              : "cursor-not-allowed bg-white/5 border-white/5 opacity-50 grayscale"
          }`}
        >
          {dreamId && <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-10 translate-x-10 transition-all group-hover:bg-indigo-500/20"></div>}
          
          <div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
              <Binary className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Rüya & Uyum Analizi</h2>
            <p className="text-gray-400 text-sm">
              {dreamId 
                ? "Son gördüğünüz rüyanın sayılarıyla kendi numerolojik haritanızın uyumunu analiz edin." 
                : "Bu analiz için önce bir rüya yorumlatmalısınız."}
            </p>
          </div>

          <div className={`flex items-center text-sm font-bold uppercase tracking-wider gap-2 ${dreamId ? "text-indigo-400 group-hover:gap-4 transition-all" : "text-gray-600"}`}>
            {dreamId ? "Uyumu Keşfet" : "Rüya Verisi Yok"} <ArrowRight className="w-4 h-4" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <NumerologyHub />
    </Suspense>
  );
}