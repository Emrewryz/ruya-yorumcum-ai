"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, ChevronRight, BookOpen, Sparkles, 
  ArrowRight, PenTool, Search, Loader2, BrainCircuit,
  Layers, Hash, Star
} from "lucide-react";
import AdUnit from "@/components/AdUnit";

// --- DİNAMİK HİZMET KUTUSU VERİLERİ ---
const SERVICES = [
  {
    id: 'dream',
    title: 'Rüyanız Size Özeldir',
    desc: 'Blog yazıları geneldir. Yapay zekaya rüyanızı anlatın, size özel derinlemesine psikolojik analiz hazırlasın.',
    btnText: 'Özel Analiz Yaptır',
    link: '/dashboard',
    icon: BrainCircuit,
    theme: {
      text: 'text-amber-400',
      bg: 'bg-amber-500',
      hover: 'hover:bg-amber-400',
      border: 'border-amber-500/20',
      gradient: 'from-amber-500/10',
      iconColor: 'text-amber-500'
    }
  },
  {
    id: 'tarot',
    title: 'Geleceğiniz Kartlarda',
    desc: 'Niyetinizi tutun ve kartlarınızı seçin. Yapay zeka kahinimiz size özel tarot açılımınızı anında yorumlasın.',
    btnText: 'Tarot Falı Baktır',
    link: '/dashboard', 
    icon: Layers,
    theme: {
      text: 'text-purple-400',
      bg: 'bg-purple-600',
      hover: 'hover:bg-purple-500',
      border: 'border-purple-500/20',
      gradient: 'from-purple-600/10',
      iconColor: 'text-purple-500'
    }
  },
  {
    id: 'numerology',
    title: 'Sayıların Gizemli Gücü',
    desc: 'İsminiz bir tesadüf değil. Numeroloji analizi ile hayat amacınızı, güçlü yönlerinizi ve kader sayınızı keşfedin.',
    btnText: 'Numeroloji Analizi',
    link: '/dashboard',
    icon: Hash,
    theme: {
      text: 'text-blue-400',
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-400',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500/10',
      iconColor: 'text-blue-500'
    }
  },
  {
    id: 'astrology',
    title: 'Yıldızların Rehberliği',
    desc: 'Gökyüzünün sizin için çizdiği haritayı okuyun. Doğum haritanız üzerinden eşsiz potansiyellerinizi öğrenin.',
    btnText: 'Doğum Haritası Çıkar',
    link: '/dashboard',
    icon: Star,
    theme: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500',
      hover: 'hover:bg-indigo-400',
      border: 'border-indigo-500/20',
      gradient: 'from-indigo-500/10',
      iconColor: 'text-indigo-400'
    }
  }
];

