import type { Metadata } from "next";
import TarotLandingClient from "./TarotLandingClient";
import { 
  BookOpen, Star, Sparkles, Eye, Compass, Layers, Zap, Info, 
  Heart, HelpCircle, ChevronDown 
} from "lucide-react";

// --- 1. SEO METADATA (CSV VERİLERİNE GÖRE OPTİMİZE EDİLDİ) ---
export const metadata: Metadata = {
  title: "Ücretsiz Tarot Falı Bak - %100 Gerçek 3 Kart ve Tek Kart Açılımı",
  description: "Türkiye'nin en gelişmiş yapay zeka tarot falı. Aşk, kariyer ve gelecek için 3 kart tarot, tek kart günlük fal ve evet hayır açılımları. Kartlarınızı hemen seçin.",
  keywords: [
    "tarot falı", "tarot falı bak", "ücretsiz tarot", "3 kart tarot", "tek kart tarot", 
    "aşk falı", "tarot kartı anlamları", "günlük tarot falı", "online tarot", 
    "evet hayır tarot", "tarot bak", "yapay zeka fal"
  ],
  alternates: { canonical: "https://ruyayorumcum.com/tarot" },
  openGraph: {
    title: "Ücretsiz Tarot Falı Bak | Yapay Zeka Destekli",
    description: "Kartlarını seç, enerjini gönder. Yapay zeka senin için geçmiş, şimdi ve geleceği yorumlasın.",
    type: "website",
    url: "https://ruyayorumcum.com/tarot",
    images: ["/images/tarot-cover-seo.jpg"],
  },
};

// --- 2. ZENGİN SCHEMA YAPISI (FAQ + APP) ---
const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Rüya Yorumcum Tarot",
      "applicationCategory": "LifestyleApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TRY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "12450" },
      "description": "Yapay zeka destekli online tarot falı ve rüya tabirleri uygulaması."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Tarot falı geleceği kesin bilir mi?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tarot bir kehanet aracı değil, bilinçaltı rehberidir. Gelecek sabit değildir, tarot size mevcut enerjilerin olası sonuçlarını gösterir."
          }
        },
        {
          "@type": "Question",
          "name": "3 Kart Tarot açılımı nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "En popüler açılımdır. Birinci kart geçmişi, ikinci kart şimdiki durumu, üçüncü kart ise olası geleceği temsil eder."
          }
        },
        {
          "@type": "Question",
          "name": "Günlük tek kart tarot nasıl bakılır?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Güne başlarken 'Bugün beni ne bekliyor?' niyetine odaklanarak tek bir kart seçilir. Bu kart günün enerjisini belirler."
          }
        }
      ]
    }
  ]
};

// --- STİL BİLEŞENLERİ ---
const SectionTitle = ({ children, icon }: { children: React.ReactNode, icon: any }) => (
    <h2 className="flex items-center gap-3 text-2xl md:text-4xl font-serif font-bold text-white mb-6">
        <span className="p-2 rounded-lg bg-[#fbbf24]/10 text-[#fbbf24]">{icon}</span>
        {children}
    </h2>
);

const ContentBox = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-[#0f172a]/50 border border-white/5 rounded-3xl p-8 md:p-10 hover:border-[#fbbf24]/20 transition-all ${className}`}>
        {children}
    </div>
);

