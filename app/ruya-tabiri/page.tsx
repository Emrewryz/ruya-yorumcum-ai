"use client";

import Link from "next/link";
import { 
  BookOpen, Brain, Moon, Star, Layers, 
  CheckCircle2, Fingerprint, Sparkles, Scroll,
  ArrowRight, ShieldCheck, Search, Lightbulb,
  FileText
} from "lucide-react";
import Script from "next/script";

// --- SEO SCHEMA ---
const detailedSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "name": "Yapay Zeka Destekli İslami Rüya Tabiri",
      "provider": { "@type": "Organization", "name": "Rüya Yorumcum AI" },
      "serviceType": "Dream Interpretation",
      "description": "İmam Nablusi ve İbn-i Sirin kaynaklı İslami rüya tabirleri ile Freud ve Jung tabanlı psikolojik rüya analizi."
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
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-[#fbbf24]/30 pb-12 md:pb-20 overflow-x-hidden">
      <Script
        id="detailed-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(detailedSchema) }}
      />

      {/* --- 1. HERO SECTION --- */}
      {/* MOBİL: pt-28 (daha az boşluk), pb-12 */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 overflow-hidden">
        {/* Arkaplan Efektleri - Mobilde küçültüldü */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[1000px] md:h-[600px] bg-[#fbbf24]/5 rounded-[100%] blur-[80px] md:blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          
          <div className="flex flex-col lg:flex-row items-center gap-10 md:gap-16">
            
             {/* SAĞ (MOBİLDE ÜSTTE): METİN */}
             {/* Mobilde sıralamayı değiştirdik: Metin önce, görsel sonra */}
             <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 text-[#fbbf24] font-bold text-xs md:text-sm uppercase tracking-widest justify-center lg:justify-start">
                   <Lightbulb className="w-4 h-4" /> Rüya Tabirinde Yeni Dönem
                </div>
                
                {/* MOBİL: Text-4xl, TABLET: Text-6xl */}
                <h1 className="font-serif text-4xl lg:text-6xl font-bold leading-tight">
                   Geleneksel Tabirleri <br />
                   <span className="text-gray-500">Yapay Zeka ile</span> <br />
                   Yeniden Keşfedin.
                </h1>
                
                <p className="text-gray-400 text-base md:text-lg leading-relaxed px-2 lg:px-0">
                   Rüyalarınız sadece rastgele görüntüler değildir; bilinçaltınızın en derin mesajlarıdır. Platformumuz, <strong>Diyanet rüya tabirleri</strong> külliyatını ve modern <strong>psikanaliz</strong> yöntemlerini birleştirerek size %100 kişisel bir yol haritası sunar.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 px-4 lg:px-0">
                   <Link href="/auth?redirect=dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-bold text-base md:text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      Detaylı Analiz Başlat
                   </Link>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 flex flex-col items-center lg:items-start">
                   <p className="text-xs text-gray-500 mb-2">Analiz Kriterlerimiz:</p>
                   <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-300">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#fbbf24]" /> İslami Kaynaklar</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Jung Arketipleri</span>
                   </div>
                </div>
             </div>

             {/* SOL (MOBİLDE ALTTA): GÖRSEL ODAK */}
             <div className="w-full lg:w-1/2 order-2 lg:order-1 relative group perspective-1000 px-2 md:px-0">
                <div className="relative z-30 bg-[#0f172a] border border-[#fbbf24]/20 rounded-2xl p-5 md:p-8 shadow-2xl">
                   <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-[#fbbf24]/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-[#fbbf24]" />
                         </div>
                         <div>
                            <h3 className="font-bold text-white text-sm md:text-base">Rüya Analiz Raporu</h3>
                            <p className="text-[10px] md:text-xs text-gray-500">Kişiye Özel Hazırlanmıştır</p>
                         </div>
                      </div>
                      <span className="px-2 py-1 md:px-3 md:py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] md:text-xs font-bold border border-green-500/20 whitespace-nowrap">Tamamlandı</span>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                         <h4 className="text-[#fbbf24] font-bold text-sm mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Rüyanın Özü
                         </h4>
                         <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                           "Gördüğünüz yüksek dağ sembolü, kariyerinizdeki hedefleri temsil ederken; tırmanırken zorlanmanız sabır göstermeniz gereken bir sürece işaret ediyor."
                         </p>
                      </div>
                      <div className="flex gap-3 md:gap-4">
                         <div className="flex-1 p-3 md:p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/10">
                            <h4 className="text-emerald-400 font-bold text-xs md:text-sm mb-1">Manevi Yön</h4>
                            <p className="text-[10px] text-gray-500">İhya ve Nablusi kaynaklı...</p>
                         </div>
                         <div className="flex-1 p-3 md:p-4 rounded-xl bg-blue-900/10 border border-blue-500/10">
                            <h4 className="text-blue-400 font-bold text-xs md:text-sm mb-1">Psikolojik Yön</h4>
                            <p className="text-[10px] text-gray-500">Bilinçaltı ve stres...</p>
                         </div>
                      </div>
                   </div>

                   {/* Arkadaki flu kartlar */}
                   <div className="absolute -z-10 top-4 -right-4 w-full h-full bg-[#0f172a] border border-white/5 rounded-2xl opacity-50 scale-95"></div>
                   <div className="absolute -z-20 top-8 -right-8 w-full h-full bg-[#0f172a] border border-white/5 rounded-2xl opacity-30 scale-90"></div>
                </div>
             </div>

          </div>
        </div>
      </section>

      {/* --- 2. DETAYLI SÜREÇ --- */}
      {/* MOBİL: py-16 (boşluk azaltıldı) */}
      <section id="nasil-calisir" className="py-16 md:py-24 bg-[#050a1f] border-t border-white/5 relative">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center mb-12 md:mb-20">
               <h2 className="font-serif text-2xl md:text-4xl font-bold mb-4 md:mb-6">3 Aşamalı Rüya Çözümleme Mimarisi</h2>
               <p className="text-gray-400 text-sm md:text-lg max-w-3xl mx-auto px-2">
                  Rüyanızın şifresini çözmek için hem manevi hem de bilimsel metodolojileri aynı anda kullanıyoruz.
               </p>
            </div>

            <div className="space-y-16 md:space-y-24">
               
               {/* ADIM 1 */}
               <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div className="order-2 md:order-1">
                     <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-emerald-900/20 flex items-center justify-center mb-4 md:mb-6 border border-emerald-500/20">
                        <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-4">1. İslami Kaynak Taraması ve Dini Tabir</h3>
                     <article className="prose prose-invert prose-sm text-gray-400 leading-relaxed">
                        <p>
                           Rüya yorumunun temeli, sahih kaynaklara dayanmalıdır. Yapay zeka motorumuz, rüya metninizi saniyeler içinde tarayarak içerisindeki sembolleri (Örn: Su, Yılan, Altın, Diş) tespit eder.
                        </p>
                        <p className="mt-4">
                           Bu sembolleri, veritabanımızda bulunan <strong>İmam Nablusi, İbn-i Sirin, Seyyid Süleyman</strong> ve güncel Diyanet kaynaklarındaki karşılıklarıyla eşleştirir.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 my-4 text-gray-300">
                           <li><strong>Rahmani mi Şeytani mi?</strong> Rüyanın görüldüğü saat, uyku öncesi durum analizi.</li>
                           <li><strong>İstihare Analizi:</strong> Görülen baskın renkler (Yeşil, Beyaz) üzerinden analiz.</li>
                        </ul>
                     </article>
                  </div>
                  <div className="order-1 md:order-2 bg-[#0f172a] p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                     <div className="space-y-4 font-mono text-xs md:text-sm">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                           <span className="text-gray-500">Sembol:</span>
                           <span className="text-emerald-400">"Altın Bilezik"</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                           <span className="text-gray-500">Kaynak:</span>
                           <span className="text-white">İmam Nablusi (k.s)</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                           <span className="text-gray-500">Anlam:</span>
                           <span className="text-gray-300 text-right max-w-[60%]">Kadın için ziynet, erkek için keder.</span>
                        </div>
                        <div className="mt-4 p-3 bg-emerald-900/20 rounded-lg text-xs text-emerald-300 border border-emerald-500/20">
                           <CheckCircle2 className="w-3 h-3 inline mr-1" /> Kaynak Doğrulandı
                        </div>
                     </div>
                  </div>
               </div>

               {/* ADIM 2 */}
               <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div className="bg-[#0f172a] p-6 md:p-10 rounded-3xl border border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                     
                     <h4 className="font-bold text-lg md:text-xl text-white mb-6 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-blue-500" /> Neden Psikolojik Analiz?
                     </h4>
                     
                     <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
                        <p>
                           Rüyalar, bilinçaltının konuşma dilidir. Sadece dini açıdan bakmak, rüyanın size özel olan "kişisel mesajını" kaçırmanıza neden olabilir.
                        </p>
                        
                        <div className="space-y-4">
                           <div className="flex gap-4">
                              <div className="w-1 h-auto bg-blue-500/50 rounded-full"></div>
                              <div>
                                 <strong className="text-white block mb-1">Bastırılmış Duygular (Freud)</strong>
                                 Günlük hayatta yüzleşmekten korktuğunuz duygular rüyalarda kılık değiştirir.
                              </div>
                           </div>
                           <div className="flex gap-4">
                              <div className="w-1 h-auto bg-purple-500/50 rounded-full"></div>
                              <div>
                                 <strong className="text-white block mb-1">Kolektif Bilinçdışı (Jung)</strong>
                                 Evrensel arketipler (yaşlı bilge, kahraman) karakter gelişiminizi anlatır.
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-900/20 flex items-center justify-center mb-4 md:mb-6 border border-blue-500/20">
                        <Fingerprint className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                     </div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-4">2. Bilinçaltı Haritalama ve Psikanaliz</h3>
                     <article className="prose prose-invert prose-sm text-gray-400">
                        <p>
                           Pek çok kullanıcı "Rüyamda dişimin döküldüğünü gördüm, ölecek miyim?" korkusuyla uyanır. Oysa psikolojide diş dökülmesi; güç kaybı, kontrolü yitirme korkusu veya büyük bir değişimin sancısıdır.
                        </p>
                        <p>
                           Yapay zeka modelimiz, rüyanızı kelime kelime değil, <strong>duygu duygu</strong> analiz eder. Sizin o anki ruh halinizi, yaşam döneminizle birleştirerek rüyanın "psikolojik kök nedenini" raporlar.
                        </p>
                     </article>
                  </div>
               </div>

               {/* ADIM 3: CTA KUTUSU (MOBİL UYUMLU) */}
               <div className="bg-gradient-to-r from-[#fbbf24]/10 via-[#0f172a] to-[#0f172a] p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-[#fbbf24]/20 text-center lg:text-left grid lg:grid-cols-3 gap-6 md:gap-8 items-center">
                  <div className="lg:col-span-2">
                     <h3 className="text-xl md:text-2xl font-bold text-[#fbbf24] mb-4">3. Büyük Sentez: Rüyanın Özü</h3>
                     <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                        Son aşamada yapay zeka, İslami tabir ile psikolojik analizi harmanlar. Çelişkili durumları eler ve size net, eyleme dökülebilir bir <strong>"Hayat Rehberi"</strong> sunar.
                     </p>
                  </div>
                  <div className="flex justify-center">
                     <Link href="/auth?redirect=dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#fbbf24] text-black font-bold rounded-full hover:scale-110 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.4)] text-center">
                        Ücretsiz Analiz Başlat
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- 3. KAPSAMLI SEO MAKALELERİ --- */}
      <section className="py-16 md:py-24 px-4 md:px-6 container mx-auto max-w-5xl">
         <h2 className="font-serif text-2xl md:text-3xl font-bold mb-8 md:mb-12 border-b border-white/10 pb-4">Rüya Kütüphanesi ve Rehber</h2>
         
         <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* SOL KOLON */}
            <article className="space-y-4 md:space-y-6">
               <h3 className="text-lg md:text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <Moon className="w-5 h-5" /> İslami Rüya Tabirleri Nedir?
               </h3>
               <div className="prose prose-invert prose-sm text-gray-400">
                  <p>
                     İslam kültüründe rüyalar üç kategoriye ayrılır: <strong>Salih Rüyalar</strong>, Şeytani Rüyalar ve Nefsani Rüyalar. İslami rüya tabiri, sadece "görülen nesneye" bakılarak yapılmaz.
                  </p>
                  <p>
                     Örneğin, <strong>İmam Nablusi</strong>'ye göre "rüyada yılan görmek", düşmana işaret edebileceği gibi, saltanata da işaret edebilir. Platformumuz, bu ince ayrımları yakalar.
                  </p>
               </div>
            </article>

            {/* SAĞ KOLON */}
            <article className="space-y-4 md:space-y-6">
               <h3 className="text-lg md:text-xl font-bold text-blue-400 flex items-center gap-2">
                  <Fingerprint className="w-5 h-5" /> Rüyalar Gelecekten Haber Verir mi?
               </h3>
               <div className="prose prose-invert prose-sm text-gray-400">
                  <p>
                     Bilimsel açıdan rüyalar beynin veri işleme sürecidir. Ancak parapsikoloji, bazı rüyaların (Haberci Rüyalar) zaman algısının ötesinde bilgiler taşıyabileceğini savunur.
                  </p>
                  <p>
                     <strong>Lucid Rüya</strong>, rüya gördüğünüzün farkında olduğunuz durumdur. Sistemimiz rüya detaylarınızdan bu durumu tespit edebilir.
                  </p>
               </div>
            </article>
         </div>

         {/* SEO KELİME BULUTU */}
         <div className="mt-12 md:mt-16 pt-10 border-t border-white/5">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">En Çok Aranan Tabirler</h4>
            <div className="flex flex-wrap gap-2 md:gap-3">
               {[
                  "Rüyada Diş Dökülmesi İslami Tabiri", "Rüyada Yılan Görmek Diyanet", 
                  "Rüyada Altın Bulmak Nablusi", "Rüyada Öldüğünü Görmek Psikolojik", 
                  "Rüyada Hamile Olduğunu Görmek", "Rüyada Deniz Görmek", 
                  "Rüyada Uçmak Ne Anlama Gelir", "Rüyada Eski Sevgiliyi Görmek",
                  "Rüyada Köpek Isırması", "Rüyada Para Kaybetmek"
               ].map((term, i) => {
                  const slug = term.toLowerCase()
                     .replace(/ /g, '-')
                     .replace(/[ğüşıöç]/g, (c) => {
                        const map: Record<string, string> = {
                           'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c'
                        };
                        return map[c] || c;
                     });

                  return (
                     <Link 
                        key={i} 
                        href={`/sozluk/${slug}`} 
                        className="text-[10px] md:text-xs text-gray-400 bg-white/5 hover:bg-[#fbbf24]/10 hover:text-[#fbbf24] px-2 py-1.5 md:px-3 md:py-2 rounded-lg transition-colors border border-white/5"
                     >
                        {term}
                     </Link>
                  );
               })}
            </div>
         </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-16 md:py-20 text-center px-4">
         <div className="container mx-auto">
            <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4 md:mb-6 text-white">Bilinçaltınız Sizinle Konuşuyor</h2>
            <p className="text-gray-400 mb-8 text-sm md:text-lg max-w-2xl mx-auto">
               Ona kulak verin. Sembollerin ardındaki gizli mesajı çözmek için yapay zeka destekli rehberinizi şimdi kullanın.
            </p>
            <Link href="/auth?redirect=dashboard" className="inline-flex w-full sm:w-auto items-center justify-center px-10 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors shadow-xl">
               Rüyamı Analiz Et
            </Link>
         </div>
      </section>

    </main>
  );
}