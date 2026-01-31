"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Star, Moon, Sun, MapPin, Sparkles, 
  ArrowRight, Compass, Zap, Globe, 
  Search, BookOpen, Clock, HelpCircle, ChevronDown, CheckCircle2
} from "lucide-react";
import Script from "next/script";

// --- SEO SCHEMA (Article + FAQ) ---
const astroSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Ücretsiz Doğum Haritası ve Yükselen Burç Hesaplama - Rüya Yorumcum",
      "description": "2024 güncel NASA verileriyle en detaylı doğum haritası (natal chart) ve yükselen burç hesaplama aracı. Günlük transit yorumları ve astrolojik analiz.",
      "url": "https://ruyayorumcum.com/astroloji"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Doğum haritası hesaplamak için saat şart mı?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Kesin bir yükselen burç (Ascendant) ve ev yerleşimi (House System) analizi için doğum saati şarttır. Saatsiz haritalarda sadece Güneş ve Ay burcu tahmin edilebilir."
          }
        },
        {
          "@type": "Question",
          "name": "Yükselen burç neyi etkiler?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yükselen burç, dış dünyaya gösterdiğiniz yüzü, fiziksel görünüşünüzü ve hayat motivasyonunuzu belirler. 30 yaşından sonra değil, doğduğunuz andan itibaren etkilidir."
          }
        },
        {
          "@type": "Question",
          "name": "Transit harita nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Transit harita, şu an gökyüzündeki gezegenlerin, sizin doğduğunuz andaki gezegenlere yaptığı açıları gösterir. Günlük burç yorumları bu transitlere göre yapılır."
          }
        }
      ]
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
  { name: "Akrep", date: "23 Ekim - 21 Kasım", element: "Su", symbol: "♏", planet: "Plüton/Mars" },
  { name: "Yay", date: "22 Kasım - 21 Aralık", element: "Ateş", symbol: "♐", planet: "Jüpiter" },
  { name: "Oğlak", date: "22 Aralık - 19 Ocak", element: "Toprak", symbol: "♑", planet: "Satürn" },
  { name: "Kova", date: "20 Ocak - 18 Şubat", element: "Hava", symbol: "♒", planet: "Uranüs/Satürn" },
  { name: "Balık", date: "19 Şubat - 20 Mart", element: "Su", symbol: "♓", planet: "Neptün/Jüpiter" },
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
  }, []);

  const handleStart = () => {
    if (user) {
      router.push('/dashboard/astroloji/dogum-haritasi');
    } else {
      router.push('/auth?redirect=/dashboard/astroloji/dogum-haritasi');
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-gray-300 font-sans selection:bg-purple-500/30 pb-24">
      
      <Script
        id="astro-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(astroSchema) }}
      />

      {/* --- HEADER (Minimal & Otoriter) --- */}
      <header className="relative pt-32 pb-20 border-b border-white/5 bg-[#050a1f] overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
         {/* Dekoratif Glow */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

         <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
             <div className="inline-flex items-center gap-2 mb-6 text-purple-400 font-bold text-xs tracking-[0.2em] uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                <Compass className="w-4 h-4" /> Profesyonel Astroloji Yazılımı
             </div>
             <h1 className="font-serif text-4xl md:text-7xl font-bold text-white mb-6 leading-[1.1]">
                Doğum Haritası ve <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                   Yükselen Burç Hesaplama
                </span>
             </h1>
             <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
                Astroloji, bir inanç değil; gökyüzü matematiğidir. NASA efemeris verileriyle gezegenlerin anlık konumunu hesaplayın, 
                kişiliğinizin DNA'sını çözün. %100 Ücretsiz ve detaylı analiz.
             </p>
             
             <button 
                onClick={handleStart}
                className="px-10 py-4 bg-white text-purple-950 font-bold text-lg rounded-full hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all flex items-center gap-3 mx-auto"
             >
                <Sparkles className="w-5 h-5"/> Haritamı Hemen Hesapla
             </button>
         </div>
      </header>

      {/* --- ANA İÇERİK (Makale Formatı) --- */}
      <article className="container mx-auto px-6 max-w-6xl mt-20 space-y-32">
         
         {/* BÖLÜM 1: GÜNLÜK BURÇ NEDİR? (SEO: Günlük Transitler) */}
         <section className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
                 <h2 className="text-3xl md:text-4xl font-serif font-bold text-white flex items-center gap-3">
                    <Sun className="w-8 h-8 text-yellow-500" />
                    Gerçek "Günlük Burç" Nasıl Hesaplanır?
                 </h2>
                 <div className="prose prose-lg prose-invert text-gray-400 leading-8">
                    <p>
                        Çoğu astroloji sitesinde okuduğunuz "Koçlar bugün şanslı" gibi yorumlar, sadece Güneş Burcu baz alınarak yazılmış genel ifadelerdir. Buna "Gazete Astrolojisi" denir ve doğruluk payı düşüktür.
                    </p>
                    <p>
                        <strong>Bilimsel Astroloji</strong> ise "Transit Haritası"na dayanır. Yani; şu an gökyüzünde süzülen <em>Transit Mars</em>'ın, sizin 1990 yılında doğduğunuz andaki <em>Natal Venüs</em>'ünüze yaptığı matematiksel açıyı (Trine, Square, Opposition) hesaplamaktır.
                    </p>
                    <div className="bg-[#0f172a] p-6 rounded-2xl border-l-4 border-purple-500 my-6">
                        <h4 className="text-white font-bold mb-2">Rüya Yorumcum Farkı:</h4>
                        <p className="text-sm">
                            Biz fal bakmıyoruz. Algoritmamız, doğum saatiniz ve koordinatlarınızla size özel bir gökyüzü haritası çıkarır. Milyonlarca olasılık arasından, sadece o gün sizi etkileyen gezegen kombinasyonunu yapay zeka ile yorumlar.
                        </p>
                    </div>
                 </div>
                 <button onClick={handleStart} className="text-purple-400 font-bold flex items-center gap-2 hover:gap-4 transition-all">
                    Bugünkü Özel Transitlerini Gör <ArrowRight className="w-4 h-4"/>
                 </button>
             </div>
             
             {/* Görsel / Grafik Alanı */}
             <div className="relative group cursor-default">
                 <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-600/20 rounded-[3rem] blur-3xl group-hover:blur-[100px] transition-all duration-1000"></div>
                 <div className="relative bg-[#0B0F1F] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                     <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                        <div>
                            <div className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">Transit Analizi</div>
                            <div className="text-2xl font-bold text-white">21 Ekim 2026</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-purple-400"/>
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-col items-center gap-1 hidden sm:flex">
                                <div className="w-px h-full bg-white/10"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-[#0B0F1F]"></div>
                                <div className="w-px h-full bg-white/10"></div>
                            </div>
                            <div>
                                <h4 className="text-green-400 font-bold text-sm mb-1 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4"/> Transit Jüpiter △ Natal Güneş (120°)
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Bugün şans gezegeni Jüpiter, yaşam enerjinizi temsil eden Güneş'e destek veriyor. İş görüşmeleri, finansal yatırımlar veya yeni başlangıçlar için yılın en verimli günlerinden biri.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-col items-center gap-1 hidden sm:flex">
                                <div className="w-px h-full bg-white/10"></div>
                                <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-[#0B0F1F]"></div>
                                <div className="w-px h-full bg-white/10"></div>
                            </div>
                            <div>
                                <h4 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-2">
                                    <Zap className="w-4 h-4"/> Transit Mars □ Natal Satürn (90°)
                                </h4>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Otorite figürleriyle gerginlik yaşanabilir. İçinizdeki "harekete geçme" isteği (Mars), dış dünyadaki "engellerle" (Satürn) çarpışıyor. Sabırlı olun.
                                </p>
                            </div>
                        </div>
                     </div>
                 </div>
             </div>
         </section>

         {/* BÖLÜM 2: DOĞUM HARİTASI (SEO: Natal Chart, Yükselen Burç) */}
         <section className="bg-[#0f172a] rounded-[3rem] p-8 md:p-20 border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
             
             <div className="max-w-4xl mx-auto text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
                    Doğum Haritası: <br/> <span className="text-indigo-400">Ruhunuzun Kullanma Kılavuzu</span>
                 </h2>
                 <p className="text-gray-400 text-lg leading-relaxed">
                    Doğum haritası (Natal Chart), siz ilk nefesinizi aldığınız anda gökyüzünün çekilmiş bir fotoğrafıdır. 
                    Parmak iziniz gibi eşsizdir. İkiz kardeşlerin bile dakikalık doğum farklarıyla haritaları ve kaderleri değişebilir.
                 </p>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
                 {/* Kart 1: Güneş */}
                 <div className="bg-[#020617] p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all group text-center">
                     <div className="w-16 h-16 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                         <Sun className="w-8 h-8 text-yellow-500"/>
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Güneş Burcu</h3>
                     <p className="text-sm text-gray-400 leading-relaxed">
                         "Ben Kimim?" sorusunun cevabıdır. Egonuzu, bilinçli kimliğinizi ve yaşam amacınızı temsil eder.
                     </p>
                 </div>

                 {/* Kart 2: Yükselen */}
                 <div className="bg-[#020617] p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all group text-center relative transform md:-translate-y-8">
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                         En Önemli
                     </div>
                     <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                         <Compass className="w-8 h-8 text-purple-500"/>
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Yükselen Burç (ASC)</h3>
                     <p className="text-sm text-gray-400 leading-relaxed">
                         Dış dünyaya taktığınız maskedir. Fiziksel görünüşünüzü, insanlardaki ilk izleniminizi ve hayat yolunuzu çizer.
                     </p>
                 </div>

                 {/* Kart 3: Ay */}
                 <div className="bg-[#020617] p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group text-center">
                     <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                         <Moon className="w-8 h-8 text-blue-500"/>
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">Ay Burcu</h3>
                     <p className="text-sm text-gray-400 leading-relaxed">
                         Duygularınız, bilinçaltınız ve annenizle ilişkiniz. Kimseye göstermediğiniz, evdeki halinizdir.
                     </p>
                 </div>
             </div>
         </section>

         {/* BÖLÜM 3: BURÇLAR REHBERİ (Table/Grid) */}
         <section>
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/5 pb-6 gap-4">
                 <div>
                     <h2 className="text-3xl font-serif font-bold text-white mb-2">Zodyak Çemberi</h2>
                     <p className="text-gray-400 text-sm">12 Burcun tarihleri, elementleri ve yönetici gezegenleri.</p>
                 </div>
                 <button onClick={handleStart} className="text-sm font-bold text-purple-400 hover:text-white transition-colors">
                     Kendi Burcunu Hesapla →
                 </button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {ZODIAC_SIGNS.map((sign) => (
                     <div key={sign.name} className="group relative p-6 bg-[#0f172a] hover:bg-[#1e293b] rounded-2xl border border-white/5 transition-all overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-4xl font-serif">
                             {sign.symbol}
                         </div>
                         
                         <div className="relative z-10">
                             <div className="flex justify-between items-start mb-4">
                                 <span className="text-3xl">{sign.symbol}</span>
                                 <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                                     sign.element === 'Ateş' ? 'bg-red-500/10 text-red-400' : 
                                     sign.element === 'Su' ? 'bg-blue-500/10 text-blue-400' : 
                                     sign.element === 'Hava' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'
                                 }`}>{sign.element}</span>
                             </div>
                             
                             <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{sign.name}</h3>
                             <div className="text-xs text-gray-500 mb-4">{sign.date}</div>
                             
                             <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-white/5 pt-3 mt-auto">
                                <Globe className="w-3 h-3"/> Yönetici: <span className="text-white">{sign.planet}</span>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         </section>

         {/* BÖLÜM 4: SIKÇA SORULAN SORULAR (SEO FAQ) */}
         <section className="pt-16 border-t border-white/5">
             <div className="text-center mb-16">
                 <h2 className="text-3xl font-serif font-bold text-white mb-4">Astroloji Hakkında Merak Edilenler</h2>
                 <p className="text-gray-400">Doğru bilinen yanlışlar ve teknik detaylar.</p>
             </div>

             <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                 <div className="space-y-3">
                     <h3 className="text-white font-bold text-lg flex items-start gap-3">
                         <span className="text-purple-500 mt-1"><HelpCircle className="w-5 h-5"/></span>
                         Doğum saatimi bilmiyorum, harita çıkarabilir miyim?
                     </h3>
                     <p className="text-gray-400 text-sm leading-relaxed pl-8">
                         Doğum saati olmadan "Yükselen Burç" ve "Ev Sistemleri" (House Systems) hesaplanamaz. Sadece Güneş ve Ay burcunuz (eğer o gün burç değiştirmediyse) hesaplanabilir. Kesin bir analiz için tahmini bir saat girmek yerine, aile büyüklerine danışmanız veya profesyonel bir astrologdan "Rektifikasyon" (Saat bulma işlemi) yaptırmanız önerilir.
                     </p>
                 </div>

                 <div className="space-y-3">
                     <h3 className="text-white font-bold text-lg flex items-start gap-3">
                         <span className="text-purple-500 mt-1"><HelpCircle className="w-5 h-5"/></span>
                         Burç yorumları ne kadar doğru?
                     </h3>
                     <p className="text-gray-400 text-sm leading-relaxed pl-8">
                         Genel burç yorumları "Cold Reading" denilen genel geçer ifadeler içerebilir. Ancak bizim sistemimiz, sizin **spesifik doğum koordinatlarınıza (Enlem/Boylam)** göre matematiksel bir harita çıkarır. Bu, parmak iziniz kadar size özeldir ve doğruluğu istatistiksel olarak çok daha yüksektir.
                     </p>
                 </div>

                 <div className="space-y-3">
                     <h3 className="text-white font-bold text-lg flex items-start gap-3">
                         <span className="text-purple-500 mt-1"><HelpCircle className="w-5 h-5"/></span>
                         Yükselen burç neden 30 yaşından sonra etkili olur?
                     </h3>
                     <p className="text-gray-400 text-sm leading-relaxed pl-8">
                         Bu yaygın bir mittir. Yükselen burç (Ascendant), doğduğunuz andan itibaren dış dünyayla kurduğunuz köprüdür. Çocuklukta, gençlikte ve yaşlılıkta daima etkilidir. Hatta bebeklerin fiziksel görünüşünü bile yükselen burç belirler.
                     </p>
                 </div>

                 <div className="space-y-3">
                     <h3 className="text-white font-bold text-lg flex items-start gap-3">
                         <span className="text-purple-500 mt-1"><HelpCircle className="w-5 h-5"/></span>
                         Ay Burcu nedir ve neden önemlidir?
                     </h3>
                     <p className="text-gray-400 text-sm leading-relaxed pl-8">
                         Güneş burcunuz "isteklerinizi", Ay burcunuz ise "ihtiyaçlarınızı" anlatır. Duygusal güvenliğinizi, beslenme şeklinizi ve annenizle olan ilişkinizi Ay burcunuz yönetir. Birini gerçekten tanımak istiyorsanız, Ay burcunu öğrenmelisiniz.
                     </p>
                 </div>
             </div>
         </section>

      </article>

      {/* --- ALT CTA (Harekete Geçirici Mesaj) --- */}
      <section className="container mx-auto px-6 mt-32">
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
              {/* Animasyonlu Arkaplan */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] pointer-events-none"></div>

              <div className="relative z-10 max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                      Kendi Yıldız Haritanızı Şimdi Keşfedin
                  </h2>
                  <p className="text-indigo-200 text-lg mb-10 leading-relaxed">
                      Potansiyellerinizi, aşk hayatınızı ve kariyer yeteneklerinizi gezegenlerin diliyle okuyun. 
                      Sadece doğum tarihinizi girin, gerisini yapay zekaya bırakın.
                  </p>
                  <button 
                    onClick={handleStart}
                    className="px-12 py-5 bg-white text-purple-900 font-bold text-lg rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all flex items-center gap-3 mx-auto"
                  >
                      <Sparkles className="w-5 h-5 text-purple-600"/> Ücretsiz Analiz Başlat
                  </button>
                  <p className="mt-6 text-xs text-indigo-300 opacity-60">
                      * Kayıt olmak ücretsizdir. Temel analizler için ücret talep edilmez.
                  </p>
              </div>
          </div>
      </section>

    </main>
  );
}