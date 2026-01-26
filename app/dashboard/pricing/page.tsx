"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Check, Star, Zap, Crown, ArrowLeft, Loader2, X, MessageCircle, Image as ImageIcon, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// TİP TANIMLAMALARI
interface PlanFeature {
  text: string;
  included: boolean;
  icon?: React.ReactNode; 
}

interface Plan {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  period?: string;
  description: string;
  features: PlanFeature[];
  color: string;
  icon: React.ReactNode;
  buttonText: string;
  popular: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<string>('free');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();
        if (profile) setCurrentTier(profile.subscription_tier?.toLowerCase() || 'free');
      }
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  // --- GÜNCELLENEN SATIN ALMA FONKSİYONU ---
  // ... diğer kodlar aynı

  const handlePurchase = async (planName: string) => {
    // 1. Kullanıcının Sitedeki Mailini Al
    const { data: { user } } = await supabase.auth.getUser();
    
    // Eğer kullanıcı giriş yapmamışsa login'e at
    if (!user || !user.email) {
        router.push('/login'); // veya /auth
        return;
    }

    // 2. Linki Seç
    let paymentLink = "";
    if (planName === "KAŞİF") paymentLink = "https://www.shopier.com/ruyayorumcumai/43369308";
    if (planName === "KAHİN") paymentLink = "https://www.shopier.com/ruyayorumcumai/43369409";

    if (!paymentLink) return;

    // 3. TOAST UYARISI (Kopyala & Git)
    toast(
      <div className="flex flex-col gap-3">
        <div className="font-bold text-amber-400 flex items-center gap-2">
           ⚠️ ÇOK ÖNEMLİ!
        </div>
        <div className="text-sm text-gray-200 leading-tight">
          Paketinizin anında aktif olması için ödeme ekranında 
          <span className="text-white font-bold underline mx-1">bu e-posta adresini</span> 
          kullanmalısınız:
        </div>
        
        {/* Mail Kutusu - Tıklayınca Kopyalar */}
        <div 
          onClick={() => {
             navigator.clipboard.writeText(user.email!);
             toast.success("E-Posta kopyalandı!");
          }}
          className="bg-white/10 p-3 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-colors flex items-center justify-between group"
        >
          <span className="font-mono text-xs md:text-sm text-white truncate">{user.email}</span>
          <span className="text-[10px] bg-white/20 px-2 py-1 rounded group-hover:bg-white/30">KOPYALA</span>
        </div>

        <button 
            onClick={() => window.location.href = paymentLink}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-sm transition-colors shadow-lg"
        >
            ANLADIM, ÖDEMEYE GİT 👉
        </button>
      </div>,
      {
        duration: Infinity, // Kullanıcı tıklayana kadar kapanmasın
        position: 'top-center',
        style: { background: '#0f172a', border: '1px solid #334155' }
      }
    );
  };

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'ÇIRAK',
      price: 'Ücretsiz',
      description: 'Yolculuğa yeni başlayanlar için temel rehberlik.',
      features: [
        { text: 'Sadece Rüya Özeti (Derin Öz)', included: true },
        { text: 'Reklamlı Deneyim', included: true },
        { text: 'Psikolojik & Manevi Analiz', included: false },
        { text: 'Rüya Görselleştirme', included: false },
        { text: 'Tarot & Şanslı Sayılar', included: false },
        { text: 'Rüya Sohbeti (AI)', included: false },
      ],
      color: 'gray', 
      icon: <Star className="w-6 h-6" />, 
      buttonText: 'Mevcut Plan', 
      popular: false
    },
    {
      id: 'pro',
      name: 'KAŞİF',
      price: '119 TL', 
      oldPrice: '199 TL', 
      period: '/ay',
      description: 'Bilinçaltını daha derinden keşfetmek isteyenler.',
      features: [
        { text: 'Detaylı Psikolojik & Manevi Analiz', included: true },
        { text: 'Rüya Görselleştirme (1 Adet/Rüya)', included: true },
        { text: 'Ruh Hali & Şanslı Sayılar', included: true },
        { text: 'Haftalık Tarot (3 Hak)', included: true },
        { text: 'Reklamsız Deneyim', included: true },
        { text: 'Rüya Sohbeti (AI)', included: false },
      ],
      color: 'blue', 
      icon: <Zap className="w-6 h-6" />, 
      buttonText: 'Kaşif Ol', 
      popular: true
    },
    {
      id: 'elite',
      name: 'KAHİN',
      price: '299 TL', 
      oldPrice: '499 TL', 
      period: '/ay',
      description: 'Rüyaların hakimi ol ve kaderini şekillendir.',
      features: [
        { text: 'SINIRSIZ Rüya Analizi', included: true },
        { text: 'Rüya Sohbeti (AI ile Konuş)', included: true, icon: <MessageCircle className="w-4 h-4 text-amber-400 inline mr-1"/> },
        { text: 'Gelişmiş Görsel Stüdyosu (10 Adet)', included: true, icon: <ImageIcon className="w-4 h-4 text-amber-400 inline mr-1"/> },
        { text: 'Günlük Tarot & İşaretler', included: true },
        { text: 'Detaylı Ruh Hali Analizi', included: true },
        { text: 'Öncelikli Destek', included: true },
      ],
      color: 'amber', 
      icon: <Crown className="w-6 h-6" />, 
      buttonText: 'Kahin Ol', 
      popular: false
    }
  ];

  if (loading) return (
    <div className="min-h-[100dvh] bg-[#020617] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-white animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#020617] text-white font-sans relative overflow-x-hidden flex flex-col pb-32">
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      
      {/* HEADER (Sticky) */}
      <nav className="sticky top-0 z-30 w-full bg-[#020617]/80 backdrop-blur-md border-b border-white/5 p-4 md:p-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all group">
          <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white" /> 
          <span className="text-sm font-bold text-gray-300 group-hover:text-white">Geri Dön</span>
        </button>
        <div className="text-xs font-bold text-[#fbbf24] border border-[#fbbf24]/20 px-3 py-1 rounded-full bg-[#fbbf24]/5">
            GÜVENLİ ÖDEME
        </div>
      </nav>

      <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-5xl font-serif text-[#fbbf24] mb-4 tracking-wide">Kaderini Seç</h1>
            <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto px-2">
              Bilinçaltının kapılarını ne kadar aralamak istersin? Senin için en uygun rehberlik paketini seç.
            </p>
          </motion.div>
        </div>

        {/* PAKETLER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }}
              className={`relative p-6 md:p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full group ${
                plan.popular 
                  ? 'bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10 scale-[1.02] md:scale-105' 
                  : plan.id === 'elite' 
                    ? 'bg-gradient-to-b from-[#2a1b05] to-[#0f172a] border-amber-500/30'
                    : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3 h-3" /> En Çok Tercih Edilen
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  plan.color === 'amber' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 
                  plan.color === 'blue' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className={`text-lg md:text-xl font-bold ${plan.color === 'amber' ? 'text-amber-400' : 'text-white'}`}>{plan.name}</h3>
                  <div className="h-1 w-8 md:w-12 bg-white/10 rounded-full mt-1"></div>
                </div>
              </div>
              
              <div className="mb-6 p-4 rounded-2xl bg-black/20 border border-white/5">
                {plan.oldPrice && plan.price !== 'Ücretsiz' && (
                   <span className="text-gray-500 line-through text-xs md:text-sm block mb-1">Normal: {plan.oldPrice}</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-serif text-white tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
                </div>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 md:space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-start gap-3 text-xs md:text-sm ${feature.included ? 'text-gray-200' : 'text-gray-600'}`}>
                    {feature.included ? (
                      <Check className={`w-4 h-4 md:w-5 md:h-5 shrink-0 ${
                        plan.color === 'amber' ? 'text-amber-400' : 
                        plan.color === 'blue' ? 'text-blue-400' : 
                        'text-gray-500'
                      }`} />
                    ) : (
                      <X className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-white/10" />
                    )}
                    <span className={feature.included ? '' : 'line-through decoration-white/10'}>
                      {feature.icon} {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => plan.id !== 'free' && handlePurchase(plan.name)}
                disabled={currentTier === plan.id || plan.id === 'free'}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                  currentTier === plan.id 
                    ? 'bg-white/5 text-gray-500 cursor-default border border-white/5' 
                    : plan.id === 'free'
                      ? 'bg-white/5 text-gray-400 cursor-default border border-white/5'
                    : plan.color === 'amber' 
                      ? 'bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black hover:shadow-amber-500/20' 
                    : plan.color === 'blue' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/20' 
                    : 'bg-white/10 text-white'
                }`}
              >
                {currentTier === plan.id ? 'Mevcut Planın' : plan.buttonText}
                {currentTier !== plan.id && plan.id !== 'free' && <Crown className="w-4 h-4" />}
              </button>
            </motion.div>
          ))}
        </div>
        
        {/* Güvenlik Logoları */}
        <div className="mt-12 md:mt-16 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 pb-10">
           <div className="flex items-center gap-2 text-xs text-gray-400 border border-white/10 px-4 py-2 rounded-full bg-white/5">
              <ShieldCheck className="w-4 h-4 text-green-500" /> SSL ile Güvenli Ödeme
           </div>
           <div className="flex items-center gap-4">
               <div className="h-4 w-[1px] bg-white/20"></div>
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 md:h-8" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 md:h-5" />
           </div>
        </div>
      </div>
    </div>
  );
}