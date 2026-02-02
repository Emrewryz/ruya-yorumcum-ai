import Link from "next/link";
import { createClient } from "@/utils/supabase/server"; 
import { 
  ImageIcon, Wand2, Sparkles, Eye, 
  Layers, Aperture, Maximize, 
  ArrowRight, BrainCircuit, Lightbulb,
  FileImage, Fingerprint, Zap, CheckCircle2,
  BookOpen, Search
} from "lucide-react";
import Script from "next/script";

// --- SEO SCHEMA ---
const visualizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Rüya Görselleştirme Asistanı",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "TRY"
      },
      "description": "Yapay zeka ile rüyalarınızı yüksek çözünürlüklü sanat eserlerine ve fotoğraflara dönüştürün."
    },
    {
      "@type": "Service",
      "name": "Rüyadan Resim Yapma",
      "provider": { "@type": "Organization", "name": "Rüya Yorumcum AI" },
      "serviceType": "Image Generation",
      "description": "Görülen rüyayı resme dönüştürme ve yapay zeka rüya görseli oluşturma hizmeti."
    }
  ]
};

export default async function RuyaGorsellestirmePage() {
  const supabase = createClient();

  // 1. Blog Yazılarını Çek
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('title, slug, image_url, created_at, excerpt')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  // 2. Popüler Rüya Tabirlerini Çek
  const { data: popularTerms } = await supabase
    .from('dream_dictionary')
    .select('term, slug, search_count')
    .order('search_count', { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans selection:bg-[#fbbf24]/30 pb-12 md:pb-20 overflow-x-hidden">
      <Script
        id="visualization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(visualizationSchema) }}
      />

      {/* --- 1. HERO SECTION --- */}
      {/* MOBİL: pt-28, px-4 */}
      <section className="relative pt-28 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 overflow-hidden">
        {/* Arkaplan: Mobilde küçültüldü */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] md:w-[1200px] md:h-[800px] bg-[#fbbf24]/5 rounded-[100%] blur-[80px] md:blur-[150px] pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          
          {/* SOL: COPYWRITING */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
              <Wand2 className="w-3 h-3 text-[#fbbf24]" /> Text-to-Image Teknolojisi
            </div>
            
            {/* MOBİL: Text-4xl, TABLET: Text-7xl */}
            <h1 className="font-serif text-4xl lg:text-7xl font-bold leading-[1.1]">
              Rüyanızın <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Fotoğrafını Çekin
              </span>
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Görülen rüyayı resme dönüştürmek artık hayal değil. <strong>Derin öğrenme</strong> algoritmalarımız, rüya anlatımınızı saniyeler içinde 4K çözünürlükte somut bir sanat eserine çevirir.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth?redirect=visualize" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold text-base md:text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(251,191,36,0.2)] flex items-center justify-center gap-2">
                <ImageIcon className="w-5 h-5" /> Rüya Görseli Oluştur
              </Link>
              <Link href="#nasil-calisir" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-base md:text-lg hover:bg-white/10 transition-colors flex items-center justify-center">
                Teknolojiyi İncele
              </Link>
            </div>

            <div className="pt-4 md:pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-white/5 mt-4 md:mt-6">
               <span className="flex items-center gap-2"><Maximize className="w-3 h-3 md:w-4 md:h-4 text-[#fbbf24]" /> 4K Ultra HD</span>
               <span className="flex items-center gap-2"><Zap className="w-3 h-3 md:w-4 md:h-4 text-[#fbbf24]" /> Hızlı Render</span>
               <span className="flex items-center gap-2"><Fingerprint className="w-3 h-3 md:w-4 md:h-4 text-[#fbbf24]" /> %100 Size Özel</span>
            </div>
          </div>

          {/* SAĞ: UI MOCKUP */}
          <div className="order-2 relative group perspective-1000 px-2 md:px-0">
             <div className="relative bg-[#0f172a] border border-white/10 rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
                {/* Panel Header */}
                <div className="px-4 py-3 md:px-6 md:py-4 border-b border-white/5 flex items-center justify-between bg-[#020617]">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/20"></div>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/20"></div>
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/20"></div>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-mono text-gray-500 uppercase tracking-widest">Dream Generator v1.0</span>
                </div>

                {/* Panel Body */}
                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                   
                   {/* Prompt Alanı */}
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] md:text-xs font-bold text-gray-400 ml-1">Rüya Metni (Prompt)</label>
                        <span className="text-[9px] md:text-[10px] text-green-500 font-mono">● Sistem Hazır</span>
                      </div>
                      <div className="bg-[#020617] border border-white/10 rounded-lg md:rounded-xl p-3 md:p-4 text-xs md:text-sm text-gray-300 font-mono leading-relaxed">
                         <span className="text-[#fbbf24]">/imagine</span> Sisli bir ormanın ortasında, gökyüzüne uzanan gotik tarzda devasa bir kale...
                      </div>
                   </div>

                   {/* Görsel Alanı */}
                   <div className="relative aspect-video rounded-lg md:rounded-xl overflow-hidden border border-white/5 bg-black">
                      <img 
                        src="/images/kale.jpg" 
                        alt="Yapay Zeka Rüya Görseli - Kale" 
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 bg-gradient-to-t from-black/90 to-transparent">
                         <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                            <span className="text-[10px] md:text-xs font-bold text-white">Görsel Oluşturuldu (1.2s)</span>
                         </div>
                      </div>
                   </div>

                   {/* Alt Buton */}
                   <button className="w-full py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-lg text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors">
                      İndir veya Paylaş
                   </button>
                </div>
             </div>
          </div>
        </div>

      </section>

      {/* --- 2. NASIL YAPIYORUZ? --- */}
      <section id="nasil-calisir" className="py-16 md:py-24 bg-[#050a1f] border-t border-white/5 relative">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center mb-12 md:mb-20">
               <h2 className="font-serif text-2xl md:text-5xl font-bold mb-4 md:mb-6">Yapay Zeka Rüyayı Nasıl Çizer?</h2>
               <p className="text-gray-400 text-sm md:text-lg max-w-3xl mx-auto">
                  Rüya görselleştirme, basit bir resim çizme işlemi değildir. Bu teknoloji, bilinçaltınızın karmaşık dilini görsel sanatlara tercüme eden bir köprüdür.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
               {/* ADIM 1 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-[#fbbf24]/20 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center mb-4 md:mb-6 text-gray-300 group-hover:text-[#fbbf24] transition-colors">
                     <Aperture className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">1. Metin Analizi (NLP)</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     Sistemimiz rüya metnini analiz eder. Rüyanın <strong>duygusunu</strong> ve <strong>atmosferini</strong> anlar.
                  </p>
               </div>

               {/* ADIM 2 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-[#fbbf24]/20 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center mb-4 md:mb-6 text-gray-300 group-hover:text-[#fbbf24] transition-colors">
                     <Layers className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">2. Difüzyon Modeli</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     Deep Learning modellerimiz, milyonlarca sanat eserinden öğrendiği verilerle rüyanızı sıfırdan inşa eder.
                  </p>
               </div>

               {/* ADIM 3 */}
               <div className="bg-[#0f172a] p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 hover:border-[#fbbf24]/20 transition-all group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center mb-4 md:mb-6 text-gray-300 group-hover:text-[#fbbf24] transition-colors">
                     <Wand2 className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">3. 4K Render ve Stil</h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                     Sonuç, seçtiğiniz stilde yüksek çözünürlüklü bir "Rüya Fotoğrafı"dır. Oluşturulan görsel tamamen size özeldir.
                  </p>
               </div>
            </div>

         </div>
      </section>

      {/* --- 3. PSİKOLOJİK FAYDA --- */}
      <section className="py-16 md:py-24 container mx-auto px-4 md:px-6 max-w-5xl">
         <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-8 md:mb-12 border-b border-white/10 pb-4 md:pb-6">
            <div className="p-2 md:p-3 bg-white/5 rounded-xl w-fit">
               <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-[#fbbf24]" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Neden Rüyaları Görselleştirmeliyiz?</h2>
         </div>
         
         <div className="grid md:grid-cols-2 gap-10 md:gap-16 text-gray-400 text-sm leading-relaxed">
            
            <article className="space-y-6">
               <div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                     Rüya Günlüğü Tutmanın Modern Yolu
                  </h3>
                  <p>
                     Geleneksel rüya tabirleri kitapları sembolleri açıklar, ancak görsel hafıza çok daha kalıcıdır. <strong>Rüya görselleştirme</strong>, rüya günlüğünüzü görsel bir albüme dönüştürür.
                  </p>
               </div>
               
               <div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                     Kabuslarla Yüzleşme Terapisi
                  </h3>
                  <p>
                     Kabuslarınızdaki korkutucu figürleri <strong>yapay zeka rüya görseli</strong> olarak oluşturduğunuzda, beyniniz onu "sanatsal bir obje" olarak kodlar ve korkunuz hafifler.
                  </p>
               </div>
            </article>

            <article className="space-y-6">
               <div>
                  <h3 className="text-base md:text-lg font-bold text-white mb-2 md:mb-3 flex items-center gap-2">
                     Lucid Rüya (Bilinçli Rüya) Pratiği
                  </h3>
                  <p>
                     <strong>Görülen rüyayı resme dönüştürme</strong> egzersizi yapmak, beyninizin görsel korteksini eğitir ve bir sonraki rüyanızda kontrolü ele almanızı kolaylaştırır.
                  </p>
               </div>

               <div className="bg-[#0f172a] p-5 md:p-6 rounded-2xl border border-white/5">
                  <h4 className="text-white font-bold mb-3 md:mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                     <FileImage className="w-4 h-4 text-gray-400" /> Sık Kullanılan Stiller
                  </h4>
                  <div className="flex flex-wrap gap-2">
                     {["Sinematik", "Yağlı Boya", "Karakalem", "Sürrealizm", "Cyberpunk", "Anime", "3D"].map((style, i) => (
                        <span key={i} className="px-2 py-1 md:px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] md:text-xs text-gray-400">
                           {style}
                        </span>
                     ))}
                  </div>
               </div>
            </article>
         </div>
      </section>

      {/* --- 4. VERİTABANI BAĞLANTISI --- */}
      <section className="py-16 md:py-20 bg-[#050a1f] border-t border-white/5">
         <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
               
               {/* KOLON 1: Popüler Rüya Tabirleri */}
               <div className="md:col-span-1">
                  <h3 className="text-white font-bold mb-4 md:mb-6 flex items-center gap-2">
                     <Search className="w-4 h-4 text-[#fbbf24]" /> Popüler Tabirler
                  </h3>
                  <ul className="space-y-2 md:space-y-3">
                     {popularTerms?.map((term) => (
                        <li key={term.slug}>
                           <Link 
                              href={`/sozluk/${term.slug}`} 
                              className="text-xs md:text-sm text-gray-400 hover:text-[#fbbf24] transition-colors flex items-center justify-between group border-b border-white/5 pb-2 last:border-0"
                           >
                              {term.term}
                              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                           </Link>
                        </li>
                     ))}
                     {(!popularTerms || popularTerms.length === 0) && (
                        <li className="text-xs text-gray-600">Henüz popüler veri yok.</li>
                     )}
                  </ul>
                  <Link href="/sozluk" className="inline-block mt-4 text-xs font-bold text-[#fbbf24] hover:underline">
                     Tüm Sözlüğü Gör &rarr;
                  </Link>
               </div>

               {/* KOLON 2 & 3: İlgili Blog Yazıları */}
               <div className="md:col-span-2">
                  <h3 className="text-white font-bold mb-4 md:mb-6 flex items-center gap-2">
                     <BookOpen className="w-4 h-4 text-[#fbbf24]" /> Rüyalar Hakkında Son Yazılar
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                     {blogPosts?.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group block bg-[#0f172a] rounded-lg md:rounded-xl border border-white/5 overflow-hidden hover:border-[#fbbf24]/30 transition-all">
                           <div className="aspect-video bg-black relative">
                              {post.image_url ? (
                                  // Placeholder for post image
                                 <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-white/5"><ImageIcon className="w-8 h-8 text-white/20"/></div>
                              )}
                           </div>
                           <div className="p-3 md:p-4">
                              <h4 className="font-bold text-white text-xs md:text-sm mb-2 group-hover:text-[#fbbf24] line-clamp-1 transition-colors">{post.title}</h4>
                              <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                           </div>
                        </Link>
                     ))}
                     {(!blogPosts || blogPosts.length === 0) && (
                        <div className="text-sm text-gray-500">Henüz blog yazısı bulunmuyor.</div>
                     )}
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-16 md:py-20 text-center relative overflow-hidden">
         <div className="container mx-auto px-4 md:px-6 relative z-10">
            <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4 md:mb-6 text-white">Hayal Gücünüzü Serbest Bırakın</h2>
            <p className="text-gray-400 mb-6 md:mb-8 text-base md:text-lg max-w-2xl mx-auto">
               Gözlerinizi kapatın, rüyanızı hatırlayın ve gerisini yapay zekaya bırakın.
            </p>
            <Link href="/auth?redirect=visualize" className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-4 rounded-xl bg-white text-black font-bold text-base md:text-lg hover:bg-gray-200 transition-colors shadow-xl group">
               Hemen Görselleştir <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
         </div>
      </section>

    </main>
  );
}