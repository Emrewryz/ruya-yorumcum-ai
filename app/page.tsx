"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, Eye, Sparkles, Lock, 
  Palette, Layers, Check, Crown, Star, X,
  MessageCircle, Hash, Zap, LogOut, LayoutDashboard, Brain,
  Image as ImageIcon // <-- 1. HATA ÇÖZÜMÜ: Buraya eklendi
} from "lucide-react";

// 2. HATA ÇÖZÜMÜ: Tip Tanımlamaları Eklendi
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

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  // 1. KULLANICI KONTROLÜ
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [supabase]);

  // ÇIKIŞ YAPMA
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  // Mührü Kır Fonksiyonu
  const handleUnlockMystery = () => {
    router.push('/dashboard');
  };

  // Paket Seçimi Yönlendirmesi
  const handlePlanSelection = (planType: 'free' | 'paid') => {
    if (user) {
       router.push('/dashboard/pricing');
    } else {
       router.push('/auth'); 
    }
  };

  // PAKET VERİLERİ (Tip tanımlaması ile düzeltildi)
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

  return (
    <main className="min-h-screen bg-[#050510] text-white relative overflow-x-hidden font-sans selection:bg-[#8b5cf6] selection:text-white pb-20">
      
      {/* 1. ATMOSFER & ZEMİN */}
      <div className="bg-noise"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#4c1d95]/20 rounded-full blur-[128px] animate-pulse-slow pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#1e1b4b]/20 rounded-full blur-[128px] animate-pulse-slow delay-1000 pointer-events-none z-0"></div>

      {/* 2. ÜST MENÜ (AKILLI NAVBAR) */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="glass-pill rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="relative w-8 h-8 flex items-center justify-center">
               <Moon className="w-6 h-6 text-[#fbbf24] fill-[#fbbf24]" />
               <Eye className="w-3 h-3 text-black absolute top-[10px] left-[10px]" />
            </div>
            <span className="font-serif font-bold text-lg tracking-wide text-white">RüyaYorumcum</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#ozellikler" className="hover:text-[#fbbf24] transition-colors">Özellikler</Link>
            <Link href="#ornekler" className="hover:text-[#fbbf24] transition-colors">Örnekler</Link>
            <Link href="#paketler" className="hover:text-[#fbbf24] transition-colors">Paketler</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
                <>
                   <span className="hidden sm:block text-xs text-gray-400 font-medium">
                      Hoş geldin, <span className="text-white">{user.email?.split('@')[0]}</span>
                   </span>
                   <Link 
                     href="/dashboard" 
                     className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-xs font-bold"
                   >
                      <LayoutDashboard className="w-4 h-4" /> PANEL
                   </Link>
                   <button 
                     onClick={handleLogout}
                     className="p-2 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                     title="Çıkış Yap"
                   >
                      <LogOut className="w-4 h-4" />
                   </button>
                </>
            ) : (
                <>
                   <Link href="/auth" className="text-sm font-medium text-white/80 hover:text-white hidden sm:block">Giriş Yap</Link>
                   <Link 
                     href="/auth" 
                     className="px-6 py-2.5 rounded-full bg-[#8b5cf6] text-white text-xs font-bold tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all hover:scale-105"
                   >
                     ÜCRETSİZ BAŞLA
                   </Link>
                </>
            )}
          </div>
        </nav>
      </div>

      {/* 3. HERO BÖLÜMÜ */}
      <section className="relative z-10 pt-48 pb-20 text-center px-4">
        <h1 className="font-serif text-5xl md:text-[80px] font-bold mb-6 leading-[1.1] max-w-5xl mx-auto tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-100 via-gray-200 to-[#8b5cf6]">
            Rüyalarınızın Gizli <br /> Mesajlarını Çözün
          </span>
        </h1>
        
        <p className="font-sans text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          Modern psikoloji, kadim İslami bilgelik ve yapay zeka teknolojisiyle <br className="hidden md:block"/> bilinçaltınızın haritasını çıkarın.
        </p>

        <Link 
          href="/dashboard"
          className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-black transition-all duration-300 bg-gradient-to-r from-[#fcd34d] via-[#fbbf24] to-[#f59e0b] rounded-full hover:scale-105 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
        >
           <span className="relative flex items-center gap-2 z-10">
             Rüyanı Şimdi Yorumla <Sparkles className="w-5 h-5 fill-black" />
           </span>
           <div className="absolute inset-0 rounded-full blur-md bg-[#fbbf24]/50 group-hover:bg-[#fbbf24]/80 transition-all"></div>
        </Link>
      </section>

      {/* 4. CANLI DEMO */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mb-32" id="ornekler">
        <div className="glass-panel rounded-3xl p-1 relative overflow-hidden group hover:border-[#fbbf24]/30 transition-colors duration-500 bg-white/5 backdrop-blur-xl border border-white/10">
           <div className="grid md:grid-cols-2 gap-0 bg-[#050510]/60 rounded-2xl overflow-hidden">
             {/* Sol: Rüya Metni */}
             <div className="p-10 border-b md:border-b-0 md:border-r border-white/5 font-serif text-gray-300 italic text-lg leading-relaxed flex items-center">
               <span className="animate-pulse opacity-80">
                 "Rüyamda dişlerimin döküldüğünü gördüm ve ağzımdan kan yerine kum aktığını hissettim..."
                 <span className="inline-block w-2 h-5 bg-white/50 ml-1 animate-ping"></span>
               </span>
             </div>

             {/* Sağ: Analiz */}
             <div className="relative p-10 bg-black/40 flex flex-col justify-center min-h-[300px]">
                 <div className="space-y-4 filter blur-[8px] opacity-40 select-none pointer-events-none">
                    <h4 className="text-[#8b5cf6] font-bold text-xl">Psikolojik Analiz:</h4>
                    <p className="text-gray-300">Bu rüya, hayatınızdaki güç kaybı korkusunu simgeliyor. Kum sembolü zamanın aktığını...</p>
                    <h4 className="text-[#fbbf24] font-bold text-xl mt-6">Manevi Mesaj:</h4>
                    <p className="text-gray-300">İbni Sirin kayıtlarına göre diş dökülmesi ailenizle ilgili önemli bir değişimin habercisidir...</p>
                 </div>
                 
                 <div onClick={handleUnlockMystery} className="absolute inset-0 flex flex-col items-center justify-center z-10 cursor-pointer group/lock">
                    <div className="w-20 h-20 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24] flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.2)] mb-4 backdrop-blur-md group-hover/lock:scale-110 transition-transform duration-300 group-hover/lock:bg-[#fbbf24] group-hover/lock:text-black">
                       <Lock className="w-8 h-8 text-[#fbbf24] group-hover/lock:text-black transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-[#fbbf24] tracking-[0.2em] uppercase opacity-80 group-hover/lock:opacity-100 group-hover/lock:text-white transition-colors">
                       Analizi Görmek İçin Tıkla
                    </span>
                 </div>
             </div>
           </div>
        </div>
      </section>

      {/* 5. ÖZELLİKLER VİTRİNİ */}
      <section id="ozellikler" className="container mx-auto px-6 py-20 relative z-10 space-y-32">
         <div className="text-center mb-24">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">Evrenin Dört Kapısı</h2>
            <p className="text-gray-400">Sadece rüya tabiri değil, tam kapsamlı bir spiritüel rehberlik.</p>
         </div>

         {/* 1. Numeroloji */}
         <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 w-full relative group">
               <div className="relative aspect-video bg-[#0f172a] border border-[#fbbf24]/20 rounded-3xl p-8 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.1)] group-hover:border-[#fbbf24]/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/5 to-transparent"></div>
                  <div className="text-center z-10">
                     <div className="text-8xl font-mono font-bold text-[#fbbf24] drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse">7</div>
                     <div className="text-[#fbbf24] text-xs font-bold tracking-[0.3em] uppercase mt-2">Ruhsal Uyanış</div>
                  </div>
                  <div className="absolute top-4 left-4 text-gray-800 font-mono text-2xl">3</div>
                  <div className="absolute bottom-4 right-4 text-gray-800 font-mono text-2xl">12</div>
               </div>
            </div>
            <div className="flex-1 space-y-6">
               <div className="w-12 h-12 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center">
                  <Hash className="w-6 h-6 text-[#fbbf24]" />
               </div>
               <h3 className="text-3xl font-serif font-bold text-white">Sayıların Gizemi</h3>
               <p className="text-gray-400 leading-relaxed text-lg">
                  Rüyanızda beliren sayıların tesadüf olmadığını biliyor muydunuz? Yapay zeka, rüyanızdaki sembollerin numerolojik değerini hesaplar ve evrenin size gönderdiği matematiksel mesajı çözer.
               </p>
               <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-[#fbbf24]" /> Şanslı sayı analizi</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-[#fbbf24]" /> Günlük numeroloji rehberi</li>
               </ul>
            </div>
         </div>

         {/* 2. Tarot */}
         <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
            <div className="flex-1 w-full relative group">
               <div className="relative aspect-video bg-[#0f172a] border border-pink-500/20 rounded-3xl p-8 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.1)] group-hover:border-pink-500/50 transition-colors">
                  <div className="flex gap-4 items-center">
                     <div className="w-20 h-32 rounded-lg bg-pink-900/20 border border-pink-500/30 transform -rotate-6 translate-y-4"></div>
                     <div className="w-24 h-40 rounded-xl bg-gradient-to-b from-pink-500/20 to-purple-500/20 border border-pink-500 flex items-center justify-center z-10 shadow-xl">
                        <Layers className="w-8 h-8 text-pink-400" />
                     </div>
                     <div className="w-20 h-32 rounded-lg bg-pink-900/20 border border-pink-500/30 transform rotate-6 translate-y-4"></div>
                  </div>
                  <div className="absolute bottom-4 text-pink-400 text-xs font-bold tracking-widest uppercase">Geçmiş • Şimdi • Gelecek</div>
               </div>
            </div>
            <div className="flex-1 space-y-6">
               <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-pink-500" />
               </div>
               <h3 className="text-3xl font-serif font-bold text-white">Tarot Ritüeli</h3>
               <p className="text-gray-400 leading-relaxed text-lg">
                  Rüya yorumu bazen yetmeyebilir. Böyle anlarda kartların bilgeliğine başvurun. Yapay zeka destekli Tarot açılımı ile geçmiş, şimdi ve gelecek arasındaki bağı kurun.
               </p>
               <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-pink-500" /> 3 Kart Açılımı (Past/Present/Future)</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-pink-500" /> Rüya ile bağlantılı yorum</li>
               </ul>
            </div>
         </div>

         {/* 3. AI Vizyon */}
         <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 w-full relative group">
               <div className="relative aspect-video bg-[#0f172a] border border-emerald-500/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/50 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black"></div>
                  <div className="absolute inset-0 opacity-50 blur-2xl bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.4),transparent_50%)] animate-pulse-slow"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-center">
                        <Palette className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                        <span className="text-emerald-200 text-xs uppercase tracking-widest">Görsel Oluşturuluyor...</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex-1 space-y-6">
               <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-emerald-500" />
               </div>
               <h3 className="text-3xl font-serif font-bold text-white">AI Vizyon</h3>
               <p className="text-gray-400 leading-relaxed text-lg">
                  Rüyanızdaki o bulanık sahneyi, yüksek çözünürlüklü bir sanat eserine dönüştürün. Anlattığınız rüya, saniyeler içinde görsel bir anıya dönüşsün.
               </p>
               <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-emerald-500" /> HD Kalitede Görselleştirme</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-emerald-500" /> İndirilebilir Rüya Kartpostalı</li>
               </ul>
            </div>
         </div>
      </section>

      {/* 6. FİYATLANDIRMA (YENİLENMİŞ & UYARLANMIŞ) */}
      <section id="paketler" className="container mx-auto px-6 py-32 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold mb-4 text-white">Kaderini Seç</h2>
          <p className="text-gray-400">Ruhsal yolculuğunuzda size eşlik edecek rehberi belirleyin.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.id}
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
                onClick={() => handlePlanSelection(plan.id === 'free' ? 'free' : 'paid')}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  plan.id === 'free'
                    ? 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                    : plan.color === 'amber' 
                      ? 'bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black hover:shadow-amber-500/20 hover:scale-[1.02]' 
                    : plan.color === 'blue' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/20 hover:scale-[1.02]' 
                    : 'bg-white/10 text-white'
                }`}
              >
                {plan.id === 'free' ? 'Başla' : plan.buttonText}
                {plan.id !== 'free' && <Crown className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER: Global Footer Layout'tan geleceği için buradan kaldırıldı */}
    </main>
  );
}