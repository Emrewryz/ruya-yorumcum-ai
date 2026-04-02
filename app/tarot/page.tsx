import Link from "next/link";
import { 
  Sparkles, Lock, ArrowRight, 
  Layers, Star, Moon, Heart, Compass, BrainCircuit, CheckCircle2
} from "lucide-react";
import Script from "next/script";

// --- SEO SCHEMA ---
const tarotSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Yapay Zeka Tarot Falı ve Kart Açılımı",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "description": "Gelişmiş yapay zeka ile ücretsiz tarot falı baktırın. Geçmiş, şimdi ve gelecek açılımı ile kişisel rehberlik alın."
    },
    {
      "@type": "Article",
      "headline": "Tarot Falı Nasıl Bakılır? Kartların Gizli Anlamları",
      "description": "Tarot kartlarının anlamları, 3 kart tarot açılımı ve yapay zeka ile tarot okumanın incelikleri hakkında rehber.",
      "author": { "@type": "Organization", "name": "Rüya Yorumcum AI" }
    }
  ]
};

export default function TarotLandingPage() {
  return (
    <main className="min-h-screen font-sans relative overflow-hidden transition-colors duration-300">
      <Script id="tarot-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tarotSchema) }} />
      
      {/* --- ATMOSFER --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-stone-300/30 dark:bg-rose-950/20 rounded-full blur-[140px] pointer-events-none z-0 transform-gpu"></div>

      {/* ================= 1. HERO & PAZARLAMA SECTION (EDİTORYAL MİSTİSİZM) ================= */}
      <section className="relative pt-32 md:pt-48 pb-20 px-6 z-10 border-b border-stone-200 dark:border-stone-800/50">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          
          {/* Üst Etiket */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px] font-medium tracking-[0.2em] uppercase bg-[#faf9f6]/50 dark:bg-stone-900/50 backdrop-blur-sm mb-8">
             <Star className="w-3.5 h-3.5 text-rose-700 dark:text-rose-500" /> Kadim Kart Okuma Sanatı
          </div>
          
          {/* Ana Başlık */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-stone-900 dark:text-stone-50 tracking-tight mb-6">
             Geleceğiniz <br className="hidden md:block" />
             <span className="text-stone-500 dark:text-stone-400 font-normal italic">
               Kartlarda Gizli.
             </span>
          </h1>
          
          <p className="text-stone-600 dark:text-stone-400 text-lg md:text-xl font-serif max-w-2xl mx-auto leading-relaxed mb-12">
             Niyetinize odaklanın. Asırlık Rider-Waite sembolizmi ve yapay zekanın analitik gücüyle hayatınızın en gizli düğümlerini çözün.
          </p>

          {/* Premium CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full sm:w-auto">
             <Link 
               href="/auth?mode=signup"
               className="w-full sm:w-auto px-10 py-4 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-base transition-colors flex items-center justify-center gap-2 shadow-sm group"
             >
                <Layers className="w-5 h-5 text-rose-400 dark:text-rose-600" /> Ücretsiz Seans Başlat
             </Link>
          </div>

          {/* --- SNEAK PEEK: KİLİTLİ TAROT RAPORU MOCKUP --- */}
          <div className="w-full max-w-4xl relative text-left bg-[#faf9f6] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl shadow-stone-200/50 dark:shadow-black/40 overflow-hidden">
             
             {/* Üst Bar */}
             <div className="bg-stone-100 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-rose-900/10 dark:bg-rose-500/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-rose-700 dark:text-rose-500" />
                   </div>
                   <div>
                      <h4 className="text-stone-900 dark:text-stone-100 font-bold text-sm font-serif">Örnek 3 Kart Açılımı</h4>
                      <p className="text-[10px] text-stone-500 font-mono">Niyet: Kariyerimde beni ne bekliyor?</p>
                   </div>
                </div>
                <span className="text-[10px] font-bold text-stone-500 border border-stone-200 dark:border-stone-700 px-2 py-1 rounded bg-white dark:bg-stone-800">ŞİFRELİ</span>
             </div>

             <div className="p-8 md:p-12 relative flex flex-col items-center">
                
                {/* 3 Kart Dizilimi (Görsel Temsil) */}
                <div className="flex justify-center gap-4 md:gap-8 mb-10 w-full max-w-2xl">
                   {/* Kart 1 */}
                   <div className="relative w-24 h-40 md:w-36 md:h-56 rounded-xl overflow-hidden border-2 border-stone-200 dark:border-stone-700 shadow-lg bg-stone-200 dark:bg-stone-800">
                      <img src="https://images.unsplash.com/photo-1633519812404-58a5e30ee107?q=80&w=600&auto=format&fit=crop" alt="Geçmiş Kartı" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-900 to-transparent p-3 pt-8 text-center">
                         <p className="text-rose-300 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1">Geçmiş</p>
                         <p className="text-white font-serif text-xs md:text-sm font-bold truncate">Asılan Adam</p>
                      </div>
                   </div>
                   {/* Kart 2 */}
                   <div className="relative w-24 h-40 md:w-36 md:h-56 rounded-xl overflow-hidden border-2 border-stone-200 dark:border-stone-700 shadow-lg bg-stone-200 dark:bg-stone-800 transform -translate-y-4">
                      <img src="https://images.unsplash.com/photo-1601662528567-526cd06f6582?q=80&w=600&auto=format&fit=crop" alt="Şimdi Kartı" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-900 to-transparent p-3 pt-8 text-center">
                         <p className="text-rose-300 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1">Şimdi</p>
                         <p className="text-white font-serif text-xs md:text-sm font-bold truncate">Kupa Şövalyesi</p>
                      </div>
                   </div>
                   {/* Kart 3 */}
                   <div className="relative w-24 h-40 md:w-36 md:h-56 rounded-xl overflow-hidden border-2 border-stone-200 dark:border-stone-700 shadow-lg bg-stone-200 dark:bg-stone-800">
                      <img src="https://images.unsplash.com/photo-1620662736427-b8a198ee3ec7?q=80&w=600&auto=format&fit=crop" alt="Gelecek Kartı" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-900 to-transparent p-3 pt-8 text-center">
                         <p className="text-rose-300 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1">Gelecek</p>
                         <p className="text-white font-serif text-xs md:text-sm font-bold truncate">Güneş</p>
                      </div>
                   </div>
                </div>

                <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-4 text-center">Analiz Sentezi</h3>
                
                {/* Rapor Metni ve Bulanıklaşma */}
                <div className="relative w-full max-w-2xl text-center px-4">
                   <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-serif text-sm md:text-base">
                      Geçmişte yaşadığınız fedakarlıklar (Asılan Adam), şu anki duygusal veya yaratıcı tekliflere (Kupa Şövalyesi) zemin hazırlamış durumda. Yakın gelecekte sizi bekleyen...
                   </p>
                   
                   <div className="mt-2 space-y-3 opacity-30 select-none blur-[4px]">
                     <div className="w-full h-4 bg-stone-400 dark:bg-stone-600 rounded"></div>
                     <div className="w-5/6 h-4 mx-auto bg-stone-400 dark:bg-stone-600 rounded"></div>
                     <div className="w-4/6 h-4 mx-auto bg-stone-400 dark:bg-stone-600 rounded"></div>
                   </div>

                   <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] dark:from-stone-900 to-transparent flex items-end justify-center pb-2">
                      <Link href="/auth?mode=signup" className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider group bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-stone-200 dark:border-stone-700 shadow-lg">
                        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        Kendi Desteni Aç <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-amber-600 dark:text-amber-500" />
                      </Link>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </section>

      {/* ================= 2. NASIL ÇALIŞIR (Akademik Disiplin) ================= */}
      <section className="py-24 relative z-10 border-b border-stone-200 dark:border-stone-800/50 bg-stone-50 dark:bg-stone-950/30">
         <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-20">
               <h2 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-6">Geleneksel Bilgelik, Modern Mimari</h2>
               <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif max-w-2xl mx-auto">
                  Sıradan bir fal okumasının ötesinde; kartların derin sembolizmini sizin niyetinizle harmanlayarak kişiye özel bir psiko-analitik rapor sunuyoruz.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-950 flex items-center justify-center mb-6 border border-stone-200 dark:border-stone-800">
                     <Moon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Bilinçaltı Senkronizasyonu</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">Kartlar rastgele gelmez. Seçim anındaki niyetiniz ve odaklanmanız, algoritmanın sizin zihinsel enerjinizle eşleşmesini sağlar.</p>
               </div>

               <div className="bg-[#faf9f6] dark:bg-stone-950 p-10 rounded-2xl border-2 border-stone-300 dark:border-stone-700 shadow-xl shadow-stone-200/50 dark:shadow-black/30 relative transform md:-translate-y-4">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">78 Kartlık Analiz</div>
                  <div className="w-12 h-12 rounded-xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center mb-6 border border-stone-300 dark:border-stone-700">
                     <Compass className="w-5 h-5 text-rose-700 dark:text-rose-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Derin Semboloji</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">Klasik Rider-Waite destesinin Majör ve Minör Arkana sembollerini kullanarak, yüzeysel yorumlardan kaçınır, kök nedene ineriz.</p>
               </div>

               <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-950 flex items-center justify-center mb-6 border border-stone-200 dark:border-stone-800">
                     <BrainCircuit className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Yapay Zeka Sentezi</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">Özel sorunuz ile çıkan kartların kombinasyonunu NLP modelleri ile birleştirerek size net ve eyleme dökülebilir tavsiyeler verir.</p>
               </div>
            </div>
         </div>
      </section>

      {/* ================= 3. DEV SEO MAKALESİ (Ansiklopedik Formatta) ================= */}
      <section className="py-24 px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-12 text-center border-b border-stone-200 dark:border-stone-800 pb-8">
            Tarot Falı ve Kartların Gizemli Dünyası
         </h2>
         
         <div className="space-y-12 text-stone-600 dark:text-stone-400 font-serif text-base md:text-lg leading-relaxed">
            
            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <Layers className="w-5 h-5 text-rose-700 dark:text-rose-500"/> Tarot Falı Nedir? Nasıl Bakılır?
               </h3>
               <p>
                  Yüzyıllardır insanların geleceği anlamlandırmak ve içsel rehberlik bulmak için başvurduğu <strong>Tarot</strong>, 78 kartlık kadim bir desteden oluşur. İnternette en çok aranan <strong>"Ücretsiz tarot falı bak"</strong> terimi, insanların hızlı bir yol göstericiye ihtiyaç duyduğunu kanıtlar.
               </p>
               <p>
                  Ancak tarot sadece geleceği dikte eden bir araç değil, aynı zamanda bilinçaltınızın kusursuz bir aynasıdır. Platformumuzda desteye danışırken asıl önemli olan, zihninizde tuttuğunuz o spesifik niyettir (Aşk, Kariyer, Karar aşaması vb.).
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-600 dark:text-amber-500"/> 3 Kart Açılımı (Geçmiş, Şimdi, Gelecek)
               </h3>
               <p>
                  En popüler ve isabetli yöntemlerden biri <strong>3 kart tarot açılımı</strong>dır. Birinci kart geçmişte yaşadığınız ve bugünü şekillendiren kök nedeni; ikinci kart şu anki enerjinizi ve içinde bulunduğunuz durumu; üçüncü kart ise bu yolda devam ederseniz varacağınız muhtemel geleceği (potansiyel sonucu) gösterir.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-stone-500 dark:text-stone-400"/> Yapay Zeka ile Analitik Yorumlama
               </h3>
               <p>
                  Geleneksel ezberci yorumlardan farklı olarak sistemimiz, yapay zeka destekli bir <strong>tarot sentezi</strong> gerçekleştirir. Seçtiğiniz kartların Majör Arkana (Büyük sırlar) mı yoksa Minör Arkana mı olduğunu hesaplar ve birbirleriyle olan etkileşimlerini analiz eder. Sonuç olarak size mistik safsatalar değil, psikolojik temelli ve eyleme geçirilebilir bir rehberlik raporu sunar.
               </p>
            </article>

         </div>
      </section>

    </main>
  );
}