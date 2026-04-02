import Link from "next/link";
import { 
  ImageIcon, Sparkles, Layers, Aperture, Maximize, 
  BrainCircuit, CheckCircle2, Image as ImageIcon2, 
  Palette, Cpu, ScanLine, ArrowDown
} from "lucide-react";
import Script from "next/script";

// --- SEO SCHEMA ---
const visualizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Yapay Zeka Rüya Görselleştirme Asistanı",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TRY"
      },
      "description": "Yapay zeka ile rüyalarınızı 4K çözünürlüklü sanat eserlerine ve fotoğraflara dönüştürün. Text-to-image rüya çizim aracı."
    },
    {
      "@type": "Service",
      "name": "Rüyadan Resim Yapma",
      "provider": { "@type": "Organization", "name": "Rüya Yorumcum AI" },
      "serviceType": "Image Generation",
      "description": "Görülen rüyayı resme dönüştürme, yapay zeka ile rüya görseli oluşturma ve dijital rüya günlüğü hizmeti."
    }
  ]
};

export default function RuyaGorsellestirmePage() {
  return (
    <main className="min-h-screen font-sans relative overflow-hidden transition-colors duration-300">
      <Script
        id="visualization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(visualizationSchema) }}
      />

      {/* Arka Plan Işıkları (Sade ve zarif) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-stone-300/30 dark:bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0 transform-gpu"></div>

      {/* ================= 1. HERO SECTION (EDİTORYAL SANAT GALERİSİ HİSSİ) ================= */}
      <section className="relative pt-32 md:pt-48 pb-16 px-4 md:px-6 z-10 min-h-[85vh] flex items-center border-b border-stone-200 dark:border-stone-800/50">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* SOL: COPYWRITING */}
          <div className="space-y-6 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-[10px] md:text-xs font-mono uppercase tracking-widest bg-[#faf9f6]/50 dark:bg-stone-900/50 backdrop-blur-sm">
              <ScanLine className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" /> Deep Learning Engine v2
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-stone-900 dark:text-stone-50 tracking-tight">
              Bilinçaltınızı <br className="hidden md:block" />
              <span className="text-stone-500 dark:text-stone-400 font-normal italic">
                Görselleştirin.
              </span>
            </h1>
            
            <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif leading-relaxed max-w-lg mx-auto lg:mx-0">
              Kelimelerin yetersiz kaldığı o sınırda, yapay zekamız devreye giriyor. Rüyalarınızı yüksek sadakatli, stüdyo kalitesinde dijital sanat eserlerine dönüştüren gelişmiş difüzyon teknolojisi.
            </p>

            <div className="flex justify-center lg:justify-start pt-4">
              <Link href="/auth?redirect=visualize" className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-sm transition-all flex items-center justify-center gap-2 group shadow-sm">
                <ImageIcon className="w-4 h-4" /> Stüdyoya Giriş Yap
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest border-t border-stone-200 dark:border-stone-800 mt-8">
               <span className="flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5" /> 4K Çözünürlük</span>
               <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Neural Render</span>
               <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Benzersiz Çıktı</span>
            </div>
          </div>

          {/* SAĞ: GERÇEKÇİ UI MOCKUP (Sanat Çerçevesi) */}
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[520px] mt-4 lg:mt-0 px-2 md:px-0">
             
             {/* Üstteki Prompt Kutusu (Şık ve editoryal) */}
             <div className="absolute -top-4 left-4 md:-left-6 right-10 md:right-16 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 p-5 md:p-6 rounded-xl z-30 shadow-xl shadow-stone-200/50 dark:shadow-black/20">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Rüya Girdisi (Prompt)</span>
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                 </div>
                 <p className="text-stone-800 dark:text-stone-200 font-mono text-xs leading-relaxed italic">
                    "Sisli bir ormanın ortasında, gökyüzüne uzanan gotik tarzda devasa bir kale, altın ışıklar..."
                 </p>
             </div>

             {/* Ana Görsel Çerçevesi (Müze Tablosu Hissi) */}
             <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200 dark:border-stone-800 shadow-2xl h-full bg-stone-100 dark:bg-stone-900 group mt-8 md:mt-0 p-2 md:p-3">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-950">
                  <img 
                     src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop" 
                     alt="AI Dream Output" 
                     className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:scale-105 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-[2s]"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] dark:from-stone-950 via-transparent to-transparent opacity-80"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                     <div className="space-y-2 w-full max-w-[220px]">
                        <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
                           <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                           <span className="text-[11px] font-bold uppercase tracking-wider">Görselleştirildi</span>
                        </div>
                        <div className="w-full h-1 bg-stone-300 dark:bg-stone-700 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500 w-full"></div>
                        </div>
                     </div>
                     <div className="hidden md:flex flex-col items-end gap-1.5 text-[9px] font-mono text-stone-500 dark:text-stone-400 uppercase bg-white/50 dark:bg-black/50 backdrop-blur-sm px-3 py-2 rounded">
                        <span>Stil: Sürrealizm</span>
                        <span>Format: 16:9 (4K)</span>
                     </div>
                  </div>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* ================= 2. TEKNOLOJİ (NASIL ÇALIŞIR - Akademik Anlatım) ================= */}
      <section id="nasil-calisir" className="py-24 relative z-10 border-b border-stone-200 dark:border-stone-800/50">
         <div className="container mx-auto px-6 max-w-5xl">
            
            <div className="mb-20 text-center">
               <h2 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-6">Arka Plandaki Mimari</h2>
               <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif leading-relaxed max-w-2xl mx-auto">
                 Sözcükleri piksellere çevirmek sıradan bir işlem değildir. Sistemimiz, rüyanızın duygu yoğunluğunu korumak için üç aşamalı bir yapay zeka hattı kullanır.
               </p>
            </div>

            <div className="space-y-16">
               
               {/* ADIM 1 */}
               <div className="flex flex-col md:flex-row gap-8 items-start group">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-sm transition-colors group-hover:border-stone-400 dark:group-hover:border-stone-600">
                     <BrainCircuit className="w-6 h-6 text-stone-500 dark:text-stone-400" />
                  </div>
                  <div className="pt-1">
                     <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3 flex items-center gap-3">
                        Doğal Dil İşleme (NLP) <span className="text-[10px] px-2.5 py-1 border border-stone-200 dark:border-stone-800 rounded-full font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 uppercase tracking-widest font-bold">Adım I</span>
                     </h3>
                     <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed">
                        Kullandığımız dil modelleri, yazdığınız rüyayı kelime kelime değil, anlamsal bir bütün olarak değerlendirir. <em className="text-stone-900 dark:text-stone-200 font-medium">"Korkutucu bir sessizlik"</em> veya <em className="text-stone-900 dark:text-stone-200 font-medium">"huzur veren bir ışık"</em> gibi soyut kavramlar, makinenin anlayabileceği matematiksel veri belirteçlerine dönüştürülür.
                     </p>
                  </div>
               </div>

               {/* ADIM 2 */}
               <div className="flex flex-col md:flex-row gap-8 items-start group">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-sm transition-colors group-hover:border-stone-400 dark:group-hover:border-stone-600">
                     <Layers className="w-6 h-6 text-stone-500 dark:text-stone-400" />
                  </div>
                  <div className="pt-1">
                     <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3 flex items-center gap-3">
                        Latent Difüzyon Modeli <span className="text-[10px] px-2.5 py-1 border border-stone-200 dark:border-stone-800 rounded-full font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 uppercase tracking-widest font-bold">Adım II</span>
                     </h3>
                     <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed">
                        Ayrıştırılan veriler, difüzyon (diffusion) mimarisine aktarılır. Sistem, tamamen rastgele oluşan görsel bir parazit (noise) kümesini alır ve bunu adım adım sizin rüyanızdaki sahneye uygun şekilde netleştirir. Çıkan görsel, daha önce hiçbir yerde var olmamış, o an sıfırdan sentezlenmiş bir eserdir.
                     </p>
                  </div>
               </div>

               {/* ADIM 3 */}
               <div className="flex flex-col md:flex-row gap-8 items-start group">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-sm transition-colors group-hover:border-stone-400 dark:group-hover:border-stone-600">
                     <Aperture className="w-6 h-6 text-stone-500 dark:text-stone-400" />
                  </div>
                  <div className="pt-1">
                     <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3 flex items-center gap-3">
                        Upscaling ve Final Render <span className="text-[10px] px-2.5 py-1 border border-stone-200 dark:border-stone-800 rounded-full font-mono text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 uppercase tracking-widest font-bold">Adım III</span>
                     </h3>
                     <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed">
                        Oluşan ilk taslak, yapay zeka tabanlı çözünürlük artırma (AI Upscaling) işleminden geçirilir. Dokular, ışık yansımaları ve renk derinlikleri stüdyo kalitesinde işlenerek, duvarınıza asılabilecek netlikte indirilmeye hazır hale getirilir.
                     </p>
                  </div>
               </div>

            </div>

         </div>
      </section>

      {/* ================= 3. DEV SEO MAKALESİ (Editoryal Dergi Formatı) ================= */}
      <section className="py-24 px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-12 text-center">
            Yapay Zeka ile Rüyaları Çizdirmek
         </h2>
         
         <div className="space-y-12 text-stone-600 dark:text-stone-400 font-serif text-base md:text-lg leading-relaxed">
            
            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <ImageIcon2 className="w-5 h-5 text-amber-500"/> Rüyadan Resim Yapma Teknolojisi
               </h3>
               <p>
                  Eskiden sadece kelimelerle birine anlatabildiğimiz rüyalar, artık saniyeler içinde gözle görülür, yüksek çözünürlüklü tablolara dönüşebiliyor. Arama motorlarında sıkça aranan <strong>"görülen rüyayı resme dönüştürme"</strong> işlemi, gelişmiş difüzyon algoritmaları sayesinde tam da bu platformda mümkün olmaktadır. 
               </p>
               <p>
                  Siz sadece rüyanızı metin olarak girersiniz; sistemimiz o metindeki "kasvetli hava", "uçan dev balıklar" veya "aydınlık bir orman" gibi betimlemeleri algılar ve hiçbir telif hakkına takılmayan, dünyada sadece size ait olan eşsiz bir görsel üretir.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-stone-500 dark:text-stone-400"/> Terapötik Bir Araç Olarak Görselleştirme
               </h3>
               <p>
                  Klasik bir <strong>rüya tabiri</strong> okuması yapmak zihninizi rahatlatabilir ancak rüyanın görsel bir kaydını tutmak, psikolojik olarak çok daha güçlü bir etkiye sahiptir. 
               </p>
               <p>
                  Özellikle tekrarlayan kabuslar gören kişiler için <strong>"Kabuslarla Yüzleşme Terapisi"</strong> oldukça etkilidir. Korkutucu bir rüyayı yapay zekaya çizdirdiğinizde, zihniniz o korkuyu soyut bir tehdit olmaktan çıkarıp somut ve sanatsal bir objeye dönüştürür. Ayrıca rüyalarını düzenli olarak görselleştiren kişilerin, rüya içinde bilinç kazandığı <strong>Lucid Rüya (Bilinçli Rüya)</strong> görme yeteneklerinin arttığı bilimsel olarak desteklenmektedir.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <Palette className="w-5 h-5 text-amber-600 dark:text-amber-500"/> Sanatsal Stiller ve Çıktı Kalitesi
               </h3>
               <p>
                  Platformumuz üzerinde <strong>rüya görseli oluştururken</strong> sadece düz bir fotoğraf elde etmezsiniz. Zihninizin tarzına en uygun sanat akımını seçebilirsiniz. Rüyanız bir yağlı boya tablosu gibi mi hissettiriyordu? Yoksa fütüristik bir Cyberpunk evreninde miydiniz? 
               </p>
               <p>
                  Sinematik, Karakalem, Sürrealizm veya Anime gibi farklı sanat filtreleri ile bilinçaltınızdaki o bulanık sahneyi, gerçek bir ressamın elinden çıkmışçasına kusursuz dijital bir esere dönüştürebilirsiniz.
               </p>
            </article>

         </div>
      </section>

      {/* ================= 4. ALT BİTİRİŞ ================= */}
      <section className="py-16 text-center border-t border-stone-200 dark:border-stone-800/50 relative z-10">
         <div className="container mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-stone-50 mb-8">Gözlerinizi Kapatın.</h2>
            <Link href="#top" className="inline-flex items-center justify-center p-4 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:border-stone-400 transition-all shadow-sm">
               <ArrowDown className="w-5 h-5" />
            </Link>
         </div>
      </section>

    </main>
  );
}