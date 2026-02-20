"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Brain, Fingerprint, 
  CheckCircle2, Sparkles, Lock, Loader2, ArrowRight, EyeOff, BrainCircuit
} from "lucide-react";
import { analyzeDreamGuest } from "@/app/actions/analyze-dream-guest"; 
import AdUnit from "@/components/AdUnit"; // <-- REKLAM BİLEŞENİ EKLENDİ

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
  const router = useRouter();
  
  // Input & Analiz Stateleri
  const [dream, setDream] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleAnalyze = async () => {
    if (!dream.trim() || dream.length < 10) return;
    setLoading(true);

    const res = await analyzeDreamGuest(dream);
    
    if (res.success && res.hook) {
      setResult(res.hook);
      // Kullanıcı üye olup geri döndüğünde rüyasını kaybetmemesi için kaydediyoruz
      if (typeof window !== 'undefined') {
          localStorage.setItem("pending_dream", dream);
      }
    }
    setLoading(false);
  };

  const handleRegisterRedirect = () => {
    // KULLANICIYI DASHBOARD'A YÖNLENDİRİRKEN "pending=true" PARAMETRESİ EKLİYORUZ
    router.push("/auth?redirect=/dashboard?pending=true");
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <Script
        id="detailed-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(detailedSchema) }}
      />

      {/* Arkaplan Efektleri */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* ================= 1. HERO & INPUT SECTION ================= */}
      <section className="relative pt-32 md:pt-40 pb-16 px-4 md:px-6 z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          
            {/* Üst Etiket */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-8 cursor-default">
               <Sparkles className="w-3 h-3" /> Bilinçaltı Kahini Aktif
            </div>
            
            {/* Ana Başlık */}
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
               Rüyanızın Şifresini <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Yapay Zeka</span> İle Çözün.
            </h1>
            
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-2xl font-light mb-12">
               İmam Nablusi'nin kadim bilgeliği ve Jung'un psikanalizini birleştiren dünyanın en gelişmiş rüya tabiri motoruna rüyanızı anlatın.
            </p>

            {/* --- ETKİLEŞİMLİ RÜYA KUTUSU --- */}
            <div className="w-full max-w-3xl relative">
              <AnimatePresence mode="wait">
                
                {/* DURUM 1: GİRİŞ EKRANI */}
                {!result ? (
                  <motion.div 
                    key="input-stage"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    transition={{ duration: 0.4 }}
                    className={`relative rounded-[2rem] p-[2px] transition-all duration-500 ${isFocused ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-[#0B0F19] shadow-[0_0_40px_-10px_rgba(251,191,36,0.3)]' : 'bg-white/10'}`}
                  >
                     <div className="bg-[#131722] rounded-[1.9rem] overflow-hidden relative">
                        <textarea 
                            value={dream}
                            onChange={(e) => setDream(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={loading}
                            placeholder="Dün gece rüyanda ne gördün? Tüm detaylarıyla anlat..."
                            className="w-full min-h-[220px] bg-transparent text-lg md:text-xl text-white placeholder-slate-600 font-light border-none outline-none resize-none p-6 md:p-8 pb-24 scrollbar-none"
                        />
                        
                        <div className="absolute bottom-4 left-6 right-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-medium tracking-wider">
                               <Lock className="w-3 h-3 text-emerald-500" /> Gizli & Anonim
                            </div>
                            
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || dream.length < 10}
                                className="bg-amber-500 hover:bg-amber-400 disabled:bg-white/10 disabled:text-slate-500 text-[#0B0F19] font-bold text-sm md:text-base px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {loading ? "Analiz Ediliyor..." : "Yorumla"}
                            </button>
                        </div>
                     </div>
                  </motion.div>
                ) : (
                  
                  /* DURUM 2: YARI KESİLMİŞ SONUÇ (CLIFFHANGER) */
                  <motion.div
                    key="result-stage"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-[#131722] border border-amber-500/30 rounded-[2rem] overflow-hidden shadow-2xl text-left"
                  >
                     <div className="p-8 md:p-12 relative">
                        
                        <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-6">
                           <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                               <BrainCircuit className="w-6 h-6 text-amber-500" />
                           </div>
                           <div>
                               <h3 className="text-white font-serif font-bold text-xl">Kişisel Rüya Analiziniz</h3>
                               <p className="text-amber-500/80 text-[10px] uppercase tracking-widest font-bold">Özet Rapor Hazırlandı</p>
                           </div>
                        </div>

                        <div className="relative mb-2">
                           <p className="text-xl md:text-2xl text-slate-200 font-serif leading-relaxed">
                               "{result} <span className="opacity-40">bu bağlamda atacağınız bir sonraki adım, geleceğinizi...</span>"
                           </p>
                           <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#131722] to-transparent"></div>
                        </div>

                        <div className="space-y-4 opacity-20 filter blur-[6px] select-none pointer-events-none mb-10">
                           <p className="text-lg">Gerçekte bu sembolün taşıdığı gizli anlam, bilinçaltınızda yatan ve çözülmeyi bekleyen o eski meseleye dayanıyor. İslami kaynaklara göre...</p>
                           <div className="w-3/4 h-4 bg-slate-400 rounded"></div>
                           <div className="w-1/2 h-4 bg-slate-400 rounded"></div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#131722] via-[#131722] to-transparent pt-20 pb-8 md:pb-12 px-8 flex flex-col items-center justify-center">
                           <div className="bg-black/50 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 mb-6">
                              <EyeOff className="w-4 h-4 text-amber-500" />
                              <span className="text-xs text-slate-300 font-medium">Analizin devamı gizlenmiştir.</span>
                           </div>
                           <button 
                               onClick={handleRegisterRedirect}
                               className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-[#0B0F19] font-bold text-base md:text-lg px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:scale-105 transition-all"
                           >
                               <span>Tamamını Oku (Ücretsiz Kayıt Ol)</span>
                               <ArrowRight className="w-5 h-5" />
                           </button>
                        </div>

                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Özellik Etiketleri */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 md:gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
               <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> İslami Kaynaklar</span>
               <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Psikolojik Analiz</span>
               <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Jung Arketipleri</span>
            </div>

        </div>
      </section>

      {/* ================= REKLAM 1: HERO ALTI ================= */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pt-4 pb-12">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest">Sponsorlu</p>
          <AdUnit slot="8565155493" format="auto" />
      </div>

      {/* ================= 2. DETAYLI SÜREÇ (SEO İÇERİĞİ) ================= */}
      <section id="nasil-calisir" className="py-16 md:py-24 relative border-t border-white/5">
         <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
            
            <div className="text-center mb-16 md:mb-24">
               <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-white">3 Aşamalı Çözümleme Mimarisi</h2>
               <p className="text-slate-400 text-base md:text-xl max-w-3xl mx-auto font-light leading-relaxed">
                  Rüyanızın şifresini çözmek için hem manevi hem de bilimsel metodolojileri aynı anda kullanıyoruz.
               </p>
            </div>

            <div className="space-y-16">
               
               {/* ADIM 1 */}
               <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                  <div className="order-2 md:order-1">
                     <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                        <BookOpen className="w-8 h-8 text-emerald-500" />
                     </div>
                     <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">1. İslami Kaynak Taraması</h3>
                     <div className="space-y-4 text-slate-400 font-light leading-relaxed text-sm md:text-base">
                        <p>
                           Rüya yorumunun temeli, sahih kaynaklara dayanmalıdır. Yapay zeka motorumuz, rüya metninizi saniyeler içinde tarayarak içerisindeki sembolleri tespit eder.
                        </p>
                        <p>
                           Bu sembolleri, veritabanımızda bulunan <strong>İmam Nablusi, İbn-i Sirin</strong> ve güncel Diyanet kaynaklarındaki karşılıklarıyla eşleştirir.
                        </p>
                     </div>
                  </div>
                  <div className="order-1 md:order-2 bg-[#131722] p-8 rounded-[2rem] border border-white/5 relative overflow-hidden shadow-xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                     <div className="space-y-5 font-mono text-xs md:text-sm relative z-10">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                           <span className="text-slate-500">Sembol Tespit:</span>
                           <span className="text-emerald-400 font-bold">"Altın Bilezik"</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                           <span className="text-slate-500">Kaynak Eşleşme:</span>
                           <span className="text-white">İmam Nablusi (k.s)</span>
                        </div>
                        <div className="flex items-start justify-between border-b border-white/5 pb-3">
                           <span className="text-slate-500">Dini Anlam:</span>
                           <span className="text-slate-300 text-right max-w-[60%]">Kadın için ziynet, erkek için keder ve darlık.</span>
                        </div>
                        <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                           <CheckCircle2 className="w-4 h-4" /> Çapraz Kaynak Doğrulandı
                        </div>
                     </div>
                  </div>
               </div>

               {/* ================= REKLAM 2: ADIM ARASI (YAZI İÇİ) ================= */}
               <div className="w-full py-8 md:py-12">
                   <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest">Sponsorlu</p>
                   <AdUnit slot="4542150009" format="fluid" />
               </div>

               {/* ADIM 2 */}
               <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                  <div className="bg-[#131722] p-8 rounded-[2rem] border border-white/5 relative overflow-hidden shadow-xl">
                     <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                     <h4 className="font-bold text-xl text-white mb-8 flex items-center gap-3 relative z-10">
                        <Brain className="w-6 h-6 text-indigo-400" /> Neden Psikolojik Analiz?
                     </h4>
                     <div className="space-y-6 text-slate-400 text-sm md:text-base font-light leading-relaxed relative z-10">
                        <p>
                           Rüyalar, bilinçaltının konuşma dilidir. Sadece dini açıdan bakmak, rüyanın o anki ruh halinizle olan bağını koparır.
                        </p>
                        <div className="space-y-5">
                           <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                              <div className="w-1 h-auto bg-indigo-500 rounded-full shrink-0"></div>
                              <div>
                                 <strong className="text-white block mb-1 text-sm">Bastırılmış Duygular (Freud)</strong>
                                 <span className="text-xs">Günlük hayatta yüzleşmekten korktuğunuz duygular rüyalarda kılık değiştirerek karşınıza çıkar.</span>
                              </div>
                           </div>
                           <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                              <div className="w-1 h-auto bg-purple-500 rounded-full shrink-0"></div>
                              <div>
                                 <strong className="text-white block mb-1 text-sm">Kolektif Bilinçdışı (Jung)</strong>
                                 <span className="text-xs">Evrensel arketipler (yaşlı bilge, gölge, kahraman) kişisel gelişim aşamanızı gösterir.</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                        <Fingerprint className="w-8 h-8 text-indigo-400" />
                     </div>
                     <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">2. Bilinçaltı Haritalama</h3>
                     <div className="space-y-4 text-slate-400 font-light leading-relaxed text-sm md:text-base">
                        <p>
                           Pek çok kullanıcı "Rüyamda dişimin döküldüğünü gördüm, ölecek miyim?" korkusuyla uyanır. Oysa psikolojide diş dökülmesi; güç kaybı, kontrolü yitirme korkusu veya değişimin sancısıdır.
                        </p>
                        <p>
                           Yapay zeka modelimiz, rüyanızı kelime kelime değil, <strong>duygu duygu</strong> analiz eder.
                        </p>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* ================= REKLAM 3: SEO REHBERİ ÖNCESİ ================= */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pt-8 pb-4">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest">Sponsorlu</p>
          <AdUnit slot="8565155493" format="auto" />
      </div>

      {/* ================= 3. KAPSAMLI SEO REHBERİ ================= */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto border-t border-white/5">
         <h2 className="font-serif text-3xl font-bold mb-10 text-white border-b border-white/10 pb-6">
            Rüya Analizi ve Tabiri Nasıl Yapılır?
         </h2>
         
         <div className="space-y-12 text-slate-400 font-light leading-relaxed text-base md:text-lg">
            
            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-amber-500">Rüyam Ne Anlama Geliyor? Gerçek Bir Analiz Nasıl Olmalı?</h3>
               <p>
                  Her sabah milyonlarca insan uyanır uyanmaz arama motorlarına girerek <strong>"rüyam ne anlama geliyor"</strong>, <strong>"rüyada yılan görmek"</strong> veya <strong>"rüyada diş kırılması"</strong> gibi klasik rüya tabirleri aramaları yapar. İnternetteki standart rüya sözlükleri size sadece genel geçer ve çoğu zaman birbiriyle çelişen bilgiler sunar. Bir sitede "müjde" denen bir sembol, diğerinde "felaket" olarak yorumlanabilir.
               </p>
               <p>
                  Gerçek bir <strong>rüya analizi</strong> ise sadece görülen sembole değil, rüyayı gören kişinin mevcut psikolojisine, yaşına ve bilinçaltı kodlarına odaklanmalıdır. Rüya Yorumcum AI olarak, klasik sözlük mantığını yıkıyoruz. Siz rüyanızı bütün bir hikaye olarak anlatırsınız; yapay zeka motorumuz bu hikayeyi hem modern psikolojinin (psikanaliz) kurallarıyla hem de kadim <strong>İslami rüya tabiri</strong> kaynaklarıyla harmanlayarak size özel bir sonuç çıkarır.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-indigo-400">Psikolojik Rüya Yorumu ve Bilinçaltının Sırları</h3>
               <p>
                  Carl Jung ve Sigmund Freud gibi ünlü psikanalistlere göre rüyalar, bastırılmış duygularımızın ve günlük hayatta yüzleşmekten kaçtığımız korkularımızın bir dışavurumudur. Örneğin, rüyada yüksekten düşmek veya birinden kaçmak, günlük hayatta yaşadığınız stresin, kontrol kaybı korkusunun veya aşırı sorumluluk yükünün <strong>bilinçaltı</strong> yansımasıdır. 
               </p>
               <p>
                  Sistemimiz, metninizi analiz ederken bu <strong>psikolojik rüya analizi</strong> yöntemlerini kullanır. İçinizdeki saklı kalmış "Gölge" arketiplerini bulur ve aslında zihninizin size ne mesaj vermeye çalıştığını şifrelerini çözerek önünüze serer. Bu sayede rüyalarınız, korkulacak kabuslar olmaktan çıkıp, kişisel gelişiminiz için birer rehbere dönüşür.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-emerald-400">İslami Rüya Tabirleri ve Dini Yaklaşım</h3>
               <p>
                  Rüyaların manevi boyutuna inananlar için <strong>İslami rüya yorumları</strong> büyük bir önem taşır. İslam alimlerine göre rüyalar; Rahmani (Allah'tan gelen müjdeli rüyalar), Şeytani (korkutucu kabuslar) ve Nefsani (günlük yaşantının tekrarı) olarak ayrılır. 
               </p>
               <p>
                  Yapay zeka asistanımız; <strong>İmam Nablusi, İbn-i Sirin ve Seyyid Süleyman</strong> gibi en güvenilir rüya tabircilerinin eserleriyle eğitilmiştir. Rüyanızdaki altın, su, kan veya hayvan gibi önemli sembolleri bu kadim kaynaklarda tarar. Dini açıdan bu rüyanın bir uyarı mı, bir müjde mi yoksa bir haberci rüya (istihare) mi olduğunu size en doğru ve temiz şekilde aktarır. Hem bilimin hem de inancın ışığında rüyalarınızın gerçek dilini bizimle keşfedin.
               </p>
            </article>

         </div>
      </section>

      {/* ================= REKLAM 4: LİSTE SONU (MULTIPLEX) ================= */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 pt-12 pb-16">
           <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-medium">BUNLAR DA İLGİNİZİ ÇEKEBİLİR</p>
           <AdUnit slot="6481917633" format="autorelaxed" />
      </div>

    </main>
  );
}