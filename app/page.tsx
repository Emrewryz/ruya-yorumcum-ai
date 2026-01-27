"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, Eye, Sparkles, Lock, 
  Palette, Layers, Check, Crown, Star, X, BookOpen, ArrowRight,
  MessageCircle, Hash, Zap, LogOut, LayoutDashboard, 
  Image as ImageIcon, Calendar 
} from "lucide-react";

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

// Blog verisi için tip tanımı
interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const initData = async () => {
      // 1. Kullanıcıyı kontrol et
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. Son 3 Blog yazısını çek (Blog Vitrini için)
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('title, slug, excerpt, image_url, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (posts) setLatestPosts(posts);
    };
    initData();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const handleUnlockMystery = () => {
    router.push('/dashboard');
  };

  const handlePlanSelection = (planType: 'free' | 'paid') => {
    if (user) {
       router.push('/dashboard/pricing');
    } else {
       router.push('/auth'); 
    }
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

  return (
    <main className="min-h-screen bg-[#050510] text-white relative overflow-x-hidden font-sans selection:bg-[#8b5cf6] selection:text-white pb-32 md:pb-20">
      
      {/* 1. ATMOSFER & ZEMİN */}
      <div className="bg-noise"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#4c1d95]/20 rounded-full blur-[80px] md:blur-[128px] animate-pulse-slow pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#1e1b4b]/20 rounded-full blur-[80px] md:blur-[128px] animate-pulse-slow delay-1000 pointer-events-none z-0"></div>

      {/* 2. ÜST MENÜ */}
      <div className="fixed top-4 md:top-6 left-0 right-0 z-40 flex justify-center px-4">
        <nav className="glass-pill rounded-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between w-full max-w-5xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="relative w-8 h-8 flex items-center justify-center">
               <Moon className="w-6 h-6 text-[#fbbf24] fill-[#fbbf24]" />
               <Eye className="w-3 h-3 text-black absolute top-[10px] left-[10px]" />
            </div>
            <span className="font-serif font-bold text-lg tracking-wide text-white">RüyaYorumcum</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#ozellikler" className="hover:text-[#fbbf24] transition-colors">Özellikler</Link>
            <Link href="#sozluk" className="hover:text-[#fbbf24] transition-colors">Sözlük</Link>
            {/* BLOG LINKI EKLENDİ */}
            <Link href="/blog" className="hover:text-[#fbbf24] transition-colors">Blog</Link>
            <Link href="#paketler" className="hover:text-[#fbbf24] transition-colors">Paketler</Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 px-3 md:px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-xs font-bold active:scale-95"
                >
                   <LayoutDashboard className="w-4 h-4" /> <span className="hidden md:inline">PANEL</span>
                </Link>
            ) : (
                <>
                   <Link href="/auth" className="text-sm font-medium text-white/80 hover:text-white hidden sm:block">Giriş Yap</Link>
                   <Link 
                     href="/auth" 
                     className="px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-[#8b5cf6] text-white text-xs font-bold tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all hover:scale-105 active:scale-95"
                   >
                     BAŞLA
                   </Link>
                </>
            )}
          </div>
        </nav>
      </div>

      {/* 3. HERO BÖLÜMÜ */}
      <section className="relative z-10 pt-32 md:pt-48 pb-12 md:pb-20 text-center px-4">
        <h1 className="font-serif text-4xl md:text-[80px] font-bold mb-4 md:mb-6 leading-[1.1] max-w-5xl mx-auto tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-100 via-gray-200 to-[#8b5cf6]">
            Rüyalarınızın Gizli <br /> Mesajlarını Çözün
          </span>
        </h1>
        
        <p className="font-sans text-base md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-8 md:mb-12 font-light leading-relaxed px-2">
          Modern psikoloji, kadim İslami bilgelik ve yapay zeka teknolojisiyle <br className="hidden md:block"/> bilinçaltınızın haritasını çıkarın.
        </p>

        <Link 
          href="/dashboard"
          className="group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-lg font-bold text-black transition-all duration-300 bg-gradient-to-r from-[#fcd34d] via-[#fbbf24] to-[#f59e0b] rounded-full hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
        >
           <span className="relative flex items-center gap-2 z-10">
             Rüyanı Şimdi Yorumla <Sparkles className="w-5 h-5 fill-black" />
           </span>
           <div className="absolute inset-0 rounded-full blur-md bg-[#fbbf24]/50 group-hover:bg-[#fbbf24]/80 transition-all"></div>
        </Link>
      </section>

      {/* 4. CANLI DEMO */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 mb-20 md:mb-32">
        <div className="glass-panel rounded-3xl p-1 relative overflow-hidden group bg-white/5 backdrop-blur-xl border border-white/10">
           <div className="grid md:grid-cols-2 gap-0 bg-[#050510]/60 rounded-2xl overflow-hidden">
             <div className="p-6 md:p-10 border-b md:border-b-0 md:border-r border-white/5 font-serif text-gray-300 italic text-lg leading-relaxed flex items-center">
               <span className="animate-pulse opacity-80">
                 "Rüyamda dişlerimin döküldüğünü gördüm ve ağzımdan kan yerine kum aktığını hissettim..."
                 <span className="inline-block w-2 h-5 bg-white/50 ml-1 animate-ping"></span>
               </span>
             </div>

             <div className="relative p-6 md:p-10 bg-black/40 flex flex-col justify-center min-h-[250px] md:min-h-[300px]">
                 <div className="space-y-4 filter blur-[8px] opacity-40 select-none pointer-events-none">
                   <h4 className="text-[#8b5cf6] font-bold text-xl">Psikolojik Analiz:</h4>
                   <p className="text-gray-300">Bu rüya, hayatınızdaki güç kaybı korkusunu simgeliyor...</p>
                   <h4 className="text-[#fbbf24] font-bold text-xl mt-6">Manevi Mesaj:</h4>
                   <p className="text-gray-300">İbni Sirin kayıtlarına göre diş dökülmesi...</p>
                 </div>
                 
                 <div onClick={handleUnlockMystery} className="absolute inset-0 flex flex-col items-center justify-center z-10 cursor-pointer active:scale-95 transition-transform">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24] flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.2)] mb-4 backdrop-blur-md">
                       <Lock className="w-6 h-6 md:w-8 md:h-8 text-[#fbbf24]" />
                    </div>
                    <span className="text-xs md:text-sm font-bold text-[#fbbf24] tracking-[0.2em] uppercase opacity-90">
                       Analizi Görmek İçin Tıkla
                    </span>
                 </div>
             </div>
           </div>
        </div>
      </section>

      {/* 5. ÖZELLİKLER VİTRİNİ */}
      <section id="ozellikler" className="container mx-auto px-6 py-12 md:py-20 relative z-10 space-y-24 md:space-y-32">
         {/* ... (Numeroloji, Tarot ve AI Vizyon aynı kaldı) ... */}
         {/* 1. Numeroloji */}
         <div className="flex flex-col md:flex-row items-center gap-8 md:gap-24">
            <div className="flex-1 w-full relative">
               <div className="relative aspect-video bg-[#0f172a] border border-[#fbbf24]/20 rounded-3xl p-8 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(251,191,36,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/5 to-transparent"></div>
                  <div className="text-center z-10">
                     <div className="text-6xl md:text-8xl font-mono font-bold text-[#fbbf24] drop-shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse">7</div>
                     <div className="text-[#fbbf24] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mt-2">Ruhsal Uyanış</div>
                  </div>
                  <div className="absolute top-4 left-4 text-gray-800 font-mono text-xl md:text-2xl">3</div>
                  <div className="absolute bottom-4 right-4 text-gray-800 font-mono text-xl md:text-2xl">12</div>
               </div>
            </div>
            <div className="flex-1 space-y-4 md:space-y-6">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 md:w-6 md:h-6 text-[#fbbf24]" />
               </div>
               <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Sayıların Gizemi</h3>
               <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                  Rüyanızda beliren sayıların tesadüf olmadığını biliyor muydunuz? Yapay zeka, rüyanızdaki sembollerin numerolojik değerini hesaplar.
               </p>
               <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-[#fbbf24]" /> Şanslı sayı analizi</li>
                  <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-4 h-4 text-[#fbbf24]" /> Günlük numeroloji rehberi</li>
               </ul>
            </div>
         </div>

         {/* 2. Tarot */}
         <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-24">
            <div className="flex-1 w-full relative">
               <div className="relative aspect-video bg-[#0f172a] border border-pink-500/20 rounded-3xl p-8 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.1)]">
                  <div className="flex gap-4 items-center">
                     <div className="w-16 h-24 md:w-20 md:h-32 rounded-lg bg-pink-900/20 border border-pink-500/30 transform -rotate-6 translate-y-4"></div>
                     <div className="w-20 h-32 md:w-24 md:h-40 rounded-xl bg-gradient-to-b from-pink-500/20 to-purple-500/20 border border-pink-500 flex items-center justify-center z-10 shadow-xl">
                        <Layers className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
                     </div>
                     <div className="w-16 h-24 md:w-20 md:h-32 rounded-lg bg-pink-900/20 border border-pink-500/30 transform rotate-6 translate-y-4"></div>
                  </div>
                  <div className="absolute bottom-4 text-pink-400 text-[10px] md:text-xs font-bold tracking-widest uppercase">Geçmiş • Şimdi • Gelecek</div>
               </div>
            </div>
            <div className="flex-1 space-y-4 md:space-y-6">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
               </div>
               <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">Tarot Ritüeli</h3>
               <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                  Rüya yorumu bazen yetmeyebilir. Kartların bilgeliğine başvurun ve 3 kartlık açılım ile kaderinizi görün.
               </p>
            </div>
         </div>

         {/* 3. AI Vizyon */}
         <div className="flex flex-col md:flex-row items-center gap-8 md:gap-24">
            <div className="flex-1 w-full relative">
               <div className="relative aspect-video bg-[#0f172a] border border-emerald-500/20 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-black"></div>
                  <div className="absolute inset-0 opacity-50 blur-2xl bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.4),transparent_50%)] animate-pulse-slow"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-center">
                        <Palette className="w-10 h-10 md:w-12 md:h-12 text-emerald-400 mx-auto mb-2" />
                        <span className="text-emerald-200 text-[10px] md:text-xs uppercase tracking-widest">Görsel Oluşturuluyor...</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex-1 space-y-4 md:space-y-6">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
               </div>
               <h3 className="text-2xl md:text-3xl font-serif font-bold text-white">AI Vizyon</h3>
               <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                  Rüyanızdaki o bulanık sahneyi, yüksek çözünürlüklü bir sanat eserine dönüştürün.
               </p>
            </div>
         </div>
      </section>

      {/* SEMBOLLER KÜTÜPHANESİ */}
      <section id="sozluk" className="container mx-auto px-4 md:px-6 py-20 relative z-10 border-t border-white/5 bg-[#050510]">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Semboller Kütüphanesi</h2>
          <p className="text-gray-400 text-lg font-light">Kadim işaretlerin dilini çöz. Rüyandaki sembolü arat ve anlamını keşfet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/sozluk/ruyada-altin-gormek" className="group p-8 rounded-3xl bg-[#0f1020] border border-white/5 hover:border-[#fbbf24]/30 hover:bg-[#151525] transition-all duration-300 hover:-translate-y-2 flex flex-col items-start text-left">
             <div className="w-12 h-12 rounded-xl bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center mb-6 text-[#fbbf24] group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
             </div>
             <h3 className="font-serif text-xl font-bold text-[#fbbf24] mb-4 group-hover:text-white transition-colors">Rüyada Altın Görmek</h3>
             <p className="text-gray-400 text-sm leading-relaxed">Rüyada altın görmek, zenginlik, neşe ve dileklerin kabul olması anlamına gelir. Manevi aydınlanmayı da simgeler.</p>
          </Link>

          <Link href="/sozluk/ruyada-deniz-gormek" className="group p-8 rounded-3xl bg-[#0f1020] border border-white/5 hover:border-white/20 hover:bg-[#151525] transition-all duration-300 hover:-translate-y-2 flex flex-col items-start text-left">
             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-gray-400 group-hover:text-white transition-colors group-hover:scale-110">
                <Sparkles className="w-6 h-6" />
             </div>
             <h3 className="font-serif text-xl font-bold text-white mb-4">Rüyada Deniz Görmek</h3>
             <p className="text-gray-400 text-sm leading-relaxed">Rüyada deniz görmek, büyük bir kısmet, devlet kapısında iş veya derin duygusal dünyayı ifade eder.</p>
          </Link>

          <Link href="/sozluk/ruyada-dis-dokulmesi" className="group p-8 rounded-3xl bg-[#0f1020] border border-white/5 hover:border-white/20 hover:bg-[#151525] transition-all duration-300 hover:-translate-y-2 flex flex-col items-start text-left">
             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-gray-400 group-hover:text-white transition-colors group-hover:scale-110">
                <Sparkles className="w-6 h-6" />
             </div>
             <h3 className="font-serif text-xl font-bold text-white mb-4">Rüyada Diş Dökülmesi</h3>
             <p className="text-gray-400 text-sm leading-relaxed">Rüyada diş dökülmesi, güç kaybı, aile büyükleriyle ilgili endişeler veya hayatınızdaki köklü değişimleri simgeler.</p>
          </Link>

          <Link href="/sozluk/ruyada-ucmak" className="group p-8 rounded-3xl bg-[#0f1020] border border-white/5 hover:border-white/20 hover:bg-[#151525] transition-all duration-300 hover:-translate-y-2 flex flex-col items-start text-left">
             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-gray-400 group-hover:text-white transition-colors group-hover:scale-110">
                <Sparkles className="w-6 h-6" />
             </div>
             <h3 className="font-serif text-xl font-bold text-white mb-4">Rüyada Uçmak</h3>
             <p className="text-gray-400 text-sm leading-relaxed">Rüyada uçmak, özgürlük isteği, ruhsal yükseliş ve engelleri aşma başarısı olarak yorumlanır.</p>
          </Link>
        </div>

        <div className="text-center mt-12">
           <Link href="/sozluk" className="inline-flex items-center gap-2 text-sm font-bold text-[#fbbf24] hover:text-[#f59e0b] transition-colors border-b border-[#fbbf24]/30 pb-1 hover:border-[#fbbf24]">
              Tüm Sözlüğü İncele <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </section>

      {/* --- YENİ EKLENEN BÖLÜM: BLOG VİTRİNİ (ANA SAYFA İÇİN) --- */}
      {latestPosts.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 py-20 relative z-10 border-t border-white/5 bg-[#050510]">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
             <div className="text-left">
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Rüya Rehberi</h2>
                <p className="text-gray-400 text-lg font-light max-w-xl">
                  Bilinçaltının sırlarını, bilimsel ve manevi gerçekleri keşfedin.
                </p>
             </div>
             <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#fbbf24] transition-colors group">
                Tüm Yazılar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full">
                <article className="h-full bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden hover:border-[#fbbf24]/30 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  {/* Resim */}
                  <div className="aspect-video bg-black/50 relative overflow-hidden">
                    {post.image_url ? (
                      <img 
                        src={post.image_url} 
                        alt={post.title} 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                        <BookOpen className="w-10 h-10 text-white/10" />
                      </div>
                    )}
                  </div>
                  
                  {/* İçerik */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Calendar className="w-3 h-3 text-[#fbbf24]" />
                      {new Date(post.created_at).toLocaleDateString('tr-TR')}
                    </div>
                    
                    <h3 className="font-serif text-lg font-bold text-white mb-3 group-hover:text-[#fbbf24] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>

                    <span className="text-[#fbbf24] text-xs font-bold mt-auto uppercase tracking-wider flex items-center gap-1">
                      OKU <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 6. FİYATLANDIRMA */}
      <section id="paketler" className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-white">Kaderini Seç</h2>
          <p className="text-gray-400 text-sm">Ruhsal yolculuğunuzda size eşlik edecek rehberi belirleyin.</p>
        </div>
        {/* ... Paketler Grid aynı kaldı ... */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.id}
              className={`relative p-6 md:p-8 rounded-3xl border transition-all duration-300 flex flex-col h-full group ${
                plan.popular 
                  ? 'bg-gradient-to-b from-[#1e1b4b] to-[#0f172a] border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] md:scale-105 z-10' 
                  : plan.id === 'elite' 
                    ? 'bg-gradient-to-b from-[#2a1b05] to-[#0f172a] border-amber-500/30'
                    : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> En Çok Tercih Edilen
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                  plan.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : 
                  plan.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : 
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className={`text-lg md:text-xl font-bold ${plan.color === 'amber' ? 'text-amber-400' : 'text-white'}`}>{plan.name}</h3>
                  <div className="h-1 w-12 bg-white/10 rounded-full mt-1"></div>
                </div>
              </div>
              
              <div className="mb-6 p-4 rounded-2xl bg-black/20 border border-white/5">
                {plan.oldPrice && plan.price !== 'Ücretsiz' && (
                   <span className="text-gray-500 line-through text-xs md:text-sm block mb-1">Normal Fiyat: {plan.oldPrice}</span>
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
                onClick={() => handlePlanSelection(plan.id === 'free' ? 'free' : 'paid')}
                className={`w-full py-3 md:py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                  plan.id === 'free'
                    ? 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                    : plan.color === 'amber' 
                      ? 'bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black' 
                      : plan.color === 'blue' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
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

      {/* 7. SEO & BİLGİ ALANI */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative z-10 border-t border-white/5 bg-[#050510]">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Ana SEO Başlığı ve Giriş */}
          <div className="text-center space-y-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white tracking-tight">
              Türkiye'nin Gelişmiş <span className="text-[#fbbf24]">Yapay Zeka Destekli</span> Rüya Tabiri Platformu
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Rüya Yorumcum AI, sıradan bir rüya sözlüğü değildir. Klasik <strong>İslami rüya tabirleri</strong> (İmam Nablusi, İbn-i Sirin, Seyyid Süleyman) ile modern <strong>Jungiyen psikoloji</strong> prensiplerini birleştiren gelişmiş bir yapay zeka asistanıdır. Rüyalarınızın sadece "ne anlama geldiğini" değil, bilinçaltınızın size vermeye çalıştığı gizli mesajı analiz eder.
            </p>
          </div>

          {/* Detaylı Anahtar Kelime Alanı */}
          <div className="grid md:grid-cols-2 gap-8 text-sm text-gray-500">
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#fbbf24]" /> İslami ve Dini Rüya Tabirleri
              </h3>
              <p>
                Kadim kaynaklardan süzülen bilgilerle, rüyanızın manevi boyutunu keşfedin. <strong>Diyanet rüya tabirleri</strong> kaynaklarına uygun, sahih ve güvenilir yorumlarla içiniz ferahlasın. İstihare rüyaları, haberci rüyalar ve uyarıcı rüyaların ayrımını yapay zeka hassasiyetiyle yapın.
              </p>
            </div>

            <div className="space-y-4">
               <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#8b5cf6]" /> Psikolojik Rüya Analizi
              </h3>
              <p>
                Rüyalar sadece gelecekten haber vermez, aynı zamanda ruh halinizin aynasıdır. <strong>Rüyada düşmek, diş dökülmesi, yılan görmek</strong> veya uçmak gibi sık görülen sembollerin bilinçaltınızdaki karşılığını öğrenin. Kaygılarınızı, arzularınızı ve bastırılmış duygularınızı gün yüzüne çıkarın.
              </p>
            </div>
          </div>

          {/* SSS Tarzı Kısa Bilgi Kutusu */}
          <div className="bg-white/5 p-6 md:p-8 rounded-3xl border border-white/5">
            <h3 className="text-xl font-serif font-bold text-white mb-4">Neden Yapay Zeka ile Rüya Yorumu?</h3>
            <p className="text-gray-400 mb-4">
              Geleneksel sözlükler statiktir. Örneğin, "rüyada elma görmek" herkese aynı sonucu verir. Ancak <strong>Rüya Yorumcum AI</strong>, rüyanın bağlamını, sizin duygu durumunuzu ve rüyanın detaylarını (rengini, hissini, mekanını) analiz ederek size <strong>%100 kişiye özel</strong> bir yorum sunar.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Rüya Tabirleri', 'İslami Yorum', 'Psikolojik Analiz', 'Rüya Sözlüğü', 'Yapay Zeka'].map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/5">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}