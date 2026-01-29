"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Zap, Check, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function UpgradeModal({ isOpen, onClose, message }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          {/* Arkaplan Blur */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal İçerik */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0f172a] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            {/* Glow Efekti */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Sınırları Kaldır</h2>
              <p className="text-amber-200/80 text-sm font-medium">
                {message || "Bu özelliği kullanmak için paketinizi yükseltin."}
              </p>
            </div>

            {/* Özellikler Listesi */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                <span>Sınırsız Rüya Analizi</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                <span>Gelişmiş Görsel Stüdyosu (Flux Model)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-500" />
                <span>Kahin ile Rüya Sohbeti</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/dashboard/pricing')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm uppercase tracking-wider hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Paketleri İncele
            </button>
            
            <p className="text-center text-[10px] text-gray-500 mt-4">
              İstediğiniz zaman iptal edebilirsiniz.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}