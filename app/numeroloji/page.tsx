"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Hash, Calculator, Sparkles, Star, 
  Binary, Infinity, Fingerprint, 
  ArrowRight, BookOpen, Quote, Calendar, User, ArrowDown
} from "lucide-react";
import Script from "next/script";
import AdUnit from "@/components/AdUnit"; 

// --- SEO SCHEMA ---
const numerologySchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Rüya Numerolojisi ve Yaşam Yolu Hesaplama",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "description": "Doğum tarihiniz ve isminizle yaşam yolu sayınızı, kader şifrenizi ve Ebcet değerinizi hesaplayın."
    },
    {
      "@type": "Article",
      "headline": "Numeroloji Nedir? İsim ve Doğum Tarihi ile Kader Sayısı Hesaplama",
      "description": "Pisagor numerolojisi ve İslam geleneğindeki Ebcet hesabının hayatımıza ve rüyalarımıza etkisi.",
      "author": { "@type": "Organization", "name": "Rüya Yorumcum AI" }
    }
  ]
};

export default function NumerolojiLandingPage() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  // Günümüz tarihini YYYY-MM-DD formatında al (Maksimum tarih için)
  const today = new Date().toISOString().split('T')[0];

  const handleStartAnalysis = () => {
    if (!fullName.trim() || !birthDate) return;
    setIsCalculating(true);

    const pendingData = { fullName, birthDate };

    if (typeof window !== 'undefined') {
        localStorage.setItem("pending_numerology_data", JSON.stringify(pendingData));
    }

    setTimeout(() => {
        router.push("/auth?redirect=/dashboard/numerology/genel");
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-300 font-sans selection:bg-amber-500/30 pb-20 overflow-x-hidden relative scroll-smooth">
      <Script
        id="numerology-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(numerologySchema) }}
      />

      {/* --- ATMOSFER --- */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* ================= 1. HERO SECTION (Minimal & Akademik) ================= */}
      <section className="relative pt-32 md:pt-48 pb-16 px-4 md:px-6 z-10 min-h-[85vh] flex items-center">
        <div className="container mx-auto max-w-7xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* SOL: COPYWRITING */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 text-[10px] md:text-xs font-mono uppercase tracking-widest shadow-xl">
              <Hash className="w-3.5 h-3.5 text-amber-500" /> Pisagor & Ebcet Sistemi
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] text-white tracking-tight">
              Sayıların <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                Gizemini Çözün.
              </span>
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Evren matematikle konuşur. İsminizin frekansını ve doğum tarihinizin kaderinize etkisini antik numeroloji yöntemleriyle bilimsel bir temelde keşfedin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button 
                onClick={() => document.getElementById('calculator-card')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 hover:border-amber-500/30 transition-colors flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm group"
              >
                <Calculator className="w-4 h-4 text-amber-500" /> Analize Başla
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-widest border-t border-white/5 mt-6">
               <span className="flex items-center gap-1.5"><Infinity className="w-3 h-3 text-slate-600" /> Yaşam Yolu Raporu</span>
               <span className="flex items-center gap-1.5"><Binary className="w-3 h-3 text-slate-600" /> İsim Titreşimi</span>
            </div>
          </div>

          {/* SAĞ: İNTERAKTİF HESAPLAMA KARTI (HOOK) */}
          <div id="calculator-card" className="lg:col-span-5 relative w-full perspective-1000 mt-4 lg:mt-0 px-2 md:px-0">
             <div className="relative z-30 bg-[#131722]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.1)]">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-xl"><Hash className="w-5 h-5 text-amber-500"/></div>
                      <div>
                         <h3 className="text-white font-bold text-sm md:text-base">Numeroloji Paneli</h3>
                         <p className="text-[10px] text-slate-500 font-mono">Ücretsiz Şifre Çözücü</p>
                      </div>
                   </div>
                </div>

                {/* FORM INPUTLARI */}
                <div className="space-y-5">
                    
                    {/* İsim Input */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Adınız Soyadınız</label>
                        <div className="relative group/input">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Örn: Yunus Emre"
                                className="w-full bg-[#0B0F19] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* Tarih Input (Sınırlandırılmış) */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Doğum Tarihiniz</label>
                        <div className="relative group/input">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input 
                                type="date" 
                                value={birthDate}
                                min="1920-01-01" // 1920'den öncesine izin verme
                                max={today}      // Gelecek tarihe izin verme
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full bg-[#0B0F19] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/30 transition-all appearance-none min-h-[50px] [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Buton */}
                    <button 
                        onClick={handleStartAnalysis}
                        disabled={!fullName.trim() || !birthDate || isCalculating}
                        className="w-full mt-2 py-4 rounded-xl bg-amber-500 text-[#0B0F19] font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                    >
                        {isCalculating ? (
                            <span className="font-mono animate-pulse">Veriler İşleniyor...</span>
                        ) : (
                            <>
                                Frekansımı Hesapla <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* --- REKLAM 1: HERO ALTI --- */}
      <div className="max-w-6xl mx-auto w-full px-4 py-8 z-10 relative border-t border-white/5">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="8565155493" format="auto" />
      </div>

      {/* ================= 2. NASIL ÇALIŞIR (3'lü Kart) ================= */}
      <section className="py-20 bg-[#131722]/30 border-y border-white/5 relative z-10">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center mb-16">
               <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Sistem Nasıl Analiz Eder?</h2>
               <p className="text-slate-400 text-sm md:text-base font-light max-w-2xl mx-auto">
                  Antik çağlardan günümüze kadar gelen iki büyük numerolojik öğretiyi dijital ortamda birleştirdik.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/10">
                     <Binary className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Ebcet Metodolojisi</h3>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">
                     Arap alfabesindeki harflerin sayısal değerlerine dayanan bu sistemle, isminizin arkasında yatan manevi ağırlığı hesaplıyoruz.
                  </p>
               </div>

               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/10">
                     <Calculator className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Yaşam Yolu (Pisagor)</h3>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">
                     Doğum tarihinizdeki rakamların tek haneli bir sayıya indirgenmesiyle elde edilen "Kader Sayınızı" buluyoruz.
                  </p>
               </div>

               <div className="bg-[#0B0F19] p-8 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/10">
                     <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Kişisel Yıllar</h3>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">
                     İçinde bulunduğunuz yılın sizin için şanslı mı yoksa bir dönüşüm yılı mı olduğunu hesaplayarak geleceğe ışık tutuyoruz.
                  </p>
               </div>
            </div>

         </div>
      </section>

      {/* --- REKLAM 2: BÖLÜM ARASI --- */}
      <div className="max-w-5xl mx-auto w-full px-4 py-12 z-10 relative">
          <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
          <AdUnit slot="4542150009" format="fluid" />
      </div>

      {/* ================= 3. DEV SEO MAKALESİ (Ansiklopedik Bilgi) ================= */}
      <section className="py-12 px-4 md:px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-10 border-b border-white/10 pb-6">
            Numeroloji ve Ebcet Hesabı Nedir?
         </h2>
         
         <div className="space-y-12 text-slate-400 font-light leading-relaxed text-sm md:text-base">
            
            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Hash className="w-5 h-5 text-amber-500"/> Doğum Tarihi ile Yaşam Yolu Sayısı Hesaplama
               </h3>
               <p>
                  Numeroloji, evrendeki her şeyin sayısal bir frekansa sahip olduğunu savunan kadim bir ilimdir. İnternette sıkça aranan <strong>"Kader sayısı nasıl hesaplanır?"</strong> sorusunun temeli Pisagor sistemine dayanır. Doğum tarihinizdeki gün, ay ve yıl rakamları toplanarak 1 ile 9 arasında tek haneli bir değere veya 11, 22, 33 gibi <strong>"Üstat Sayılara"</strong> (Master Numbers) indirgenir.
               </p>
               <p>
                  Elde edilen bu <strong>yaşam yolu sayısı</strong>, kişinin bu hayattaki amacını, aşması gereken engelleri ve en güçlü yeteneklerini ortaya koyar. Kariyer seçiminden ilişki uyumuna kadar hayatın her alanında bir pusula görevi görür.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500"/> Ebcet Hesabı ve İsim Analizi
               </h3>
               <p>
                  İslam ve Ortadoğu geleneğinde yer alan <strong>Ebcet hesabı</strong>, Arap alfabesindeki her harfin belirli bir sayısal değere sahip olması prensibine dayanır. "İsim numerolojisi" olarak da bilinen bu yöntemde, adınızın ve soyadınızın harfleri toplanarak size özel bir rakam elde edilir.
               </p>
               <p>
                  Özellikle yeni doğan bebeklere isim verirken veya hayatınızdaki önemli olayların (evlilik, iş kurma) tarihlerini seçerken bu sayısal titreşimlerden faydalanılır. İsminizin toplam değeri, karakterinizin dışa vurumunu ve insanların sizi nasıl algıladığını (İfade Sayısı) belirler.
               </p>
            </article>

            {/* REKLAM 3: SEO İÇERİĞİ ARASI */}
            <div className="py-6 border-y border-white/5 my-6">
                <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                <AdUnit slot="4542150009" format="fluid" />
            </div>

            <article className="space-y-4">
               <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-amber-500"/> Melek Sayıları (11:11, 333) ve Evrensel Mesajlar
               </h3>
               <p>
                  Eğer sürekli olarak saate baktığınızda <strong>11:11</strong>, <strong>22:22</strong> görüyor veya rüyalarınızda 333, 777 gibi rakamlarla karşılaşıyorsanız, bu durum numerolojide "Melek Sayıları" (Angel Numbers) olarak adlandırılır. 
               </p>
               <p>
                  Evrenin sizinle eşzamanlılık (synchronicity) üzerinden iletişim kurma şeklidir. Örneğin; 111 yeni başlangıçları, 777 ise spiritüel aydınlanmayı ve doğru yolda olduğunuzu simgeler. Platformumuz, girdiğiniz veriler ışığında hayatınızda tekrar eden bu gizli kalıpları da analiz eder.
               </p>
            </article>

         </div>
      </section>

      {/* REKLAM 4: İÇERİK SONU MULTIPLEX */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-4 mb-20 z-10 relative">
          <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-bold">İlginizi Çekebilir</p>
          <AdUnit slot="6481917633" format="autorelaxed" />
      </div>

      {/* ================= ALT BİTİRİŞ (Minimalist) ================= */}
      <section className="py-12 text-center border-t border-white/5 relative z-10">
         <div className="container mx-auto px-4">
            <h2 className="font-serif text-xl md:text-2xl text-slate-400 mb-4">Kodunuzu Çözün.</h2>
            <button 
               onClick={() => document.getElementById('calculator-card')?.scrollIntoView({ behavior: 'smooth' })}
               className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
               <ArrowDown className="w-5 h-5 animate-bounce" />
            </button>
         </div>
      </section>

    </main>
  );
}