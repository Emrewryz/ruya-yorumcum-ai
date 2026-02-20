"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  Star, Moon, Sun, Sparkles, 
  ArrowRight, Compass, Zap, Globe, 
  Clock, HelpCircle, CheckCircle2, BrainCircuit,
  ChevronRight, ScanLine, Cpu, ArrowDown,Loader2
} from "lucide-react";
import Script from "next/script";
import AdUnit from "@/components/AdUnit";

// --- SEO SCHEMA ---
const astroSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Ücretsiz Doğum Haritası ve Yükselen Burç Hesaplama - Rüya Yorumcum AI",
      "description": "2026 güncel NASA efemeris verileriyle en hassas ve ücretsiz doğum haritası hesaplama. Yükselen burç, ay burcu, transit gezegenler ve detaylı astrolojik analiz.",
      "url": "https://ruyayorumcum.com/astroloji"
    },
    {
      "@type": "Article",
      "headline": "Doğum Haritası Nasıl Hesaplanır? Yükselen ve Ay Burcu Rehberi",
      "description": "Gerçek astroloji, yükselen burç özellikleri, ay burcu hesaplama ve gezegen transitlerinin günlük hayata etkileri hakkında kapsamlı rehber.",
      "author": { "@type": "Organization", "name": "Rüya Yorumcum AI" }
    }
  ]
};

const ZODIAC_SIGNS = [
  { name: "Koç", date: "21 Mart - 19 Nisan", element: "Ateş", symbol: "♈", planet: "Mars" },
  { name: "Boğa", date: "20 Nisan - 20 Mayıs", element: "Toprak", symbol: "♉", planet: "Venüs" },
  { name: "İkizler", date: "21 Mayıs - 20 Haziran", element: "Hava", symbol: "♊", planet: "Merkür" },
  { name: "Yengeç", date: "21 Haziran - 22 Temmuz", element: "Su", symbol: "♋", planet: "Ay" },
  { name: "Aslan", date: "23 Temmuz - 22 Ağustos", element: "Ateş", symbol: "♌", planet: "Güneş" },
  { name: "Başak", date: "23 Ağustos - 22 Eylül", element: "Toprak", symbol: "♍", planet: "Merkür" },
  { name: "Terazi", date: "23 Eylül - 22 Ekim", element: "Hava", symbol: "♎", planet: "Venüs" },
  { name: "Akrep", date: "23 Ekim - 21 Kasım", element: "Su", symbol: "♏", planet: "Plüton" },
  { name: "Yay", date: "22 Kasım - 21 Aralık", element: "Ateş", symbol: "♐", planet: "Jüpiter" },
  { name: "Oğlak", date: "22 Aralık - 19 Ocak", element: "Toprak", symbol: "♑", planet: "Satürn" },
  { name: "Kova", date: "20 Ocak - 18 Şubat", element: "Hava", symbol: "♒", planet: "Uranüs" },
  { name: "Balık", date: "19 Şubat - 20 Mart", element: "Su", symbol: "♓", planet: "Neptün" },
];

