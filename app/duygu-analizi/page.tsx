import Link from "next/link";
import { 
  Activity, PieChart, HeartPulse, BrainCircuit, 
  ArrowRight, BarChart3, Fingerprint, Zap,
  TrendingUp, Smile, ArrowDown, ShieldAlert, CheckCircle2
} from "lucide-react";
import Script from "next/script";

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
    <main className="min-h-screen font-sans relative overflow-hidden transition-colors duration-300">
      <Script
        id="mood-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moodAnalysisSchema) }}
      />

      {/* Arka Plan Işıkları (Sade ve klinik) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-stone-300/30 dark:bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none z-0 transform-gpu"></div>

      {/* ================= 1. HERO SECTION (EDİTORYAL & KLİNİK) ================= */}
      <section className="relative pt-32 md:pt-48 pb-16 px-4 md:px-6 z-10 min-h-[85vh] flex items-center border-b border-stone-200 dark:border-stone-800/50">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* SOL: COPYWRITING */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-[10px] md:text-xs font-mono uppercase tracking-widest bg-[#faf9f6]/50 dark:bg-stone-900/50 backdrop-blur-sm">
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> NLP Sentiment Engine
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1.1] text-stone-900 dark:text-stone-50 tracking-tight">
              Bilinçaltınızın <br className="hidden md:block"/>
              <span className="text-stone-500 dark:text-stone-400 font-normal italic">
                Duygu Haritası.
              </span>
            </h1>
            
            <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif leading-relaxed max-w-lg mx-auto lg:mx-0">
              Rüyalar sadece rastgele görüntüler değil, yoğun psikolojik verilerdir. Yapay zekamız, metinlerinizdeki duygusal yükü ölçerek size aylık ruhsal denge raporunuzu sunar.
            </p>

            <div className="flex justify-center lg:justify-start pt-4">
              <Link href="/auth?mode=signup" className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm group">
                <HeartPulse className="w-4 h-4 group-hover:scale-110 transition-transform" /> Duygu Durumumu Ölç
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest border-t border-stone-200 dark:border-stone-800 mt-8">
               <span className="flex items-center gap-1.5"><BrainCircuit className="w-3.5 h-3.5" /> NLP Analizi</span>
               <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Gelişim Grafiği</span>
               <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Stres Ölçümü</span>
            </div>
          </div>

          {/* SAĞ: GERÇEKÇİ UI MOCKUP (DASHBOARD KARTI) */}
          <div className="lg:col-span-6 relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[500px] mt-4 lg:mt-0 px-2 md:px-0">
             
             <div className="relative z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-2xl shadow-stone-200/50 dark:shadow-black/20">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-200 dark:border-stone-800">
                   <div>
                      <h3 className="text-stone-900 dark:text-stone-100 font-serif font-bold text-lg">Duygu Spektrumu</h3>
                      <p className="text-[10px] font-mono text-stone-500">Son 30 Günlük Veri Seti</p>
                   </div>
                   <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                      <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                   </div>
                </div>

                {/* Grafik Alanı */}
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
                   
                   {/* Donut Chart (CSS ile) */}
                   <div className="relative w-32 h-32 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] shrink-0"
                       style={{ background: "conic-gradient(#6366f1 0% 45%, #a855f7 45% 75%, #ef4444 75% 100%)" }}
                   >
                      <div className="absolute inset-2 bg-white dark:bg-stone-900 rounded-full flex flex-col items-center justify-center border border-stone-200 dark:border-stone-800 shadow-inner">
                         <span className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-50">45%</span>
                         <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Huzur</span>
                      </div>
                   </div>
                   
                   {/* Lejant */}
                   <div className="space-y-4 flex-1 w-full">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                            <span className="text-[11px] font-mono text-stone-600 dark:text-stone-400">Huzurlu / Sakin</span>
                         </div>
                         <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100">45%</span>
                      </div>
                      <div className="w-full h-px bg-stone-100 dark:bg-stone-800"></div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                            <span className="text-[11px] font-mono text-stone-600 dark:text-stone-400">Meraklı / Aktif</span>
                         </div>
                         <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100">30%</span>
                      </div>
                      <div className="w-full h-px bg-stone-100 dark:bg-stone-800"></div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[11px] font-mono text-stone-600 dark:text-stone-400">Endişeli / Stresli</span>
                         </div>
                         <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100">25%</span>
                      </div>
                   </div>
                </div>

                {/* AI Yorumu (Rapor Ciddiyeti) */}
                <div className="p-4 bg-[#faf9f6] dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                   <div className="flex items-center gap-2 mb-2 ml-2">
                      <BrainCircuit className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Klinik Ön Rapor</span>
                   </div>
                   <p className="text-sm font-serif text-stone-700 dark:text-stone-300 leading-relaxed ml-2 italic">
                      "Genel spektrum pozitif bir ivmede. Ancak endişe seviyesindeki %5'lik artış, günlük hayatta üstlendiğiniz yeni sorumlulukların bilinçaltı baskısına işaret ediyor olabilir."
                   </p>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* ================= 2. TEKNOLOJİ (NASIL ÇALIŞIR - Akademik Düzen) ================= */}
      <section id="nasil-calisir" className="py-24 bg-stone-50 dark:bg-stone-950/30 border-b border-stone-200 dark:border-stone-800/50 relative z-10">
         <div className="container mx-auto px-6 max-w-6xl">
            
            <div className="text-center mb-20">
               <h2 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-6">Duygularınızı Nasıl Ölçüyoruz?</h2>
               <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif leading-relaxed max-w-2xl mx-auto">
                 Rüyalarınızdaki gizli stresi veya huzuru matematiksel bir kesinlikle ortaya çıkarmak için, psikolojik Doğal Dil İşleme (NLP) algoritmaları kullanıyoruz.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               
               {/* KART 1 */}
               <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-950 flex items-center justify-center mb-6 border border-stone-200 dark:border-stone-800">
                     <Smile className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Sentiment Analizi</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                     Rüyanızın genel tonu neşeli mi yoksa karamsar mı? Sistem metindeki sıfatları, eylemleri ve bağlamı analiz ederek rüyanın ruhsal etkisini puanlar.
                  </p>
               </div>

               {/* KART 2 */}
               <div className="bg-[#faf9f6] dark:bg-stone-950 p-10 rounded-2xl border-2 border-stone-300 dark:border-stone-700 shadow-xl shadow-stone-200/50 dark:shadow-black/30 relative transform md:-translate-y-4">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">En Önemlisi</div>
                  <div className="w-12 h-12 rounded-xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center mb-6 border border-stone-300 dark:border-stone-700">
                     <TrendingUp className="w-5 h-5 text-stone-800 dark:text-stone-300" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Zaman Çizelgesi</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                     Tek bir rüya değil, süreç önemlidir. Son 30 gündeki rüyalarınızın grafiğini çıkararak "duygusal dalgalanmalarınızı" haftalık olarak takip ederiz.
                  </p>
               </div>

               {/* KART 3 */}
               <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-950 flex items-center justify-center mb-6 border border-stone-200 dark:border-stone-800">
                     <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Bilinçaltı Uyarıları</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                     Eğer "Korku" veya "Endişe" oranı belli bir eşiğin üzerine çıkarsa, yapay zeka size günlük hayatınızdaki stres faktörleri için farkındalık uyarısı sunar.
                  </p>
               </div>

            </div>
         </div>
      </section>

      {/* ================= 3. DEV SEO MAKALESİ (Editoryal Dergi Stili) ================= */}
      <section className="py-24 px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-12 text-center border-b border-stone-200 dark:border-stone-800 pb-8">
            Rüya Duygu Analizi ve Psikolojik Haritalama
         </h2>
         
         <div className="space-y-12 text-stone-600 dark:text-stone-400 font-serif text-base md:text-lg leading-relaxed">
            
            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/> Duygu Analizi (Sentiment Analysis) Nedir?
               </h3>
               <p>
                  Arama motorlarında sıkça aranan <strong>"psikolojik rüya analizi"</strong> kavramı, sadece sembolleri değil, rüya sırasındaki duygusal durumu da kapsar. <strong>Duygu Analizi</strong>, yapay zekanın girdiğiniz metindeki kelime seçimlerini, cümle yapılarını ve bağlamı inceleyerek o metnin arkasındaki "duyguyu" (korku, neşe, endişe, huzur vb.) matematiksel olarak ölçme işlemidir.
               </p>
               <p>
                  Siz rüyanızı yazarken kullandığınız "kaçıyordum", "nefes nefese", "karanlık" gibi kelimeler sistem tarafından endişe/korku spektrumuna alınırken; "uçuyordum", "parlak", "gülümsüyordu" gibi ifadeler huzur spektrumunda değerlendirilir.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-stone-500 dark:text-stone-400"/> Rüyalar ve Bastırılmış Duygular
               </h3>
               <p>
                  Günlük hayatın koşuşturmacasında stres, öfke veya kıskançlık gibi duyguları genellikle halının altına süpürürüz. Ancak analitik psikolojinin de doğruladığı gibi, bilinçaltı uyumaz. Bastırılan her duygu, gece rüyalarımızda kılık değiştirerek (kabuslar, karmaşık senaryolar) karşımıza çıkar.
               </p>
               <p>
                  <strong>Rüya günlüğü tutmak</strong> ve bu rüyaların duygu haritasını çıkarmak, kişinin kendiyle yüzleşmesi için mükemmel bir terapötik araçtır. Düzenli analiz sayesinde, hayatınızdaki gizli stres faktörlerini (iş, ilişki, gelecek kaygısı) henüz fiziksel bir soruna dönüşmeden fark edebilirsiniz.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-rose-700 dark:text-rose-500"/> Ruhsal Denge Raporu ve Farkındalık
               </h3>
               <p>
                  Tek bir kötü rüya görmek normaldir, ancak ardışık günlerde sürekli negatif rüyalar görmek yüksek anksiyete işareti olabilir. Sistemimizin sunduğu "Zaman Çizelgesi" grafikleri, haftalık ve aylık bazda duygu dalgalanmalarınızı görselleştirir. 
               </p>
               <p>
                  Böylece, ruh halinizdeki düşüş trendlerini erken fark edebilir ve kişisel gelişiminiz (veya gerekiyorsa profesyonel bir destek almak) için bilinçli bir adım atabilirsiniz.
               </p>
            </article>

         </div>
      </section>

      {/* ================= ALT BİTİRİŞ ================= */}
      <section className="py-16 text-center border-t border-stone-200 dark:border-stone-800/50 relative z-10">
         <div className="container mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-stone-50 mb-8">Kendinizle Yüzleşin.</h2>
            <Link href="#top" className="inline-flex items-center justify-center p-4 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:border-stone-400 transition-all shadow-sm">
               <ArrowDown className="w-5 h-5" />
            </Link>
         </div>
      </section>

    </main>
  );
}