"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Check, Zap, ArrowLeft, Loader2, X, 
  ShieldCheck, Copy, Clock, Sparkles, Layers, Moon, Star, ImageIcon, Compass, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// --- FİYATLANDIRMA YAPILANDIRMASI ---
const SHOPIER_LINKS = {
  starter: "https://www.shopier.com/ruyayorumcumai/43928759", 
  explorer: "https://www.shopier.com/ruyayorumcumai/43369308", 
  master: "https://www.shopier.com/ruyayorumcumai/43369409"   
};

interface Package {
  id: 'starter' | 'explorer' | 'master';
  name: string;
  credits: number;
  price: string;
  oldPrice?: string;
  description: string;
  features: string[];
  color: 'gray' | 'amber' | 'indigo';
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

  // --- PAKETLER ---
  const packages: Package[] = [
    {
      id: 'starter',
      name: 'BAŞLANGIÇ',
      credits: 15,
      price: '39 TL', 
      description: 'Sistemi denemek isteyenler için ideal başlangıç.',
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
      credits: 40,
      price: '89 TL', 
      oldPrice: '120 TL',
      description: 'Düzenli analiz yaptıranlar için en mantıklısı.',
      features: [
        'Hesaba 40 Kredi Yüklenir',
        'Gelişmiş Numeroloji ve Tarot',
        'Bol Bol Görsel Üretimi',
        '%25 Fiyat Avantajı'
      ],
      color: 'amber',
      popular: true,
      badge: 'EN ÇOK TERCİH EDİLEN'
    },
    {
      id: 'master',
      name: 'KAHİN',
      credits: 100,
      price: '169 TL', 
      oldPrice: '269 TL',
      description: 'Spiritüel yolculuğun için devasa kaynak.',
      features: [
        'Hesaba 100 Kredi Yüklenir',
        'Tüm Özelliklere Tam Erişim',
        'Yarı Yarıya Daha Ucuz',
        'Süper Fiyat Avantajı'
      ],
      color: 'indigo',
      badge: 'SÜPER FIRSAT'
    }
  ];

