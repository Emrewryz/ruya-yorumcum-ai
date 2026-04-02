"use client";

import Link from "next/link";
import Script from "next/script";
import { 
  BookOpen, Brain, Fingerprint, 
  CheckCircle2, Sparkles, ArrowRight, Lock, Moon
} from "lucide-react";

// --- SEO SCHEMA ---
const detailedSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "name": "Yapay Zeka Destekli İslami ve Psikolojik Rüya Tabiri",
      "provider": { "@type": "Organization", "name": "Rüya Yorumcum AI" },
      "serviceType": "Dream Interpretation",
      "description": "İmam Nablusi kaynaklı İslami rüya tabirleri ile Freud ve Jung tabanlı psikolojik rüya analizi."
    },
    {
      "@type": "Article",
      "headline": "Rüya Tabiri Nasıl Yapılır? İslami ve Bilimsel Yöntemler",
      "description": "Rüya yorumlamanın incelikleri, sembollerin manevi anlamları ve bilinçaltı analizi hakkında detaylı rehber.",
      "author": { "@type": "Organization", "name": "Rüya Yorumcum AI" }
    }
  ]
};

export default function RuyaTabiriPage() {
  return (
    <main className="min-h-screen font-sans relative overflow-hidden">
      <Script
        id="detailed-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(detailedSchema) }}
      />

      {/* ================= 1. HERO & PAZARLAMA SECTION ================= */}
      <section className="relative pt-32 md:pt-40 pb-20 px-6 z-10 border-b border-stone-200 dark:border-stone-800/50">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          
            {/* Üst Etiket */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-transparent border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px] font-medium tracking-[0.2em] uppercase mb-8">
               <Moon className="w-3 h-3 text-amber-600 dark:text-amber-500" />
               Bilinçaltı Analiz Motoru
            </div>
            
            {/* Ana Başlık */}
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 dark:text-stone-50 leading-[1.1] tracking-tight mb-6">
               Rüyanızın Şifresini <br className="hidden md:block" />
               <span className="text-stone-500 dark:text-stone-400 font-normal italic">Yapay Zeka ile Çözün.</span>
            </h1>
            
            <p className="text-stone-600 dark:text-stone-400 text-lg md:text-xl leading-relaxed max-w-2xl font-serif mb-12">
               İmam Nablusi'nin kadim bilgeliği ve Carl Jung'un psikanalizini birleştiren dünyanın en gelişmiş rüya tabiri algoritmasıyla tanışın.
            </p>

            {/* Premium CTA Butonları */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
               <Link 
                 href="/auth?mode=signup"
                 className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-base transition-colors flex items-center justify-center gap-2 shadow-sm"
               >
                  <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                  <span>Ücretsiz Analiz Başlat</span>
               </Link>
            </div>

            {/* --- ÖRNEK ANALİZ (SNEAK PEEK) MOCKUP --- */}
            <div className="w-full max-w-4xl relative text-left bg-[#faf9f6] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl shadow-stone-200/50 dark:shadow-black/50 overflow-hidden transform-gpu">
                {/* Mac OS tarzı zarif bar */}
                <div className="bg-stone-100 dark:bg-stone-950/50 border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-700"></div>
                   <div className="w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-700"></div>
                   <div className="w-3 h-3 rounded-full bg-stone-300 dark:bg-stone-700"></div>
                   <span className="ml-2 text-xs text-stone-500 dark:text-stone-400 font-mono">rapor_ornek_v2.ai</span>
                </div>
                
                <div className="p-8 md:p-12 relative">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center shrink-0">
                         <Brain className="w-6 h-6 text-stone-600 dark:text-stone-400" />
                      </div>
                      <div>
                         <h3 className="text-stone-900 dark:text-stone-50 font-serif font-bold text-xl md:text-2xl">Kişisel Rüya Analizi</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-emerald-600 dark:text-emerald-500/80 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Analiz Tamamlandı</span>
                         </div>
                      </div>
                   </div>

                   <p className="text-lg md:text-xl text-stone-900 dark:text-stone-200 font-serif leading-relaxed italic mb-6">
                     "Gökyüzünden dökülen altın rengi yaprakların altında yürüyordum..."
                   </p>

                   <div className="space-y-4 text-stone-600 dark:text-stone-400 leading-relaxed text-sm md:text-base mb-8">
                      <p>
                        <strong className="text-stone-900 dark:text-stone-200">Psikolojik Boyut:</strong> Bu sembolizm, hayatınızda bir dönüşüm evresine girdiğinizi ve geçmişten gelen yükleri "dökülen yapraklar" misali geride bıraktığınızı gösteriyor...
                      </p>
                      <p>
                        <strong className="text-stone-900 dark:text-stone-200">İslami Boyut:</strong> İmam Nablusi'ye göre altın rengi yapraklar, zahmetsizce elde edilecek bir ilme veya manevi bir ferahlamaya işaret eder...
                      </p>
                   </div>

                   {/* Bulanıklaşan kısım - Kullanıcıyı kayıt olmaya teşvik eder */}
                   <div className="relative">
                      <div className="space-y-3 opacity-30 select-none blur-[4px]">
                        <div className="w-full h-4 bg-stone-400 dark:bg-stone-600 rounded"></div>
                        <div className="w-5/6 h-4 bg-stone-400 dark:bg-stone-600 rounded"></div>
                        <div className="w-4/6 h-4 bg-stone-400 dark:bg-stone-600 rounded"></div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] dark:from-stone-900 to-transparent flex items-end justify-center pb-2">
                         <Link href="/auth?mode=signup" className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider group bg-white/50 dark:bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-stone-200 dark:border-stone-700">
                           <Lock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                           Kendi Rüyanı Yorumlat <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-amber-600 dark:text-amber-500" />
                         </Link>
                      </div>
                   </div>
                </div>
            </div>

            {/* Özellik Etiketleri */}
            <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 text-xs font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
               <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-stone-400 dark:text-stone-600" /> İslami Kaynaklar</span>
               <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-stone-400 dark:text-stone-600" /> Psikolojik Analiz</span>
               <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-stone-400 dark:text-stone-600" /> %100 Gizlilik</span>
            </div>

        </div>
      </section>

      {/* ================= 2. DETAYLI SÜREÇ (EDİTORYAL MİMARİ) ================= */}
      <section id="nasil-calisir" className="py-24 relative">
         <div className="max-w-5xl mx-auto px-6 relative z-10">
            
            <div className="text-center mb-20">
               <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-stone-900 dark:text-stone-50 tracking-tight">3 Aşamalı Çözümleme Mimarisi</h2>
               <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg max-w-2xl mx-auto font-serif">
                  Rüyanızın şifresini çözmek için hem kadim dini metinleri hem de modern bilimi eşzamanlı olarak tarıyoruz.
               </p>
            </div>

            <div className="space-y-24">
               
               {/* ADIM 1 */}
               <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                  <div className="order-2 md:order-1 space-y-6">
                     <span className="text-stone-400 dark:text-stone-500 font-serif italic text-xl">Aşama I</span>
                     <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">Kadim Metin Taraması</h3>
                     <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm md:text-base">
                        Yapay zeka motorumuz, rüya metninizi saniyeler içinde tarayarak içerisindeki sembolleri tespit eder. Bu sembolleri, veritabanımızda bulunan <strong>İmam Nablusi ve İbn-i Sirin</strong> gibi güvenilir alimlerin kaynaklarındaki karşılıklarıyla eşleştirir.
                     </p>
                  </div>
                  <div className="order-1 md:order-2 bg-[#faf9f6] dark:bg-stone-900 p-8 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-black/50">
                     <div className="space-y-5 font-mono text-xs md:text-sm">
                        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                           <span className="text-stone-500">Sembol Tespit:</span>
                           <span className="text-stone-900 dark:text-stone-100 font-bold">"Altın Bilezik"</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                           <span className="text-stone-500">Kaynak Eşleşme:</span>
                           <span className="text-stone-900 dark:text-stone-100">İmam Nablusi (k.s)</span>
                        </div>
                        <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                           <span className="text-stone-500">Dini Anlam:</span>
                           <span className="text-stone-900 dark:text-stone-100 text-right max-w-[60%]">Kadın için ziynet, erkek için keder ve darlık.</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* ADIM 2 */}
               <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                  <div className="bg-[#faf9f6] dark:bg-stone-900 p-8 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-black/50">
                     <div className="space-y-6 text-sm md:text-base font-serif italic text-stone-700 dark:text-stone-300">
                        <p className="border-l-2 border-stone-300 dark:border-stone-700 pl-4">
                           "Rüyalar, bilinçaltına giden kral yoludur." — Sigmund Freud
                        </p>
                        <p className="border-l-2 border-stone-300 dark:border-stone-700 pl-4">
                           "Dışarıya bakan rüya görür, içeriye bakan uyanır." — Carl Jung
                        </p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <span className="text-stone-400 dark:text-stone-500 font-serif italic text-xl">Aşama II</span>
                     <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">Psikolojik Çözümleme</h3>
                     <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm md:text-base">
                        Sadece dini açıdan bakmak, rüyanın güncel ruh halinizle olan bağını zayıflatır. Modelimiz, rüyanızdaki eylemleri <strong>bastırılmış duygular</strong> ve <strong>kolektif bilinçdışı</strong> arketipleri üzerinden okuyarak zihinsel durumunuzu analiz eder.
                     </p>
                  </div>
               </div>

               {/* ADIM 3 */}
               <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                  <div className="order-2 md:order-1 space-y-6">
                     <span className="text-stone-400 dark:text-stone-500 font-serif italic text-xl">Aşama III</span>
                     <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">Bilinçaltı Sentezi</h3>
                     <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm md:text-base">
                        Örneğin diş dökülmesi rüyası, basit bir kayıp korkusu olabileceği gibi kontrolü yitirme endişesinin bir yansımasıdır. Yapay zeka, metninizi kelime kelime değil, <strong>duygusal bağlamıyla</strong> sentezleyerek tamamen size özel, birleşik bir rapor sunar.
                     </p>
                     <Link href="/auth?mode=signup" className="text-stone-900 dark:text-stone-100 text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all pt-4 group uppercase tracking-wider">
                        Sistemi Deneyimle <ArrowRight className="w-4 h-4 text-amber-600 transition-transform group-hover:translate-x-1" />
                     </Link>
                  </div>
                  <div className="order-1 md:order-2 bg-[#faf9f6] dark:bg-stone-900 p-8 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-black/50 flex justify-center items-center h-full min-h-[200px]">
                     <Fingerprint className="w-24 h-24 text-stone-300 dark:text-stone-800" strokeWidth={1} />
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* ================= 3. KAPSAMLI SEO REHBERİ (EDİTORYAL) ================= */}
      <section className="py-24 px-6 max-w-4xl mx-auto border-t border-stone-200 dark:border-stone-800/50">
         <h2 className="font-serif text-3xl md:text-4xl font-bold mb-12 text-stone-900 dark:text-stone-50 text-center">
            Gerçek Bir Analiz Nasıl Yapılmalıdır?
         </h2>
         
         <div className="space-y-12 text-stone-600 dark:text-stone-400 leading-relaxed text-base md:text-lg font-serif">
            
            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-200 font-sans">Sözlüklerin Ötesine Geçmek</h3>
               <p>
                  Her sabah milyonlarca insan uyanır uyanmaz arama motorlarına girerek <strong>"rüyam ne anlama geliyor"</strong> gibi klasik aramalar yapar. İnternetteki standart rüya sözlükleri size sadece genel geçer ve çoğu zaman birbiriyle çelişen bilgiler sunar. Bir sitede "müjde" denen bir sembol, diğerinde "felaket" olarak yorumlanabilir. Gerçek bir analiz ise rüyayı gören kişinin mevcut psikolojisine ve hikayenin bütününe odaklanmalıdır.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-200 font-sans">Psikanaliz ve Bilinçaltının Sırları</h3>
               <p>
                  Carl Jung ve Sigmund Freud gibi ünlü psikanalistlere göre rüyalar, günlük hayatta yüzleşmekten kaçtığımız korkularımızın bir dışavurumudur. Örneğin, rüyada yüksekten düşmek veya birinden kaçmak, günlük hayatta yaşadığınız stresin, kontrol kaybı korkusunun <strong>bilinçaltı</strong> yansımasıdır. İçinizdeki saklı kalmış "Gölge" arketiplerini anlamak, rüyaları korkulacak kabuslar olmaktan çıkarıp kişisel gelişim rehberlerine dönüştürür.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-200 font-sans">Kadim Bilgelik ve Dini Yaklaşım</h3>
               <p>
                  Rüyaların manevi boyutuna inananlar için <strong>İslami rüya yorumları</strong> büyük bir önem taşır. İslam alimlerine göre rüyalar; Rahmani, Şeytani ve Nefsani olarak ayrılır. Dini açıdan bu rüyanın bir uyarı mı, bir müjde mi yoksa bir haberci rüya (istihare) mi olduğunu kavramak, ancak güvenilir kaynakların doğru sentezlenmesiyle mümkündür. Hem bilimin hem de inancın ışığında rüyalarınızın gerçek dilini bizimle keşfedin.
               </p>
            </article>

         </div>
      </section>

    </main>
  );
}