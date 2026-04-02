"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  Star, Moon, Sun, ArrowRight, Compass, Zap, Globe, 
  Clock, CheckCircle2, BrainCircuit, ChevronRight, 
  ScanLine, Cpu, ArrowDown, Loader2
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
      "description": "Güncel NASA efemeris verileriyle en hassas ve ücretsiz doğum haritası hesaplama. Yükselen burç, ay burcu, transit gezegenler ve detaylı astrolojik analiz.",
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
    <main className="min-h-screen font-sans relative overflow-hidden transition-colors duration-300">
      <Script id="astro-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(astroSchema) }} />
      
      {/* Arka Plan Işıkları (Sade ve zarif) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-stone-300/20 dark:bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0 transform-gpu"></div>

      {/* ================= 1. HERO SECTION (EDİTORYAL & CİDDİ) ================= */}
      <section className="relative pt-32 md:pt-48 pb-16 px-4 md:px-6 z-10 min-h-[85vh] flex items-center border-b border-stone-200 dark:border-stone-800/50">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* SOL: COPYWRITING */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-[10px] md:text-xs font-mono uppercase tracking-widest bg-[#faf9f6]/50 dark:bg-stone-900/50 backdrop-blur-sm">
              <ScanLine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" /> NASA Efemeris Motoru
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1.1] text-stone-900 dark:text-stone-50 tracking-tight">
              Yıldızların Diliyle <br/>
              <span className="text-stone-500 dark:text-stone-400 font-normal italic">
                Kaderinizi Okuyun.
              </span>
            </h1>
            
            <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif leading-relaxed max-w-lg mx-auto lg:mx-0">
              Gerçek astroloji matematiksel bir disiplindir. Evrensel gökyüzü koordinatlarını kullanarak doğum anınızın hassas haritasını ve yükselen burcunuzu anında hesaplıyoruz.
            </p>

            <div className="flex justify-center lg:justify-start pt-4">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-sm transition-all flex items-center justify-center gap-2 group shadow-sm"
              >
                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" /> Haritayı Çıkar
              </button>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest border-t border-stone-200 dark:border-stone-800 mt-8">
               <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Detaylı Algoritma</span>
               <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Tam Enlem/Boylam</span>
            </div>
          </div>

          {/* SAĞ: GERÇEKÇİ UI MOCKUP (Klasik Rapor Formu) */}
          <div className="lg:col-span-6 relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[500px] mt-4 lg:mt-0 px-2 md:px-0">
             
             {/* Üstteki Veri Kutusu (Evrak hissi) */}
             <div className="absolute -top-4 left-4 md:-left-6 right-10 md:right-16 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 p-5 md:p-6 rounded-xl z-30 shadow-xl shadow-stone-200/50 dark:shadow-black/20">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Kozmik Koordinat Girdisi</span>
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                 </div>
                 <div className="flex justify-between items-end">
                    <p className="text-stone-800 dark:text-stone-200 font-mono text-xs leading-loose">
                       DOĞUM TARİHİ : 14.08.1995 <br/>
                       SAAT         : 04:20 AM <br/>
                       LOKASYON     : İZMİR, TR (38.42° N, 27.14° E)
                    </p>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">ŞİFRELENDİ</span>
                 </div>
             </div>

             {/* Ana Görsel Çerçevesi (Klasik Astroloji Haritası) */}
             <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-2xl h-full bg-stone-100 dark:bg-stone-900 group mt-8 md:mt-0">
                <img 
                   src="https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?q=80&w=1000&auto=format&fit=crop" 
                   alt="Astrology Chart" 
                   className="w-full h-full object-cover mix-blend-luminosity opacity-40 group-hover:scale-105 group-hover:opacity-60 transition-all duration-[2s]"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] dark:from-stone-950 via-transparent to-transparent opacity-90"></div>
                
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                         <Loader2 className="w-4 h-4 animate-spin" />
                         <span className="text-[11px] font-bold uppercase tracking-wider">Yükselen (ASC) Hesaplanıyor...</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500">92%</span>
                   </div>
                   <div className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 dark:bg-amber-600 w-[92%] relative"></div>
                   </div>
                   <div className="hidden md:flex justify-between items-center text-[9px] font-mono text-stone-500 dark:text-stone-400 uppercase mt-2 border-t border-stone-200 dark:border-stone-800 pt-3">
                      <span>Ev Sistemi: Placidus</span>
                      <span>Transit Algoritması: Aktif</span>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* --- REKLAM 1 --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 z-10 relative">
          <p className="text-center text-[9px] text-stone-400 dark:text-stone-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu Bağlantı</p>
          <AdUnit slot="8565155493" format="auto" />
      </div>

      {/* ================= 2. TRANSİT & GÜNLÜK YORUM (Kitap Tadında) ================= */}
      <section className="py-24 relative z-10 border-y border-stone-200 dark:border-stone-800/50">
         <div className="container mx-auto px-6 max-w-5xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                  <span className="text-stone-400 dark:text-stone-500 font-serif italic text-xl">Aşama I</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50">
                     Gerçek Burç Yorumu Nedir?
                  </h2>
                  <div className="space-y-6 text-stone-600 dark:text-stone-400 leading-relaxed text-base">
                     <p>
                        İnternette okuduğunuz genel yorumlar, sizi 12 basmakalıp karaktere böler. Gerçek astroloji ise gökyüzündeki anlık gezegen konumlarının (Transitler), sizin doğum haritanızdaki <strong>tam dereceye</strong> yaptığı matematiksel açıları inceler.
                     </p>
                     
                     <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
                        <h4 className="text-stone-900 dark:text-stone-100 font-bold text-sm mb-3 flex items-center gap-2">
                           <BrainCircuit className="w-4 h-4 text-amber-600 dark:text-amber-500" /> Algoritmik Analiz
                        </h4>
                        <p className="text-sm">
                           Sistemimiz, Güneş'in ötesine geçerek Mars'ın öfkenizi, Venüs'ün ilişkilerinizi bugün nasıl etkilediğini "Açı (Aspect)" bazlı hesaplayarak size tamamen şahsi bir rapor sunar.
                        </p>
                     </div>
                  </div>
              </div>
              
              <div className="relative order-1 lg:order-2">
                  <div className="relative bg-[#faf9f6] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 shadow-xl shadow-stone-200/50 dark:shadow-black/20">
                     <div className="flex justify-between items-center mb-8 border-b border-stone-200 dark:border-stone-800 pb-6">
                        <div className="space-y-1.5">
                           <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Sistem Çıktısı</div>
                           <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">Anlık Transitler</div>
                        </div>
                        <Clock className="w-5 h-5 text-stone-400"/>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                           <CheckCircle2 className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                           <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed"><span className="text-stone-900 dark:text-stone-200 font-bold">Trine (120°):</span> Transit Jüpiter ile Natal Venüs uyumu. İkili ilişkilerde ve finansal kararlarda şans kapıları aralanıyor.</p>
                        </div>
                        <div className="flex gap-4 p-4 rounded-lg bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                           <Zap className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                           <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed"><span className="text-stone-900 dark:text-stone-200 font-bold">Square (90°):</span> Transit Mars gerilimi. Otorite figürleriyle olan iletişiminizde ani çıkışlardan kaçının.</p>
                        </div>
                     </div>
                  </div>
              </div>
            </div>
         </div>
      </section>

      {/* --- REKLAM 2 --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-12 z-10 relative">
          <p className="text-center text-[9px] text-stone-400 dark:text-stone-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu Bağlantı</p>
          <AdUnit slot="4542150009" format="fluid" />
      </div>

      {/* ================= 3. ÜÇ ANA SÜTUN & ZODYAK ================= */}
      <section className="relative z-10 py-12">
         <div className="max-w-5xl mx-auto px-6 mb-24 text-center">
             <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-6">
                Kozmik Şifreniz
             </h2>
             <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif leading-relaxed max-w-2xl mx-auto">
                Sadece Güneş burcunuzu bilmek, hikayenin sadece kapağını okumaktır. Kişiliğinizin asıl derinliği bu üç ana sütun üzerine inşa edilmiştir.
             </p>
         </div>

         <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
             <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800">
                 <Sun className="w-6 h-6 text-amber-500 mb-6"/>
                 <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">Güneş Burcu</h3>
                 <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Egonuzu, bilinçli kimliğinizi ve yaşam amacınızı temsil eder. Topluma gösterdiğiniz temel iradedir.</p>
             </div>
             
             {/* Odak Noktası: Yükselen */}
             <div className="bg-[#faf9f6] dark:bg-stone-950 p-10 rounded-2xl border-2 border-stone-300 dark:border-stone-700 shadow-xl shadow-stone-200/50 dark:shadow-black/30 relative">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">En Önemli Kilit</div>
                 <Compass className="w-6 h-6 text-stone-800 dark:text-stone-300 mb-6"/>
                 <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">Yükselen (ASC)</h3>
                 <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Birinci evinizin yöneticisidir. İnsanlardaki ilk izleniminizi, dış görünüşünüzü ve hayata taktığınız maskeyi belirler.</p>
             </div>
             
             <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800">
                 <Moon className="w-6 h-6 text-stone-400 mb-6"/>
                 <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">Ay Burcu</h3>
                 <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Bilinçaltınızı, duygusal ihtiyaçlarınızı ve içgüdülerinizi yönetir. Kapılar kapandığındaki gerçek sizdir.</p>
             </div>
         </div>

         {/* ZODYAK TABLOSU (Ansiklopedi Tadında) */}
         <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10 border-b border-stone-200 dark:border-stone-800 pb-4">
               <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">Zodyak Fihristi</h2>
               <Link href="/dashboard/astroloji" className="text-stone-500 font-bold hover:text-stone-900 dark:hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest text-[10px]">
                   Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
               </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ZODIAC_SIGNS.map((sign) => (
                    <div key={sign.name} className="group p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 transition-colors relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-5xl opacity-[0.03] dark:opacity-5 font-serif text-stone-900 dark:text-white group-hover:opacity-10 transition-opacity">{sign.symbol}</div>
                        <span className="text-2xl block mb-3 text-stone-800 dark:text-stone-200">{sign.symbol}</span>
                        <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-1">{sign.name}</h3>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-4">{sign.date}</p>
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 border-t border-stone-200 dark:border-stone-800 pt-3">
                            <Globe className="w-3.5 h-3.5"/> {sign.planet}
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* --- REKLAM 3 --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-16 z-10 relative border-t border-stone-200 dark:border-stone-800 mt-20">
          <p className="text-center text-[9px] text-stone-400 dark:text-stone-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu İçerik</p>
          <AdUnit slot="4542150009" format="fluid" />
      </div>

      {/* ================= 4. SEO MAKALESİ (Editoryal Dergi Stili) ================= */}
      <section className="py-16 px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-12 text-center">
            Astroloji Rehberi: Harita Çıkarma
         </h2>
         
         <div className="space-y-12 text-stone-600 dark:text-stone-400 font-serif text-base md:text-lg leading-relaxed">
            
            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans">
                  Ücretsiz Doğum Haritası Analizi
               </h3>
               <p>
                  <strong>Doğum haritası (Natal Chart)</strong>, dünyaya geldiğiniz tam tarih, saat ve coğrafi konuma göre gökyüzündeki gezegenlerin, burçların ve evlerin dizilimini gösteren şemadır. Birçok kişi arama motorlarında <strong>"ücretsiz doğum haritası hesaplama"</strong> terimini aratarak karakterlerinin derinliklerini keşfetmek ister. 
               </p>
               <p>
                  Sistemimiz, basit burç yorumlarının aksine NASA efemeris verilerini kullanarak gezegenlerin (Venüs, Mars, Jüpiter vb.) milimetrik derecelerini hesaplar. Bu harita; kariyer potansiyelinizi, finansal fırsatlarınızı ve ilişkilerdeki şablonlarınızı net bir şekilde ortaya koyar.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans">
                  Yükselen Burç Nedir? Neden Kilit Rol Oynar?
               </h3>
               <p>
                  Astrolojide en çok merak edilen <strong>"Yükselen burcum ne?"</strong> sorusudur. Yükselen burç (Ascendant), doğum anınızda ufuk çizgisinde yükselmekte olan burçtur. 
               </p>
               <p>
                  Halk arasında yükselen burcun sadece "30 yaşından sonra" etkili olduğu yönünde yanlış bir inanış vardır. Gerçekte yükselen burcunuz; dış görünüşünüzü, maskenizi ve hayata karşı geliştirdiğiniz savunma mekanizmasını ilk andan itibaren belirler.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans">
                  Ay Burcu Hesaplama ve İç Dünyamız
               </h3>
               <p>
                  Güneş burcunuz iradenizi, <strong>Ay burcu</strong> ise duygularınızı ve tepkilerinizi temsil eder. Özellikle ilişkilerde, kriz anlarında ve anne ile olan ilişkinizde Ay burcunuzun yerleşimi devreye girer. Algoritmamız sayesinde bilinçaltınızın yöneticisi olan Ay burcunuzu da detaylıca raporluyoruz.
               </p>
            </article>

         </div>
      </section>

      {/* REKLAM 4 */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-8 mb-24 z-10 relative">
          <p className="text-center text-[10px] text-stone-400 dark:text-stone-600 mb-4 uppercase tracking-widest font-bold">Önerilen İçerikler</p>
          <AdUnit slot="6481917633" format="autorelaxed" />
      </div>

      {/* ================= ALT BİTİRİŞ ================= */}
      <section className="py-16 text-center border-t border-stone-200 dark:border-stone-800/50 relative z-10">
         <div className="container mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-stone-50 mb-8">Göklerin Dilini Keşfedin.</h2>
            <Link href="#top" className="inline-flex items-center justify-center p-4 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:border-stone-400 transition-all shadow-sm">
               <ArrowDown className="w-5 h-5" />
            </Link>
         </div>
      </section>

    </main>
  );
}