"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Check, Star, Zap, Crown, ArrowLeft, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<string>('free');
  
  // Modal State'leri
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'elite' | null>(null);
  const [formData, setFormData] = useState({ name: "", surname: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

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

  // Modal Açma
  const openPaymentModal = (tier: 'pro' | 'elite') => {
    setSelectedPlan(tier);
    setShowModal(true);
  };

  // Ödeme Başlatma (API'ye İstek Atar)
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.surname || !formData.phone) {
        toast.warning("Lütfen tüm alanları doldurun.");
        return;
    }

    setSubmitting(true);

    try {
        // 1. Backend'den Shopier Form Verisini İste
        const response = await fetch('/api/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plan: selectedPlan,
                buyerInfo: formData
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Ödeme başlatılamadı.");
        }

        // 2. Görünmez Form Oluştur ve Gönder (Shopier'e Yönlendirme)
        const form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", "https://www.shopier.com/ShowProduct/api_pay4.php");

        // Gelen verileri input olarak ekle
        Object.keys(data.form).forEach(key => {
            const input = document.createElement("input");
            input.setAttribute("type", "hidden");
            input.setAttribute("name", key);
            input.setAttribute("value", data.form[key]);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit(); // Yönlendir

    } catch (error: any) {
        console.error(error);
        toast.error(error.message);
        setSubmitting(false);
    }
  };

  // Paket Listesi
  const plans = [
    {
      id: 'free',
      name: 'Çırak',
      price: 'Ücretsiz',
      description: 'Yolculuğa yeni başlayanlar için.',
      features: ['Günde 1 Rüya Analizi', 'Kısa Rüya Özeti', 'Reklamlı Deneyim'],
      color: 'gray', icon: <Star className="w-6 h-6" />, buttonText: 'Mevcut Plan', popular: false
    },
    {
      id: 'pro',
      name: 'KAŞİF',
      price: '119 TL', oldPrice: '199 TL', period: '/ay',
      description: 'Bilinçaltını keşfetmek isteyenler.',
      features: ['Günde 5 Rüya Analizi', 'Psikolojik Analiz', 'Haftada 1 Tarot', 'Günde 1 Görsel (Standart)', 'Reklamsız'],
      color: 'blue', icon: <Zap className="w-6 h-6" />, buttonText: 'Kaşif Ol', popular: true
    },
    {
      id: 'elite',
      name: 'KAHİN',
      price: '299 TL', oldPrice: '499 TL', period: '/ay',
      description: 'Rüyaların hakimi olmak isteyenler.',
      features: ['SINIRSIZ Analiz', 'Manevi Mesajlar', 'Her Gün Tarot', 'Günde 5 Görsel (Ultra HD)', 'Rüya Sohbeti'],
      color: 'amber', icon: <Crown className="w-6 h-6" />, buttonText: 'Kahin Ol', popular: false
    }
  ];

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="w-10 h-10 text-white animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-hidden">
      <div className="bg-noise fixed inset-0 opacity-20 pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="p-6 relative z-20">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> <span>Geri Dön</span>
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#fbbf24] mb-4">Kaderini Seç</h1>
          <p className="text-gray-400 text-lg">Açılışa özel fiyatlarla bilinçaltının kapılarını arala.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full ${
                plan.popular ? 'bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] scale-105 z-10' : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">En Popüler</div>}
              
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${plan.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : plan.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{plan.icon}</div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-8">
                {plan.oldPrice && <span className="text-gray-500 line-through text-sm block mb-1">{plan.oldPrice}</span>}
                <div className="flex items-baseline gap-1"><span className="text-4xl font-serif text-white">{plan.price}</span>{plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}</div>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300"><Check className={`w-5 h-5 shrink-0 ${plan.color === 'amber' ? 'text-amber-400' : plan.color === 'blue' ? 'text-blue-400' : 'text-gray-500'}`} /><span>{feature}</span></li>
                ))}
              </ul>

              <button
                onClick={() => plan.id !== 'free' && openPaymentModal(plan.id as 'pro' | 'elite')}
                disabled={currentTier === plan.id}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  currentTier === plan.id ? 'bg-white/10 text-gray-400 cursor-not-allowed' : plan.color === 'amber' ? 'bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black hover:scale-[1.02]' : plan.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.02]' : 'bg-white/10 text-white'
                }`}
              >
                {currentTier === plan.id ? 'Mevcut Planın' : plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- ÖDEME BİLGİ FORMU MODALI --- */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              
              <h3 className="text-xl font-serif text-[#fbbf24] mb-2">Ödeme Bilgileri</h3>
              <p className="text-sm text-gray-400 mb-6">Fatura ve güvenlik için yasal zorunluluktur.</p>

              <form onSubmit={handlePayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Ad</label>
                        <input type="text" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#fbbf24] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Soyad</label>
                        <input type="text" required className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#fbbf24] outline-none" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Telefon</label>
                    <input type="tel" required placeholder="05..." className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:border-[#fbbf24] outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Güvenli Ödemeye Geç <ArrowLeft className="w-4 h-4 rotate-180" /></>}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center mt-3">Shopier güvenli ödeme sayfasına yönlendirileceksiniz.</p>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}