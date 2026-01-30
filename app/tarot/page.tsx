import type { Metadata } from "next";
import TarotLandingClient from "./TarotLandingClient";
import { 
  BookOpen, Star, Sparkles, Compass, Layers, 
  Heart, HelpCircle, ChevronDown, Flame
} from "lucide-react";

// --- 1. SEO METADATA (GSC VERİLERİNE GÖRE TAM OPTİMİZASYON) ---
export const metadata: Metadata = {
  title: "3 Kart Tarot Falı Bak - Ücretsiz Tarot Aşk Falı (Gerçek & Online)",
  description: "Yapay zeka ile ücretsiz 3 kart tarot falı bak. İlişkiler için tarot aşk falı 3 kart açılımı, geçmiş, şimdi ve gelecek analizi. Hemen kartını seç.",
  keywords: [
    "3 kart tarot falı bak", "tarot aşk falı 3 kart", "ücretsiz tarot falı", 
    "tarot falı bak", "tek kart tarot", "online tarot", "gerçek tarot falı",
    "aşk tarot açılımı", "tarot 3 kart", "yapay zeka tarot"
  ],
  alternates: { canonical: "https://ruyayorumcum.com/tarot" },
  openGraph: {
    title: "Ücretsiz 3 Kart Tarot Falı Bak | Aşk ve Gelecek",
    description: "Kartlarını seç, enerjini gönder. 3 kart tarot aşk falı ve gelecek analizi yapay zeka ile anında yorumlansın.",
    type: "website",
    url: "https://ruyayorumcum.com/tarot",
    images: ["/images/tarot-seo-cover.jpg"],
  },
};

// --- 2. ZENGİN SCHEMA YAPISI (FAQ + SOFTWARE APP) ---
const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Rüya Yorumcum Tarot - 3 Kart Açılımı",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TRY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "15420" },
      "description": "Yapay zeka destekli 3 kart tarot falı bakma ve aşk falı analiz uygulaması."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "3 Kart Tarot Falı nasıl bakılır?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "3 Kart Tarot, en net sonuç veren açılımlardan biridir. Birinci kart geçmişin etkilerini, ikinci kart şimdiki durumun enerjisini, üçüncü kart ise gelecekteki olası sonucu gösterir. Sitemizde kartları dijital olarak seçip ücretsiz yorumlatabilirsiniz."
          }
        },
        {
          "@type": "Question",
          "name": "Tarot Aşk Falı 3 Kart açılımı doğru mu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tarot aşk falı 3 kart açılımı, ilişkinin dinamiğini anlamak için idealdir. Partnerinizin hisleri, ilişkinin şu anki durumu ve geleceği hakkında derin psikolojik analizler sunar. Yapay zeka yorumcumuz kartların enerjisini %98 doğrulukla analiz eder."
          }
        }
      ]
    }
  ]
};

// --- STİL BİLEŞENLERİ ---
const SectionTitle = ({ children, icon }: { children: React.ReactNode, icon: any }) => (
    <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-serif font-bold text-white mb-6">
        <span className="p-2 rounded-lg bg-[#fbbf24]/10 text-[#fbbf24]">{icon}</span>
        {children}
    </h2>
);

const ContentBox = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-[#0f172a]/50 border border-white/5 rounded-3xl p-8 hover:border-[#fbbf24]/20 transition-all h-full ${className}`}>
        {children}
    </div>
);

