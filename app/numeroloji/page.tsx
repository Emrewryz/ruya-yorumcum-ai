"use client";

import Link from "next/link";
import { 
  Hash, Calculator, Sparkles, Star, 
  Binary, Infinity, Fingerprint, 
  ArrowRight, BookOpen, Quote
} from "lucide-react";
import Script from "next/script";

// --- SEO SCHEMA ---
const numerologySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Rüya Numerolojisi ve Ebcet Hesaplama",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "description": "Rüyalarınızdaki sembollerin Ebcet değerini hesaplayın ve şanslı sayılarınızı öğrenin."
    },
    {
      "@type": "Article",
      "headline": "Rüyaların Sayısal Şifresi: Ebcet ve Numeroloji Nedir?",
      "description": "Pisagor numerolojisi ve İslam geleneğindeki Ebcet hesabının rüya tabirindeki yeri.",
      "author": { "@type": "Organization", "name": "Rüya Yorumcum AI" }
    }
  ]
};

export default function NumerolojiLandingPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-amber-500/30 pb-12 md:pb-20 overflow-x-hidden">
      <Script
        id="numerology-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(numerologySchema) }}
      />

      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 overflow-hidden">
        {/* Arkaplan Efektleri - Mobilde küçültüldü */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] md:w-[1200px] md:h-[800px] bg-amber-600/5 rounded-[100%] blur-[80px] md:blur-[150px] pointer-events-none"></div>
        {/* Dekoratif Daireler - Mobilde gizlenebilir veya küçültülebilir */}
        <div className="absolute top-20 right-5 md:right-20 w-16 h-16 md:w-32 md:h-32 border border-white/5 rounded-full animate-spin-slow opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-20 left-5 md:left-20 w-24 h-24 md:w-48 md:h-48 border border-dashed border-white/5 rounded-full animate-reverse-spin opacity-20 pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          
          {/* SOL: METİN VE VAAT */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-colors justify-center lg:justify-start">
              <Hash className="w-3 h-3" /> Evrenin Matematiksel Dili
            </div>
            
            {/* MOBİL: Text-4xl, TABLET: Text-7xl */}
            <h1 className="font-serif text-4xl lg:text-7xl font-bold leading-[1.1]">
              Sayıların <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                Gizemini Çözün
              </span>
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Her rüya bir frekanstır ve her frekansın bir sayısı vardır. <strong>Ebcet hesabı</strong> ve <strong>Pisagor numerolojisi</strong> ile rüyanızdaki gizli şanslı sayıları, tarihleri ve yaşam yolu numaranızı keşfedin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth?redirect=numerology" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-base md:text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" /> Şanslı Sayımı Bul
              </Link>
              <Link href="#nasil-calisir" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-base md:text-lg hover:bg-white/10 transition-colors flex items-center justify-center">
                Ebcet Nedir?
              </Link>
            </div>

            <div className="pt-4 md:pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-white/5 mt-4 md:mt-6">
               <span className="flex items-center gap-2"><Infinity className="w-3 h-3 md:w-4 md:h-4 text-amber-500" /> Sonsuz Döngü</span>
               <span className="flex items-center gap-2"><Binary className="w-3 h-3 md:w-4 md:h-4 text-amber-500" /> Ebcet Değeri</span>
               <span className="flex items-center gap-2"><Star className="w-3 h-3 md:w-4 md:h-4 text-amber-500" /> Şans Faktörü</span>
            </div>
          </div>

          {/* SAĞ: UI MOCKUP (HESAPLAMA KARTI) */}
          <div className="order-2 perspective-1000 group relative px-2 md:px-0">
             <div className="relative z-30 bg-[#0f172a] border border-amber-500/30 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl transform transition-transform duration-700 hover:rotate-y-6 hover:scale-105">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Hash className="w-5 h-5 md:w-6 md:h-6"/></div>
                      <div>
                         <h3 className="text-white font-bold text-base md:text-lg">Numeroloji Raporu</h3>
                         <p className="text-[10px] md:text-xs text-gray-500">Rüya ID: #8291</p>
                      </div>
                   </div>
                </div>

                {/* Sayı Kartları */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
                   <div className="bg-black/40 border border-white/10 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                      <span className="text-[10px] md:text-xs text-gray-500 uppercase">Ruh</span>
                      <div className="text-xl md:text-3xl font-mono font-bold text-white mt-1">7</div>
                   </div>
                   <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg md:rounded-xl p-3 md:p-4 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-amber-500/10 blur-xl animate-pulse"></div>
                      <span className="text-[10px] md:text-xs text-amber-300 uppercase relative z-10">Kader</span>
                      <div className="text-xl md:text-3xl font-mono font-bold text-amber-400 mt-1 relative z-10">11</div>
                   </div>
                   <div className="bg-black/40 border border-white/10 rounded-lg md:rounded-xl p-3 md:p-4 text-center">
                      <span className="text-[10px] md:text-xs text-gray-500 uppercase">Kişilik</span>
                      <div className="text-xl md:text-3xl font-mono font-bold text-white mt-1">4</div>
                   </div>
                </div>

                {/* Analiz Metni */}
                <div className="space-y-3">
                   <div className="flex gap-3">
                      <div className="w-1 bg-gradient-to-b from-amber-500 to-transparent rounded-full shrink-0"></div>
                      <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                         "Gördüğün <strong>yılan</strong> sembolünün Ebcet değeri <strong>60</strong>'tır. Bu sayı, numerolojide dengeyi ve ailevi sorumlulukları temsil eder. Kader sayın olan 11 ise, güçlü bir sezgiye işaret ediyor."
                      </p>
                   </div>
                </div>

             </div>

             {/* Arka Dekorasyon */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-amber-500/10 blur-[60px] md:blur-[100px] -z-10"></div>
          </div>

        </div>
      </section>

      {/* --- 2. TEKNOLOJİ VE TARİHÇE --- */}
      <section id="nasil-calisir" className="py-16 md:py-24 bg-[#050a1f] border-t border-white/5 relative">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center mb-12 md:mb-20">
               <h2 className="font-serif text-2xl md:text-5xl font-bold mb-4 md:mb-6">Sayıların Diliyle Konuşmak</h2>
               <p className="text-gray-400 text-sm md:text-lg max-w-3xl mx-auto">
                  Antik çağlardan beri sayıların evrensel bir dili olduğuna inanılır. Platformumuz, bu kadim bilgeliği modern algoritmalarla birleştirir.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
               {/* KART 1 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 md:mb-6 text-amber-400 group-hover:scale-110 transition-transform">
                     <Binary className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Ebcet Hesabı</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     İslam kültüründe harflerin sayısal değerleri vardır. Rüyadaki anahtar kelimelerin Ebcet değerini hesaplayarak size özel mesajı çözeriz.
                  </p>
               </div>

               {/* KART 2 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 md:mb-6 text-orange-400 group-hover:scale-110 transition-transform">
                     <Calculator className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Yaşam Yolu Analizi</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     Doğum tarihiniz ve rüyanın görüldüğü tarih arasındaki matematiksel ilişkiyi inceler. Bu rüyanın hayatınızın hangi döngüsüne denk geldiğini bulur.
                  </p>
               </div>

               {/* KART 3 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4 md:mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
                     <Star className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Şanslı Sayılar</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     Rüyanızdan türetilen sayısal kombinasyonları (Loto, Şans Topu vb. için) size sunar. Bilinçaltınızın size fısıldadığı rakamları kaçırmayın.
                  </p>
               </div>
            </div>

         </div>
      </section>

      {/* --- 3. SEO MAKALELERİ VE BİLGİ --- */}
      <section className="py-16 md:py-24 container mx-auto px-4 md:px-6 max-w-5xl">
         <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-8 md:mb-12 border-b border-white/10 pb-4 md:pb-6">
            <div className="p-2 md:p-3 bg-amber-500/10 rounded-xl w-fit">
               <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Numeroloji Rehberi</h2>
         </div>
         
         <div className="grid md:grid-cols-2 gap-8 md:gap-16 text-gray-400 text-sm leading-relaxed">
            
            <article className="space-y-6">
               <div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                     Nikola Tesla ve 3-6-9 Kodu
                  </h3>
                  <p>
                     Tesla, "3, 6 ve 9'un gizemini çözseydiniz, evrenin anahtarına sahip olurdunuz" demiştir. Rüyalarınızda bu sayıların veya katlarının ne sıklıkla tekrar ettiğini analiz ediyoruz.
                  </p>
               </div>
               
               <div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                     Melek Sayıları (Angel Numbers)
                  </h3>
                  <p>
                     Rüyanızda sürekli <strong>11:11</strong>, <strong>222</strong> veya <strong>444</strong> gibi tekrar eden sayılar mı görüyorsunuz? Bunlar "Melek Sayıları" olarak bilinir ve özel bir mesajı vardır.
                  </p>
               </div>
            </article>

            <article className="space-y-6">
               <div className="bg-[#0f172a] p-5 md:p-6 rounded-2xl border border-white/5 relative">
                  <Quote className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 text-white/5 rotate-180" />
                  <h4 className="text-white font-bold mb-3 md:mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                     <Fingerprint className="w-4 h-4 text-amber-500" /> Örnek Analiz
                  </h4>
                  <p className="italic text-gray-500 mb-3 md:mb-4">
                     "Rüyamda <strong>7</strong> katlı bir bina gördüm."
                  </p>
                  <ul className="space-y-2 text-xs md:text-sm">
                     <li className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span>Sembolik Anlam:</span>
                        <span className="text-amber-400 font-bold">Manevi Yükseliş</span>
                     </li>
                     <li className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span>Gezegen:</span>
                        <span className="text-amber-400 font-bold">Neptün (Sezgi)</span>
                     </li>
                     <li className="flex justify-between items-center pt-2">
                        <span>Tarot Karşılığı:</span>
                        <span className="text-amber-400 font-bold">Savaş Arabası</span>
                     </li>
                  </ul>
               </div>
            </article>
         </div>

         {/* Keyword Cloud - Mobilde yatay scroll yerine wrap kullanıldı */}
         <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-white/5">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 md:mb-6">Popüler Hesaplamalar</h4>
            <div className="flex flex-wrap gap-2 md:gap-3">
               {[
                  "Ebcet Hesabı", "İsim Analizi", "Doğum Tarihi Numerolojisi", 
                  "Şanslı Sayılar", "Melek Sayıları", "11:11 Anlamı",
                  "Rüya Sayısal Loto", "Kader Sayısı Hesaplama", "Aşk Uyumu Numeroloji"
               ].map((tag, i) => (
                  <span key={i} className="text-[10px] md:text-xs text-gray-500 border border-white/5 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-[#020617] hover:border-amber-500/30 hover:text-white transition-colors cursor-default">
                     #{tag}
                  </span>
               ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-16 md:py-20 text-center relative overflow-hidden">
         <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4 md:mb-6 text-white">Sayıların Rehberliğine Güvenin</h2>
            <p className="text-gray-400 mb-6 md:mb-8 text-base md:text-lg max-w-2xl mx-auto">
               Rüyalarınızdaki matematiksel kodu çözmek ve şanslı sayılarınızı öğrenmek için hemen başlayın.
            </p>
            <Link href="/auth?redirect=numerology" className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-bold text-base md:text-lg hover:bg-gray-200 transition-colors shadow-xl group">
               Hemen Hesapla <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </section>

    </main>
  );
}