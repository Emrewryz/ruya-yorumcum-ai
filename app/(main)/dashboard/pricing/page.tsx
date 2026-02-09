"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Check, Zap, ArrowLeft, Loader2, X, 
  ShieldCheck, Copy, Clock, Sparkles, Layers
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// --- FİYATLANDIRMA YAPILANDIRMASI ---
// Shopier panelinden bu fiyatlara (39, 89, 169) sahip linkleri oluşturup buraya koymalısın.
const SHOPIER_LINKS = {
  starter: "https://www.shopier.com/ruyayorumcumai/43928759", // 15 Kredi (39 TL)
  explorer: "https://www.shopier.com/ruyayorumcumai/43369308", // 40 Kredi (89 TL)
  master: "https://www.shopier.com/ruyayorumcumai/43369409"    // 100 Kredi (169 TL)
};

interface Package {
  id: 'starter' | 'explorer' | 'master';
  name: string;
  credits: number;
  price: string;
  oldPrice?: string;
  description: string;
  features: string[];
  color: 'gray' | 'blue' | 'purple';
  popular?: boolean;
  badge?: string;
}

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentCredits, setCurrentCredits] = useState<number>(0);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();
        if (profile) setCurrentCredits(profile.credits || 0);
      }
      setLoading(false);
    };
    init();
  }, [supabase]);

  // --- PAKETLER (GÜNCELLENMİŞ FİYATLAR) ---
  const packages: Package[] = [
    {
      id: 'starter',
      name: 'BAŞLANGIÇ',
      credits: 15,
      price: '39 TL', 
      description: 'Sistemi denemek isteyenler için ideal.',
      features: [
        'Hesaba 15 Kredi Yüklenir',
        'Yaklaşık 15 Rüya Analizi',
        'Veya 5 Yapay Zeka Görseli',
        'Süre Sınırı Yok'
      ],
      color: 'gray'
    },
    {
      id: 'explorer',
      name: 'KAŞİF',
      credits: 30,
      price: '89 TL', 
      oldPrice: '120 TL',
      description: 'Düzenli analiz yaptıranlar için en mantıklısı.',
      features: [
        'Hesaba 40 Kredi Yüklenir',
        'Gelişmiş Numeroloji ve Tarot',
        'Bol Bol Görsel Üretimi',
        '%25 Fiyat Avantajı'
      ],
      color: 'blue',
      popular: true,
      badge: 'EN ÇOK TERCİH EDİLEN'
    },
    {
      id: 'master',
      name: 'KAHİN',
      credits: 100,
      price: '269 TL', 
      oldPrice: '399TL',
      description: 'Spiritüel yolculuğun için devasa kaynak.',
      features: [
        'Hesaba 100 Kredi Yüklenir',
        'Tüm Özelliklere Tam Erişim',
        'Yarı Yarıya Daha Ucuz',
        'Süper Fiyat Avantajı'
      ],
      color: 'purple',
      badge: 'SÜPER FIRSAT'
    }
  ];

  // --- SATIN ALMA İŞLEMİ ---
  const handlePurchase = (pkg: Package) => {
    if (!userEmail) {
        toast.error("Önce giriş yapmalısınız.");
        router.push('/login');
        return;
    }

    const link = SHOPIER_LINKS[pkg.id];
    if (!link || link.includes("XXXXX")) {
        toast.error("Ödeme sistemi güncelleniyor. Lütfen yönetici ile iletişime geçin.");
        return;
    }

    // BİLGİLENDİRME MODALI
    toast.custom((t) => (
      <div className="w-full max-w-[90vw] md:max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-sans relative mx-auto">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/10 blur-[60px] pointer-events-none" />
        
        <div className="p-5 md:p-6 relative z-10">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
               </div>
               <div>
                  <h3 className="text-white font-bold text-base">Güvenli Ödeme</h3>
                  <p className="text-gray-400 text-xs mt-0.5">{pkg.credits} Kredi Hesabınıza Tanımlanacak</p>
               </div>
            </div>
            <button onClick={() => toast.dismiss(t)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div 
              onClick={() => { navigator.clipboard.writeText(userEmail); toast.success("E-Posta Kopyalandı!"); }}
              className="group cursor-pointer bg-black/40 border border-white/10 hover:border-purple-500/40 rounded-xl p-4 mb-4 transition-all"
          >
              <div className="flex items-center justify-between mb-1">
                 <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-purple-400">Ödeme İçin E-Posta Adresiniz</span>
                 <span className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded flex items-center gap-1 group-hover:bg-purple-500 group-hover:text-white transition-colors"><Copy className="w-3 h-3" /> KOPYALA</span>
              </div>
              <div className="font-mono text-sm text-white truncate">{userEmail}</div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 mb-5 flex gap-3">
             <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
             <div className="text-[11px] leading-relaxed text-gray-300">
                Ödeme tamamlandıktan sonra kredileriniz <span className="text-white font-bold">otomatik olarak</span> hesabınıza yansır.
             </div>
          </div>

          <button 
            onClick={() => { toast.dismiss(t); window.location.href = link; }}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
              ÖDEMEYE GİT ({pkg.price}) <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center', style: { background: 'transparent', boxShadow: 'none' } });
  };

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-x-hidden flex flex-col pb-24">
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      
      {/* HEADER */}
      <nav className="sticky top-0 z-30 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 p-4 md:p-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-gray-300 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> <span className="text-sm font-bold">Geri</span>
        </button>
        
        {/* MEVCUT BAKİYE */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Kredi Bakiyesi:</span>
            <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-lg font-bold text-white">{currentCredits}</span>
            </div>
        </div>
      </nav>

      <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 pt-8 relative z-10">
        
        {/* BAŞLIK */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white mb-4 tracking-wide drop-shadow-lg">
                Ruhsal Yolculuğunu Seç
            </h1>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
              İhtiyacın kadar yükle, dilediğin gibi harca. <br className="hidden md:block" />
              Süre sınırı yok, aylık abonelik derdi yok.
            </p>
          </motion.div>
        </div>

        {/* HARCAMA TABLOSU */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto mb-16 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-sm"
        >
            <h3 className="text-center text-white font-bold mb-6 flex items-center justify-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" /> Kredi Harcama Değerleri
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Rüya Yorumu</div>
                    <div className="text-base font-bold text-white">1 Kredi</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Tarot & Fal</div>
                    <div className="text-base font-bold text-white">2 Kredi</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Numeroloji</div>
                    <div className="text-base font-bold text-white">2 Kredi</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">AI Görsel</div>
                    <div className="text-base font-bold text-white">3 Kredi</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Astroloji</div>
                    <div className="text-base font-bold text-white">5 Kredi</div>
                </div>
            </div>
        </motion.div>

        {/* PAKETLER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div 
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.15 }}
              className={`relative p-6 md:p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full group ${
                pkg.popular 
                  ? 'bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.15)] z-10 scale-[1.05]' 
                  : pkg.id === 'master' 
                    ? 'bg-gradient-to-b from-[#2e1065] to-[#0f172a] border-purple-500/30'
                    : 'bg-white/5 border-white/10'
              }`}
            >
              {pkg.badge && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1 whitespace-nowrap ${
                    pkg.id === 'explorer' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                }`}>
                  <Sparkles className="w-3 h-3" /> {pkg.badge}
                </div>
              )}
              
              <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${
                    pkg.color === 'purple' ? 'text-purple-300' : pkg.color === 'blue' ? 'text-blue-300' : 'text-gray-200'
                  }`}>
                      {pkg.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className={`w-8 h-8 ${
                        pkg.color === 'purple' ? 'text-purple-400' : pkg.color === 'blue' ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                    <span className="text-4xl font-bold text-white">{pkg.credits}</span>
                  </div>
                  <div className="h-px w-full bg-white/10 my-4"></div>
                  <div className="flex flex-col items-center">
                    {pkg.oldPrice && <span className="text-gray-500 line-through text-sm mb-1">{pkg.oldPrice}</span>}
                    <span className="text-3xl font-serif text-white">{pkg.price}</span>
                  </div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className={`w-5 h-5 shrink-0 ${
                        pkg.color === 'purple' ? 'text-purple-400' : pkg.color === 'blue' ? 'text-blue-400' : 'text-gray-500'
                    }`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(pkg)}
                className={`w-full py-4 rounded-xl font-bold text-sm md:text-base transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                  pkg.color === 'purple' 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/20' 
                    : pkg.color === 'blue' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-blue-500/20' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {pkg.id === 'starter' ? 'Paketi Seç' : 'Hemen Yükle'}
                <Zap className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
        
        {/* Güvenlik Footer */}
        <div className="mt-16 text-center pb-10 opacity-50">
            <div className="flex justify-center items-center gap-4 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-xs text-gray-400">256-bit SSL Korumalı Güvenli Ödeme</span>
            </div>
            <p className="text-[10px] text-gray-600">Ödemeler Shopier altyapısı ile işlenmektedir.</p>
        </div>

      </div>
    </div>
  );
}