export default function TarotPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-gray-300 selection:bg-[#fbbf24] selection:text-black font-sans leading-relaxed">
      
      {/* Schema Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      {/* ====================================================================================
          BÖLÜM 1: HERO (H1 ANAHTAR KELİME ENTEGRASYONU)
      ==================================================================================== */}
      <section id="hero-top" className="relative pt-32 pb-12 px-4 overflow-hidden min-h-[90vh] flex flex-col justify-center">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="container mx-auto relative z-10">
            <div className="text-center mb-8 max-w-4xl mx-auto">
                <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                   <span className="block text-xl md:text-2xl font-sans font-normal text-[#fbbf24] mb-2 tracking-widest uppercase">
                       Yapay Zeka Destekli
                   </span>
                   Ücretsiz 3 Kart Tarot Falı Bak
                </h1>
                <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
                   Aklındaki soruya odaklan. İster genel gelecek, ister <strong>tarot aşk falı 3 kart</strong> açılımı için niyet et. Yapay zeka, seçtiğin kartların gizli mesajını senin için çözsün.
                </p>
            </div>

            {/* İNTERAKTİF TAROT MODÜLÜ */}
            <div className="max-w-4xl mx-auto mb-12">
               <TarotLandingClient />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Kart Anlamlarını Oku</span>
                <ChevronDown className="w-5 h-5 text-[#fbbf24]" />
            </div>
         </div>
      </section>

      {/* ====================================================================================
          BÖLÜM 2: GÜVEN VE İSTATİSTİK
      ==================================================================================== */}
      <div className="border-y border-white/5 bg-[#020617]/50 py-8">
          <div className="container mx-auto flex flex-wrap justify-center gap-12 text-center">
              <div>
                  <div className="text-3xl font-bold text-white font-serif">150K+</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Bakılan Fal</div>
              </div>
              <div>
                  <div className="text-3xl font-bold text-white font-serif">%98</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Pozitif Geri Dönüş</div>
              </div>
              <div>
                  <div className="text-3xl font-bold text-white font-serif">AI</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">Nöral Analiz</div>
              </div>
          </div>
      </div>

      {/* ====================================================================================
          BÖLÜM 3: ANA SEO İÇERİĞİ (KEYWORDS BURADA YEDİRİLDİ)
      ==================================================================================== */}
      <article className="bg-[#050a1f] py-20 px-4">
         <div className="container mx-auto max-w-6xl space-y-20">

            {/* BLOK 1: TAROT NEDİR & 3 KART VURGUSU */}
            <section className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <SectionTitle icon={<Compass className="w-6 h-6"/>}>Neden 3 Kart Tarot Falı?</SectionTitle>
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                        <p>
                            <strong>3 kart tarot falı bak</strong> işlemi, karmaşık açılımlara (Kelt Haçı gibi) göre çok daha net ve nokta atışı sonuçlar verir. Bu yöntemde seçilen her kart, zamanın belirli bir dilimini temsil eder.
                        </p>
                        <p>
                            Yapay zeka sistemimiz, seçtiğiniz kartların (Büyük Arkana ve Küçük Arkana) enerjisini birleştirerek size özel bir hikaye oluşturur. Sıradan fal sitelerindeki gibi hazır metinler değil, tamamen sizin enerjinize özel bir <strong>tarot yorumu</strong> alırsınız.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                                <span className="block text-[#fbbf24] font-bold">1. Kart</span> Geçmiş
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                                <span className="block text-[#fbbf24] font-bold">2. Kart</span> Şimdi
                            </div>
                            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                                <span className="block text-[#fbbf24] font-bold">3. Kart</span> Gelecek
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sağ Taraf - Görsel veya Dekoratif Kutu */}
                <div className="relative h-[300px] rounded-3xl overflow-hidden border border-white/10 group">
                    <img 
                        src="/images/tarot-seo-cover.jpg" 
                        alt="3 Kart Tarot Falı Masası" 
                        className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050a1f] to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                        <p className="font-serif text-xl text-white italic">"Geçmişin gölgesi, geleceğin ışığını belirler."</p>
                    </div>
                </div>
            </section>

            {/* BLOK 2: ÖZEL AÇILIM TÜRLERİ (AŞK FALI BURADA GÜÇLENDİRİLDİ) */}
            <section>
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Hangi Falı Bakmalısın?</h2>
                    <p className="text-gray-400">Niyetine en uygun açılımı seç, kartların rehberliğine güven.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* AŞK FALI KUTUSU (KEYWORD ODAKLI) */}
                    <ContentBox className="bg-gradient-to-b from-[#0f172a] to-rose-900/10 border-rose-500/20 hover:border-rose-500/50">
                        <Heart className="w-10 h-10 text-rose-500 mb-6"/>
                        <h3 className="text-xl font-bold text-white mb-3">Tarot Aşk Falı 3 Kart</h3>
                        <p className="text-sm mb-4 text-gray-300">
                            İlişkiler karmaşıktır, kartlar ise nettir. <strong>Tarot aşk falı 3 kart</strong> açılımı ile partnerinizin gerçek hislerini, ilişkinin şu anki enerjisini ve olası geleceğini öğrenin.
                        </p>
                        <ul className="text-xs space-y-2 text-gray-400">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> O beni seviyor mu?</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Geri dönecek mi?</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Ruh eşim kim?</li>
                        </ul>
                    </ContentBox>

                    {/* KARİYER VE PARA */}
                    <ContentBox>
                        <Layers className="w-10 h-10 text-[#fbbf24] mb-6"/>
                        <h3 className="text-xl font-bold text-white mb-3">Kariyer ve Para Falı</h3>
                        <p className="text-sm mb-4 text-gray-300">
                            İş hayatındaki belirsizlikler için 3 kart açılımı yapın. Terfi, yeni iş veya maddi kazanç kapılarını aralayın.
                        </p>
                        <ul className="text-xs space-y-2 text-gray-400">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]"></span> İş değişikliği hayırlı mı?</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]"></span> Para akışı ne zaman?</li>
                        </ul>
                    </ContentBox>

                    {/* EVET HAYIR / TEK KART */}
                    <ContentBox>
                        <Star className="w-10 h-10 text-purple-400 mb-6"/>
                        <h3 className="text-xl font-bold text-white mb-3">Tek Kart Tarot (Günlük)</h3>
                        <p className="text-sm mb-4 text-gray-300">
                            Hızlı cevaplar için <strong>tek kart tarot</strong> seçin. "Bugün beni ne bekliyor?" veya net bir Evet/Hayır sorusu için idealdir.
                        </p>
                        <ul className="text-xs space-y-2 text-gray-400">
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Günlük enerji analizi</li>
                            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Net karar verme</li>
                        </ul>
                    </ContentBox>
                </div>
            </section>

            {/* BLOK 3: DETAYLI SEO MAKALEDİ (GİZLİ SİLAH) */}
            <section className="border-t border-white/5 pt-12">
                 <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <SectionTitle icon={<BookOpen className="w-6 h-6"/>}>Tarot Kart Anlamları</SectionTitle>
                        <p className="mb-6 text-gray-400">
                            Tarot destesi toplam 78 karttan oluşur. Bu kartlar, insan hayatının evrelerini, psikolojik arketipleri ve günlük olayları sembolize eder.
                        </p>
                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-purple-900/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 shrink-0">22</div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Büyük Arkana (Major Arcana)</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Ruhun yolculuğunu temsil eder. <em>Deli, Büyücü, İmparatoriçe, Ölüm, Şeytan, Kule</em> gibi kartlar buradadır. Hayatınızdaki büyük karmik dersleri ve dönüm noktalarını gösterir.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 shrink-0">56</div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Küçük Arkana (Minor Arcana)</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Günlük olayları anlatır. 4 elemente ayrılır: <strong>Değnekler</strong> (Ateş/Tutku), <strong>Kupalar</strong> (Su/Aşk), <strong>Kılıçlar</strong> (Hava/Zihin) ve <strong>Tılsımlar</strong> (Toprak/Para).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* SEO Metni Devamı */}
                    <div className="prose prose-invert prose-lg max-w-none text-gray-400 pt-2">
                        <h3 className="text-white font-serif text-xl mb-4">Aşk Hayatında 3 Kartın Önemi</h3>
                        <p>
                            Birçok kullanıcı <strong>tarot aşk falı 3 kart</strong> yöntemini tercih eder çünkü ilişkiler "dün, bugün ve yarın" ekseninde yaşanır.
                        </p>
                        <ul className="list-none pl-0 space-y-2 text-sm">
                            <li className="flex items-center gap-2"><span className="text-[#fbbf24]">✓</span> <strong>1. Kart:</strong> İlişkinin köklerini ve geçmiş travmaları gösterir.</li>
                            <li className="flex items-center gap-2"><span className="text-[#fbbf24]">✓</span> <strong>2. Kart:</strong> Şu anki tutkuyu, sorunları veya bağları gösterir.</li>
                            <li className="flex items-center gap-2"><span className="text-[#fbbf24]">✓</span> <strong>3. Kart:</strong> Bu enerjiyle devam edilirse ilişkinin nereye gideceğini söyler.</li>
                        </ul>
                        <p className="mt-4 text-sm">
                            İster <em>Kılıçların Onlusu</em> gibi zorlu bir kart, ister <em>Güneş</em> gibi müjdeli bir kart çıksın; Rüya Yorumcum AI size bu sembollerin hayatınızdaki pratik karşılığını anlatır.
                        </p>
                    </div>
                 </div>
            </section>

            {/* BLOK 4: SIKÇA SORULAN SORULAR */}
            <section className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-serif font-bold text-white">Merak Edilenler</h3>
                </div>
                <div className="space-y-4">
                    {[
                        { q: "3 Kart Tarot falı ne kadar doğru?", a: "Kartların enerjisi evrenseldir. Sitemizdeki yapay zeka, kartların kombinasyonlarını milyonlarca veriyle analiz ettiği için yorumlar %90'ın üzerinde isabetli ve kişiye özeldir." },
                        { q: "Tarot aşk falı için hangi kartları seçmeliyim?", a: "Özel bir kart seçmenize gerek yok. Niyetinizi 'aşk hayatım' üzerine odaklayıp desteden rastgele 3 kart seçmeniz yeterlidir. Enerjiniz doğru kartları bulacaktır." },
                        { q: "Ücretsiz tarot falı bakabilir miyim?", a: "Evet, Rüya Yorumcum AI üzerinden her gün ücretsiz olarak 3 kart veya tek kart tarot açılımı yapabilirsiniz." },
                        { q: "Ters gelen kartların anlamı nedir?", a: "Ters kartlar genellikle o kartın enerjisinin bloke olduğunu, içselleştirildiğini veya zıttına döndüğünü işaret eder. Yapay zekamız ters kartları da yorumlar." },
                    ].map((faq, i) => (
                        <details key={i} className="group bg-white/5 border border-white/5 rounded-2xl p-6 cursor-pointer open:bg-white/10 transition-all">
                            <summary className="font-bold text-white flex justify-between list-none items-center">
                                {faq.q}
                                <span className="group-open:rotate-180 transition-transform text-[#fbbf24]">▼</span>
                            </summary>
                            <p className="mt-4 text-gray-400 leading-relaxed text-sm">
                                {faq.a}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <div className="text-center py-8">
                <h3 className="text-2xl font-bold text-white mb-6">Kartlar Senin İçin Hazır</h3>
                <a 
                    href="#hero-top"
                    className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                >
                    <Flame className="w-5 h-5"/> Ücretsiz Falını Bak
                </a>
            </div>

         </div>
      </article>
    </main>
  );
}