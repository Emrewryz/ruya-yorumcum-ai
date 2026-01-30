"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, Eye, Sparkles, Lock, 
  Palette, Layers, Check, Crown, Star, ArrowRight,
  MessageCircle, Hash, Zap, BookOpen, Calendar, Search,
  Activity, Fingerprint, Compass, BrainCircuit, HeartPulse,LayoutDashboard,ImageIcon
} from "lucide-react";
import Script from "next/script";

// Blog verisi için tip tanımı
interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  created_at: string;
}
// --- GOOGLE İÇİN ANA SAYFA ŞEMASI (SCHEMA.ORG) ---
const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Rüya Yorumcum AI",
  "url": "https://www.ruyayorumcum.com.tr",
  "description": "Yapay zeka destekli İslami ve psikolojik rüya tabirleri platformu.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.ruyayorumcum.com.tr/sozluk/{search_term_string}",
    "query-input": "required name=search_term_string"
  }
};
export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const initData = async () => {
      // 1. Kullanıcı Kontrolü
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. Blog Yazılarını Çek
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('title, slug, excerpt, image_url, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (posts) setLatestPosts(posts);
    };
    initData();
  }, [supabase]);

  // Ana Aksiyon Butonu (Rüya Yorumla)
  const handleDreamInterpret = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden font-sans selection:bg-[#fbbf24]/30 pb-20">
      
     <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      {/* --- 3. HERO (GİRİŞ) BÖLÜMÜ - MERAK UYANDIRICI --- */}
      <section className="relative z-10 pt-40 md:pt-52 pb-24 text-center px-4 max-w-6xl mx-auto">
        
        {/* Etiket */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#fbbf24] text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in-up hover:bg-white/10 transition-colors cursor-default">
          <Sparkles className="w-3 h-3" /> Türkiye'nin İlk Derin Öğrenme Tabanlı Rüya Kahini
        </div>

        {/* H1 Başlık */}
        <h1 className="font-serif text-5xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
          Bilinçaltınızın <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] drop-shadow-2xl">
            Gizli Dilini Çözün
          </span>
        </h1>
        
        {/* Alt Metin (SEO Odaklı) */}
        <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
          Sıradan sözlükleri unutun. Rüya Yorumcum AI; rüyanızı <strong className="text-gray-200">İmam Nablusi ve İbn-i Sirin</strong> gibi kadim İslami kaynaklarla tarar, <strong className="text-gray-200">Carl Jung ve Freud</strong> ekolüyle psikolojik analizini yapar. Size %100 kişisel bir yol haritası sunar.
        </p>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={handleDreamInterpret}
            className="w-full md:w-auto px-12 py-6 rounded-2xl bg-gradient-to-r from-[#fbbf24] to-[#d97706] text-black font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-[0_0_50px_rgba(251,191,36,0.3)] flex items-center justify-center gap-3 group"
          >
             <Moon className="w-6 h-6 fill-black group-hover:rotate-12 transition-transform" />
             Rüyamı Şimdi Yorumla
          </button>
          <Link href="#ruya-analizi" className="w-full md:w-auto px-12 py-6 rounded-2xl bg-white/5 text-white font-bold text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3">
            Örnek Analizi Gör <Eye className="w-5 h-5 text-gray-400" />
          </Link>
        </div>

        {/* İstatistik / Güven */}
        <div className="mt-16 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">100K+</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Yorumlanan Rüya</div>
            </div>
            <div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">%98</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Doğruluk Oranı</div>
            </div>
            <div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">7/24</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">Anlık Analiz</div>
            </div>
            <div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">Gizli</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">%100 Anonim</div>
            </div>
        </div>
      </section>

      {/* --- 4. DETAYLI ÖZELLİK VİTRİNİ (Zig-Zag Yerleşim) --- */}
      <div id="ruya-analizi" className="space-y-0">
        
        {/* ÖZELLİK 1: RÜYA ANALİZİ (İslami & Psikolojik) */}
        <section className="py-24 md:py-32 border-t border-white/5 bg-[#020617] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#fbbf24]/5 rounded-full blur-[150px] pointer-events-none"></div>
            
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative z-10">
                {/* Sol: Görsel/UI (Mobile Order 2) */}
                <div className="order-2 md:order-1 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative glass-panel rounded-3xl p-8 border border-white/10 bg-[#0f172a] shadow-2xl">
                        {/* Simüle Edilmiş Chat Arayüzü */}
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold">SİZ</div>
                                <div className="bg-white/5 p-5 rounded-2xl rounded-tl-none text-sm text-gray-300 leading-relaxed">
                                    "Rüyamda dişlerimin döküldüğünü ve avucuma kan dolduğunu gördüm. Çok korkarak uyandım, anlamı nedir?"
                                </div>
                            </div>
                            <div className="flex gap-4 items-start flex-row-reverse">
                                <div className="w-10 h-10 rounded-full bg-[#fbbf24] flex items-center justify-center flex-shrink-0"><Sparkles className="w-5 h-5 text-black"/></div>
                                <div className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 p-5 rounded-2xl rounded-tr-none text-sm text-gray-200 leading-relaxed">
                                    <h4 className="text-[#fbbf24] font-bold mb-2 flex items-center gap-2"><BookOpen className="w-3 h-3"/> İslami Tabir (İbn-i Sirin):</h4>
                                    <p className="mb-4 text-xs text-gray-400">Rüyanızda diş dökülmesi, genel kanının aksine ömrün uzunluğuna veya hane halkının artmasına işaret edebilir. Kan görülmesi ise rüyanın bozulduğu anlamına gelmez, bilakis yaşam enerjisidir.</p>
                                    
                                    <h4 className="text-[#8b5cf6] font-bold mb-2 flex items-center gap-2"><Activity className="w-3 h-3"/> Psikolojik Analiz (Jung):</h4>
                                    <p className="text-xs text-gray-400">Bilinçaltınızda bir "güç kaybı" korkusu yaşıyorsunuz. Şu sıralar kontrolü kaybettiğinizi hissettiğiniz bir olay yaşadınız mı?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sağ: Metin (Mobile Order 1) */}
                <div className="order-1 md:order-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#fbbf24]/10 text-[#fbbf24] text-xs font-bold uppercase tracking-wider mb-6">
                        <MessageCircle className="w-4 h-4" /> Ana Modül
                    </div>
                    <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">Rüyanızın <br/> <span className="text-[#fbbf24]">Gerçek Anlamı</span></h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        Sıradan sözlüklerde "diş dökülmesi ölümdür" yazar ve sizi korkutur. Oysa rüya bir bütündür. Yapay zekamız, rüyanın rengini, hissini ve görüldüğü saati analiz ederek size özel yorum yapar.
                    </p>
                    
                    <div className="space-y-4 mb-10">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#fbbf24]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <BookOpen className="w-5 h-5 text-[#fbbf24]" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Külliyat Taraması</h4>
                                <p className="text-sm text-gray-500">İhya, Nablusi, Seyyid Süleyman ve Diyanet kaynakları taranır.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                <Fingerprint className="w-5 h-5 text-[#8b5cf6]" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Kişisel Analiz</h4>
                                <p className="text-sm text-gray-500">Yaşınız, medeni durumunuz ve ruh halinize göre yorum değişir.</p>
                            </div>
                        </div>
                    </div>

                  {/* --- YENİ HALİ (BUNU YAPIŞTIR) --- */}
<Link href="/ruya-tabiri" className="group flex items-center gap-3 text-white font-bold border-b border-[#fbbf24] pb-1 hover:text-[#fbbf24] transition-colors">
    Detaylı Analizi ve Süreci İncele <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
</Link>
                </div>
            </div>
        </section>

        {/* ÖZELLİK 2: GÖRSEL OLUŞTURMA (AI Image) */}
        <section className="py-24 md:py-32 border-t border-white/5 bg-[#050a1f] relative">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                {/* Sol: Metin */}
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Palette className="w-4 h-4" /> AI Vizyon
                    </div>
                    <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">Rüyanızı <br/> <span className="text-purple-400">Fotoğraflayın</span></h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        Bazen kelimeler o mistik atmosferi anlatmaya yetmez. Gördüğünüz o garip yaratığı, uçan şehri veya rahmani ışığı hatırlamak mı istiyorsunuz? Gelişmiş "Text-to-Image" teknolojimiz ile rüyanızın fotoğrafını çekiyoruz.
                    </p>
                    <p className="text-sm text-gray-500 italic border-l-2 border-purple-500 pl-4 mb-10">
                        "Rüyamda gökyüzünün mor olduğunu ve bulutların altından altın yağdığını gördüm..." diyin, o kareyi sizin için çizelim.
                    </p>
                    <Link href="/ruya-gorsellestirme" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shadow-lg hover:shadow-purple-500/20">
                        Rüyamı Çizdir <ImageIcon className="w-4 h-4 ml-2" />
                    </Link>
                </div>

                {/* Sağ: Görsel */}
                <div className="relative group">
                     <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-blue-500/30 rounded-[2rem] blur-[60px] group-hover:blur-[80px] transition-all"></div>
                     <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
                        {/* Placeholder Visual - Unsplash'tan mistik bir görsel */}
                        <img 
                            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop" 
                            alt="AI Rüya Görseli" 
                            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000" 
                        />
                        <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                            <div className="text-xs text-purple-300 font-mono mb-1">PROMPT:</div>
                            <div className="text-sm text-white line-clamp-1">"A giant golden snake flying in a purple sky..."</div>
                        </div>
                     </div>
                </div>
            </div>
        </section>

        {/* --- MİSTİK ARAÇLAR BÖLÜMÜ (AYRI KUTULAR) --- */}
        <section id="mistik-araclar" className="py-24 md:py-32 border-t border-white/5 bg-[#020617]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">Mistik Araçlar</h2>
                    <p className="text-gray-400">Rüyalarınızın ötesindeki enerjiyi keşfetmeniz için tasarlanmış özel modüller.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    
                    {/* 1. TAROT KUTUSU */}
                    <div className="group relative bg-[#0f172a] rounded-3xl p-8 border border-white/5 hover:border-pink-500/50 transition-all hover:-translate-y-2">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[50px] group-hover:bg-pink-500/20 transition-all"></div>
                        <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 text-pink-500">
                            <Layers className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-4 group-hover:text-pink-400 transition-colors">Tarot Açılımı</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Rüyalarınızın işaret ettiği kader yolunu kartlarla doğrulayın. Kelt Haçı veya Üç Kart açılımı ile geçmiş, şimdi ve gelecek analizi yapın.
                        </p>
                        <Link href="/tarot" className="w-full py-3 rounded-xl border border-pink-500/30 text-pink-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-pink-500 hover:text-white transition-all">
                            Kart Seç <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* 2. NUMEROLOJİ KUTUSU */}
                    <div className="group relative bg-[#0f172a] rounded-3xl p-8 border border-white/5 hover:border-blue-500/50 transition-all hover:-translate-y-2">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                            <Hash className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">Ebced & Numeroloji</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Gördüğünüz nesnelerin (örn: Yılan, Altın) Ebced değerini hesaplayın. Rüyalarınızın size fısıldadığı "Şanslı Sayıları" öğrenin.
                        </p>
                        <Link href="/numeroloji" className="w-full py-3 rounded-xl border border-blue-500/30 text-blue-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all">
                            Hesapla <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* 3. DUYGU ANALİZİ KUTUSU */}
                    <div className="group relative bg-[#0f172a] rounded-3xl p-8 border border-white/5 hover:border-emerald-500/50 transition-all hover:-translate-y-2">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] group-hover:bg-emerald-500/20 transition-all"></div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
                            <BrainCircuit className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">Duygu Analizi</h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            Rüyanızdaki baskın duygu neydi? Korku, huzur, endişe? Yapay zeka, rüya metninizden ruh halinizi ve stres seviyenizi ölçer.
                        </p>
                        <Link href="/duygu-analizi" className="w-full py-3 rounded-xl border border-emerald-500/30 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all">
                            Analiz Et <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                </div>
            </div>
        </section>
      </div>

      {/* --- 5. RÜYA SÖZLÜĞÜ (SEO ANAHTAR KELİMELER) --- */}
      <section id="sozluk" className="py-24 bg-[#050a1f] border-t border-white/5 relative">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
                    <Search className="w-3 h-3" /> En Çok Arananlar
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Google'da Popüler Rüya Tabirleri</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Kullanıcıların en sık arattığı, manası en çok merak edilen sembollerin İslami ve bilimsel açıklamaları.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                    { term: "Rüyada Yılan Görmek", slug: "ruyada-yilan-gormek", color: "text-green-400" },
                    { term: "Rüyada Diş Dökülmesi", slug: "ruyada-dis-dokulmesi", color: "text-gray-200" },
                    { term: "Rüyada Altın Görmek", slug: "ruyada-altin-gormek", color: "text-yellow-400" },
                    { term: "Rüyada Kız Arkadaş Görmek", slug: "ruyada-kiz-arkadas-gormek", color: "text-pink-400" },
                    { term: "Rüyada Anahtar Görmek", slug: "ruyada-anahtar-gormek", color: "text-blue-400" },
                    { term: "Rüyada Köpek Görmek", slug: "ruyada-kopek-gormek", color: "text-orange-400" },
                    { term: "Rüyada Deniz Görmek", slug: "ruyada-deniz-gormek", color: "text-cyan-400" },
                    { term: "Rüyada Uçmak", slug: "ruyada-ucmak", color: "text-purple-400" },
                    { term: "Rüyada Bebek Görmek", slug: "ruyada-bebek-gormek", color: "text-rose-300" },
                    { term: "Rüyada Para Görmek", slug: "ruyada-para-gormek", color: "text-green-500" },
                    { term: "Rüyada Fare Görmek", slug: "ruyada-fare-gormek", color: "text-gray-400" },
                    { term: "Rüyada Öldüğünü Görmek", slug: "ruyada-oldugunu-gormek", color: "text-red-400" },
                ].map((item, idx) => (
                    <Link key={idx} href={`/sozluk/${item.slug}`} className="group p-5 rounded-xl bg-[#020617] border border-white/5 hover:border-[#fbbf24]/50 hover:shadow-[0_0_20px_rgba(251,191,36,0.1)] transition-all flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{item.term}</span>
                        <ArrowRight className={`w-4 h-4 ${item.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                    </Link>
                ))}
            </div>

            <div className="mt-12 text-center">
                <Link href="/sozluk" className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 text-sm font-bold transition-all group">
                    Tüm Rüya Sözlüğünü İncele <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
         </div>
      </section>

      {/* --- 6. BLOG VİTRİNİ --- */}
      {latestPosts.length > 0 && (
         <section className="py-24 bg-[#020617] border-t border-white/5">
             <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="font-serif text-3xl font-bold mb-2">Rüya ve Bilinçaltı Rehberi</h2>
                        <p className="text-gray-400 text-sm">Karabasan, lucid rüya ve uyku bozuklukları hakkında uzman yazıları.</p>
                    </div>
                    <Link href="/blog" className="text-[#fbbf24] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                        Tümünü Gör <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {latestPosts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
                            <div className="bg-[#0f172a] rounded-2xl overflow-hidden border border-white/5 h-full hover:border-[#fbbf24]/30 transition-all hover:-translate-y-1">
                                <div className="aspect-video bg-white/5 relative overflow-hidden">
                                    {post.image_url ? (
                                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-white/20"/></div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase text-[#fbbf24] border border-white/10">
                                        Blog
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                        <Calendar className="w-3 h-3 text-[#fbbf24]" />
                                        {new Date(post.created_at).toLocaleDateString('tr-TR')}
                                    </div>
                                    <h3 className="font-serif text-xl font-bold text-white mb-3 group-hover:text-[#fbbf24] transition-colors line-clamp-2">{post.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                                    <span className="text-[#fbbf24] text-xs font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Makaleyi Oku <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
             </div>
         </section>
      )}

      {/* --- 7. PREMIUM BANNER (SADELEŞTİRİLMİŞ) --- */}
      <section className="container mx-auto px-6 py-20">
         <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#fbbf24] to-[#d97706] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_60px_rgba(251,191,36,0.15)] group">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
             
             <div className="relative z-10 text-center md:text-left max-w-xl">
                 <div className="inline-block px-3 py-1 rounded-lg bg-black/10 text-black/70 text-xs font-bold uppercase tracking-wider mb-4 border border-black/5">Premium</div>
                 <h2 className="font-serif text-3xl md:text-5xl font-bold text-black mb-4 leading-tight">Sınırları Kaldırın</h2>
                 <p className="text-black/80 font-medium text-lg leading-relaxed">
                     Reklamsız deneyim, sınırsız rüya analizi, detaylı tarot açılımları ve öncelikli destek. Kaderinizin kontrolünü elinize alın.
                 </p>
             </div>
             <div className="relative z-10 flex-shrink-0">
                 <Link href="/dashboard/pricing" className="px-10 py-5 rounded-2xl bg-black text-[#fbbf24] font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all flex items-center gap-3">
                    <Crown className="w-5 h-5" /> Paketleri İncele
                 </Link>
             </div>
         </div>
      </section>

      {/* --- 8. SEO MEGA-FOOTER (UZUN VE DETAYLI İÇERİK) --- */}
      <article className="container mx-auto px-6 py-20 border-t border-white/5 text-gray-400 text-sm leading-relaxed space-y-12">
         
         <div className="grid md:grid-cols-2 gap-12">
             <div className="space-y-4">
                 <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#fbbf24]" /> İslami Rüya Tabirleri ve Dini Yorumlar
                 </h3>
                 <p>
                     Türkiye'de rüya yorumu denildiğinde akla ilk gelen kaynaklar, yüzyıllardır güvenle başvurulan <strong>Diyanet rüya tabirleri</strong>, <strong>İmam Nablusi</strong>, <strong>İbn-i Sirin</strong> ve <strong>Seyyid Süleyman</strong> hazretlerinin eserleridir. Rüya Yorumcum AI, bu kadim külliyatı saniyeler içinde tarayarak rüyanızdaki sembollerin (örneğin; <em>rüyada kelime-i şehadet getirmek</em>, <em>rüyada cami görmek</em>, <em>rüyada namaz kılmak</em>) manevi karşılığını bulur ve size sunar.
                 </p>
                 <p>
                     Özellikle <strong>istihare rüyaları</strong> ve haberci (rahmani) rüyalar konusunda hassas analizler sunar. Rüyada görülen nesnelerin (altın, su, toprak) dini açıdan helal mala mı yoksa uyarıya mı işaret ettiğini ayet ve hadis ışığında yorumlar. Platformumuz, geleneksel bilgeliği teknolojiyle harmanlayarak size en doğru İslami rüya yorumunu sunmayı hedefler.
                 </p>
             </div>
             <div className="space-y-4">
                 <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-400" /> Psikolojik Rüya Yorumlama ve Bilinçaltı Analizi
                 </h3>
                 <p>
                     Rüyalar sadece gelecekten haber vermez; onlar aynı zamanda bastırılmış duyguların, korkuların ve arzuların birer aynasıdır. <strong>Sigmund Freud</strong> ve <strong>Carl Gustav Jung</strong> gibi modern psikolojinin kurucularına göre rüyalar, bilinçaltına giden kral yoludur. <strong>Sürekli rüya görmek</strong>, <em>rüyada dişlerin dökülmesi</em>, <em>yüksekten düşmek</em> veya <em>birinden kaçmak</em> gibi yaygın temalar, aslında stres, kaygı, değişim isteği veya güç kaybı korkusu olarak yorumlanır.
                 </p>
                 <p>
                     Yapay zeka motorumuz, rüyanızdaki duygu durumunu (Sentiment Analysis) analiz ederek size "Bu rüya bilinçaltınızın bir oyunu mu yoksa gerçek bir mesaj mı?" sorusunun cevabını verir. Jung'un arketip teorisi ve Freud'un rüya sansürü kavramlarını kullanarak kişisel gelişiminize katkı sağlar.
                 </p>
             </div>
         </div>

         {/* Sıkça Arananlar (SEO Images'den Gelen Kelimeler ve Uzun Kuyruk Anahtarlar) */}
         <div className="bg-[#0f172a] rounded-3xl p-10 border border-white/5">
             <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" /> Sıkça Sorulan Rüya Tabirleri
             </h3>
             <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-500">
                 {[
                     "Rüyada Anahtar Görmek", "Rüyada Anahtar Kaybetmek", "Rüyada Ev Anahtarı", 
                     "Rüyada Kız Arkadaş Görmek", "Eski Sevgiliyi Görmek", "Rüyada Sevgiliden Ayrılmak",
                     "Rüyada Kelime-i Şehadet Getirmek", "Rüyada Namaz Kılmak", "Rüyada Camiye Gitmek",
                     "Rüyada Yılan Isırması", "Rüyada Sarı Yılan", "Rüyada Evde Yılan Görmek",
                     "Rüyada Diş Kırılması", "Rüyada Diş Çektirmek", "Rüyada Ön Dişin Düşmesi",
                     "Sürekli Rüya Görmek ve Yorgun Uyanmak", "Çok Fazla Rüya Görmek",
                     "Rüyada Bir Sürü Anahtar Görmek", "Rüyada Köpek Saldırması", "Rüyada Denizde Yüzmek"
                 ].map((tag, i) => (
                     <Link key={i} href={`/sozluk/${tag.toLowerCase().replace(/ /g, '-').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')}`} className="px-3 py-2 rounded-lg bg-black/30 hover:bg-[#fbbf24]/10 hover:text-[#fbbf24] transition-colors border border-white/5">
                         #{tag}
                     </Link>
                 ))}
             </div>
         </div>

         <div className="text-center max-w-2xl mx-auto pt-8">
             <p className="italic opacity-60">
                 "Rüyalar, uyanıkken göremediğimiz gerçeklerin geceleyin açılan pencereleridir."
             </p>
             <p className="mt-4 font-bold text-white text-sm">Rüya Yorumcum AI © 2026 — Tüm Hakları Saklıdır.</p>
         </div>
      </article>

    </main>
  );
}