export default function BlogListingPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // CTA Kutusu için Slider State'i
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  // Hizmet Kutusunu Otomatik Döndüren Effect (Her 5 Saniyede Bir)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % SERVICES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Canlı Arama ve Veri Çekme
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      let query = supabase
        .from('blog_posts')
        .select('title, slug, excerpt, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, supabase]);

  const isSearching = searchTerm.length > 0;
  const featuredPost = !isSearching && posts.length > 0 ? posts[0] : null;
  const gridPosts = !isSearching && posts.length > 0 ? posts.slice(1) : posts;

  // Şu anki aktif hizmeti seç
  const activeService = SERVICES[currentServiceIndex];
  const ActiveIcon = activeService.icon;

  // --- REKLAM SINIRLANDIRMA AYARLARI ---
  const AD_INTERVAL = 6; // Her 6 blog kartında bir (Masaüstünde 3 satırda bir)
  const MAX_INFEED_ADS = 2; // Grid arasına maksimum 2 reklam girebilir

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-amber-500/30 pb-24 md:pb-32 relative">
      
      {/* --- ATMOSFER --- */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none z-0 transform-gpu"></div>

      {/* --- HERO BÖLÜMÜ --- */}
      <section className="relative z-10 pt-32 md:pt-40 pb-12 px-4 text-center border-b border-white/5">
        <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-6 cursor-default">
              <BookOpen className="w-3 h-3" /> Bilgi Kütüphanesi
            </div>
            
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
              Rüyaların <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Gizli Dili</span>
            </h1>
            
            <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed max-w-xl mx-auto">
              Modern psikoloji ve kadim bilgeliğin ışığında bilinçaltınızın derinliklerini keşfedin. Uzman makaleleri ve rehberler.
            </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* ================= SOL SÜTUN (YAZILAR) ================= */}
        <div className="lg:col-span-8 space-y-10">
            
            {/* MOBİL İÇİN ARAMA KUTUSU */}
            <div className="lg:hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-500/0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="relative flex items-center bg-[#131722] border border-white/10 rounded-2xl px-5 py-4 shadow-xl transition-all group-focus-within:border-amber-500/50">
                    <Search className={`w-5 h-5 mr-3 transition-colors ${loading ? 'text-amber-500 animate-pulse' : 'text-slate-500 group-focus-within:text-amber-500'}`} />
                    <input 
                      type="text" 
                      placeholder="Makale ara..." 
                      className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading && posts.length === 0 ? (
                <div className="text-center py-20 bg-[#131722] rounded-[2rem] border border-white/5">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-4" />
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Kütüphane Taranıyor...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-[#131722] rounded-[2rem] border border-white/5">
                    <p className="text-slate-400 text-sm mb-6">"{searchTerm}" ile ilgili bir makale bulunamadı.</p>
                </div>
            ) : (
                <>
                    {/* Öne Çıkan Yazı */}
                    {featuredPost && (
                        <Link href={`/blog/${featuredPost.slug}`} className="group relative block rounded-[2.5rem] bg-[#131722] border border-white/5 hover:border-amber-500/30 transition-all duration-500 overflow-hidden shadow-2xl p-8 md:p-10">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/20 transition-colors pointer-events-none transform-gpu"></div>
                            <PenTool className="absolute -bottom-10 -right-10 w-64 h-64 text-white/[0.02] transform -rotate-12 pointer-events-none" strokeWidth={1} />
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-5">
                                    <span className="bg-amber-500 text-[#0B0F19] px-3 py-1.5 rounded-lg shadow-inner">Öne Çıkan</span>
                                    <span className="flex items-center gap-1.5 text-slate-400">
                                       <Calendar className="w-3.5 h-3.5" /> {new Date(featuredPost.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-5 leading-[1.2] group-hover:text-amber-400 transition-colors">
                                    {featuredPost.title}
                                </h2>
                                
                                <div className="border-l-2 border-amber-500/50 pl-4 mb-8">
                                    <p className="text-slate-300 text-sm font-light leading-relaxed line-clamp-3">
                                        {featuredPost.excerpt}
                                    </p>
                                </div>
                                
                                <div className="inline-flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider group-hover:gap-3 transition-all mt-auto w-fit">
                                    Makaleyi Oku <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* DİĞER YAZILAR (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      {gridPosts?.map((post, index) => {
                          
                          // DİNAMİK REKLAM HESAPLAMASI
                          const isAdPosition = (index + 1) % AD_INTERVAL === 0;
                          const showAd = isAdPosition && ((index + 1) / AD_INTERVAL) <= MAX_INFEED_ADS;

                          return (
                          <Fragment key={post.slug}>
                              <Link href={`/blog/${post.slug}`} className="group h-full block">
                                  <article className="h-full bg-[#131722] border border-white/5 rounded-2xl p-6 md:p-8 hover:border-amber-500/30 hover:bg-[#1a1f2e] transition-all duration-300 flex flex-col relative overflow-hidden shadow-lg hover:-translate-y-1">
                                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-4 font-medium uppercase tracking-widest">
                                          <Calendar className="w-3.5 h-3.5 text-amber-500/70" /> {new Date(post.created_at).toLocaleDateString('tr-TR')}
                                      </div>
                                      
                                      <h3 className="font-serif text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors leading-snug">
                                          {post.title}
                                      </h3>
                                      
                                      <p className="text-slate-400 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                                          {post.excerpt}
                                      </p>

                                      <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                                          <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-500 transition-colors uppercase tracking-wider flex items-center gap-1.5 opacity-60 group-hover:opacity-100">
                                              Okumaya Başla <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                          </span>
                                      </div>
                                  </article>
                              </Link>

                              {/* REKLAM KUTUSU (Grid arasına girer ve 2 sütunu kaplar) */}
                              {showAd && (
                                  <div className="col-span-1 md:col-span-2 py-6 flex justify-center items-center bg-[#0a0c10] border-y border-white/5 my-2 rounded-3xl">
                                      <div className="w-full">
                                          <p className="text-center text-[10px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu İçerik</p>
                                          <AdUnit slot="8565155493" format="fluid" />
                                      </div>
                                  </div>
                              )}
                          </Fragment>
                          )
                      })}
                    </div>
                </>
            )}

            {/* --- LİSTE SONU REKLAM --- */}
            <div className="mt-10 w-full border-t border-white/5 pt-8">
                 <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-bold">Sponsorlu İçerik</p>
                 <AdUnit slot="6481917633" format="autorelaxed" />
            </div>

        </div>

        {/* ================= SAĞ SÜTUN (SIDEBAR) ================= */}
        <aside className="col-span-1 lg:col-span-4">
            <div className="sticky top-24 space-y-6">
               
               {/* 1. MASAÜSTÜ İÇİN ARAMA KUTUSU */}
               <div className="hidden lg:block relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <div className="relative flex items-center bg-[#131722]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 shadow-xl transition-all group-focus-within:border-amber-500/50">
                      <Search className={`w-5 h-5 mr-3 transition-colors ${loading ? 'text-amber-500 animate-pulse' : 'text-slate-500 group-focus-within:text-amber-500'}`} />
                      <input 
                        type="text" 
                        placeholder="Makalelerde ara..." 
                        className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
               </div>

               {/* 2. DİNAMİK / ANİMASYONLU CTA KUTUSU */}
               <div className={`bg-gradient-to-br ${activeService.theme.gradient} to-[#131722] border ${activeService.theme.border} rounded-[2rem] p-8 relative overflow-hidden shadow-2xl min-h-[260px] transition-colors duration-1000`}>
                   
                   <div className="absolute -top-6 -right-6 p-4 opacity-10 transition-opacity pointer-events-none">
                      <ActiveIcon className={`w-32 h-32 ${activeService.theme.iconColor}`} />
                   </div>
                   
                   <AnimatePresence mode="wait">
                     <motion.div
                       key={currentServiceIndex}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       transition={{ duration: 0.4 }}
                       className="relative z-10 flex flex-col h-full"
                     >
                        <h3 className={`${activeService.theme.text} font-serif font-bold text-xl md:text-2xl mb-3 leading-tight`}>
                           {activeService.title}
                        </h3>
                        <p className="text-sm text-slate-300 font-light leading-relaxed mb-6 min-h-[60px]">
                           {activeService.desc}
                        </p>
                        <Link href={activeService.link} className={`w-full py-3.5 ${activeService.theme.bg} ${activeService.theme.hover} text-[#0B0F19] rounded-xl text-xs uppercase tracking-widest font-bold shadow-lg transition-colors flex items-center justify-center gap-2 mt-auto active:scale-95`}>
                           <ActiveIcon className="w-4 h-4" /> {activeService.btnText}
                        </Link>
                     </motion.div>
                   </AnimatePresence>

                   {/* Alttaki Noktalar (Gösterge) */}
                   <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-20">
                     {SERVICES.map((_, idx) => (
                       <div 
                         key={idx} 
                         className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentServiceIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/20'}`}
                       />
                     ))}
                   </div>
               </div>

               {/* 3. SAĞ SÜTUN REKLAM */}
               <div className="bg-[#131722] border border-white/5 rounded-[2rem] p-4 text-center shadow-xl">
                  <p className="text-[10px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                  <AdUnit slot="8565155493" format="rectangle" />
               </div>

            </div>
        </aside>

      </main>
    </div>
  );
}