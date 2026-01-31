"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { 
  Moon, Sparkles, ArrowRight, Crown, Star, 
  Palette, Layers, Hash, BrainCircuit, Search, 
  CheckCircle2, Compass, Activity, Lock
} from "lucide-react";
import Script from "next/script";

// --- SEO SCHEMA ---
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

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    initData();
  }, [supabase]);

  const handleAction = () => {
    router.push(user ? '/dashboard' : '/auth');
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-x-hidden font-sans selection:bg-[#fbbf24]/30">
      
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      {/* ================= HERO SECTION (ALTIN GİRİŞ) ================= */}
      <section className="relative pt-44 pb-32 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#fbbf24]/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay -z-10"></div>

         <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#fbbf24] text-xs font-bold tracking-widest uppercase mb-8 hover:bg-white/10 transition-colors backdrop-blur-md cursor-default">
               <Sparkles className="w-3 h-3" /> Türkiye'nin En Kapsamlı Spiritüel Yapay Zekası
            </div>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
               Kaderinizin <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#d97706] drop-shadow-2xl">
                  Dijital Rehberi
               </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
               <strong>Rüya Tabiri</strong>, <strong>Doğum Haritası</strong>, <strong>Tarot</strong> ve <strong>Numeroloji</strong> tek bir platformda. 
               Geleneksel bilgeliği modern teknolojiyle birleştirerek bilinçaltınızın şifrelerini çözüyoruz.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
               {/* ALTIN ANA BUTON */}
               <button 
                 onClick={handleAction}
                 className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#fbbf24] text-black font-extrabold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-3"
               >
                  <Moon className="w-5 h-5 fill-black" /> Ücretsiz Başla
               </button>
               
               <Link href="/sozluk" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 text-white font-bold text-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3">
                  Rüya Sözlüğü <Search className="w-5 h-5 text-gray-400" />
               </Link>
            </div>
         </div>
      </section>

      {/* ================= ZIG-ZAG ÖZELLİKLER (TÜM HİZMETLER) ================= */}
      <div className="py-24 space-y-32 container mx-auto px-6 relative">
         
         {/* 1. KUTU: RÜYA ANALİZİ (SOL METİN - SAĞ GÖRSEL/BLUR) */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider">
                  <Moon className="w-4 h-4" /> Yapay Zeka Rüya Tabiri
               </div>
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                  Rüyalarınızın <br/> <span className="text-yellow-400">Gizli Mesajını Çözün</span>
               </h2>
               <p className="text-gray-400 text-lg leading-relaxed">
                  Sıradan rüya tabiri sitelerindeki basmakalıp metinleri unutun. Rüya Yorumcum AI, rüyanızı <strong>İslami kaynaklar</strong> (İmam Nablusi, İbn-i Sirin) ve 
                  <strong>Psikolojik arketipler</strong> (Carl Jung) ile sentezleyerek analiz eder. Rüyanın görüldüğü saat, duygu durumu ve kişisel hayatınız yoruma dahil edilir.
               </p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-yellow-500" /> Dini ve Bilimsel Sentez Yorum</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-yellow-500" /> Rüya İçindeki Sembol Analizi</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-yellow-500" /> Kişisel Gelişim Tavsiyeleri</li>
               </ul>
               <button onClick={handleAction} className="text-white font-bold border-b-2 border-yellow-500 pb-1 hover:text-yellow-400 transition-colors flex items-center gap-2">
                  Rüyanı Yorumla <ArrowRight className="w-4 h-4" />
               </button>
            </div>
            {/* BLUR EFFECT MOCKUP */}
            <div className="order-2 relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
               <div className="relative bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-2xl min-h-[400px] flex flex-col justify-center">
                  <div className="space-y-6">
                     {/* Kullanıcı Mesajı */}
                     <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">SİZ</div>
                        <div className="bg-white/5 p-5 rounded-2xl rounded-tl-none text-sm text-gray-300">
                           "Rüyamda dişlerimin döküldüğünü ve avucuma kan dolduğunu gördüm. Çok korkarak uyandım..."
                        </div>
                     </div>
                     {/* AI Cevabı (BLUR EFFECT) */}
                     <div className="flex gap-4 flex-row-reverse relative">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center z-10"><Sparkles className="w-5 h-5 text-black"/></div>
                        <div className="bg-yellow-500/5 border border-yellow-500/20 p-5 rounded-2xl rounded-tr-none text-sm text-gray-400 flex-1 relative overflow-hidden group-hover:bg-yellow-500/10 transition-colors">
                           <div className="filter blur-sm select-none opacity-60">
                              <p className="mb-2">Rüyanızdaki diş dökülmesi sembolü, genel inanışın aksine ömür uzunluğuna delalet eder. İbn-i Sirin'e göre...</p>
                              <p>Psikolojik olarak ise şu sıralar yaşadığınız güç kaybı korkusunu ve kontrolü elden bırakma endişesini yansıtır. Kan görülmesi rüyayı bozmaz, aksine...</p>
                           </div>
                           {/* Kilit İkonu */}
                           <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                              <div className="bg-black/50 p-3 rounded-full border border-white/10">
                                 <Lock className="w-6 h-6 text-yellow-400" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. KUTU: ASTROLOJİ & HARİTA (SAĞ METİN - SOL GÖRSEL) */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-2xl flex items-center justify-center min-h-[400px]">
                    {/* Astroloji Chart Mockup */}
                    <div className="relative w-72 h-72 border-2 border-indigo-500/30 rounded-full flex items-center justify-center animate-spin-slow">
                        <div className="absolute inset-0 border border-white/5 rounded-full m-4"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 bg-[#0f172a] px-2 text-indigo-400 text-xl">♈</div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 bg-[#0f172a] px-2 text-indigo-400 text-xl">♎</div>
                        <div className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 bg-[#0f172a] px-2 text-indigo-400 text-xl">♋</div>
                        <div className="absolute right-0 top-1/2 translate-x-3 -translate-y-1/2 bg-[#0f172a] px-2 text-indigo-400 text-xl">♑</div>
                        
                        <div className="text-center bg-[#0f172a] p-4 rounded-full border border-indigo-500/20 z-10">
                            <div className="text-4xl font-bold text-white mb-1">ASC</div>
                            <div className="text-xs text-indigo-400 uppercase tracking-widest font-bold">Yükselen</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Compass className="w-4 h-4" /> Doğum Haritası & Transitler
               </div>
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                  Kozmik Matematiğin <br/> <span className="text-indigo-400">Hayatınıza Etkisi</span>
               </h2>
               <p className="text-gray-400 text-lg leading-relaxed">
                  Astroloji fal değil, gökyüzü matematiğidir. <strong>Doğum Haritası (Natal Chart)</strong> hesaplayıcımız ile Güneş, Ay ve Yükselen burcunuzu en hassas koordinatlarla öğrenin. 
                  Ayrıca <strong>Günlük Burç Yorumları</strong> modülü ile anlık gökyüzü transitlerinin (Gezegen hareketlerinin) haritanıza olan etkilerini takip edin.
               </p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Ücretsiz Yükselen Burç Hesaplama</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Kişiye Özel Günlük Transit Analizi</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-indigo-500" /> Element Dengesi ve Gezegen Konumları</li>
               </ul>
               <Link href="/astroloji" className="text-white font-bold border-b-2 border-indigo-500 pb-1 hover:text-indigo-400 transition-colors flex items-center gap-2">
                  Haritamı Hesapla <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </div>

         {/* 3. KUTU: RÜYA GÖRSELLEŞTİRME (SOL METİN - SAĞ GÖRSEL) */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Palette className="w-4 h-4" /> AI Rüya Çizimi
               </div>
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                  Rüyalarınızı <br/> <span className="text-purple-400">Fotoğraflayın</span>
               </h2>
               <p className="text-gray-400 text-lg leading-relaxed">
                  Bazı rüyalar o kadar etkileyicidir ki kelimeler yetersiz kalır. Gelişmiş <strong>Text-to-Image (Metinden Görsele)</strong> teknolojimiz ile 
                  gördüğünüz o mistik manzarayı, uçan şehri veya sembolik varlığı yüksek çözünürlüklü bir sanat eserine dönüştürür.
               </p>
               <p className="text-sm text-gray-500 italic border-l-2 border-purple-500 pl-4">
                  "Rüyamda mor gökyüzü altında altın kanatlı dev bir at gördüm..." diyin, yapay zeka sizin için çizsin.
               </p>
               <button onClick={() => router.push('/ruya-gorsellestirme')} className="text-white font-bold border-b-2 border-purple-500 pb-1 hover:text-purple-400 transition-colors flex items-center gap-2">
                  Görsel Oluştur <ArrowRight className="w-4 h-4" />
               </button>
            </div>
            <div className="order-2 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative aspect-square bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                   <img 
                      src="../images/kale.jpg" 
                      alt="AI Dream Image Generation" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                   />
                   <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                      <div className="text-[10px] text-purple-300 font-mono mb-1">PROMPT</div>
                      <div className="text-xs text-white truncate">"Cosmic ocean with floating geometric shapes, mystical atmosphere..."</div>
                   </div>
                </div>
            </div>
         </div>

         {/* 4. KUTU: TAROT FALI (SAĞ METİN - SOL GÖRSEL) */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0f172a] rounded-3xl p-10 border border-white/10 flex items-center justify-center min-h-[400px]">
                    {/* Tarot Card Spread */}
                    <div className="flex gap-4">
                        <div className="w-24 h-40 bg-gradient-to-br from-pink-900 to-black rounded-lg border border-pink-500/30 transform -rotate-12 shadow-xl"></div>
                        <div className="w-24 h-40 bg-gradient-to-br from-pink-900 to-black rounded-lg border border-pink-500/30 transform -translate-y-4 shadow-2xl flex items-center justify-center">
                            <Layers className="text-pink-500 w-8 h-8 opacity-50"/>
                        </div>
                        <div className="w-24 h-40 bg-gradient-to-br from-pink-900 to-black rounded-lg border border-pink-500/30 transform rotate-12 shadow-xl"></div>
                    </div>
                </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-pink-500/10 text-pink-400 text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-4 h-4" /> Mistik Tarot Rehberi
               </div>
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                  Kartların <br/> <span className="text-pink-400">Kadim Bilgeliği</span>
               </h2>
               <p className="text-gray-400 text-lg leading-relaxed">
                  Rüyalarınızın mesajını evrensel sembollerle doğrulayın. <strong>Kelt Haçı</strong>, <strong>İlişki Açılımı</strong> veya <strong>Tek Kart</strong> yöntemleri ile 
                  geçmiş, şimdi ve gelecek arasındaki enerji akışını okuyun. Her kartın anlamı yapay zeka ile size özel yorumlanır.
               </p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-pink-500" /> Aşk, Kariyer ve Genel Açılımlar</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-pink-500" /> Ters ve Düz Kart Yorumları</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-pink-500" /> Günlük Tarot Enerjisi</li>
               </ul>
               <Link href="/tarot" className="text-white font-bold border-b-2 border-pink-500 pb-1 hover:text-pink-400 transition-colors flex items-center gap-2">
                  Kart Seç <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </div>

         {/* 5. KUTU: NUMEROLOJİ (SOL METİN - SAĞ GÖRSEL) */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Hash className="w-4 h-4" /> Numeroloji ve İsim Analizi
               </div>
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                  Sayıların <br/> <span className="text-amber-400">Titreşimini Keşfedin</span>
               </h2>
               <p className="text-gray-400 text-lg leading-relaxed">
                  Evren matematikle konuşur. İsmiminizin harfleri ve doğum tarihiniz, karakteriniz hakkında ipuçları taşır. 
                  <strong>Yaşam Yolu Sayısı</strong>, <strong>Kader Sayısı</strong> ve <strong>İsim Analizi</strong> modülümüz ile sayısal kodunuzu çözün.
               </p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Ebced Hesabı ve İsim Analizi</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Yaşam Yolu Sayısı Hesaplama</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-amber-500" /> Şanslı Günler ve Sayılar</li>
               </ul>
               <Link href="/numeroloji" className="text-white font-bold border-b-2 border-amber-500 pb-1 hover:text-amber-400 transition-colors flex items-center gap-2">
                  Hesapla <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
            <div className="order-2 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0f172a] rounded-3xl p-10 border border-white/10 flex items-center justify-center min-h-[400px]">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                            <div key={n} className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center text-2xl font-bold text-amber-500 border border-white/5 group-hover:border-amber-500/30 transition-colors">
                                {n}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         </div>

         {/* 6. KUTU: DUYGU ANALİZİ (SAĞ METİN - SOL GÖRSEL - YENİLENMİŞ!) */}
         <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-[#0f172a] rounded-3xl p-10 border border-white/10 flex items-center justify-center min-h-[400px] overflow-hidden">
                    
                    {/* AI Brain Visual */}
                    <div className="relative z-10 flex justify-center items-center animate-pulse-slow">
                        {/* Central Brain */}
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 relative z-20 group-hover:scale-110 transition-transform">
                            <BrainCircuit className="w-12 h-12 text-emerald-400" />
                        </div>

                        {/* Orbiting Emotion Points */}
                        {/* Stres */}
                        <div className="absolute -top-16 -left-20 bg-[#0f172a] p-3 rounded-xl border border-red-500/30 flex items-center gap-2 shadow-lg group-hover:-translate-y-2 transition-transform">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-xs text-red-400 font-bold">Stres: %65</span>
                        </div>
                        {/* Huzur */}
                        <div className="absolute -bottom-20 bg-[#0f172a] p-3 rounded-xl border border-emerald-500/30 flex items-center gap-2 shadow-lg group-hover:translate-y-2 transition-transform">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-emerald-400 font-bold">Huzur: %85</span>
                        </div>
                        {/* Kaygı */}
                        <div className="absolute -top-12 -right-24 bg-[#0f172a] p-3 rounded-xl border border-orange-500/30 flex items-center gap-2 shadow-lg group-hover:-translate-y-2 transition-transform">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-xs text-orange-400 font-bold">Kaygı: %30</span>
                        </div>
                    </div>

                    {/* Background Pulse Effect */}
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-3xl scale-50 group-hover:scale-150 transition-transform duration-[2s] pointer-events-none"></div>
                </div>
            </div>
            <div className="order-1 lg:order-2 space-y-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Activity className="w-4 h-4" /> Psikolojik Duygu Analizi
               </div>
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                  Bilinçaltı <br/> <span className="text-emerald-400">Röntgeni</span>
               </h2>
               <p className="text-gray-400 text-lg leading-relaxed">
                  Rüyalarınızdaki baskın duygu nedir? Korku mu, huzur mu, yoksa endişe mi? Yapay zeka destekli 
                  <strong>Duygu Durum Analizi (Sentiment Analysis)</strong> ile rüyalarınızın psikolojik haritasını çıkarın ve stres seviyenizi ölçümleyin.
               </p>
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Pozitif ve Negatif Duygu Tespiti</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Freudyen Sembol Analizi</li>
                  <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Ruh Hali Takibi</li>
               </ul>
               <Link href="/duygu-analizi" className="text-white font-bold border-b-2 border-emerald-500 pb-1 hover:text-emerald-400 transition-colors flex items-center gap-2">
                  Analiz Et <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </div>

      </div>

      {/* ================= PRICING CTA (ALTIN VURUŞ) ================= */}
      <section className="container mx-auto px-6 py-24">
         <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 p-12 md:p-24 text-center group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            {/* Arkaplan Hareketi */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
               <div className="inline-block px-4 py-2 rounded-lg bg-black/30 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
                  Premium Ayrıcalıklar
               </div>
               <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Kaderinizin Kontrolünü <br/> Eline Alın
               </h2>
               <p className="text-indigo-200 text-lg md:text-xl mb-12 leading-relaxed">
                  Reklamsız deneyim, sınırsız detaylı rüya analizi, günlük özel burç yorumları ve görsel üretim hakları. 
                  Spiritüel yolculuğunuzda VIP ayrıcalıkları yaşayın.
               </p>
               <Link 
                 href="/dashboard/pricing" 
                 className="inline-flex items-center gap-3 px-12 py-5 bg-white text-indigo-900 font-extrabold text-lg rounded-full hover:scale-105 hover:shadow-2xl transition-all shadow-xl"
               >
                  <Crown className="w-5 h-5" /> Paketleri İncele
               </Link>
               <p className="mt-6 text-xs text-indigo-300/60 font-medium">
                  * Kredi kartı gerekmez. İptal edilebilir.
               </p>
            </div>
         </div>
      </section>

      {/* ================= SEO ARTICLE (DETAYLI ANLATIM) ================= */}
      <article className="container mx-auto px-6 py-20 border-t border-white/5 text-gray-400 text-sm leading-relaxed max-w-6xl">
         <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                   <BrainCircuit className="w-5 h-5 text-indigo-400" /> Yapay Zeka ile Modern Rüya Tabirleri
                </h3>
                <p>
                   Rüya Yorumcum AI, Türkiye'nin ilk ve tek kapsamlı <strong>rüya analiz platformudur</strong>. Geleneksel "rüyada yılan görmek düşmandır" gibi sığ yorumların ötesine geçer. Yapay zeka algoritmalarımız, rüyadaki sembolleri (yılanın rengi, büyüklüğü, rüya sahibinin hisleri) bir bütün olarak değerlendirir. 
                </p>
                <p>
                   Sistemimiz, <strong>İslami Rüya Tabirleri</strong> (Diyanet, İhya, Seyyid Süleyman) kaynaklarını tarayarak manevi bir perspektif sunarken, aynı zamanda <strong>Modern Psikoloji</strong> (Freudyen ve Jungian analiz) yöntemleriyle bilinçaltınızın derinliklerine iner.
                </p>
            </div>
            <div className="space-y-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                   <Star className="w-5 h-5 text-indigo-400" /> Astroloji, Tarot ve Daha Fazlası
                </h3>
                <p>
                   Platformumuz sadece rüya tabiri ile sınırlı değildir. <strong>Ücretsiz Doğum Haritası Hesaplama</strong> aracımız ile yükselen burcunuzu, ay burcunuzu ve gezegen konumlarını (Natal Chart) saniyelik hassasiyetle öğrenebilirsiniz.
                </p>
                <p>
                   Ayrıca <strong>Tarot Falı</strong> ile kartların rehberliğine başvurabilir, <strong>Numeroloji</strong> ile isminizin ve doğum tarihinizin enerjisini keşfedebilirsiniz. Tüm bu hizmetler, kişisel verilerinizin gizliliği korunarak, uçtan uca şifreli bir altyapıda sunulur.
                </p>
            </div>
         </div>
         
         <div className="mt-12 text-center border-t border-white/5 pt-8">
            <p className="font-bold text-gray-500">© 2026 Rüya Yorumcum AI — Tüm Hakları Saklıdır.</p>
         </div>
      </article>

    </main>
  );
}