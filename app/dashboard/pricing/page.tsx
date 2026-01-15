"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Check, X, Star, Zap, Crown, ArrowLeft, Loader2, Sparkles, MessageCircle, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Tip Tanımlamaları
interface PlanFeature {
  text: string;
  included: boolean;
  icon?: React.ReactNode; 
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: PlanFeature[];
  theme: 'dark' | 'purple' | 'gold'; // Görseldeki temalar
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
    toast.info(`Ödeme altyapısı (PayTR) entegrasyon sürecindedir. ${planName} paketi çok yakında aktif olacaktır.`, {
      duration: 5000,
      icon: <Loader2 className="w-5 h-5 animate-spin" />,
    });
  };

  // GÖRSELDEKİ VERİLERE GÖRE GÜNCELLENMİŞ PLANLAR
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Çırak',
      price: 'Ücretsiz',
      description: '',
      theme: 'dark',
      features: [
        { text: 'Günde 1 Rüya Özeti', included: true },
        { text: 'Reklamlı Deneyim', included: true },
        { text: 'Detaylı Analiz Yok', included: false },
        { text: 'Tarot Falı Yok', included: false },
      ],
      buttonText: 'Başla', 
      popular: false
    },
    {
      id: 'pro',
      name: 'Kaşif',
      price: '₺199', 
      period: '/ay',
      description: 'Kendini keşfetmek isteyenler için.',
      theme: 'purple',
      features: [
        { text: 'Günde 5 Detaylı Analiz', included: true },
        { text: 'Şanslı Sayılar & Rehberlik', included: true, icon: <Sparkles className="w-4 h-4 mr-1 text-purple-300"/> },
        { text: 'Haftada 1 Tarot Hakkı', included: true },
        { text: 'Günde 1 AI Görsel', included: true },
      ],
      buttonText: 'Kaşif Ol', 
      popular: true
    },
    {
      id: 'elite',
      name: 'Kahin',
      price: '₺499', 
      period: '/ay',
      description: '',
      theme: 'gold',
      features: [
        { text: 'Sınırsız Rüya Yorumu', included: true },
        { text: 'Her Gün Tarot Falı', included: true },
        { text: 'Rüya ile Sohbet (Chat)', included: true, icon: <MessageCircle className="w-4 h-4 mr-1 text-amber-400"/> },
        { text: 'Günde 5 HD Görsel', included: true, icon: <ImageIcon className="w-4 h-4 mr-1 text-amber-400"/> },
      ],
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
      
      {/* Navbar */}
      <nav className="p-6 relative z-20 w-full max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> <span>Geri Dön</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-grow w-full max-w-7xl mx-auto px-6 pb-20 relative z-10 flex flex-col items-center">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-wide">Kaderini Seç</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Ruhsal yolculuğunuzda size eşlik edecek rehberi belirleyin.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl items-center">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-[2rem] border flex flex-col h-full transition-transform duration-300 ${
                plan.theme === 'purple' 
                  ? 'bg-[#1a103c] border-[#8b5cf6] shadow-[0_0_50px_rgba(139,92,246,0.2)] md:scale-110 z-10' 
                  : plan.theme === 'gold' 
                    ? 'bg-black border-[#fbbf24]/50'
                    : 'bg-[#121212] border-white/10'
              }`}
            >
              {/* En Popüler Etiketi */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#8b5cf6] text-white text-xs font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-lg z-20 whitespace-nowrap">
                  EN POPÜLER
                </div>
              )}

              {/* Başlık ve İkon */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                   {plan.theme === 'purple' && <Zap className="w-6 h-6 text-[#a78bfa] fill-[#a78bfa]" />}
                   {plan.theme === 'gold' && <Crown className="w-6 h-6 text-[#fbbf24] fill-[#fbbf24]" />}
                   <h3 className={`text-2xl font-bold ${
                     plan.theme === 'purple' ? 'text-[#a78bfa]' : 
                     plan.theme === 'gold' ? 'text-[#fbbf24]' : 'text-gray-400'
                   }`}>{plan.name}</h3>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 text-lg">{plan.period}</span>}
                </div>
                {plan.description && <p className="text-gray-400 text-sm mt-3">{plan.description}</p>}
              </div>

              {/* Özellikler */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`flex items-start gap-3 text-sm ${
                    !feature.included ? 'text-gray-600 line-through decoration-gray-700' : 'text-gray-300'
                  }`}>
                    {feature.included ? (
                      <Check className={`w-5 h-5 shrink-0 ${
                        plan.theme === 'purple' ? 'text-[#a78bfa]' : 
                        plan.theme === 'gold' ? 'text-[#fbbf24]' : 'text-gray-500'
                      }`} />
                    ) : (
                      <Check className="w-5 h-5 shrink-0 text-transparent" /> // Hizalama için boşluk
                    )}
                    <span className="flex items-center">
                      {feature.icon} {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Buton */}
              <button
                onClick={() => plan.id !== 'free' && handlePurchase(plan.name)}
                disabled={currentTier === plan.id}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  currentTier === plan.id 
                    ? 'bg-white/10 text-gray-500 cursor-default' 
                    : plan.theme === 'purple' 
                      ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-lg shadow-purple-900/50' 
                      : plan.theme === 'gold' 
                        ? 'bg-transparent border border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24] hover:text-black' 
                        : 'bg-transparent border border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {currentTier === plan.id ? 'Mevcut Plan' : plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
        
        {/* Footer Güvenlik Logoları (Dashboard içinde değil, layout'tan gelecek ama burada da ekstra güven için tutulabilir) */}
        <div className="mt-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           <img src="https://www.paytr.com/img/brand/paytr-logo.svg" alt="PayTR" className="h-6 inline-block mx-2" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 inline-block mx-2" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 inline-block mx-2" />
        </div>
      </div>
    </div>
  );
}