import Link from "next/link";
import { 
  ImageIcon, Wand2, Sparkles, 
  Layers, Aperture, Maximize, 
  ArrowRight, BrainCircuit,
  FileImage, Fingerprint, Zap, CheckCircle2,
  Image as ImageIcon2, Palette, Cpu, ScanLine, ArrowDown
} from "lucide-react";
import Script from "next/script";
import AdUnit from "@/components/AdUnit"; 

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
    <main className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans selection:bg-amber-500/30 pb-20 overflow-x-hidden relative scroll-smooth">
      <Script
        id="visualization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(visualizationSchema) }}
      />

      {/* --- ATMOSFER --- */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      
      {/* Arka Plan Işıkları (Rüya Sayfası Tonlaması: Amber/Lacivert) */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[150px]"></div>
      </div>

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-32 md:pt-40 pb-16 px-4 md:px-6 z-10 min-h-[85vh] flex items-center">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* SOL: COPYWRITING (Orantılı Boyutlar) */}
          <div className="space-y-6 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 text-[10px] md:text-xs font-mono uppercase tracking-widest shadow-xl">
              <ScanLine className="w-3.5 h-3.5 text-amber-500" /> Deep Learning Engine v2
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-white tracking-tight">
              Bilinçaltınızı <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                Görselleştirin.
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              Kelimelerin yetersiz kaldığı o sınırda, yapay zekamız devreye giriyor. Rüyalarınızı yüksek sadakatli, stüdyo kalitesinde dijital sanat eserlerine dönüştüren gelişmiş difüzyon teknolojisi.
            </p>

            <div className="flex justify-center lg:justify-start pt-2">
              <Link href="/auth?redirect=visualize" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-amber-500/30 transition-colors flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm group">
                <ImageIcon className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" /> Stüdyoya Giriş Yap
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest border-t border-white/5 mt-6">
               <span className="flex items-center gap-1.5"><Maximize className="w-3 h-3 text-slate-600" /> 4K Çözünürlük</span>
               <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-slate-600" /> Neural Render</span>
               <span className="flex items-center gap-1.5"><Fingerprint className="w-3 h-3 text-slate-600" /> Uniq Çıktı</span>
            </div>
          </div>

          {/* SAĞ: GERÇEKÇİ UI MOCKUP */}
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[500px] perspective-1000 mt-4 lg:mt-0 px-2 md:px-0">
             
             {/* Üstteki Prompt Kutusu */}
             <div className="absolute -top-4 left-4 md:-left-6 right-10 md:right-16 bg-[#131722]/90 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-2xl z-30 shadow-2xl">
                 <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Rüya Girdisi</span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 </div>
                 <p className="text-slate-300 font-mono text-xs leading-relaxed">
                    Sisli bir ormanın ortasında, gökyüzüne uzanan gotik tarzda devasa bir kale, altın ışıklar...
                 </p>
             </div>

             {/* Ana Görsel Çerçevesi */}
             <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.1)] h-full bg-[#0B0F19] group mt-8 md:mt-0">
                <img 
                   src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop" 
                   alt="AI Dream Output" 
                   className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-[2s] sepia-[20%] hue-rotate-15"
                />
                
                {/* Teknolojik Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-90"></div>
                
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                   <div className="space-y-1.5 w-full max-w-[200px]">
                      <div className="flex items-center gap-2">
                         <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                         <span className="text-[10px] font-mono text-white">Rüya Görselleştirildi</span>
                      </div>
                      <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-full"></div>
                      </div>
                   </div>
                   <div className="hidden md:flex flex-col items-end gap-1 text-[8px] font-mono text-slate-500 uppercase">
                      <span>Stil: Sürrealizm</span>
                      <span>Format: 16:9 4K</span>
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

      {/* ================= 2. TEKNOLOJİ (NASIL ÇALIŞIR) ================= */}
      <section id="nasil-calisir" className="py-20 relative z-10">
         <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            
            <div className="mb-16 md:mb-20 text-center md:text-left">
               <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Arka Plandaki Mimari</h2>
               <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-2xl">
                  Sözcükleri piksellere çevirmek sıradan bir işlem değildir. Sistemimiz, rüyanızın duygu yoğunluğunu korumak için üç aşamalı bir yapay zeka hattı kullanır.
               </p>
            </div>

            <div className="space-y-10 md:space-y-14">
               
               {/* ADIM 1 */}
               <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start group">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-colors">
                     <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-3">
                        Doğal Dil İşleme (NLP) <span className="text-[9px] px-2 py-0.5 border border-white/10 rounded font-mono text-slate-500 bg-white/5">Adım 1</span>
                     </h3>
                     <p className="text-slate-400 text-sm font-light leading-relaxed">
                        Kullandığımız dil modelleri, yazdığınız rüyayı kelime kelime değil, anlamsal bir bütün olarak değerlendirir. <em>"Korkutucu bir sessizlik"</em> veya <em>"huzur veren bir ışık"</em> gibi soyut kavramlar, makinenin anlayabileceği veri belirteçlerine dönüştürülür.
                     </p>
                  </div>
               </div>

               {/* ADIM 2 */}
               <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start group">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-colors">
                     <Layers className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-3">
                        Latent Difüzyon Modeli <span className="text-[9px] px-2 py-0.5 border border-white/10 rounded font-mono text-slate-500 bg-white/5">Adım 2</span>
                     </h3>
                     <p className="text-slate-400 text-sm font-light leading-relaxed">
                        Ayrıştırılan veriler, difüzyon (diffusion) mimarisine aktarılır. Sistem, tamamen rastgele oluşan görsel bir parazit (noise) kümesini alır ve bunu adım adım sizin rüyanızdaki sahneye uygun şekilde netleştirir. Görsel o an sıfırdan sentezlenir.
                     </p>
                  </div>
               </div>

               {/* ADIM 3 */}
               <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start group">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-colors">
                     <Aperture className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-lg md:text-xl font-bold text-white mb-2 flex items-center gap-3">
                        Upscaling ve Final Render <span className="text-[9px] px-2 py-0.5 border border-white/10 rounded font-mono text-slate-500 bg-white/5">Adım 3</span>
                     </h3>
                     <p className="text-slate-400 text-sm font-light leading-relaxed">
                        Oluşan ilk taslak, yapay zeka tabanlı çözünürlük artırma (AI Upscaling) işleminden geçirilir. Dokular, ışık yansımaları ve renk derinlikleri stüdyo kalitesinde işlenerek indirilmeye hazır hale getirilir.
                     </p>
                  </div>
               </div>

            </div>

         </div>
      </section>

      {/* --- REKLAM 2: BÖLÜM ARASI --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 z-10 relative">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="4542150009" format="fluid" />
      </div>

      {/* ================= 3. DEV SEO MAKALESİ ================= */}
      <section className="py-12 px-4 md:px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-10 border-b border-white/10 pb-6">
            Yapay Zeka ile Rüyaları Çizdirmek
         </h2>
         
         <div className="space-y-12 text-slate-400 font-light leading-relaxed text-sm md:text-base">
            
            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <ImageIcon2 className="w-5 h-5 text-amber-500"/> Rüyadan Resim Yapma Teknolojisi
               </h3>
               <p>
                  Eskiden sadece kelimelerle birine anlatabildiğimiz rüyalar, artık saniyeler içinde gözle görülür, yüksek çözünürlüklü tablolara dönüşebiliyor. Arama motorlarında sıkça aranan <strong>"görülen rüyayı resme dönüştürme"</strong> işlemi, gelişmiş difüzyon algoritmaları sayesinde mümkün olmaktadır. 
               </p>
               <p>
                  Siz sadece rüyanızı metin olarak girersiniz; sistemimiz o metindeki "kasvetli hava", "uçan dev balıklar" veya "aydınlık bir orman" gibi betimlemeleri algılar ve hiçbir telif hakkına takılmayan, dünyada sadece size ait olan eşsiz bir görsel üretir.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400"/> Psikolojik Terapi Olarak Görselleştirme
               </h3>
               <p>
                  Klasik bir <strong>rüya tabirleri</strong> okuması yapmak zihninizi rahatlatabilir ancak rüyanın görsel bir kaydını tutmak, psikolojik olarak çok daha güçlü bir etkiye sahiptir. 
               </p>
               <p>
                  Özellikle tekrarlayan kabuslar gören kişiler için <strong>"Kabuslarla Yüzleşme Terapisi"</strong> oldukça etkilidir. Korkutucu bir rüyayı yapay zekaya çizdirdiğinizde, zihniniz o korkuyu soyut bir tehdit olmaktan çıkarıp "somut ve sanatsal bir objeye" dönüştürür. Ek olarak, rüyalarını görselleştiren kişilerin, rüya içinde bilinç kazandığı <strong>Lucid Rüya (Bilinçli Rüya)</strong> görme yeteneklerinin arttığı gözlemlenmiştir. 
               </p>
            </article>

            {/* REKLAM 3: SEO İÇERİĞİ ARASI */}
            <div className="py-6 border-y border-white/5 my-6">
                <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                <AdUnit slot="4542150009" format="fluid" />
            </div>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-emerald-500"/> Sanatsal Stiller ve Çıktı Kalitesi
               </h3>
               <p>
                  Platformumuz üzerinde <strong>rüya görseli oluştururken</strong> sadece düz bir fotoğraf elde etmezsiniz. Zihninizin tarzına en uygun sanat akımını seçebilirsiniz. Rüyanız bir yağlı boya tablosu gibi mi hissettiriyordu? Yoksa fütüristik bir Cyberpunk evreninde miydiniz? 
               </p>
               <p>
                  Sinematik, Karakalem, Sürrealizm veya Anime gibi farklı filtreler ile bilinçaltınızdaki o bulanık sahneyi duvarınıza asılabilecek kalitede dijital bir sanat eserine dönüştürebilirsiniz.
               </p>
            </article>

         </div>
      </section>

      {/* REKLAM 4: İÇERİK SONU MULTIPLEX */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-4 mb-20 z-10 relative">
          <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-bold">İlginizi Çekebilir</p>
          <AdUnit slot="6481917633" format="autorelaxed" />
      </div>

      {/* ================= 4. ALT BİTİRİŞ (İlham Alın) ================= */}
      <section className="py-12 text-center border-t border-white/5 relative z-10">
         <div className="container mx-auto px-4">
            <h2 className="font-serif text-xl md:text-2xl text-slate-400 mb-4">Gözlerinizi Kapatın.</h2>
            <Link href="#top" className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
               <ArrowDown className="w-5 h-5 animate-bounce" />
            </Link>
         </div>
      </section>

    </main>
  );
}