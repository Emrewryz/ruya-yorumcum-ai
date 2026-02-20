"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Lock, ArrowRight, RefreshCcw, 
  Layers, Star, Moon, Heart, Compass ,BrainCircuit
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { TAROT_DECK } from "@/utils/tarot-deck"; 
import Script from "next/script";
import AdUnit from "@/components/AdUnit";

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

export default function TarotLandingClient() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // AŞAMALAR:
  const [phase, setPhase] = useState<'intention' | 'shuffle' | 'spread' | 'locked_result'>('intention');
  
  const [question, setQuestion] = useState("");
  const [selectedCards, setSelectedCards] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    };
    init();
  }, [supabase]);

  // 1. AŞAMA: NİYETİ ONAYLA VE KARIŞTIRMAYA GEÇ
  const handleIntentionSubmit = () => {
    if (!question.trim()) return;
    setPhase('shuffle');
    setTimeout(() => {
      setPhase('spread');
    }, 2500);
  };

  // 2. AŞAMA: KART SEÇME
  const handleCardPick = (index: number) => {
    if (selectedCards.length >= 3) return;
    
    const randomCard = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
    const newSelection = [...selectedCards, { ...randomCard, tempId: index }];
    setSelectedCards(newSelection);

    if (navigator && navigator.vibrate) navigator.vibrate(40);

    // 3 Kart seçildi mi?
    if (newSelection.length === 3) {
      setTimeout(() => setPhase('locked_result'), 1200); 
    }
  };

  // 3. AŞAMA: KAYDET VE YÖNLENDİR
  const handleUnlockResult = (isLoggedIn: boolean) => {
    const readingData = {
        question: question,
        cards: selectedCards.map(c => ({ id: c.id, name: c.name, image: c.image })),
        date: new Date().toISOString()
    };
    
    localStorage.setItem('pending_tarot_reading', JSON.stringify(readingData));

    if (isLoggedIn) {
        // Zaten giriş yapmışsa direkt panele (Dashboard içindeki tarota yönlendiriyor)
        router.push('/dashboard/tarot?new=true'); 
    } else {
        router.push('/auth?redirect=/dashboard/tarot?new=true');
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans selection:bg-rose-500/30 pb-24 overflow-x-hidden relative">
      <Script id="tarot-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tarotSchema) }} />
      
      {/* --- ATMOSFER --- */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-rose-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* ================= 1. HERO & İNTERAKTİF UYGULAMA ALANI ================= */}
      <section className="relative pt-32 md:pt-40 pb-16 px-4 md:px-6 z-10 flex flex-col items-center">
        
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-rose-400 text-[10px] md:text-xs font-mono uppercase tracking-widest shadow-xl">
             <Star className="w-3.5 h-3.5" /> 3 Kart Tarot Açılımı
           </div>
           <h1 className="font-serif text-4xl md:text-6xl font-bold leading-[1.1] text-white tracking-tight mb-4">
              Geleceğiniz <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-rose-500 to-pink-500">
                Kartlarda Gizli
              </span>
           </h1>
           <p className="text-slate-400 text-sm md:text-base font-light max-w-xl mx-auto">
              Niyetinize odaklanın, sorunuzu yazın ve yapay zeka kahinimizin kartlarınızı okumasına izin verin.
           </p>
        </div>

        {/* --- İNTERAKTİF TAROT KUTUSU --- */}
        <div className="relative w-full max-w-4xl min-h-[500px] md:min-h-[550px] bg-[#131722]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(225,29,72,0.1)] overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-700">
            
            <AnimatePresence mode="wait">

                {/* --- PHASE 1: NİYET (INTENTION) --- */}
                {phase === 'intention' && (
                <motion.div 
                    key="intention"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    className="relative z-10 w-full max-w-lg text-center"
                >
                    <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(225,29,72,0.15)]">
                        <Layers className="w-8 h-8 text-rose-500" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">Kartlara Ne Sormak İstersiniz?</h2>
                    <p className="text-slate-400 mb-8 text-sm font-light">
                        Zihninizi boşaltın. Sadece cevabını aradığınız o tek konuya odaklanın.
                    </p>

                    <div className="relative group mb-6">
                        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                        <input 
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Örn: Bu ilişkide beni neler bekliyor?"
                            className="relative w-full bg-[#0B0F19] text-white p-5 rounded-2xl border border-white/5 outline-none focus:border-rose-500/50 transition-colors text-center text-sm md:text-base placeholder:text-slate-600"
                            onKeyDown={(e) => e.key === 'Enter' && handleIntentionSubmit()}
                        />
                    </div>

                    <button 
                        onClick={handleIntentionSubmit}
                        disabled={!question.trim()}
                        className="px-10 py-4 bg-white text-[#0B0F19] font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl flex items-center gap-2 mx-auto"
                    >
                        Enerjimi Gönder <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
                )}

                {/* --- PHASE 2: KARIŞTIRMA (SHUFFLE) --- */}
                {phase === 'shuffle' && (
                <motion.div 
                    key="shuffle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center z-10"
                >
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-400 font-serif text-xl md:text-2xl mb-12 text-center max-w-md italic"
                    >
                        "{question}"
                    </motion.p>

                    <div className="relative w-32 h-48">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                            key={i}
                            animate={{ x: [0, 60, -60, 0], rotate: [0, 15, -15, 0], scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="absolute inset-0 bg-gradient-to-br from-[#131722] to-[#0B0F19] rounded-xl border border-rose-500/20 shadow-2xl"
                            style={{ zIndex: i }}
                            >
                            <div className="w-full h-full flex items-center justify-center opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                                <RefreshCcw className="w-8 h-8 text-rose-500" />
                            </div>
                            </motion.div>
                        ))}
                    </div>
                    <p className="mt-10 text-slate-500 text-[10px] tracking-widest font-mono uppercase animate-pulse">Kozmik Bağ Bağlanıyor</p>
                </motion.div>
                )}

                {/* --- PHASE 3: SEÇİM (SPREAD) --- */}
                {phase === 'spread' && (
                <motion.div 
                    key="spread"
                    className="w-full h-full flex flex-col items-center justify-center py-4 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="text-center mb-8">
                        <h3 className="text-white font-serif text-2xl mb-2">3 Kart Seç</h3>
                        <p className="text-slate-500 text-xs italic">Niyetin: {question}</p>
                    </div>

                    {/* Yelpaze */}
                    <div className="relative h-[220px] md:h-[260px] w-full flex justify-center items-end mt-4 perspective-1000">
                        {[...Array(22)].map((_, i) => {
                            if (selectedCards.find(c => c.tempId === i)) return null; 
                            
                            const spread = isMobile ? 12 : 20;
                            const angle = (i - 11) * 3;
                            const x = (i - 11) * spread;
                            const y = Math.abs(i - 11) * 2;

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ y: 300, opacity: 0 }}
                                    animate={{ y: y, x: x, rotate: angle, opacity: 1 }}
                                    transition={{ delay: i * 0.02, type: "spring" }}
                                    whileHover={{ y: y - 40, scale: 1.1, zIndex: 50 }}
                                    onClick={() => handleCardPick(i)}
                                    className="absolute w-16 h-28 md:w-24 md:h-40 bg-gradient-to-br from-[#131722] to-[#0B0F19] border border-white/10 rounded-lg cursor-pointer shadow-[-5px_0_15px_rgba(0,0,0,0.5)] hover:border-rose-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-colors origin-bottom"
                                >
                                    <div className="w-full h-full flex items-center justify-center opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Slotlar */}
                    <div className="flex gap-4 mt-12">
                        {[0, 1, 2].map((slot) => (
                            <div key={slot} className="w-16 h-24 md:w-20 md:h-32 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center bg-[#0B0F19] relative">
                                {selectedCards[slot] ? (
                                    <motion.div 
                                    layoutId={`card-${selectedCards[slot].tempId}`}
                                    className="absolute inset-0 bg-gradient-to-br from-rose-900/40 to-[#0B0F19] rounded-xl border border-rose-500/50 flex items-center justify-center"
                                    >
                                        <Sparkles className="w-5 h-5 text-rose-400" />
                                    </motion.div>
                                ) : (
                                    <span className="text-slate-600 font-mono text-xs">{slot + 1}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
                )}

                {/* --- PHASE 4: KİLİTLİ SONUÇ --- */}
                {phase === 'locked_result' && (
                <motion.div 
                    key="locked_result" 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-3xl z-10 flex flex-col items-center justify-center"
                >
                    <div className="mb-10 text-center">
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">Kartların Açıldı</h3>
                        <p className="text-slate-400 text-sm font-light">Seçtiğiniz bu 3 kartın kombinasyonu kaderiniz hakkında ne söylüyor?</p>
                    </div>

                    {/* KARTLAR */}
                    <div className="flex justify-center gap-4 md:gap-8 mb-10 w-full">
                        {selectedCards.map((card, i) => (
                            <motion.div 
                            key={i}
                            initial={{ rotateY: 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                            className="relative w-24 h-40 md:w-36 md:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group transform hover:-translate-y-2 transition-transform duration-300"
                            >
                                <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent p-3 pt-8 text-center">
                                    <p className="text-rose-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1">
                                        {i === 0 ? "Geçmiş" : i === 1 ? "Şimdi" : "Gelecek"}
                                    </p>
                                    <p className="text-white font-serif text-xs md:text-sm font-bold truncate">
                                        {card.name}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* KİLİTLİ ANALİZ KUTUSU */}
                    <div className="w-full bg-[#0B0F19] border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl">
                        
                        <div className="p-6 md:p-8 opacity-20 filter blur-[4px] grayscale select-none space-y-3 pointer-events-none">
                            <h4 className="text-xl font-serif text-white mb-2">Gizli Anlam</h4>
                            <p className="text-sm">Seçtiğiniz kartlar arasındaki enerji akışı, özellikle {selectedCards[1]?.name} kartının etkisiyle...</p>
                            <div className="w-full h-3 bg-slate-600 rounded"></div>
                            <div className="w-2/3 h-3 bg-slate-600 rounded"></div>
                            <div className="w-3/4 h-3 bg-slate-600 rounded"></div>
                        </div>

                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/90 to-transparent p-6 text-center">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-4 border border-rose-500/20">
                                <Lock className="w-5 h-5 text-rose-500" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Detaylı Analiz Hazır</h3>
                            <p className="text-slate-400 text-xs md:text-sm mb-6 max-w-sm font-light">
                                Bu kartların aşk, kariyer ve gelecek üzerindeki gizli etkilerini öğrenmek için hemen devam et.
                            </p>

                            <button 
                                onClick={() => handleUnlockResult(!!user)}
                                className="px-8 py-3.5 rounded-xl bg-white text-[#0B0F19] font-bold text-sm md:text-base hover:bg-slate-200 transition-colors shadow-lg flex items-center gap-2"
                            >
                                {user ? "Sonucumu Görüntüle" : "Ücretsiz Kilidi Aç ve Oku"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </motion.div>
                )}

            </AnimatePresence>
        </div>
      </section>

      {/* --- REKLAM 1: HERO ALTI --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-4 z-10 relative">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="8565155493" format="auto" />
      </div>

      {/* ================= 2. NASIL ÇALIŞIR ================= */}
      <section className="py-20 border-y border-white/5 relative z-10 bg-[#131722]/30">
         <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center mb-16">
               <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Geleneksel Bilgelik, Modern Algoritma</h2>
               <p className="text-slate-400 text-sm md:text-base font-light max-w-2xl mx-auto">
                  Sıradan bir fal uygulamasının ötesinde, seçtiğiniz kartların sembolizmini sizin niyetinizle harmanlayarak size özel bir yaşam rehberi sunuyoruz.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-rose-500/20 transition-all">
                  <Moon className="w-6 h-6 text-rose-400 mb-5"/>
                  <h3 className="text-lg font-bold text-white mb-2">Bilinçaltı Yansıması</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">Kartlar rastgele gelmez. Seçim anınızdaki niyetiniz, algoritmanın sizin enerjinizle senkronize olmasını sağlar.</p>
               </div>
               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-rose-500/20 transition-all">
                  <Compass className="w-6 h-6 text-rose-400 mb-5"/>
                  <h3 className="text-lg font-bold text-white mb-2">Derin Semboloji</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">Rider-Waite destesinin 78 kartlık derin sembolizmini kullanarak yüzeysel yorumlardan kaçınır, kök nedene ineriz.</p>
               </div>
               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-rose-500/20 transition-all">
                  <BrainCircuit className="w-6 h-6 text-rose-400 mb-5"/>
                  <h3 className="text-lg font-bold text-white mb-2">Yapay Zeka Sentezi</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">Sorduğunuz özel soru ile kartların kombinasyonunu NLP ile birleştirerek eyleme dökülebilir tavsiyeler verir.</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- REKLAM 2 --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-12 z-10 relative">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="4542150009" format="fluid" />
      </div>

      {/* ================= 3. DEV SEO MAKALESİ ================= */}
      <section className="py-12 px-4 md:px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-10 border-b border-white/10 pb-6">
            Tarot Falı ve Kartların Gizemli Dünyası
         </h2>
         
         <div className="space-y-12 text-slate-400 font-light leading-relaxed text-sm md:text-base">
            
            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-rose-400"/> Tarot Falı Nedir? Nasıl Bakılır?
               </h3>
               <p>
                  Yüzyıllardır insanların geleceği anlamlandırmak ve içsel rehberlik bulmak için başvurduğu <strong>Tarot</strong>, 78 kartlık bir desteden oluşur. İnternette en çok aranan <strong>"Ücretsiz tarot falı bak"</strong> veya <strong>"3 kart tarot açılımı"</strong> gibi terimler, insanların hızlıca bir yol göstericiye ihtiyaç duyduğunu kanıtlar.
               </p>
               <p>
                  Ancak tarot sadece geleceği söyleyen bir araç değil, aynı zamanda bilinçaltınızın aynasıdır. Platformumuzda kartlarınızı seçerken asıl önemli olan, zihninizde tuttuğunuz o spesifik <strong>niyet</strong>tir (Aşk, Kariyer, Karar aşaması vb.).
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-rose-400"/> 3 Kart Açılımı (Geçmiş, Şimdi, Gelecek)
               </h3>
               <p>
                  En popüler ve etkili yöntemlerden biri <strong>3 kart tarot açılımı</strong>dır. Birinci kart geçmişte yaşadığınız ve bugünü şekillendiren kök nedeni; ikinci kart şu anki enerjinizi ve durumunuzu; üçüncü kart ise bu yolda devam ederseniz varacağınız muhtemel geleceği (potansiyel sonucu) gösterir.
               </p>
            </article>

            {/* REKLAM 3: SEO İÇERİĞİ ARASI */}
            <div className="py-6 border-y border-white/5 my-6">
                <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                <AdUnit slot="4542150009" format="fluid" />
            </div>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-rose-400"/> Yapay Zeka ile Modern Yorumlama
               </h3>
               <p>
                  Geleneksel falcılardan farklı olarak, sistemimiz yapay zeka destekli bir <strong>tarot okuması</strong> gerçekleştirir. Seçtiğiniz kartların Majör Arkana (Büyük sırlar) mı yoksa Minör Arkana mı olduğunu analiz eder ve sorduğunuz soruya en uygun, psikolojik temelli, eyleme geçirilebilir bir sentez raporu sunar.
               </p>
            </article>

         </div>
      </section>

      {/* REKLAM 4: İÇERİK SONU MULTIPLEX */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-4 mb-20 z-10 relative">
          <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-bold">İlginizi Çekebilir</p>
          <AdUnit slot="6481917633" format="autorelaxed" />
      </div>

    </main>
  );
}