export default function AstrologyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, [supabase.auth]);

  const handleStart = () => {
    if (user) {
      router.push('/dashboard/astroloji/dogum-haritasi');
    } else {
      router.push('/auth?redirect=/dashboard/astroloji/dogum-haritasi');
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans selection:bg-indigo-500/30 pb-20 overflow-x-hidden relative scroll-smooth">
      <Script id="astro-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(astroSchema) }} />
      
      {/* --- ATMOSFER --- */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      
      {/* Arka Plan Işıkları (Astroloji Tonlaması: Derin İndigo / Gece Mavisi) */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px]"></div>
      </div>

      {/* ================= 1. HERO SECTION (FÜTÜRİSTİK & MAT TASARIM) ================= */}
      <section className="relative pt-32 md:pt-48 pb-16 px-4 md:px-6 z-10 min-h-[85vh] flex items-center">
        <div className="container mx-auto max-w-7xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* SOL: COPYWRITING (Minimal & Profesyonel) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 text-[10px] md:text-xs font-mono uppercase tracking-widest shadow-xl">
              <ScanLine className="w-3.5 h-3.5 text-indigo-400" /> Ephemeris Sync v3
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-white tracking-tight">
              Yıldızların Diliyle <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-400 to-indigo-500">
                Kaderinizi Okuyun.
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              Gerçek astroloji matematiksel bir disiplindir. NASA gökyüzü koordinatlarını kullanarak doğum anınızın mikroskobik haritasını ve yükselen burcunuzu saniyeler içinde hesaplıyoruz.
            </p>

            <div className="flex justify-center lg:justify-start pt-2">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-indigo-500/30 transition-colors flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm group"
              >
                <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-500" /> Haritayı Hesapla
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest border-t border-white/5 mt-6">
               <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-slate-600" /> Yapay Zeka Yorumu</span>
               <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-slate-600" /> Tam Enlem/Boylam</span>
            </div>
          </div>

          {/* SAĞ: GERÇEKÇİ UI MOCKUP (Astrological Engine) */}
          <div className="lg:col-span-6 relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[500px] perspective-1000 mt-4 lg:mt-0 px-2 md:px-0">
             
             {/* Üstteki Veri Kutusu */}
             <div className="absolute -top-4 left-4 md:-left-6 right-10 md:right-16 bg-[#131722]/90 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-2xl z-30 shadow-2xl">
                 <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Girdi Verisi (Koordinat)</span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 </div>
                 <div className="flex justify-between items-end">
                    <p className="text-slate-300 font-mono text-xs leading-relaxed">
                       Tarih: 14.08.1995 <br/>
                       Saat: 04:20 AM <br/>
                       Konum: İzmir, TR
                    </p>
                    <span className="text-[10px] text-indigo-400 font-mono border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 rounded">Locked</span>
                 </div>
             </div>

             {/* Ana Görsel Çerçevesi (Uzay / Yıldız Haritası) */}
             <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.1)] h-full bg-[#0B0F19] group mt-8 md:mt-0">
                <img 
                   src="https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?q=80&w=1000&auto=format&fit=crop" 
                   alt="Astrology Cosmos Calculation" 
                   className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-[2s] hue-rotate-[240deg] saturate-50"
                />
                
                {/* Teknolojik Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-90"></div>
                
                <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-3">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                         <span className="text-[10px] font-mono text-white tracking-wider">Ascendant Tespiti Yapılıyor...</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">92%</span>
                   </div>
                   <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[92%] relative">
                         <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_ease-in-out_infinite]"></div>
                      </div>
                   </div>
                   <div className="hidden md:flex justify-between items-center text-[8px] font-mono text-slate-500 uppercase mt-1 border-t border-white/5 pt-2">
                      <span>Ev Sistemi: Placidus</span>
                      <span>Transit: Real-Time</span>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* --- REKLAM 1: HERO ALTI --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 z-10 relative border-t border-white/5">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="8565155493" format="auto" />
      </div>

      {/* ================= 2. TRANSİT & GÜNLÜK YORUM (Teknik Vurgu) ================= */}
      <section className="py-20 bg-[#131722]/30 border-y border-white/5 relative z-10">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 order-2 lg:order-1">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white flex items-center gap-3">
                     Gerçek Burç Yorumu Nedir?
                  </h2>
                  <div className="space-y-5 text-slate-400 leading-relaxed text-sm md:text-base font-light">
                     <p>
                        İnternette okuduğunuz genel yorumlar, sizi 12 basmakalıp karaktere böler. Gerçek astroloji ise gökyüzündeki anlık gezegen konumlarının (Transitler), sizin doğum haritanızdaki <strong>tam dereceye</strong> yaptığı matematiksel açıları inceler.
                     </p>
                     
                     <div className="bg-[#0B0F19] p-5 rounded-2xl border border-white/5 shadow-xl">
                        <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                           <BrainCircuit className="w-4 h-4 text-indigo-400" /> Algoritmik Analiz
                        </h4>
                        <p className="text-xs">
                           Sistemimiz, Güneş'in ötesine geçerek Mars'ın öfkenizi, Venüs'ün ilişkilerinizi bugün nasıl etkilediğini "Açı (Aspect)" bazlı hesaplayarak size özel, benzersiz bir rapor sunar.
                        </p>
                     </div>
                  </div>
              </div>
              
              <div className="relative order-1 lg:order-2">
                  <div className="absolute inset-0 bg-indigo-500/5 rounded-[2rem] blur-2xl"></div>
                  <div className="relative bg-[#0B0F19] border border-white/5 rounded-[2rem] p-6 shadow-2xl">
                     <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                        <div className="space-y-1">
                           <div className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest">Sistem Çıktısı</div>
                           <div className="text-lg font-bold text-white">Anlık Transitler</div>
                        </div>
                        <Clock className="w-5 h-5 text-indigo-400 animate-pulse"/>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                           <p className="text-xs text-slate-400 leading-relaxed"><span className="text-white font-bold">Trine (120°):</span> Transit Jüpiter ile Natal Venüs uyumu. Finansal şans kapıları açılıyor.</p>
                        </div>
                        <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                           <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                           <p className="text-xs text-slate-400 leading-relaxed"><span className="text-white font-bold">Square (90°):</span> Transit Mars gerilimi. Otorite figürleriyle iletişimde sakin kalın.</p>
                        </div>
                     </div>
                  </div>
              </div>
            </div>
         </div>
      </section>

      {/* --- REKLAM 2: BÖLÜM ARASI --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-12 z-10 relative">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="4542150009" format="fluid" />
      </div>

      {/* ================= 3. ÜÇ ANA SÜTUN & ZODYAK ================= */}
      <section className="relative z-10">
         <div className="max-w-5xl mx-auto px-4 md:px-6 mb-20 text-center">
             <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-5">
                Kozmik <span className="text-indigo-400">DNA'nız</span>
             </h2>
             <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto">
                Sadece Güneş burcunuzu bilmek, buzdağının sadece ucunu görmektir. Kişiliğinizin asıl haritası bu üç ana sütun üzerine kuruludur.
             </p>
         </div>

         <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
             <div className="bg-[#131722] p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                 <Sun className="w-6 h-6 text-amber-500 mb-4"/>
                 <h3 className="text-lg font-bold text-white mb-2">Güneş Burcu</h3>
                 <p className="text-xs text-slate-400 font-light leading-relaxed">Egonuzu, bilinçli kimliğinizi ve yaşam amacınızı temsil eder. Topluma gösterdiğiniz iradedir.</p>
             </div>
             <div className="bg-[#131722] p-8 rounded-[1.5rem] border border-indigo-500/30 shadow-2xl relative transform md:-translate-y-4">
                 <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">En Önemli</div>
                 <Compass className="w-6 h-6 text-indigo-400 mb-4"/>
                 <h3 className="text-lg font-bold text-white mb-2">Yükselen (ASC)</h3>
                 <p className="text-xs text-slate-400 font-light leading-relaxed">Birinci evinizin yöneticisidir. İnsanlardaki ilk izleniminizi, fiziğinizi ve hayat maskenizi belirler.</p>
             </div>
             <div className="bg-[#131722] p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                 <Moon className="w-6 h-6 text-slate-300 mb-4"/>
                 <h3 className="text-lg font-bold text-white mb-2">Ay Burcu</h3>
                 <p className="text-xs text-slate-400 font-light leading-relaxed">Bilinçaltınızı ve duygusal güvenlik ihtiyacınızı yönetir. Yalnız kaldığınızdaki gerçek sizdir.</p>
             </div>
         </div>

         {/* ZODYAK TABLOSU */}
         <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
               <h2 className="text-2xl font-serif font-bold text-white">Zodyak Çemberi</h2>
               <Link href="/dashboard/astroloji" className="text-indigo-400 font-bold hover:text-white transition-all flex items-center gap-1.5 text-xs">
                   Hesapla <ChevronRight className="w-3.5 h-3.5" />
               </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ZODIAC_SIGNS.map((sign) => (
                    <div key={sign.name} className="group p-5 bg-[#131722] rounded-2xl border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden">
                        <div className="absolute top-2 right-2 text-4xl opacity-5 font-serif text-white group-hover:opacity-10 transition-opacity">{sign.symbol}</div>
                        <span className="text-2xl block mb-2">{sign.symbol}</span>
                        <h3 className="text-base font-bold text-white mb-0.5">{sign.name}</h3>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">{sign.date}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 border-t border-white/5 pt-2">
                            <Globe className="w-3 h-3"/> {sign.planet}
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* --- REKLAM 3: BÖLÜM ARASI --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-12 z-10 relative">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="4542150009" format="fluid" />
      </div>

      {/* ================= 4. DEV SEO MAKALESİ ================= */}
      <section className="py-12 px-4 md:px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-10 border-b border-white/10 pb-6">
            Astroloji Rehberi: Doğum Haritası Nedir ve Nasıl Hesaplanır?
         </h2>
         
         <div className="space-y-12 text-slate-400 font-light leading-relaxed text-sm md:text-base">
            
            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-400"/> Ücretsiz Doğum Haritası Çıkarma
               </h3>
               <p>
                  <strong>Doğum haritası (Natal Chart)</strong>, dünyaya geldiğiniz tam tarih, saat ve coğrafi konuma göre gökyüzündeki gezegenlerin, burçların ve evlerin dizilimini gösteren şemadır. Birçok kişi arama motorlarında <strong>"ücretsiz doğum haritası hesaplama"</strong> veya <strong>"astroloji haritası çıkar"</strong> terimlerini aratarak karakterlerinin derinliklerini keşfetmek ister. 
               </p>
               <p>
                  Sistemimiz, sıradan sitelerin aksine NASA efemeris verilerini kullanarak gezegenlerin (Venüs, Mars, Jüpiter vb.) milimetrik derecelerini ve ev yerleşimlerini hesaplar. Bu harita, sizin bu hayattaki potansiyel yeteneklerinizi, finansal şansınızı ve aşk hayatınızdaki eğilimleri net bir şekilde ortaya koyar.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400"/> Yükselen Burç Nedir? Neden Çok Önemlidir?
               </h3>
               <p>
                  Astrolojide en çok merak edilen konulardan biri <strong>"Yükselen burcum ne?"</strong> sorusudur. Yükselen burç (Ascendant), doğum anınızda doğu ufkunda yükselen burçtur ve hesaplanması için doğum saati kesinlikle gereklidir. 
               </p>
               <p>
                  Halk arasında yükselen burcun "30 yaşından sonra etkili olduğu" yönünde yaygın ama yanlış bir inanç vardır. Oysa yükselen burcunuz, hayata geliş anınızdan itibaren fiziksel görünümünüzü, insanlarda bıraktığınız ilk izlenimi ve hayat motivasyonunuzu belirler.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-400"/> Ay Burcu Hesaplama ve Bilinçaltı
               </h3>
               <p>
                  Güneş burcunuz mantığınızı, <strong>Ay burcu</strong> ise kalbinizi ve içgüdülerinizi temsil eder. Özellikle ilişkilerde ve zor kararlar alırken Ay burcunuzun element özellikleri devreye girer. Sistemimiz sayesinde, sadece güneş burcunuzu değil, bilinçaltınızın yöneticisi olan Ay burcunuzu da detaylıca öğrenebilirsiniz.
               </p>
            </article>

         </div>
      </section>

      {/* REKLAM 4: İÇERİK SONU MULTIPLEX */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-4 mb-20 z-10 relative">
          <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-bold">İlginizi Çekebilir</p>
          <AdUnit slot="6481917633" format="autorelaxed" />
      </div>

      {/* ================= ALT BİTİRİŞ (Minimalist) ================= */}
      <section className="py-12 text-center border-t border-white/5 relative z-10">
         <div className="container mx-auto px-4">
            <h2 className="font-serif text-xl md:text-2xl text-slate-400 mb-4">Göklerin Dilini Keşfedin.</h2>
            <Link href="#top" className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
               <ArrowDown className="w-5 h-5 animate-bounce" />
            </Link>
         </div>
      </section>

    </main>
  );
}