"use client";

import Link from "next/link";
import { 
  Activity, PieChart, HeartPulse, BrainCircuit, 
  ArrowRight, BarChart3, Fingerprint, Zap,
  TrendingUp, Smile, ArrowDown, ShieldAlert
} from "lucide-react";
import Script from "next/script";
import AdUnit from "@/components/AdUnit"; // Reklam bileşeni

// --- SEO SCHEMA ---
const moodAnalysisSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Yapay Zeka Rüya Duygu Analizi ve Takibi",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web",
      "description": "Yapay zeka ile rüyalarınızdaki duygu durumunu analiz edin, stres seviyenizi ölçün ve ruhsal haritanızı çıkarın."
    },
    {
      "@type": "Article",
      "headline": "Rüya Duygu Analizi: Bilinçaltı Haritalama ve Psikolojik Yorum",
      "description": "Rüyaların duygusal tonunu (Sentiment Analysis) ölçerek kişisel gelişim ve stres yönetimi hakkında kapsamlı rehber.",
      "author": { "@type": "Organization", "name": "Rüya Yorumcum AI" }
    }
  ]
};

export default function DuyguAnaliziPage() {
  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans selection:bg-blue-500/30 pb-20 overflow-x-hidden relative scroll-smooth">
      <Script
        id="mood-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moodAnalysisSchema) }}
      />

      {/* --- ATMOSFER --- */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      
      {/* Arka Plan Işıkları (Mat Mavi & İndigo) */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[150px]"></div>
      </div>

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-32 md:pt-48 pb-16 px-4 md:px-6 z-10 min-h-[85vh] flex items-center">
        <div className="container mx-auto max-w-7xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* SOL: COPYWRITING (Minimalist) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 text-[10px] md:text-xs font-mono uppercase tracking-widest shadow-xl">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> NLP Sentiment Engine
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-white tracking-tight">
              Bilinçaltınızın <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-400 to-blue-600">
                Duygu Haritası.
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              Rüyalar sadece görüntü değil, yoğun duygulardır. Yapay zekamız, metinlerinizdeki psikolojik yükü ölçerek size aylık ruhsal denge raporunuzu sunar.
            </p>

            <div className="flex justify-center lg:justify-start pt-2">
              <Link href="/auth?redirect=mood" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-blue-500/30 transition-colors flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm group">
                <HeartPulse className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" /> Analize Başla
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest border-t border-white/5 mt-6">
               <span className="flex items-center gap-1.5"><BrainCircuit className="w-3 h-3 text-slate-600" /> Duygu Tespiti</span>
               <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-slate-600" /> Gelişim Grafiği</span>
               <span className="flex items-center gap-1.5"><ShieldAlert className="w-3 h-3 text-slate-600" /> Stres Ölçümü</span>
            </div>
          </div>

          {/* SAĞ: GERÇEKÇİ UI MOCKUP (DASHBOARD) */}
          <div className="lg:col-span-5 relative w-full perspective-1000 mt-4 lg:mt-0 px-2 md:px-0">
             
             <div className="relative z-30 bg-[#131722]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.1)]">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                   <div>
                      <h3 className="text-white font-bold text-sm">Duygu Spektrumu</h3>
                      <p className="text-[10px] font-mono text-slate-500">Son 30 Günlük Veri Seti</p>
                   </div>
                   <div className="p-2 bg-blue-500/10 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                   </div>
                </div>

                {/* Grafik Alanı */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                   <div className="relative w-28 h-28 rounded-full border-[6px] border-[#0B0F19] shadow-[0_0_0_1px_rgba(255,255,255,0.05)] shrink-0"
                        style={{ background: "conic-gradient(#3b82f6 0% 45%, #6366f1 45% 75%, #ef4444 75% 100%)" }}
                   >
                      <div className="absolute inset-0 m-1.5 bg-[#131722] rounded-full flex flex-col items-center justify-center">
                         <span className="text-xl font-bold text-white">45%</span>
                         <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Huzur</span>
                      </div>
                   </div>
                   
                   {/* Lejant */}
                   <div className="space-y-3 flex-1 w-full">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-[11px] font-mono text-slate-300">Huzurlu</span>
                         </div>
                         <span className="text-[11px] font-bold text-white">45%</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="text-[11px] font-mono text-slate-300">Meraklı</span>
                         </div>
                         <span className="text-[11px] font-bold text-white">30%</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[11px] font-mono text-slate-300">Endişeli</span>
                         </div>
                         <span className="text-[11px] font-bold text-white">25%</span>
                      </div>
                   </div>
                </div>

                {/* AI Yorumu */}
                <div className="mt-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                   <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistem Özeti</span>
                   </div>
                   <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
                      "Genel spektrum pozitif. Ancak endişe seviyesindeki %5'lik artış, yaklaşan olayların bilinçaltı baskısına işaret ediyor."
                   </p>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* --- REKLAM 1: HERO ALTI --- */}
      <div className="max-w-6xl mx-auto w-full px-4 py-8 z-10 relative border-t border-white/5">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="8565155493" format="auto" />
      </div>

      {/* ================= 2. TEKNOLOJİ (NASIL ÇALIŞIR) ================= */}
      <section id="nasil-calisir" className="py-20 bg-[#131722]/30 border-y border-white/5 relative z-10">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center mb-16">
               <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Duygularınızı Nasıl Ölçüyoruz?</h2>
               <p className="text-slate-400 text-sm md:text-base font-light max-w-2xl mx-auto">
                  Kullandığımız Doğal Dil İşleme (NLP) teknolojisi, yazdığınız rüya metnindeki her kelimenin ve cümlenin psikolojik yükünü hesaplar.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/10">
                     <Smile className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Sentiment Analizi</h3>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">
                     Rüyanızın genel tonu neşeli mi yoksa karamsar mı? Sistem metni analiz ederek rüyanın ruhsal etkisini puanlar.
                  </p>
               </div>

               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/10">
                     <TrendingUp className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Zaman Çizelgesi</h3>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">
                     Tek bir rüya değil, süreç önemlidir. Son 30 gündeki rüyalarınızın grafiğini çıkararak "duygusal dalgalanmalarınızı" takip ederiz.
                  </p>
               </div>

               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/10">
                     <ShieldAlert className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Bilinçaltı Uyarıları</h3>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">
                     Eğer "Korku" veya "Endişe" oranı belli bir seviyenin üzerine çıkarsa, yapay zeka size özel bir farkındalık uyarısı sunar.
                  </p>
               </div>
            </div>

         </div>
      </section>

      {/* --- REKLAM 2: BÖLÜM ARASI --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-12 z-10 relative">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="4542150009" format="fluid" />
      </div>

      {/* ================= 3. DEV SEO MAKALESİ ================= */}
      <section className="py-12 px-4 md:px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-10 border-b border-white/10 pb-6">
            Rüya Duygu Analizi ve Psikolojik Haritalama
         </h2>
         
         <div className="space-y-12 text-slate-400 font-light leading-relaxed text-sm md:text-base">
            
            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400"/> Duygu Analizi (Sentiment Analysis) Nedir?
               </h3>
               <p>
                  Arama motorlarında sıkça aranan <strong>"psikolojik rüya analizi"</strong> kavramı, sadece sembolleri değil, rüya sırasındaki duygusal durumu da kapsar. <strong>Duygu Analizi</strong>, yapay zekanın girdiğiniz metindeki kelime seçimlerini, cümle yapılarını ve bağlamı inceleyerek o metnin arkasındaki "duyguyu" (korku, neşe, endişe, huzur vb.) matematiksel olarak ölçme işlemidir.
               </p>
               <p>
                  Siz rüyanızı yazarken kullandığınız "kaçıyordum", "nefes nefese", "karanlık" gibi kelimeler sistem tarafından endişe/korku spektrumuna alınırken; "uçuyordum", "parlak", "gülümsüyordu" gibi ifadeler huzur spektrumunda değerlendirilir.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400"/> Rüyalar ve Bastırılmış Duygular
               </h3>
               <p>
                  Günlük hayatın koşuşturmacasında stres, öfke veya kıskançlık gibi duyguları genellikle halının altına süpürürüz. Ancak Carl Jung'un da belirttiği gibi, bilinçaltı uyumaz. Bastırılan her duygu, gece rüyalarımızda kılık değiştirerek (kabuslar, karmaşık senaryolar) karşımıza çıkar.
               </p>
               <p>
                  <strong>Rüya günlüğü tutmak</strong> ve bu rüyaların duygu haritasını çıkarmak, kişinin kendiyle yüzleşmesi için mükemmel bir terapötik araçtır. Düzenli analiz sayesinde, hayatınızdaki gizli stres faktörlerini (iş, ilişki, gelecek kaygısı) henüz fiziksel bir soruna dönüşmeden fark edebilirsiniz.
               </p>
            </article>

            {/* REKLAM 3: SEO İÇERİĞİ ARASI */}
            <div className="py-6 border-y border-white/5 my-6">
                <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                <AdUnit slot="4542150009" format="fluid" />
            </div>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400"/> Ruhsal Denge Raporu
               </h3>
               <p>
                  Tek bir kötü rüya görmek normaldir, ancak ardışık günlerde sürekli negatif rüyalar görmek <strong>depresyon belirtileri</strong> veya yüksek anksiyete işareti olabilir. Sistemimizin sunduğu "Zaman Çizelgesi" grafikleri, haftalık ve aylık bazda duygu dalgalanmalarınızı görselleştirir. 
               </p>
               <p>
                  Böylece, ruh halinizdeki düşüş trendlerini erken fark edebilir ve kişisel gelişiminiz (veya gerekiyorsa profesyonel bir destek almak) için bilinçli bir adım atabilirsiniz.
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
            <h2 className="font-serif text-xl md:text-2xl text-slate-400 mb-4">Kendinizle Yüzleşin.</h2>
            <Link href="#top" className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
               <ArrowDown className="w-5 h-5 animate-bounce" />
            </Link>
         </div>
      </section>

    </main>
  );
}