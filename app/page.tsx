import Link from "next/link";
import Image from "next/image";
import { 
  Moon, Sparkles, ArrowRight, BrainCircuit, 
  Compass, Layers, Hash, Palette, Activity,
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

// Sayfa artık Server Component
export default function Home() {

  return (
    // ZEMİN VE RENKLER: Artık global değişkenler kullanılıyor.
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-amber-500/20 relative overflow-hidden">
      
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      {/* Ekstra Dekoratif Işıklar (Açık temadaki boşluğu doldurur) */}
      <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none dark:hidden transform-gpu"></div>
      <div className="absolute top-[40%] -right-40 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none dark:hidden transform-gpu"></div>

      {/* ================= HERO SECTION (DAHA KOMPAKT & SADE) ================= */}
      <section className="relative pt-32 pb-20 container mx-auto px-6 text-center max-w-4xl z-10">
          
          {/* Arkaplan Işığı (Sarı/Altın tonunda, çok soft) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] -z-10 dark:opacity-100 opacity-80 transform-gpu"></div>

          {/* Rozet */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] dark:bg-amber-500/5 border border-[var(--border-color)] dark:border-amber-500/10 text-amber-600 dark:text-amber-200/80 text-[11px] font-medium mb-6 backdrop-blur-md tracking-wider uppercase shadow-sm">
             <Sparkles className="w-3 h-3" /> Spiritüel Yapay Zeka
          </div>

          {/* Başlık */}
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-main)] mb-6 tracking-tight leading-[1.15]">
            Bilinçaltınızın <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-100 dark:via-amber-200 dark:to-amber-400 drop-shadow-sm">
               Rehberliğine Güvenin
            </span>
          </h1>

          <p className="text-base md:text-lg text-[var(--text-muted)] mb-10 max-w-xl mx-auto leading-relaxed font-light">
             Rüyalarınız, semboller ve yıldızlar size ne anlatmaya çalışıyor?
             Modern teknolojiyle iç dünyanızın haritasını çıkarın.
          </p>

          {/* BUTONLAR: Daha zarif */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link 
               href="/auth"
               className="group px-8 py-3 rounded-full bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0B0F19] font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
             >
                <Moon className="w-4 h-4 fill-current" />
                <span>Ücretsiz Başla</span>
             </Link>
             
             <Link 
                href="/sozluk" 
                className="px-8 py-3 rounded-full bg-[var(--bg-card)] dark:bg-white/5 text-[var(--text-main)] font-medium text-sm border border-[var(--border-color)] dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-2 shadow-sm active:scale-95"
             >
                <Search className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Rüya Sözlüğü</span>
             </Link>
          </div>
      </section>

      {/* ================= ÖZELLİKLER (ZIG-ZAG AKIŞI) ================= */}
      <div className="py-16 space-y-24 container mx-auto px-4 md:px-6 relative z-10">
         
         {/* 1. RÜYA ANALİZİ (SOL) */}
         <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 order-1">
               <div className="w-10 h-10 bg-[var(--bg-card)] dark:bg-amber-500/10 rounded-xl flex items-center justify-center border border-[var(--border-color)] dark:border-amber-500/20 shadow-sm">
                  <Moon className="w-5 h-5 text-amber-500 dark:text-amber-300" />
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">
                  Rüya Analizi
               </h2>
               <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed">
                  Sabah uyandığınızda aklınızda kalan o imgeler tesadüf değil. Yapay zeka asistanımız, rüyanızı <strong>İslami kaynaklar</strong> (Nablusi) ve <strong>Psikolojik semboller</strong> (Jung) ile tarayarak size özel bir rehberlik sunar.
               </p>
               <Link href="/auth" className="text-amber-600 dark:text-amber-300 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-2 border-b border-amber-500/20 pb-0.5 hover:border-amber-500/50 w-fit">
                  Yorumla <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
            
            <div className="order-2 relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/50">
               <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-4">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500/80 uppercase tracking-widest">Örnek Analiz</span>
                  <Lock className="w-3 h-3 text-[var(--text-muted)]" />
               </div>
               <div className="space-y-3">
                  <p className="text-sm text-[var(--text-main)] italic">"Rüyamda uçsuz bucaksız bir denizde yüzüyordum..."</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-3 border-l-2 border-amber-500/30">
                     Bu rüya, duygusal derinliğinizi ve bilinçaltınızdaki huzur arayışını simgeler. Deniz, potansiyelinizin sınırsızlığını işaret ederken, yüzmek kontrolün sizde olduğunu gösterir.
                  </p>
               </div>
            </div>
         </div>

         {/* 2. ASTROLOJİ (SAĞ) */}
         <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex items-center justify-center aspect-video shadow-xl shadow-slate-200/50 dark:shadow-black/50">
               <div className="relative w-40 h-40 border border-[var(--border-color)] dark:border-slate-700/50 rounded-full flex items-center justify-center bg-[var(--bg-main)] dark:bg-transparent shadow-inner">
                  <div className="absolute inset-0 border-t border-amber-400/50 dark:border-amber-200/30 rounded-full animate-spin" style={{animationDuration: '15s'}}></div>
                  <Compass className="w-8 h-8 text-amber-500/50 dark:text-amber-200/50" />
                  <div className="absolute top-0 w-1 h-1 bg-[var(--text-muted)] rounded-full"></div>
                  <div className="absolute bottom-0 w-1 h-1 bg-[var(--text-muted)] rounded-full"></div>
                  <div className="absolute left-0 w-1 h-1 bg-[var(--text-muted)] rounded-full"></div>
                  <div className="absolute right-0 w-1 h-1 bg-[var(--text-muted)] rounded-full"></div>
               </div>
            </div>
            <div className="order-1 lg:order-2 space-y-4">
               <div className="w-10 h-10 bg-[var(--bg-card)] dark:bg-amber-500/10 rounded-xl flex items-center justify-center border border-[var(--border-color)] dark:border-amber-500/20 shadow-sm">
                  <Compass className="w-5 h-5 text-amber-500 dark:text-amber-300" />
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">
                  Doğum Haritası
               </h2>
               <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed">
                  Doğduğunuz an gökyüzünün fotoğrafı, karakterinizin haritasıdır. Yükselen burcunuzu, Ay burcunuzu ve gezegenlerin şu anki konumlarının hayatınıza etkisini keşfedin.
               </p>
               <Link href="/astroloji" className="text-amber-600 dark:text-amber-300 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-2 border-b border-amber-500/20 pb-0.5 hover:border-amber-500/50 w-fit">
                  Haritanı Çıkar <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
         </div>

         {/* 3. GÖRSELLEŞTİRME (SOL) */}
         <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 order-1">
               <div className="w-10 h-10 bg-[var(--bg-card)] dark:bg-amber-500/10 rounded-xl flex items-center justify-center border border-[var(--border-color)] dark:border-amber-500/20 shadow-sm">
                  <Palette className="w-5 h-5 text-amber-500 dark:text-amber-300" />
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">
                  Rüya Görselleştirme
               </h2>
               <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed">
                  Bazı rüyaların atmosferini kelimelerle anlatmak zordur. Gördüğünüz o mistik mekanı veya sembolü yapay zeka ile saniyeler içinde <strong>yüksek çözünürlüklü bir tabloya</strong> dönüştürün.
               </p>
               <Link href="/ruya-gorsellestirme" className="text-amber-600 dark:text-amber-300 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-2 border-b border-amber-500/20 pb-0.5 hover:border-amber-500/50 w-fit">
                  Çizim Yap <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
            
            <div className="order-2 relative group overflow-hidden rounded-2xl border border-[var(--border-color)] shadow-xl shadow-slate-200/50 dark:shadow-black/50">
               <div className="aspect-video bg-[var(--bg-main)] dark:bg-[var(--bg-card)] relative">
                  <Image 
                     src="/images/kale.jpg" 
                     alt="AI Art" 
                     fill
                     className="object-cover opacity-80 dark:opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded border border-white/10 backdrop-blur-sm">
                     <p className="text-[10px] text-amber-100">AI Tarafından Çizildi</p>
                  </div>
               </div>
            </div>
         </div>

         {/* 4. TAROT (SAĞ) */}
         <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex items-center justify-center min-h-[250px] shadow-xl shadow-slate-200/50 dark:shadow-black/50">
                <div className="flex gap-3">
                   <div className="w-16 h-24 bg-[var(--bg-main)] dark:bg-[#1e2330] rounded border border-[var(--border-color)] transform -rotate-6 shadow-sm"></div>
                   <div className="w-16 h-24 bg-[var(--bg-main)] dark:bg-[#1e2330] rounded border border-amber-500/30 transform -translate-y-2 flex items-center justify-center shadow-md shadow-amber-500/10">
                      <Layers className="w-6 h-6 text-amber-500/50" />
                   </div>
                   <div className="w-16 h-24 bg-[var(--bg-main)] dark:bg-[#1e2330] rounded border border-[var(--border-color)] transform rotate-6 shadow-sm"></div>
                </div>
            </div>
            <div className="order-1 lg:order-2 space-y-4">
               <div className="w-10 h-10 bg-[var(--bg-card)] dark:bg-amber-500/10 rounded-xl flex items-center justify-center border border-[var(--border-color)] dark:border-amber-500/20 shadow-sm">
                  <Layers className="w-5 h-5 text-amber-500 dark:text-amber-300" />
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">
                  Tarot Rehberliği
               </h2>
               <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed">
                  Kararsız kaldığınızda kartların sembolik diline danışın. Kelt Haçı veya İlişki Açılımı ile sorularınıza <strong>geçmiş, şimdi ve gelecek</strong> perspektifinden bakın.
               </p>
               <Link href="/tarot" className="text-amber-600 dark:text-amber-300 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-2 border-b border-amber-500/20 pb-0.5 hover:border-amber-500/50 w-fit">
                  Kart Seç <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
         </div>

         {/* 5. NUMEROLOJİ (SOL) */}
         <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 order-1">
               <div className="w-10 h-10 bg-[var(--bg-card)] dark:bg-amber-500/10 rounded-xl flex items-center justify-center border border-[var(--border-color)] dark:border-amber-500/20 shadow-sm">
                  <Hash className="w-5 h-5 text-amber-500 dark:text-amber-300" />
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">
                  Numeroloji
               </h2>
               <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed">
                  İsminiz ve doğum tarihiniz, karakterinizin şifresidir. <strong>Yaşam Yolu Sayısı</strong> ve <strong>Kader Sayısı</strong> analizi ile güçlü yönlerinizi keşfedin.
               </p>
               <Link href="/numeroloji" className="text-amber-600 dark:text-amber-300 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-2 border-b border-amber-500/20 pb-0.5 hover:border-amber-500/50 w-fit">
                  Hesapla <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
            
            <div className="order-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex items-center justify-center min-h-[250px] shadow-xl shadow-slate-200/50 dark:shadow-black/50">
               <div className="grid grid-cols-3 gap-4 text-center opacity-60">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                     <span key={n} className="text-lg font-bold text-amber-600/50 dark:text-amber-200/50">{n}</span>
                  ))}
               </div>
            </div>
         </div>

         {/* 6. DUYGU ANALİZİ (SAĞ) */}
         <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 flex flex-col justify-center min-h-[250px] shadow-xl shadow-slate-200/50 dark:shadow-black/50">
                <div className="space-y-4 w-full max-w-xs mx-auto">
                   <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>Stres</span>
                      <span>%40</span>
                   </div>
                   <div className="w-full bg-[var(--bg-main)] dark:bg-slate-800 rounded-full h-1.5 shadow-inner">
                      <div className="bg-red-500/70 dark:bg-red-400/70 h-1.5 rounded-full w-[40%]"></div>
                   </div>
                   <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>Huzur</span>
                      <span>%80</span>
                   </div>
                   <div className="w-full bg-[var(--bg-main)] dark:bg-slate-800 rounded-full h-1.5 shadow-inner">
                      <div className="bg-emerald-500/70 dark:bg-emerald-400/70 h-1.5 rounded-full w-[80%]"></div>
                   </div>
                </div>
            </div>
            <div className="order-1 lg:order-2 space-y-4">
               <div className="w-10 h-10 bg-[var(--bg-card)] dark:bg-amber-500/10 rounded-xl flex items-center justify-center border border-[var(--border-color)] dark:border-amber-500/20 shadow-sm">
                  <Activity className="w-5 h-5 text-amber-500 dark:text-amber-300" />
               </div>
               <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] tracking-tight">
                  Duygu Analizi
               </h2>
               <p className="text-[var(--text-muted)] text-sm md:text-base leading-relaxed">
                  Rüyalarınızdaki duygular, ruh sağlığınızın aynasıdır. Yapay zeka ile rüyalarınızdaki <strong>stres, kaygı ve huzur</strong> oranlarını ölçümleyin.
               </p>
               <Link href="/duygu-analizi" className="text-amber-600 dark:text-amber-300 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-2 border-b border-amber-500/20 pb-0.5 hover:border-amber-500/50 w-fit">
                  Raporu Gör <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
         </div>

      </div>
    </main>
  );
}