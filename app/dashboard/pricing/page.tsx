"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Check, Star, Zap, Crown, ArrowLeft, Loader2, X, MessageCircle, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// TİP TANIMLAMALARI (HATAYI ÇÖZEN KISIM)
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
        if (profile) setCurrentTier(profile.subscription_tier || 'free');
      }
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  const handlePurchase = (planName: string) => {
    toast.info(`Sanal ödeme şirketiyle (PayTR) anlaşma süreci bekleniyor. ${planName} paketi çok yakında aktif olacaktır.`, {
      duration: 5000,
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });
  };

  // plans değişkenine açıkça 'Plan[]' tipini atadık
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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-white animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-hidden flex flex-col">
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      
      <nav className="p-6 relative z-20 w-full max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> <span>Geri Dön</span>
        </button>
      </nav>

      <div className="flex-grow w-full max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-serif text-[#fbbf24] mb-4 tracking-wide">Kaderini Seç</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Bilinçaltının kapılarını ne kadar aralamak istersin? Senin için en uygun rehberlik paketini seç.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full group ${
                plan.popular 
                  ? 'bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-105 z-10' 
                  : plan.id === 'elite' 
                    ? 'bg-gradient-to-b from-[#2a1b05] to-[#0f172a] border-amber-500/30 hover:border-amber-500/60'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> En Çok Tercih Edilen
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  plan.color === 'amber' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 
                  plan.color === 'blue' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${plan.color === 'amber' ? 'text-amber-400' : 'text-white'}`}>{plan.name}</h3>
                  <div className="h-1 w-12 bg-white/10 rounded-full mt-1"></div>
                </div>
              </div>
              
              <div className="mb-6 p-4 rounded-2xl bg-black/20 border border-white/5">
                {plan.oldPrice && plan.price !== 'Ücretsiz' && (
                   <span className="text-gray-500 line-through text-sm block mb-1">Normal Fiyat: {plan.oldPrice}</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl md:text-4xl font-serif text-white tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
                </div>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${feature.included ? 'text-gray-200' : 'text-gray-600'}`}>
                    {feature.included ? (
                      <Check className={`w-5 h-5 shrink-0 ${
                        plan.color === 'amber' ? 'text-amber-400' : 
                        plan.color === 'blue' ? 'text-blue-400' : 
                        'text-gray-500'
                      }`} />
                    ) : (
                      <X className="w-5 h-5 shrink-0 text-white/10" />
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
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  currentTier === plan.id 
                    ? 'bg-white/5 text-gray-500 cursor-default border border-white/5' 
                    : plan.id === 'free'
                      ? 'bg-white/5 text-gray-400 cursor-default border border-white/5'
                    : plan.color === 'amber' 
                      ? 'bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black hover:shadow-amber-500/20 hover:scale-[1.02]' 
                    : plan.color === 'blue' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/20 hover:scale-[1.02]' 
                    : 'bg-white/10 text-white'
                }`}
              >
                {currentTier === plan.id ? 'Mevcut Planın' : plan.buttonText}
                {currentTier !== plan.id && plan.id !== 'free' && <Crown className="w-4 h-4" />}
              </button>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 flex justify-center items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500"></div> SSL Güvenli Ödeme
           </div>
           <div className="h-4 w-[1px] bg-white/20"></div>
           <img src="https://www.paytr.com/img/brand/paytr-logo.svg" alt="PayTR" className="h-5" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5" />
        </div>
      </div>
    </div>
  );
}