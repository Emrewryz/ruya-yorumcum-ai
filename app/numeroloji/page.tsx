import Link from "next/link";
import { 
  Hash, Calculator, Sparkles, Star, 
  Binary, Infinity, Fingerprint, 
  ArrowRight, BookOpen, Quote, Calendar, User, Lock, ArrowDown
} from "lucide-react";
import Script from "next/script";

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
  return (
    <main className="min-h-screen font-sans relative overflow-hidden transition-colors duration-300">
      <Script
        id="numerology-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(numerologySchema) }}
      />

      {/* --- ATMOSFER (Işık) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-stone-300/30 dark:bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0 transform-gpu"></div>

      {/* ================= 1. HERO SECTION (Minimal & Akademik) ================= */}
      <section className="relative pt-32 md:pt-48 pb-16 px-4 md:px-6 z-10 min-h-[85vh] flex items-center border-b border-stone-200 dark:border-stone-800/50">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* SOL: COPYWRITING */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-[10px] md:text-xs font-mono uppercase tracking-widest bg-[#faf9f6]/50 dark:bg-stone-900/50 backdrop-blur-sm">
              <Hash className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" /> Pisagor & Ebcet Sistemi
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-stone-900 dark:text-stone-50 tracking-tight">
              Sayıların <br className="hidden md:block" />
              <span className="text-stone-500 dark:text-stone-400 font-normal italic">
                Gizemini Çözün.
              </span>
            </h1>
            
            <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif leading-relaxed max-w-lg mx-auto lg:mx-0">
              Evren matematikle konuşur. İsminizin frekansını ve doğum tarihinizin kaderinize etkisini, antik numeroloji yöntemleriyle akademik bir derinlikte keşfedin.
            </p>

            <div className="flex justify-center lg:justify-start pt-4">
              <Link 
                href="/auth?mode=signup"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm group"
              >
                <Calculator className="w-4 h-4" /> Şifrenizi Hesaplayın
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest border-t border-stone-200 dark:border-stone-800 mt-8">
               <span className="flex items-center gap-1.5"><Infinity className="w-3.5 h-3.5" /> Yaşam Yolu Raporu</span>
               <span className="flex items-center gap-1.5"><Binary className="w-3.5 h-3.5" /> İsim Titreşimi</span>
            </div>
          </div>

          {/* SAĞ: ÖRNEK RAPOR (SNEAK PEEK MOCKUP) */}
          <div className="lg:col-span-6 relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[500px] perspective-1000 mt-4 lg:mt-0 px-2 md:px-0">
             
             {/* Üstteki Kimlik Kartı */}
             <div className="absolute -top-4 left-4 md:-left-6 right-10 md:right-16 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 p-5 md:p-6 rounded-xl z-30 shadow-xl shadow-stone-200/50 dark:shadow-black/20">
                 <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Analiz Özeti</span>
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                       <User className="w-5 h-5 text-stone-400" />
                    </div>
                    <div>
                       <p className="text-stone-800 dark:text-stone-200 font-serif font-bold text-sm">Örnek Profil: Y*** E***</p>
                       <p className="text-stone-500 font-mono text-[10px]">Tarih: 14.08.1995</p>
                    </div>
                 </div>
             </div>

             {/* Ana Rapor Çerçevesi */}
             <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-2xl h-full bg-[#faf9f6] dark:bg-stone-950 group mt-8 md:mt-0 p-6 md:p-10 flex flex-col justify-center">
                
                <div className="text-center mb-6">
                   <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2">Yaşam Yolu (Kader) Sayısı</p>
                   <div className="font-serif text-8xl md:text-9xl font-bold text-stone-900 dark:text-stone-50 leading-none">
                      7
                   </div>
                </div>

                <div className="space-y-4 text-stone-600 dark:text-stone-400 leading-relaxed text-sm md:text-base font-serif text-center px-4">
                   <p>
                     <strong className="text-stone-900 dark:text-stone-200 font-sans">Mistik ve Araştırmacı:</strong> 7 sayısı, derin bir analitik zekayı, kusursuzluk arayışını ve spiritüel bir yolculuğu simgeler. Hayatınızdaki temel motivasyon "gerçeği" bulmaktır...
                   </p>
                </div>

                {/* Bulanıklaşan kısım ve CTA */}
                <div className="relative mt-2">
                   <div className="space-y-3 opacity-30 select-none blur-[4px] px-4">
                     <div className="w-full h-4 bg-stone-400 dark:bg-stone-600 rounded"></div>
                     <div className="w-5/6 h-4 mx-auto bg-stone-400 dark:bg-stone-600 rounded"></div>
                     <div className="w-4/6 h-4 mx-auto bg-stone-400 dark:bg-stone-600 rounded"></div>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] dark:from-stone-950 to-transparent flex items-end justify-center pb-4">
                      <Link href="/auth?mode=signup" className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider group bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-stone-200 dark:border-stone-700 shadow-lg">
                        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                        Kendi Şifreni Çöz <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-amber-600 dark:text-amber-500" />
                      </Link>
                   </div>
                </div>
                
             </div>

          </div>
        </div>
      </section>

    {/* ================= 2. NASIL ÇALIŞIR (3'lü Kart - Editoryal) ================= */}
      <section className="py-24 relative z-10 border-b border-stone-200 dark:border-stone-800/50">
         <div className="container mx-auto px-6 max-w-6xl">
            
            <div className="text-center mb-16">
               <h2 className="font-serif text-3xl md:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-6">Sistem Nasıl Analiz Eder?</h2>
               <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif max-w-2xl mx-auto">
                  Antik çağlardan günümüze kadar gelen iki büyük numerolojik öğretiyi dijital ortamda akademik bir titizlikle birleştirdik.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               
               {/* KART 1 */}
               <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-950 flex items-center justify-center mb-6 border border-stone-200 dark:border-stone-800">
                     <Binary className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Ebcet Metodolojisi</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                     Arap alfabesindeki harflerin sayısal değerlerine dayanan bu sistemle, isminizin arkasında yatan manevi ağırlığı ve titreşimi hesaplıyoruz.
                  </p>
               </div>

               {/* KART 2 */}
               <div className="bg-[#faf9f6] dark:bg-stone-950 p-10 rounded-2xl border-2 border-stone-300 dark:border-stone-700 shadow-xl shadow-stone-200/50 dark:shadow-black/30 relative transform md:-translate-y-4">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Temel Temel</div>
                  <div className="w-12 h-12 rounded-xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center mb-6 border border-stone-300 dark:border-stone-700">
                     <Calculator className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Yaşam Yolu (Pisagor)</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                     Doğum tarihinizdeki rakamların tek haneli bir sayıya veya üstat sayılara (11, 22, 33) indirgenmesiyle elde edilen "Kader Sayınızı" buluyoruz.
                  </p>
               </div>

               {/* KART 3 */}
               <div className="bg-white dark:bg-stone-900 p-10 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-950 flex items-center justify-center mb-6 border border-stone-200 dark:border-stone-800">
                     <Star className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 mb-3">Kişisel Yıllar</h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                     İçinde bulunduğunuz yılın döngüsel olarak sizin için bir başlangıç mı, bekleme mi yoksa hasat yılı mı olduğunu hesaplayarak geleceğe ışık tutuyoruz.
                  </p>
               </div>

            </div>

         </div>
      </section>

      {/* ================= 3. DEV SEO MAKALESİ (Ansiklopedik Bilgi) ================= */}
      <section className="py-24 px-6 max-w-4xl mx-auto relative z-10">
         <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-12 text-center">
            Numeroloji ve Ebcet Hesabı Nedir?
         </h2>
         
         <div className="space-y-12 text-stone-600 dark:text-stone-400 font-serif text-base md:text-lg leading-relaxed">
            
            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <Hash className="w-5 h-5 text-amber-600 dark:text-amber-500"/> Yaşam Yolu Sayısı Hesaplama
               </h3>
               <p>
                  Numeroloji, evrendeki her şeyin sayısal bir frekansa sahip olduğunu savunan kadim bir ilimdir. İnternette sıkça aranan <strong>"Kader sayısı nasıl hesaplanır?"</strong> sorusunun temeli Pisagor sistemine dayanır. Doğum tarihinizdeki gün, ay ve yıl rakamları toplanarak 1 ile 9 arasında tek haneli bir değere veya 11, 22, 33 gibi <strong>"Üstat Sayılara"</strong> (Master Numbers) indirgenir.
               </p>
               <p>
                  Elde edilen bu <strong>yaşam yolu sayısı</strong>, kişinin bu hayattaki amacını, aşması gereken engelleri ve en güçlü yeteneklerini ortaya koyar. Kariyer seçiminden ilişki uyumuna kadar hayatın her alanında bir pusula görevi görür.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-stone-500 dark:text-stone-400"/> Ebcet Hesabı ve İsim Analizi
               </h3>
               <p>
                  İslam ve Ortadoğu geleneğinde yer alan <strong>Ebcet hesabı</strong>, Arap alfabesindeki her harfin belirli bir sayısal değere sahip olması prensibine dayanır. "İsim numerolojisi" olarak da bilinen bu yöntemde, adınızın ve soyadınızın harfleri toplanarak size özel bir rakam elde edilir.
               </p>
               <p>
                  Özellikle yeni doğan bebeklere isim verirken veya hayatınızdaki önemli olayların tarihlerini seçerken bu sayısal titreşimlerden faydalanılır. İsminizin toplam değeri, karakterinizin dışa vurumunu ve insanların sizi nasıl algıladığını belirler.
               </p>
            </article>

            <article className="space-y-4">
               <h3 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 font-sans flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-amber-600 dark:text-amber-500"/> Melek Sayıları (11:11, 333) ve Mesajlar
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

      {/* ================= ALT BİTİRİŞ ================= */}
      <section className="py-16 text-center border-t border-stone-200 dark:border-stone-800/50 relative z-10">
         <div className="container mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-stone-50 mb-8">Kendi Kodunuzu Çözün.</h2>
            <Link href="#top" className="inline-flex items-center justify-center p-4 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white hover:border-stone-400 transition-all shadow-sm">
               <ArrowDown className="w-5 h-5" />
            </Link>
         </div>
      </section>

    </main>
  );
}