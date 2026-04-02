import Link from "next/link";
import Image from "next/image";
import { 
  Moon, Sparkles, ArrowRight, Activity, 
  Compass, Layers, Hash, Palette,
  Lock, Search
} from "lucide-react";
import Script from "next/script";

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Rüya Yorumcum AI",
  "url": "https://www.ruyayorumcum.com.tr",
  "description": "Yapay zeka destekli rüya tabirleri ve kişisel rehberlik platformu."
};

export default function Home() {
  return (
    <main className="min-h-screen font-sans relative overflow-hidden">
      
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      {/* ================= HERO SECTION (EDİTORYAL & CİDDİ) ================= */}
      <section className="relative pt-32 md:pt-40 pb-20 container mx-auto px-6 text-center max-w-4xl z-10 border-b border-stone-200 dark:border-stone-800/50">
          
          {/* İnce ve zarif bir rozet */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-transparent border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px] font-medium mb-8 tracking-[0.2em] uppercase">
             <Moon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
             Psikolojik & İslami Rehberlik
          </div>

          {/* Klasik, editoryal başlık */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-stone-900 dark:text-stone-50 mb-6 tracking-tight leading-[1.1]">
            Bilinçaltınızın <br className="hidden md:block" />
            <span className="text-stone-500 dark:text-stone-400 font-normal italic">
               Rehberliğine Güvenin
            </span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 mb-12 max-w-2xl mx-auto leading-relaxed font-serif">
             Rüyalarınız, semboller ve yıldızlar size ne anlatmaya çalışıyor?
             Modern teknolojiyle iç dünyanızın şifrelerini editoryal bir derinlikle çözün.
          </p>

          {/* Premium Butonlar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link 
               href="/auth"
               className="group px-8 py-3.5 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-sm transition-colors flex items-center gap-2"
             >
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>Ücretsiz Analiz Başlat</span>
             </Link>
             
             <Link 
                href="/sozluk" 
                className="px-8 py-3.5 rounded-full bg-transparent text-stone-900 dark:text-stone-100 font-medium text-sm border border-stone-300 dark:border-stone-700 hover:border-stone-500 dark:hover:border-stone-500 transition-colors flex items-center gap-2"
             >
                <Search className="w-4 h-4 text-stone-500" />
                <span>Rüya Sözlüğü</span>
             </Link>
          </div>
      </section>

      {/* ================= ÖZELLİKLER (KİTAP BÖLÜMLERİ GİBİ SADE) ================= */}
      <div className="py-20 space-y-32 container mx-auto px-6 max-w-5xl relative z-10">
         
         {/* 1. RÜYA ANALİZİ */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 order-1">
               <span className="text-stone-400 dark:text-stone-500 font-serif italic text-xl">Bölüm I</span>
               <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                  Rüya Analizi
               </h2>
               <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg leading-relaxed">
                  Sabah uyandığınızda aklınızda kalan o imgeler tesadüf değil. Yapay zeka asistanımız, rüyanızı klasik İslami kaynaklar (Nablusi) ve modern analitik psikoloji (Jung) merceğinden süzerek size özel, derinlikli bir rehberlik sunar.
               </p>
               <Link href="/auth" className="text-stone-900 dark:text-stone-100 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-2 group uppercase tracking-wider">
                  Yorumu Keşfet <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-500 transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
            
            <div className="order-2 relative bg-[#faf9f6] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 md:p-10 transition-colors duration-300 rounded-lg">
               <div className="flex items-center justify-between mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Kayıtlı Vaka #104</span>
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
               </div>
               <div className="space-y-5">
                  <p className="text-base text-stone-900 dark:text-stone-200 font-serif italic">"Rüyamda uçsuz bucaksız, durgun bir denizde yalnız başıma yüzüyordum..."</p>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed pl-4 border-l border-stone-300 dark:border-stone-700">
                     Bu rüya, kolektif bilinçdışına olan derin bağınızı ve ruhsal sükunet arayışınızı simgeler. Durgun deniz, zihninizin potansiyelini işaret ederken, yüzmek kontrol mekanizmanızın sağlıklı işlediğini gösterir.
                  </p>
               </div>
            </div>
         </div>

         {/* 2. ASTROLOJİ */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 bg-[#faf9f6] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-10 flex items-center justify-center aspect-square md:aspect-video rounded-lg">
               <div className="relative w-48 h-48 border border-stone-300 dark:border-stone-700 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 border border-dashed border-stone-300 dark:border-stone-700 rounded-full animate-spin-slow" style={{animationDuration: '30s'}}></div>
                  <Compass className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                  {/* Zarif astroloji noktaları */}
                  <div className="absolute top-0 w-1.5 h-1.5 bg-stone-900 dark:bg-stone-300 rounded-full -translate-y-1/2"></div>
                  <div className="absolute bottom-0 w-1.5 h-1.5 bg-stone-900 dark:bg-stone-300 rounded-full translate-y-1/2"></div>
                  <div className="absolute left-0 w-1.5 h-1.5 bg-stone-900 dark:bg-stone-300 rounded-full -translate-x-1/2"></div>
                  <div className="absolute right-0 w-1.5 h-1.5 bg-stone-900 dark:bg-stone-300 rounded-full translate-x-1/2"></div>
               </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
               <span className="text-stone-400 dark:text-stone-500 font-serif italic text-xl">Bölüm II</span>
               <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                  Doğum Haritası
               </h2>
               <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg leading-relaxed">
                  Gökyüzünün doğduğunuz andaki konumu, karakterinizin mühürüdür. Yükselen burcunuzu, Ay düğümlerinizi ve gezegenlerin güncel transitlerinin hayatınıza olan somut etkisini matematiksel bir ciddiyetle okuyun.
               </p>
               <Link href="/astroloji" className="text-stone-900 dark:text-stone-100 text-sm font-bold flex items-center gap-2 group uppercase tracking-wider">
                  Haritayı İncele <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-500 transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
         </div>

         {/* 3. GÖRSELLEŞTİRME */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 order-1">
               <span className="text-stone-400 dark:text-stone-500 font-serif italic text-xl">Bölüm III</span>
               <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 tracking-tight">
                  Görselleştirme
               </h2>
               <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg leading-relaxed">
                  Bazı rüyaların atmosferi kelimelerin ötesindedir. Zihninizdeki o mistik mekanı veya sembolü, yapay zeka entegrasyonumuz sayesinde saniyeler içinde yüksek çözünürlüklü sanatsal bir tabloya dönüştürün.
               </p>
               <Link href="/ruya-gorsellestirme" className="text-stone-900 dark:text-stone-100 text-sm font-bold flex items-center gap-2 group uppercase tracking-wider">
                  Eskizi Çıkar <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-500 transition-transform group-hover:translate-x-1" />
               </Link>
            </div>
            
            <div className="order-2 relative group overflow-hidden border border-stone-200 dark:border-stone-800 rounded-lg">
               <div className="aspect-square md:aspect-video bg-stone-200 dark:bg-stone-900 relative">
                  <Image 
                     src="/images/kale.jpg" 
                     alt="Bilinçaltı Görselleştirmesi" 
                     fill
                     className="object-cover mix-blend-luminosity opacity-80 group-hover:mix-blend-normal transition-all duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                     <p className="text-[10px] font-medium tracking-[0.2em] text-white/80 uppercase">AI Render Model v3</p>
                  </div>
               </div>
            </div>
         </div>

      </div>

      {/* SADE BİR KAPANIŞ (Ciddi markalarda olur) */}
      <div className="container mx-auto px-6 max-w-3xl text-center py-24 border-t border-stone-200 dark:border-stone-800/50">
          <Moon className="w-6 h-6 mx-auto mb-6 text-stone-300 dark:text-stone-700" />
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-50 mb-4">Kendinizi Keşfetmeye Hazır Mısınız?</h3>
          <p className="text-stone-600 dark:text-stone-400 mb-8">Hiçbir rüya anlamsız değildir. Analize hemen başlayın.</p>
          <Link href="/auth" className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium text-sm hover:opacity-90 transition-opacity">
              Başla
          </Link>
      </div>

    </main>
  );
}