export default function TarotPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-gray-300 selection:bg-[#fbbf24] selection:text-black font-sans leading-relaxed">
      
      {/* Schema Injection */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      {/* ====================================================================================
          BÖLÜM 1: HERO & İNTERAKTİF UYGULAMA
          - ID EKLENDİ: id="hero-top" (Scroll linki için)
          - PADDING ARTIRILDI: pt-32 (Navbar çakışmasını önlemek için)
      ==================================================================================== */}
      <section id="hero-top" className="relative pt-32 pb-12 px-4 overflow-hidden min-h-[90vh] flex flex-col justify-center">
         {/* Dekoratif Arka Plan */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
         
         <div className="container mx-auto relative z-10">
            {/* Başlık Alanı */}
            <div className="text-center mb-8 max-w-4xl mx-auto">
                <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                   <span className="block text-xl md:text-2xl font-sans font-normal text-[#fbbf24] mb-2 tracking-widest uppercase">Yapay Zeka Destekli</span>
                   Ücretsiz Tarot Falı
                </h1>
                <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto">
                   Niyetinizi belirleyin, kartlarınızı seçin ve <strong>3 Kart Tarot</strong> ile kaderinizin haritasını çıkarın.
                </p>
            </div>

            {/* İNTERAKTİF TAROT MODÜLÜ (CLIENT SIDE) */}
            <div className="max-w-4xl mx-auto mb-12">
               <TarotLandingClient />
            </div>

            {/* Aşağı Kaydır İpucu (Kullanıcıyı SEO metnine çeker) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-50 hover:opacity-100 transition-opacity cursor-pointer pointer-events-none md:pointer-events-auto">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Rehberi Oku</span>
                <ChevronDown className="w-5 h-5 text-[#fbbf24]" />
            </div>
         </div>
      </section>

      {/* ====================================================================================
          BÖLÜM 2: GÜVEN SİNYALLERİ (Compact Tasarım)
      ==================================================================================== */}
      <div className="border-y border-white/5 bg-[#020617]/50 py-6">
          <div className="container mx-auto flex flex-wrap justify-center gap-8 md:gap-20 text-center">
              <div>
                  <div className="text-2xl font-bold text-white">100K+</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Yorumlanan Fal</div>
              </div>
              <div>
                  <div className="text-2xl font-bold text-white">%98</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Doğruluk Payı</div>
              </div>
              <div>
                  <div className="text-2xl font-bold text-white">7/24</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">Anlık Analiz</div>
              </div>
          </div>
      </div>

      {/* ====================================================================================
          BÖLÜM 3: SEO İÇERİK MAKALESİ (Google Botları İçin Zengin Metin)
      ==================================================================================== */}
      <article className="bg-[#050a1f] py-20 px-4">
         <div className="container mx-auto max-w-5xl space-y-20">

            {/* SEO BLOK 1: TAROT NEDİR & NASIL BAKILIR? */}
            <section>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <SectionTitle icon={<Compass className="w-6 h-6"/>}>Online Tarot Falı Nedir?</SectionTitle>
                        <div className="space-y-4">
                            <p>
                                <strong>Tarot</strong>, 78 karttan oluşan kadim bir bilgelik kitabıdır. Yüzyıllardır insanlar, bilinçaltlarındaki sorulara yanıt bulmak, <strong>aşk hayatı</strong>, kariyer ve gelecek hakkında öngörü sağlamak için tarota başvurur.
                            </p>
                            <p>
                                Geleneksel yöntemlerin aksine, <strong>Rüya Yorumcum AI</strong> size sıradan kopyala-yapıştır cevaplar vermez. Yapay zeka teknolojimiz, seçtiğiniz kartların (örneğin; Kule, Aşıklar, İmparatoriçe) birbirleriyle olan kombinasyonunu ve enerjisini analiz ederek size özel, %100 benzersiz bir <strong>tarot yorumu</strong> sunar.
                            </p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-[#fbbf24]/20 to-purple-900/20 p-8 rounded-[2rem] border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#fbbf24]"/> Nasıl Bakılır?
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fbbf24] text-black font-bold flex items-center justify-center">1</span>
                                <span><strong>Odaklanın:</strong> Zihninizi boşaltın ve sorunuza odaklanın.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fbbf24] text-black font-bold flex items-center justify-center">2</span>
                                <span><strong>Karıştırın:</strong> Dijital desteyi karıştırarak enerjinizi aktarın.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#fbbf24] text-black font-bold flex items-center justify-center">3</span>
                                <span><strong>Seçin:</strong> İçgüdülerinizle 3 kart veya tek kart seçin.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* SEO BLOK 2: AÇILIM TÜRLERİ (Uzun Kuyruk Kelimeler) */}
            <section>
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Popüler Tarot Açılımları</h2>
                    <p className="text-gray-400">Soru türünüze göre en uygun yöntemi seçin.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* 3 KART */}
                    <ContentBox className="group hover:bg-[#0f172a]">
                        <Layers className="w-10 h-10 text-purple-400 mb-6 group-hover:scale-110 transition-transform"/>
                        <h3 className="text-xl font-bold text-white mb-3">3 Kart Tarot Falı</h3>
                        <p className="text-sm mb-4">
                            En yaygın ve etkili yöntemdir. Zaman akışını analiz eder.
                        </p>
                        <ul className="text-xs space-y-2 text-gray-400">
                            <li className="border-l-2 border-purple-500 pl-2"><strong className="text-white">1. Kart:</strong> Geçmiş (Kökler)</li>
                            <li className="border-l-2 border-purple-500 pl-2"><strong className="text-white">2. Kart:</strong> Şimdi (Durum)</li>
                            <li className="border-l-2 border-purple-500 pl-2"><strong className="text-white">3. Kart:</strong> Gelecek (Sonuç)</li>
                        </ul>
                    </ContentBox>

                    {/* TEK KART */}
                    <ContentBox className="group hover:bg-[#0f172a]">
                        <Star className="w-10 h-10 text-[#fbbf24] mb-6 group-hover:scale-110 transition-transform"/>
                        <h3 className="text-xl font-bold text-white mb-3">Tek Kart Tarot</h3>
                        <p className="text-sm mb-4">
                            Hızlı ve net cevaplar için idealdir. "Bugün beni ne bekliyor?" veya "Evet mi Hayır mı?" soruları için kullanılır.
                        </p>
                        <ul className="text-xs space-y-2 text-gray-400">
                            <li className="border-l-2 border-[#fbbf24] pl-2"><strong className="text-white">Günlük Tarot:</strong> Günün enerjisi.</li>
                            <li className="border-l-2 border-[#fbbf24] pl-2"><strong className="text-white">Evet/Hayır:</strong> Kesin kararlar.</li>
                        </ul>
                    </ContentBox>

                    {/* AŞK FALI */}
                    <ContentBox className="group hover:bg-[#0f172a]">
                        <Heart className="w-10 h-10 text-rose-500 mb-6 group-hover:scale-110 transition-transform"/>
                        <h3 className="text-xl font-bold text-white mb-3">Tarot Aşk Falı</h3>
                        <p className="text-sm mb-4">
                            İlişkiler, partnerinizin duyguları ve aşk hayatınızın geleceği üzerine derinlemesine analiz.
                        </p>
                        <ul className="text-xs space-y-2 text-gray-400">
                            <li className="border-l-2 border-rose-500 pl-2"><strong className="text-white">Partner Analizi:</strong> Ne hissediyor?</li>
                            <li className="border-l-2 border-rose-500 pl-2"><strong className="text-white">İlişki Geleceği:</strong> Nereye gidiyor?</li>
                        </ul>
                    </ContentBox>
                </div>
            </section>

            {/* SEO BLOK 3: KART ANLAMLARI (Kısa Sözlük) */}
            <section className="grid md:grid-cols-2 gap-12">
                <div>
                    <SectionTitle icon={<BookOpen className="w-6 h-6"/>}>Tarot Kart Anlamları</SectionTitle>
                    <p className="mb-6">
                        Tarot destesi toplam 78 karttan oluşur. Bu kartlar, insan hayatının evrelerini, psikolojik arketipleri ve günlük olayları sembolize eder.
                    </p>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-900/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20">22</div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Büyük Arkana (Major Arcana)</h4>
                                <p className="text-sm text-gray-400">Ruhun yolculuğunu temsil eder. <em>Deli, Büyücü, İmparatoriçe, Ölüm, Şeytan, Kule</em> gibi kartlar buradadır. Hayatınızdaki büyük karmik dersleri gösterir.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-900/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">56</div>
                            <div>
                                <h4 className="text-white font-bold mb-1">Küçük Arkana (Minor Arcana)</h4>
                                <p className="text-sm text-gray-400">Günlük olayları anlatır. 4 elemente ayrılır: <strong>Değnekler</strong> (Ateş/Tutku), <strong>Kupalar</strong> (Su/Aşk), <strong>Kılıçlar</strong> (Hava/Zihin) ve <strong>Tılsımlar</strong> (Toprak/Para).</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Görsel Alanı - Buraya Tarot Destesi İmajı */}
                <div className="relative h-full min-h-[300px] rounded-[2rem] overflow-hidden border border-white/10 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-10"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1633519967266-932d0c242948?q=80&w=1000&auto=format&fit=crop" 
                        alt="Tarot Kartları Masada" 
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute bottom-0 left-0 p-8 z-20">
                        <div className="text-[#fbbf24] font-serif text-2xl italic">"Kartlar yalan söylemez, sadece gerçeği fısıldar."</div>
                    </div>
                </div>
            </section>

            {/* SEO BLOK 4: SIKÇA SORULAN SORULAR (FAQ Schema İçin) */}
            <section className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <SectionTitle icon={<HelpCircle className="w-6 h-6"/>}>Sıkça Sorulan Sorular</SectionTitle>
                </div>
                <div className="space-y-4">
                    {[
                        { q: "Tarot falı geleceği kesin bilir mi?", a: "Hayır, tarot geleceği kesin olarak belirlemez. Gelecek sizin iradenize bağlıdır. Kartlar, mevcut enerjinizin olası sonuçlarını göstererek size rehberlik eder." },
                        { q: "Günde kaç kere tarot bakmalıyım?", a: "Enerjinizin dağılmaması için aynı soru üzerine günde sadece 1 kez bakmanız önerilir. Sitemizde her gün 1 ücretsiz hakkınız bulunur." },
                        { q: "Ters gelen kartların anlamı nedir?", a: "Ters kartlar genellikle o kartın enerjisinin bloke olduğunu, içselleştirildiğini veya zıttına döndüğünü işaret eder. Yapay zekamız ters kartları da yorumlar." },
                        { q: "Tarot bakmak günah mı?", a: "Tarot bir inanç sistemi değil, bir psikolojik analiz ve farkındalık aracıdır. Eğlence ve rehberlik amaçlı kullanılır." },
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

            {/* ÇAĞRI (CTA) - ANCHOR TAG KULLANILDI */}
            <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-white mb-6">Kaderini Keşfetmeye Hazır Mısın?</h3>
                <a 
                    href="#hero-top"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                >
                    <Sparkles className="w-5 h-5"/> Falımı Şimdi Yorumla
                </a>
            </div>

         </div>
      </article>

    </main>
  );
}