  const handlePurchase = (pkg: Package) => {
    if (!userEmail) {
        toast.error("Önce giriş yapmalısınız.");
        router.push('/auth?mode=login');
        return;
    }

    const link = SHOPIER_LINKS[pkg.id];
    if (!link || link.includes("XXXXX")) {
        toast.error("Ödeme sistemi güncelleniyor. Lütfen yönetici ile iletişime geçin.");
        return;
    }

    // BİLGİLENDİRME MODALI (Çift Temaya Uyarlanmış)
    toast.custom((t) => (
      <div className="w-full max-w-md bg-white dark:bg-[#131722]/95 dark:backdrop-blur-2xl border border-stone-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden font-sans relative mx-auto transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] dark:blur-[80px] pointer-events-none transition-colors" />
        
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-sm dark:shadow-inner transition-colors">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
               </div>
               <div>
                  <h3 className="text-stone-900 dark:text-white font-serif text-lg md:text-xl transition-colors">Güvenli Ödeme</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mt-0.5 transition-colors">+{pkg.credits} KREDİ YÜKLENECEK</p>
               </div>
            </div>
            <button onClick={() => toast.dismiss(t)} className="text-stone-400 dark:text-gray-500 hover:text-stone-900 dark:hover:text-white transition-colors bg-stone-100 dark:bg-white/5 p-2 rounded-full"><X className="w-4 h-4" /></button>
          </div>

          <div 
              onClick={() => { navigator.clipboard.writeText(userEmail); toast.success("E-Posta Kopyalandı!"); }}
              className="group cursor-pointer bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 rounded-2xl p-5 mb-5 transition-all shadow-sm dark:shadow-inner"
          >
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-slate-500 font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Ödeme İçin E-Posta Adresiniz</span>
                 <span className="text-[9px] bg-white dark:bg-white/5 border border-stone-200 dark:border-none text-stone-500 dark:text-gray-300 px-2 py-1 rounded font-bold uppercase flex items-center gap-1 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-[#0a0c10] group-hover:border-transparent transition-colors"><Copy className="w-3 h-3" /> Kopyala</span>
              </div>
              <div className="font-mono text-sm md:text-base text-stone-900 dark:text-white truncate transition-colors">{userEmail}</div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 transition-colors">
             <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 transition-colors" />
             <div className="text-xs leading-relaxed text-blue-800 dark:text-blue-200/70 transition-colors">
                Ödeme işlemini tamamladıktan sonra kredileriniz <span className="text-blue-600 dark:text-blue-300 font-bold">otomatik olarak</span> hesabınıza yansıyacaktır. Lütfen Shopier ekranında bu e-postayı kullandığınızdan emin olun.
             </div>
          </div>

          <button 
            onClick={() => { toast.dismiss(t); window.location.href = link; }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-[#0a0c10] py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-md hover:shadow-lg dark:shadow-[0_10px_20px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
              Ödemeye Git ({pkg.price}) <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center', style: { background: 'transparent', boxShadow: 'none', padding: 0 } });
  };

  if (loading) return (
     <div className="w-full flex items-center justify-center min-h-[60vh] bg-[#faf9f6] dark:bg-transparent transition-colors duration-500">
        <Loader2 className="w-8 h-8 text-stone-400 dark:text-amber-500 animate-spin" />
     </div>
  );

  return (
    // Çift Tema Destekli Ana Kapsayıcı
    <div className="relative w-full flex flex-col items-center z-10 pb-20 font-sans selection:bg-amber-200 dark:selection:bg-amber-500/30 transition-colors duration-500 antialiased">
      
      {/* SADECE BU SAYFAYA ÖZEL LOKAL ARKAPLAN IŞIĞI */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/60 dark:from-amber-900/15 via-transparent to-transparent pointer-events-none -z-10 transition-colors"></div>
      
      {/* HEADER */}
      <div className="w-full max-w-[1200px] px-4 md:px-0 py-6 flex items-center justify-between mt-2 md:mt-4 transition-colors">
        <button 
           onClick={() => router.back()} 
           className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/10 transition-colors text-xs font-bold text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white uppercase tracking-widest shadow-sm dark:shadow-none"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden md:inline">Geri Dön</span>
        </button>
        
        {/* MEVCUT BAKİYE */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#131722]/80 dark:backdrop-blur-md border border-stone-200 dark:border-white/5 px-5 py-2.5 rounded-xl shadow-sm transition-colors">
            <span className="text-[10px] text-stone-400 dark:text-slate-500 font-bold uppercase tracking-widest hidden md:block transition-colors">Kredi Bakiyesi</span>
            <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 transition-colors" />
                <span className="text-base md:text-lg font-bold text-stone-900 dark:text-white transition-colors">{currentCredits}</span>
            </div>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-0 pt-4 md:pt-8 flex flex-col items-center">
        
        {/* BAŞLIK */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 dark:text-white mb-4 transition-colors tracking-tight">
                Yolculuğunu <span className="text-amber-500 dark:text-amber-500">Genişlet</span>
            </h1>
            <p className="text-stone-500 dark:text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light transition-colors">
              İhtiyacın kadar yükle, dilediğin gibi harca. Herhangi bir süre sınırı veya aylık abonelik zorunluluğu yok. Sadece keşfetmek istediğin kadar kredi al.
            </p>
          </motion.div>
        </div>

        {/* HARCAMA TABLOSU */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="w-full max-w-4xl mb-16 md:mb-20 bg-white dark:bg-[#131722]/80 dark:backdrop-blur-xl border border-stone-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-xl transition-colors"
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left shrink-0">
                   <h3 className="text-stone-900 dark:text-white font-serif font-bold text-xl md:text-2xl mb-1 transition-colors">Harcama Rehberi</h3>
                   <p className="text-stone-400 dark:text-slate-500 text-xs uppercase tracking-widest font-bold transition-colors">Krediler Nereye Gider?</p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-end gap-3 md:gap-4 w-full">
                    <div className="flex items-center gap-3 bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/5 px-4 py-3 rounded-xl min-w-[140px] shadow-sm dark:shadow-none transition-colors">
                        <Moon className="w-5 h-5 text-amber-600 dark:text-amber-500 transition-colors" />
                        <div>
                           <div className="text-stone-900 dark:text-white font-bold text-sm transition-colors">1 Kredi</div>
                           <div className="text-[10px] text-stone-500 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">Rüya Analizi</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/5 px-4 py-3 rounded-xl min-w-[140px] shadow-sm dark:shadow-none transition-colors">
                        <Star className="w-5 h-5 text-orange-600 dark:text-orange-500 transition-colors" />
                        <div>
                           <div className="text-stone-900 dark:text-white font-bold text-sm transition-colors">2 Kredi</div>
                           <div className="text-[10px] text-stone-500 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">Tarot & Sayılar</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/5 px-4 py-3 rounded-xl min-w-[140px] shadow-sm dark:shadow-none transition-colors">
                        <ImageIcon className="w-5 h-5 text-pink-600 dark:text-pink-500 transition-colors" />
                        <div>
                           <div className="text-stone-900 dark:text-white font-bold text-sm transition-colors">3 Kredi</div>
                           <div className="text-[10px] text-stone-500 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">AI Görsel</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 dark:bg-[#0a0c10] border border-stone-200 dark:border-white/5 px-4 py-3 rounded-xl min-w-[140px] shadow-sm dark:shadow-none transition-colors">
                        <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-500 transition-colors" />
                        <div>
                           <div className="text-stone-900 dark:text-white font-bold text-sm transition-colors">5 Kredi</div>
                           <div className="text-[10px] text-stone-500 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">Doğum Haritası</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* PAKETLER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end max-w-5xl mx-auto w-full">
          {packages.map((pkg, index) => {
             const isAmber = pkg.color === 'amber';
             const isIndigo = pkg.color === 'indigo';
             
             // Temaya duyarlı renk setleri
             const accentColor = isAmber ? 'text-amber-600 dark:text-amber-400' : isIndigo ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-500 dark:text-slate-300';
             const iconBg = isAmber ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' : isIndigo ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20' : 'bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10';
             const glow = isAmber ? 'shadow-lg dark:shadow-[0_0_40px_rgba(251,191,36,0.1)] border-amber-200 dark:border-amber-500/30' : isIndigo ? 'shadow-lg dark:shadow-[0_0_40px_rgba(99,102,241,0.1)] border-indigo-200 dark:border-indigo-500/30' : 'shadow-md dark:shadow-none border-stone-200 dark:border-white/5 dark:hover:border-white/10';
             const badgeBg = isAmber ? 'bg-amber-500 text-white dark:text-[#0a0c10]' : 'bg-indigo-600 dark:bg-indigo-500 text-white';
             const buttonStyle = isAmber 
                ? 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-[#0a0c10]' 
                : isIndigo 
                  ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white' 
                  : 'bg-stone-900 hover:bg-stone-800 dark:bg-white/10 dark:hover:bg-white/20 text-white';

             return (
                <motion.div 
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.15 }}
                  className={`relative p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-[#131722]/60 dark:backdrop-blur-xl border transition-all duration-300 flex flex-col h-full group ${glow} ${pkg.popular ? 'md:-translate-y-4' : ''}`}
                >
                  {pkg.badge && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${badgeBg}`}>
                      <Sparkles className="w-3 h-3" /> {pkg.badge}
                    </div>
                  )}
                  
                  <div className="text-center mb-8 border-b border-stone-100 dark:border-white/5 pb-8 transition-colors">
                      <h3 className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 transition-colors ${accentColor}`}>
                          {pkg.name}
                      </h3>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className={`p-2.5 rounded-xl border transition-colors ${iconBg}`}>
                           <Zap className={`w-6 h-6 transition-colors ${accentColor}`} />
                        </div>
                        <span className="text-5xl font-serif font-bold text-stone-900 dark:text-white transition-colors">{pkg.credits}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center h-16">
                        {pkg.oldPrice && <span className="text-stone-400 dark:text-slate-500 line-through text-xs font-bold mb-1 transition-colors">{pkg.oldPrice}</span>}
                        <span className="text-3xl font-bold text-stone-900 dark:text-white tracking-tight transition-colors">{pkg.price}</span>
                      </div>
                  </div>
                  
                  <ul className="space-y-5 mb-10 flex-1">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-stone-600 dark:text-slate-300 font-medium dark:font-light transition-colors">
                        <Check className={`w-5 h-5 shrink-0 transition-colors ${accentColor}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm dark:shadow-none hover:shadow-md ${buttonStyle}`}
                  >
                    {pkg.id === 'starter' ? 'Paketi Seç' : 'Hemen Yükle'} <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
             )
          })}
        </div>
        
        {/* Güvenlik Footer */}
        <div className="mt-20 text-center pb-10 opacity-70 dark:opacity-60 transition-opacity">
            <div className="flex justify-center items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500 transition-colors" />
                <span className="text-xs text-stone-500 dark:text-slate-300 font-bold dark:font-medium tracking-wide transition-colors">256-bit SSL Korumalı Güvenli Ödeme</span>
            </div>
            <p className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-widest font-bold transition-colors">Ödemeler Shopier altyapısı ile işlenmektedir.</p>
        </div>

      </div>
    </div>
  );
}