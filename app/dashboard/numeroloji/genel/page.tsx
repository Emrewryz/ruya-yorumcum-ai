"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Hash, Calculator, Sparkles, Star, 
  Binary, Infinity, Fingerprint, 
  ArrowRight, BookOpen, Quote, Calendar, User
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
  const router = useRouter();
  
  // --- STATE ---
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  // --- HESAPLAMA VE YÖNLENDİRME (DÜZELTİLDİ) ---
  const handleStartAnalysis = () => {
    if (!fullName.trim() || !birthDate) return;
    
    setIsCalculating(true);

    // 1. Verileri paketle
    const pendingData = { fullName, birthDate };

    // 2. LocalStorage'a kaydet (Dashboard'da yakalamak için)
    if (typeof window !== 'undefined') {
        localStorage.setItem("pending_numerology_data", JSON.stringify(pendingData));
    }

    // 3. Yönlendirme (Auth sayfasına gidiyoruz, dönüş adresi olarak Numeroloji GENEL sayfasını veriyoruz)
    // Auth sayfan 'redirect' parametresini okuyup login sonrası oraya atmalı.
    setTimeout(() => {
        // BURASI ÖNEMLİ: Hedef sayfa '/dashboard/numerology/genel'
        // encodeURIComponent kullanarak URL'i güvenli hale getiriyoruz.
        const targetUrl = encodeURIComponent("/dashboard/numerology/genel");
        router.push(`/auth?redirect=${targetUrl}`);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-amber-500/30 pb-12 md:pb-20 overflow-x-hidden">
      <Script
        id="numerology-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(numerologySchema) }}
      />

      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 overflow-hidden">
        {/* Arkaplan Efektleri */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] md:w-[1200px] md:h-[800px] bg-amber-600/5 rounded-[100%] blur-[80px] md:blur-[150px] pointer-events-none"></div>
        <div className="absolute top-20 right-5 md:right-20 w-16 h-16 md:w-32 md:h-32 border border-white/5 rounded-full animate-spin-slow opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-20 left-5 md:left-20 w-24 h-24 md:w-48 md:h-48 border border-dashed border-white/5 rounded-full animate-reverse-spin opacity-20 pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          
          {/* SOL: METİN VE VAAT */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-colors justify-center lg:justify-start">
              <Hash className="w-3 h-3" /> Evrenin Matematiksel Dili
            </div>
            
            <h1 className="font-serif text-4xl lg:text-7xl font-bold leading-[1.1]">
              Sayıların <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                Gizemini Çözün
              </span>
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Her ismin bir frekansı, her doğum tarihinin bir kaderi vardır. <strong>Ebcet hesabı</strong> ve <strong>Pisagor numerolojisi</strong> ile ruhunuzun sayısal şifresini hemen çözün.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => document.getElementById('calculator-card')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-base md:text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" /> Şanslı Sayımı Bul
              </button>
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

          {/* SAĞ: İNTERAKTİF HESAPLAMA KARTI (HOOK) */}
          <div id="calculator-card" className="order-2 perspective-1000 group relative px-2 md:px-0">
             <div className="relative z-30 bg-[#0f172a] border border-amber-500/30 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl transform transition-transform duration-700 hover:shadow-amber-900/20">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 animate-pulse"><Hash className="w-5 h-5 md:w-6 md:h-6"/></div>
                      <div>
                         <h3 className="text-white font-bold text-base md:text-lg">Numeroloji Haritanı Çıkar</h3>
                         <p className="text-[10px] md:text-xs text-gray-500">Ücretsiz Yaşam Yolu Analizi</p>
                      </div>
                   </div>
                </div>

                {/* FORM INPUTLARI */}
                <div className="space-y-4 md:space-y-5">
                    
                    {/* İsim Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Adın Soyadın</label>
                        <div className="relative group/input">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Örn: Ahmet Yılmaz"
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Tarih Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Doğum Tarihin</label>
                        <div className="relative group/input">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input 
                                type="date" 
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all font-medium appearance-none min-h-[56px]"
                            />
                        </div>
                    </div>

                    {/* Buton */}
                    <button 
                        onClick={handleStartAnalysis}
                        disabled={!fullName.trim() || !birthDate || isCalculating}
                        className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold text-base uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                    >
                        {isCalculating ? (
                            <>Hesaplanıyor...</>
                        ) : (
                            <>
                                Analizi Başlat <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-[10px] text-gray-600 text-center mt-2">
                        *Pisagor ve Ebcet sistemlerine göre hesaplanır.
                    </p>
                </div>

             </div>

             {/* Arka Dekorasyon */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-amber-500/10 blur-[60px] md:blur-[100px] -z-10"></div>
          </div>

        </div>
      </section>

      {/* --- 2. TEKNOLOJİ VE TARİHÇE (Aynı kaldı) --- */}
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

         {/* Keyword Cloud */}
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
            <button 
                onClick={() => document.getElementById('calculator-card')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-bold text-base md:text-lg hover:bg-gray-200 transition-colors shadow-xl group"
            >
               Hemen Hesapla <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
         </div>
      </section>

    </main>
  );
}