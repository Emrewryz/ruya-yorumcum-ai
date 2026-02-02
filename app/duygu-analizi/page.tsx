"use client";

import Link from "next/link";
import { 
  Activity, PieChart, HeartPulse, BrainCircuit, 
  ArrowRight, BarChart3, Fingerprint, Zap,
  TrendingUp, Smile, Frown
} from "lucide-react";
import Script from "next/script";

// --- SEO SCHEMA ---
const moodAnalysisSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Rüya Duygu Analizi ve Takibi",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web",
      "description": "Yapay zeka ile rüyalarınızdaki duygu durumunu analiz edin, stres seviyenizi ölçün ve ruhsal haritanızı çıkarın."
    },
    {
      "@type": "Service",
      "name": "Bilinçaltı Duygu Haritalama",
      "provider": { "@type": "Organization", "name": "Rüya Yorumcum AI" },
      "serviceType": "Psychological Analysis",
      "description": "Rüyaların duygusal tonunu (Sentiment Analysis) ölçerek kişisel gelişim raporu sunar."
    }
  ]
};

export default function DuyguAnaliziPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 pb-12 md:pb-20 overflow-x-hidden">
      <Script
        id="mood-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moodAnalysisSchema) }}
      />

      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 overflow-hidden">
        {/* Arkaplan Efektleri - Mobilde küçültüldü */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-blue-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-indigo-900/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          
          {/* SOL: METİN VE VAAT */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-colors justify-center lg:justify-start">
              <Activity className="w-3 h-3" /> Sentiment Analysis AI
            </div>
            
            {/* MOBİL: Text-4xl, TABLET: Text-7xl */}
            <h1 className="font-serif text-4xl lg:text-7xl font-bold leading-[1.1]">
              Ruhunuzun <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
                Haritasını Çıkarın
              </span>
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Rüyalar sadece görüntü değil, yoğun duygulardır. Yapay zekamız, rüyalarınızdaki korku, neşe, endişe ve huzur oranlarını ölçerek size aylık bir <strong>"Ruhsal Denge Raporu"</strong> sunar. Kendinizi daha iyi tanıyın.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth?redirect=mood" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-base md:text-lg hover:bg-blue-700 hover:scale-105 transition-all shadow-[0_0_40px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2">
                <HeartPulse className="w-5 h-5" /> Analizi Başlat
              </Link>
              <Link href="#nasil-calisir" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-base md:text-lg hover:bg-white/10 transition-colors flex items-center justify-center">
                Nasıl Çalışır?
              </Link>
            </div>

            <div className="pt-4 md:pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
               <span className="flex items-center gap-2"><PieChart className="w-3 h-3 md:w-4 md:h-4 text-blue-500" /> Detaylı Grafik</span>
               <span className="flex items-center gap-2"><BrainCircuit className="w-3 h-3 md:w-4 md:h-4 text-indigo-500" /> Duygu Tespiti</span>
               <span className="flex items-center gap-2"><Zap className="w-3 h-3 md:w-4 md:h-4 text-purple-500" /> Stres Ölçümü</span>
            </div>
          </div>

          {/* SAĞ: UI MOCKUP (DASHBOARD SİMÜLASYONU) */}
          <div className="order-2 perspective-1000 group relative px-2 md:px-0">
             <div className="relative z-30 bg-[#0f172a] border border-blue-500/30 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-2xl transform transition-transform duration-700 hover:rotate-y-6 hover:scale-105">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 md:mb-8 pb-4 border-b border-white/5">
                   <div>
                      <h3 className="text-white font-bold text-base md:text-lg">Ekim Ayı Analizi</h3>
                      <p className="text-[10px] md:text-xs text-gray-500">Son 30 Günlük Veri</p>
                   </div>
                   <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                      <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                   </div>
                </div>

                {/* Grafik Alanı (MOBİLDE ALT ALTA - FLEX COL) */}
                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
                   <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-8 border-[#0f172a] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] shrink-0"
                        style={{
                           background: "conic-gradient(#3b82f6 0% 40%, #a855f7 40% 70%, #ef4444 70% 100%)"
                        }}
                   >
                      <div className="absolute inset-0 m-2 bg-[#0f172a] rounded-full flex flex-col items-center justify-center">
                         <span className="text-xl md:text-2xl font-bold text-white">%40</span>
                         <span className="text-[9px] md:text-[10px] text-gray-500">Huzur</span>
                      </div>
                   </div>
                   
                   {/* Lejant */}
                   <div className="space-y-3 flex-1 w-full">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-gray-300">Huzurlu</span>
                         </div>
                         <span className="text-xs font-bold text-white">%40</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-purple-500"></div>
                            <span className="text-xs text-gray-300">Meraklı</span>
                         </div>
                         <span className="text-xs font-bold text-white">%30</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs text-gray-300">Endişeli</span>
                         </div>
                         <span className="text-xs font-bold text-white">%30</span>
                      </div>
                   </div>
                </div>

                {/* AI Yorumu */}
                <div className="mt-6 md:mt-8 p-3 md:p-4 bg-white/5 rounded-xl border border-white/5 text-xs md:text-sm text-gray-400 leading-relaxed">
                   <span className="text-blue-400 font-bold block mb-1">AI Özeti:</span>
                   "Bu ay rüyalarında huzur teması hakim. Ancak %30 oranındaki endişe, yaklaşan sınavların bilinçaltındaki yansıması olabilir."
                </div>

             </div>

             {/* Arka Dekorasyon */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-blue-500/10 blur-[60px] md:blur-[100px] -z-10"></div>
          </div>

        </div>
      </section>

      {/* --- 2. TEKNİK SÜREÇ --- */}
      <section id="nasil-calisir" className="py-16 md:py-24 bg-[#050a1f] border-t border-white/5 relative">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center mb-12 md:mb-20">
               <h2 className="font-serif text-2xl md:text-5xl font-bold mb-4 md:mb-6">Duygularınızı Nasıl Ölçüyoruz?</h2>
               <p className="text-gray-400 text-sm md:text-lg max-w-3xl mx-auto">
                  Kullandığımız <strong>Doğal Dil İşleme (NLP)</strong> teknolojisi, yazdığınız rüya metnindeki her kelimenin duygusal yükünü hesaplar.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
               {/* KART 1 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-blue-500/50 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 md:mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                     <Smile className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Pozitif/Negatif Analiz</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     Rüyanızın genel tonu neşeli mi yoksa karamsar mı? Sistem -100 ile +100 arasında bir skor belirleyerek rüyanın ruhsal etkisini puanlar.
                  </p>
               </div>

               {/* KART 2 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-indigo-500/50 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 md:mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                     <TrendingUp className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Zaman Çizelgesi</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     Tek bir rüya değil, süreç önemlidir. Son 30 gündeki rüyalarınızın grafiğini çıkararak "duygusal dalgalanmalarınızı" takip etmenizi sağlarız.
                  </p>
               </div>

               {/* KART 3 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-purple-500/50 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 md:mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                     <BrainCircuit className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">Bilinçaltı Uyarıları</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     Eğer "Korku" veya "Endişe" oranı belirli bir seviyenin üzerine çıkarsa, yapay zeka size özel bir "Rahatlama ve Farkındalık Önerisi" sunar.
                  </p>
               </div>
            </div>

         </div>
      </section>

      {/* --- 3. NEDEN KULLANMALIYIM? --- */}
      <section className="py-16 md:py-24 container mx-auto px-4 md:px-6 max-w-5xl">
         <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-8 md:mb-12 border-b border-white/10 pb-4 md:pb-6">
            <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl w-fit">
               <Fingerprint className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Ruhsal Farkındalık Rehberi</h2>
         </div>
         
         <div className="grid md:grid-cols-2 gap-10 md:gap-16 text-gray-400 text-sm leading-relaxed">
            
            <article className="space-y-6">
               <div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                     Bastırılmış Duygularla Yüzleşme
                  </h3>
                  <p>
                     Günlük hayatta görmezden geldiğimiz stres, öfke veya kıskançlık gibi duygular rüyalarda açığa çıkar. <strong>Duygu analizi</strong>, bu gizli hisleri somut verilere dökerek onlarla sağlıklı bir şekilde yüzleşmenizi sağlar.
                  </p>
               </div>
               
               <div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                     Rüya ve Depresyon İlişkisi
                  </h3>
                  <p>
                     Rüyaların sürekli negatif (kabus, hüzün) ağırlıklı olması, psikolojik yorgunluğun işareti olabilir. Sistemimizdeki grafikler, ruh halinizdeki düşüşleri erken fark etmeniz için bir <strong>erken uyarı sistemi</strong> görevi görür.
                  </p>
               </div>
            </article>

            <article className="space-y-6">
               <div className="bg-[#0f172a] p-5 md:p-6 rounded-2xl border border-white/5">
                  <h4 className="text-white font-bold mb-3 md:mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                     <Activity className="w-4 h-4 text-blue-500" /> Ölçülen Temel Duygular
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {[
                        { name: "Mutluluk", color: "bg-green-500/20 text-green-400" },
                        { name: "Endişe", color: "bg-yellow-500/20 text-yellow-400" },
                        { name: "Korku", color: "bg-red-500/20 text-red-400" },
                        { name: "Huzur", color: "bg-blue-500/20 text-blue-400" },
                        { name: "Özlem", color: "bg-pink-500/20 text-pink-400" },
                        { name: "Karmaşa", color: "bg-purple-500/20 text-purple-400" },
                     ].map((mood, i) => (
                        <span key={i} className={`px-2 py-1 md:px-3 rounded-lg border border-white/5 text-[10px] md:text-xs font-bold ${mood.color}`}>
                           {mood.name}
                        </span>
                     ))}
                  </div>
               </div>
               <p>
                  Her rüya kaydınızda bu duyguların oranı otomatik hesaplanır ve profilinize işlenir. Zamanla kendi <strong>"Duygu Takviminizi"</strong> oluşturmuş olursunuz.
               </p>
            </article>
         </div>

         {/* Keyword Cloud */}
         <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-white/5">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 md:mb-6">İlgili Aramalar</h4>
            <div className="flex flex-wrap gap-2 md:gap-3">
               {[
                  "Rüya psikolojisi", "Bilinçaltı temizliği", "Duygu durumu testi", 
                  "Online psikolojik analiz", "Rüya yorumu yapay zeka", "Mood tracker",
                  "Ruh hali takibi", "Depresyon belirtileri rüya", "Stres ölçümü"
               ].map((tag, i) => (
                  <span key={i} className="text-[10px] md:text-xs text-gray-500 border border-white/5 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-[#020617] hover:border-blue-500/30 hover:text-white transition-colors cursor-default">
                     #{tag}
                  </span>
               ))}
            </div>
         </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-16 md:py-20 text-center relative overflow-hidden">
         <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4 md:mb-6 text-white">Ruhunuz Ne Söylüyor?</h2>
            <p className="text-gray-400 mb-6 md:mb-8 text-base md:text-lg max-w-2xl mx-auto">
               Bilinçaltınızın gizli mesajlarını çözmek ve duygusal haritanızı çıkarmak için şimdi başlayın.
            </p>
            <Link href="/auth?redirect=mood" className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-bold text-base md:text-lg hover:bg-gray-200 transition-colors shadow-xl group">
               Analiz Et <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </section>

    </main>
  );
}