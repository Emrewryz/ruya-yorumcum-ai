"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, Eye, Sparkles, Lock, 
  Palette, Layers, Check, Crown, 
  MessageCircle, Hash, Zap, LogOut, LayoutDashboard, Brain // <-- Brain EKLENDİ
} from "lucide-react";

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
       // Giriş yapmışsa satın alma ekranına
       router.push('/dashboard/pricing');
    } else {
       // Yapmamışsa kayıt ekranına
       router.push('/auth'); 
    }
  };

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
                // --- KULLANICI GİRİŞ YAPMIŞSA ---
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
                // --- KULLANICI GİRİŞ YAPMAMIŞSA ---
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

      {/* 4. CANLI DEMO (MÜHÜRLÜ KUTU) */}
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

             {/* Sağ: Analiz (Blur Efektli) */}
             <div className="relative p-10 bg-black/40 flex flex-col justify-center min-h-[300px]">
                 <div className="space-y-4 filter blur-[8px] opacity-40 select-none pointer-events-none">
                    <h4 className="text-[#8b5cf6] font-bold text-xl">Psikolojik Analiz:</h4>
                    <p className="text-gray-300">Bu rüya, hayatınızdaki güç kaybı korkusunu simgeliyor. Kum sembolü zamanın aktığını...</p>
                    <h4 className="text-[#fbbf24] font-bold text-xl mt-6">Manevi Mesaj:</h4>
                    <p className="text-gray-300">İbni Sirin kayıtlarına göre diş dökülmesi ailenizle ilgili önemli bir değişimin habercisidir...</p>
                 </div>
                 
                 {/* Kilit Mührü */}
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

      {/* 6. FİYATLANDIRMA (YENİLENMİŞ) */}
      <section id="paketler" className="container mx-auto px-6 py-32 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold mb-4 text-white">Kaderini Seç</h2>
          <p className="text-gray-400">Ruhsal yolculuğunuzda size eşlik edecek rehberi belirleyin.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          
          {/* 1. PAKET: ÇIRAK */}
          <div className="relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <h3 className="font-serif text-2xl font-bold text-gray-300 mb-2">Çırak</h3>
            <div className="text-3xl font-bold text-white mb-6">Ücretsiz</div>
            <ul className="space-y-4 mb-8 text-sm text-gray-400">
              <li className="flex gap-3"><Check className="w-5 h-5 text-gray-500" /> Günde 1 Rüya Özeti</li>
              <li className="flex gap-3"><Check className="w-5 h-5 text-gray-500" /> Reklamlı Deneyim</li>
              <li className="flex gap-3 line-through opacity-50"><Brain className="w-5 h-5" /> Detaylı Analiz Yok</li>
              <li className="flex gap-3 line-through opacity-50"><Layers className="w-5 h-5" /> Tarot Falı Yok</li>
            </ul>
            <button onClick={() => handlePlanSelection('free')} className="block w-full py-3 rounded-xl border border-white/20 text-center hover:bg-white/5 transition-colors">
              Başla
            </button>
          </div>

          {/* 2. PAKET: KAŞİF (MOR TEMA - EN POPÜLER) */}
          <div className="relative p-10 rounded-3xl bg-[#1a103c] border-2 border-[#8b5cf6] shadow-[0_0_50px_rgba(139,92,246,0.2)] transform md:scale-110 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#8b5cf6] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
              En Popüler
            </div>
            <h3 className="font-serif text-3xl font-bold text-[#a78bfa] mb-2 flex items-center gap-2"><Zap className="w-6 h-6 fill-current"/> Kaşif</h3>
            <div className="text-4xl font-bold text-white mb-2">₺199<span className="text-sm text-gray-400 font-normal">/ay</span></div>
            <p className="text-gray-400 text-xs mb-8">Kendini keşfetmek isteyenler için.</p>
            <ul className="space-y-4 mb-10 text-sm text-gray-300">
              <li className="flex gap-3"><Check className="w-5 h-5 text-[#a78bfa]" /> <strong>Günde 5 Detaylı Analiz</strong></li>
              <li className="flex gap-3"><Hash className="w-5 h-5 text-[#a78bfa]" /> Şanslı Sayılar & Rehberlik</li>
              <li className="flex gap-3"><Layers className="w-5 h-5 text-[#a78bfa]" /> <strong>Haftada 1 Tarot</strong> Hakkı</li>
              <li className="flex gap-3"><Palette className="w-5 h-5 text-[#a78bfa]" /> Günde 1 AI Görsel</li>
            </ul>
            <button onClick={() => handlePlanSelection('paid')} className="w-full py-4 rounded-xl bg-[#8b5cf6] hover:bg-violet-600 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
              Kaşif Ol
            </button>
          </div>

          {/* 3. PAKET: KAHİN (ALTIN TEMA) */}
          <div className="relative p-8 rounded-3xl bg-black border border-[#fbbf24]/50 hover:border-[#fbbf24] transition-colors duration-300">
            <h3 className="font-serif text-2xl font-bold text-[#fbbf24] mb-2 flex items-center gap-2"><Crown className="w-6 h-6 fill-current"/> Kahin</h3>
            <div className="text-3xl font-bold text-white mb-6">₺499<span className="text-sm text-gray-400 font-normal">/ay</span></div>
            <ul className="space-y-4 mb-8 text-sm text-gray-300">
              <li className="flex gap-3"><Check className="w-5 h-5 text-[#fbbf24]" /> <strong>Sınırsız</strong> Rüya Yorumu</li>
              <li className="flex gap-3"><Layers className="w-5 h-5 text-[#fbbf24]" /> <strong>Her Gün Tarot</strong> Falı</li>
              <li className="flex gap-3"><MessageCircle className="w-5 h-5 text-[#fbbf24]" /> Rüya ile Sohbet (Chat)</li>
              <li className="flex gap-3"><Palette className="w-5 h-5 text-[#fbbf24]" /> Günde 5 HD Görsel</li>
            </ul>
            <button onClick={() => handlePlanSelection('paid')} className="w-full py-3 rounded-xl border border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24] hover:text-black font-bold transition-all">
              Kahin Ol
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER: Global Footer Layout'tan geleceği için buradan kaldırıldı */}
    </main>
  );
}