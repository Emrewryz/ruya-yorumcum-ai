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
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-amber-500/30 pb-20">
      <Script
        id="numerology-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(numerologySchema) }}
      />

      {/* --- 1. HERO SECTION: MİSTİK VE MATEMATİKSEL --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Arkaplan Efektleri (Amber/Altın Odaklı) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-amber-600/5 rounded-[100%] blur-[150px] pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-32 h-32 border border-white/5 rounded-full animate-spin-slow opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 border border-dashed border-white/5 rounded-full animate-reverse-spin opacity-20"></div>

        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* SOL: METİN VE VAAT */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-colors">
              <Hash className="w-3 h-3" /> Evrenin Matematiksel Dili
            </div>
            
            <h1 className="font-serif text-4xl lg:text-7xl font-bold leading-[1.1]">
              Sayıların <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                Gizemini Çözün
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Her rüya bir frekanstır ve her frekansın bir sayısı vardır. <strong>Ebcet hesabı</strong> ve <strong>Pisagor numerolojisi</strong> ile rüyanızdaki gizli şanslı sayıları, tarihleri ve yaşam yolu numaranızı keşfedin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth?redirect=numerology" className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" /> Şanslı Sayımı Bul
              </Link>
              <Link href="#nasil-calisir" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center">
                Ebcet Nedir?
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-white/5 mt-6">
               <span className="flex items-center gap-2"><Infinity className="w-4 h-4 text-amber-500" /> Sonsuz Döngü</span>
               <span className="flex items-center gap-2"><Binary className="w-4 h-4 text-amber-500" /> Ebcet Değeri</span>
               <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Şans Faktörü</span>
            </div>
          </div>

          {/* SAĞ: UI MOCKUP (HESAPLAMA KARTI) */}
          <div className="order-1 lg:order-2 perspective-1000 group relative">
             <div className="relative z-30 bg-[#0f172a] border border-amber-500/30 rounded-3xl p-8 shadow-2xl transform transition-transform duration-700 hover:rotate-y-6 hover:scale-105">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Hash className="w-6 h-6"/></div>
                      <div>
                         <h3 className="text-white font-bold text-lg">Numeroloji Raporu</h3>
                         <p className="text-xs text-gray-500">Rüya ID: #8291</p>
                      </div>
                   </div>
                </div>

                {/* Sayı Kartları */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center">
                      <span className="text-xs text-gray-500 uppercase">Ruh</span>
                      <div className="text-3xl font-mono font-bold text-white mt-1">7</div>
                   </div>
                   <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-amber-500/10 blur-xl animate-pulse"></div>
                      <span className="text-xs text-amber-300 uppercase relative z-10">Kader</span>
                      <div className="text-3xl font-mono font-bold text-amber-400 mt-1 relative z-10">11</div>
                   </div>
                   <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center">
                      <span className="text-xs text-gray-500 uppercase">Kişilik</span>
                      <div className="text-3xl font-mono font-bold text-white mt-1">4</div>
                   </div>
                </div>

                {/* Analiz Metni */}
                <div className="space-y-3">
                   <div className="flex gap-3">
                      <div className="w-1 bg-gradient-to-b from-amber-500 to-transparent rounded-full"></div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                         "Gördüğün <strong>yılan</strong> sembolünün Ebcet değeri <strong>60</strong>'tır. Bu sayı, numerolojide dengeyi ve ailevi sorumlulukları temsil eder. Kader sayın olan 11 ise, güçlü bir sezgiye işaret ediyor."
                      </p>
                   </div>
                </div>

             </div>

             {/* Arka Dekorasyon (Geometrik) */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-amber-500/10 blur-[100px] -z-10"></div>
          </div>

        </div>
      </section>

      {/* --- 2. TEKNOLOJİ VE TARİHÇE (SEO TEXT) --- */}
      <section id="nasil-calisir" className="py-24 bg-[#050a1f] border-t border-white/5 relative">
         <div className="container mx-auto px-6 max-w-6xl">
            
            <div className="text-center mb-20">
               <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Sayıların Diliyle Konuşmak</h2>
               <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                  Antik çağlardan beri sayıların evrensel bir dili olduğuna inanılır. Platformumuz, bu kadim bilgeliği modern algoritmalarla birleştirir.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {/* KART 1 */}
               <div className="bg-[#0f172a] p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-400 group-hover:scale-110 transition-transform">
                     <Binary className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Ebcet Hesabı</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                     İslam kültüründe harflerin sayısal değerleri vardır. Rüyadaki anahtar kelimelerin (Örn: Su = 66) Ebcet değerini hesaplayarak size özel mesajı çözeriz.
                  </p>
               </div>

               {/* KART 2 */}
               <div className="bg-[#0f172a] p-8 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform">
                     <Calculator className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Yaşam Yolu Analizi</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                     Doğum tarihiniz ve rüyanın görüldüğü tarih arasındaki matematiksel ilişkiyi inceler. Bu rüyanın hayatınızın hangi döngüsüne denk geldiğini bulur.
                  </p>
               </div>

               {/* KART 3 */}
               <div className="bg-[#0f172a] p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-400 group-hover:scale-110 transition-transform">
                     <Star className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Şanslı Sayılar</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                     Rüyanızdan türetilen sayısal kombinasyonları (Loto, Şans Topu vb. için) size sunar. Bilinçaltınızın size fısıldadığı rakamları kaçırmayın.
                  </p>
               </div>
            </div>

         </div>
      </section>

      {/* --- 3. SEO MAKALELERİ VE BİLGİ --- */}
      <section className="py-24 container mx-auto px-6 max-w-5xl">
         <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-6">
            <div className="p-3 bg-amber-500/10 rounded-xl">
               <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="font-serif text-3xl font-bold">Numeroloji Rehberi</h2>
         </div>
         
         <div className="grid md:grid-cols-2 gap-16 text-gray-400 text-sm leading-relaxed">
            
            <article className="space-y-6">
               <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                     Nikola Tesla ve 3-6-9 Kodu
                  </h3>
                  <p>
                     Tesla, "3, 6 ve 9'un gizemini çözseydiniz, evrenin anahtarına sahip olurdunuz" demiştir. Rüyalarınızda bu sayıların veya katlarının ne sıklıkla tekrar ettiğini analiz ediyoruz. Bu tekrarlar (Synchronicities), evrensel bir uyum içinde olduğunuzun işaretidir.
                  </p>
               </div>
               
               <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                     Melek Sayıları (Angel Numbers)
                  </h3>
                  <p>
                     Rüyanızda sürekli <strong>11:11</strong>, <strong>222</strong> veya <strong>444</strong> gibi tekrar eden sayılar mı görüyorsunuz? Bunlar "Melek Sayıları" olarak bilinir ve her birinin (Uyanış, Denge, Koruma) özel bir mesajı vardır. Yapay zeka bu mesajı sizin için deşifre eder.
                  </p>
               </div>
            </article>

            <article className="space-y-6">
               <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 relative">
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5 rotate-180" />
                  <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                     <Fingerprint className="w-4 h-4 text-amber-500" /> Örnek Analiz
                  </h4>
                  <p className="italic text-gray-500 mb-4">
                     "Rüyamda <strong>7</strong> katlı bir bina gördüm."
                  </p>
                  <ul className="space-y-2">
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

         {/* Keyword Cloud */}
         <div className="mt-16 pt-10 border-t border-white/5">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Popüler Hesaplamalar</h4>
            <div className="flex flex-wrap gap-3">
               {[
                  "Ebcet Hesabı", "İsim Analizi", "Doğum Tarihi Numerolojisi", 
                  "Şanslı Sayılar", "Melek Sayıları", "11:11 Anlamı",
                  "Rüya Sayısal Loto", "Kader Sayısı Hesaplama", "Aşk Uyumu Numeroloji"
               ].map((tag, i) => (
                  <span key={i} className="text-xs text-gray-500 border border-white/5 px-3 py-2 rounded-lg bg-[#020617] hover:border-amber-500/30 hover:text-white transition-colors cursor-default">
                     #{tag}
                  </span>
               ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 text-center relative overflow-hidden">
         <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-serif font-bold mb-6 text-white">Sayıların Rehberliğine Güvenin</h2>
            <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
               Rüyalarınızdaki matematiksel kodu çözmek ve şanslı sayılarınızı öğrenmek için hemen başlayın.
            </p>
            <Link href="/auth?redirect=numerology" className="inline-flex items-center justify-center px-10 py-5 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl group">
               Hemen Hesapla <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </section>

    </main>
  );
}