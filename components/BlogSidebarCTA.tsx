"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Layers, Hash, Star, ArrowRight } from "lucide-react"; // ArrowRight eklendi

const SERVICES = [
  {
    id: 'dream',
    title: 'Rüyanız Size Özeldir',
    desc: 'Blog yazıları geneldir. Yapay zekaya rüyanızı anlatın, size özel derinlemesine analiz hazırlasın.',
    btnText: 'Özel Analiz Yaptır',
    link: '/dashboard',
    icon: BrainCircuit,
    theme: { text: 'text-amber-400', bg: 'bg-amber-500', hover: 'hover:bg-amber-400', border: 'border-amber-500/20', gradient: 'from-amber-500/10', iconColor: 'text-amber-500' }
  },
  {
    id: 'tarot',
    title: 'Geleceğiniz Kartlarda',
    desc: 'Niyetinizi tutun ve kartlarınızı seçin. Yapay zeka kahinimiz açılımınızı anında yorumlasın.',
    btnText: 'Tarot Falı Baktır',
    link: '/dashboard/tarot', 
    icon: Layers,
    theme: { text: 'text-purple-400', bg: 'bg-purple-600', hover: 'hover:bg-purple-500', border: 'border-purple-500/20', gradient: 'from-purple-600/10', iconColor: 'text-purple-500' }
  },
  {
    id: 'numerology',
    title: 'Sayıların Gizemli Gücü',
    desc: 'İsminiz bir tesadüf değil. Numeroloji ile hayat amacınızı ve kader sayınızı keşfedin.',
    btnText: 'Numeroloji Analizi',
    link: '/dashboard/numeroloji',
    icon: Hash,
    theme: { text: 'text-blue-400', bg: 'bg-blue-500', hover: 'hover:bg-blue-400', border: 'border-blue-500/20', gradient: 'from-blue-500/10', iconColor: 'text-blue-500' }
  },
  {
    id: 'astrology',
    title: 'Yıldızların Rehberliği',
    desc: 'Gökyüzünün sizin için çizdiği haritayı okuyun. Doğum haritanızla potansiyelinizi öğrenin.',
    btnText: 'Doğum Haritası Çıkar',
    link: '/dashboard',
    icon: Star,
    theme: { text: 'text-indigo-400', bg: 'bg-indigo-500', hover: 'hover:bg-indigo-400', border: 'border-indigo-500/20', gradient: 'from-indigo-500/10', iconColor: 'text-indigo-400' }
  }
];

export default function BlogSidebarCTA() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SERVICES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeService = SERVICES[currentIndex];
  const ActiveIcon = activeService.icon;

  return (
    <div className={`bg-gradient-to-br ${activeService.theme.gradient} to-[#131722] border ${activeService.theme.border} rounded-[2rem] p-6 relative overflow-hidden shadow-2xl min-h-[260px] transition-colors duration-1000`}>
        <div className="absolute -top-4 -right-4 p-4 opacity-10 transition-opacity">
            <ActiveIcon className={`w-28 h-28 ${activeService.theme.iconColor}`} />
        </div>
        
        <AnimatePresence mode="wait">
            <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col h-full"
            >
                <h3 className={`${activeService.theme.text} font-serif font-bold text-xl mb-3`}>
                {activeService.title}
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed mb-6 min-h-[60px]">
                {activeService.desc}
                </p>
                <Link href={activeService.link} className={`w-full py-3 ${activeService.theme.bg} ${activeService.theme.hover} text-[#0B0F19] rounded-xl text-sm font-bold shadow-lg transition-colors flex items-center justify-center gap-2 mt-auto`}>
                <ActiveIcon className="w-4 h-4" /> {activeService.btnText}
                </Link>
            </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-20">
            {SERVICES.map((_, idx) => (
            <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/20'}`}
            />
            ))}
        </div>
    </div>
  );
}