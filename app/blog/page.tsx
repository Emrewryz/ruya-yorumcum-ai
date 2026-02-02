import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Calendar, ChevronRight, BookOpen, Sparkles, User, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rüya ve Bilinçaltı Rehberi | Rüya Yorumcum AI Blog",
  description: "Rüyaların psikolojik ve İslami anlamları, karabasan, lucid rüya, uyku felci ve bilinçaltı sembolleri hakkında derinlemesine uzman makaleleri.",
  openGraph: {
    title: "Rüya ve Bilinçaltı Rehberi",
    description: "Modern psikoloji ve kadim bilgeliğin ışığında rüyaların gizemli dünyasını keşfedin.",
    type: "website",
  }
};

export default async function BlogListingPage() {
  const supabase = createClient();

  // Yayınlanmış (is_published = true) yazıları çekiyoruz
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, created_at, image_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  // İlk yazıyı "Öne Çıkan" (Featured) olarak ayırabiliriz
  const featuredPost = posts && posts.length > 0 ? posts[0] : null;
  const otherPosts = posts && posts.length > 0 ? posts.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-[#fbbf24]/30 pb-24 md:pb-32 relative overflow-x-hidden">
      
      {/* --- 1. ATMOSFER & ZEMİN --- */}
      <div className="bg-noise fixed inset-0 opacity-[0.04] pointer-events-none z-50"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#fbbf24]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#4c1d95]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"></div>

      {/* --- 2. HERO BÖLÜMÜ --- */}
      <section className="relative z-10 pt-28 md:pt-40 pb-12 md:pb-16 px-4 text-center border-b border-white/5 bg-gradient-to-b from-[#020617] to-[#0f172a]">
        <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-[#fbbf24] text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6 hover:bg-white/10 transition-colors cursor-default">
              <BookOpen className="w-3 h-3" /> Bilgi Kütüphanesi
            </div>
            
            {/* MOBİL İÇİN FONT BOYUTU OPTİMİZASYONU */}
            <h1 className="font-serif text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight tracking-tight">
              Rüyaların <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fbbf24] to-[#d97706]">Gizli Dili</span>
            </h1>
            
            <p className="text-gray-400 text-sm md:text-xl max-w-2xl mx-auto font-light leading-relaxed px-2">
              Modern psikoloji (Freud, Jung) ve kadim İslami kaynakların (Nablusi, İbn-i Sirin) ışığında hazırlanan rehber niteliğindeki makalelerimizle bilinçaltınızı keşfedin.
            </p>
        </div>
      </section>

      {/* --- 3. İÇERİK ALANI --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 relative z-10">
        
        {/* Öne Çıkan Yazı (Varsa) */}
        {featuredPost && (
            <div className="mb-12 md:mb-16">
                <Link href={`/blog/${featuredPost.slug}`} className="group relative block rounded-2xl md:rounded-3xl overflow-hidden aspect-[4/3] md:aspect-[21/9] border border-white/10 shadow-2xl">
                    <img 
                        src={featuredPost.image_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop"} 
                        alt={featuredPost.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-2/3">
                        <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#fbbf24] mb-3 md:mb-4">
                            <span className="bg-[#fbbf24]/10 px-2 py-1 md:px-3 md:py-1 rounded-full border border-[#fbbf24]/20">Öne Çıkan</span>
                            <span className="flex items-center gap-2 text-gray-400"><Calendar className="w-3 h-3" /> {new Date(featuredPost.created_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <h2 className="font-serif text-2xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight group-hover:text-[#fbbf24] transition-colors line-clamp-2 md:line-clamp-none">
                            {featuredPost.title}
                        </h2>
                        <p className="text-gray-300 text-xs md:text-lg line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 leading-relaxed">
                            {featuredPost.excerpt}
                        </p>
                        <div className="inline-flex items-center gap-2 text-white font-bold border-b border-[#fbbf24] pb-1 text-xs md:text-base group-hover:gap-4 transition-all">
                            Makaleyi Oku <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                        </div>
                    </div>
                </Link>
            </div>
        )}

        {/* Diğer Yazılar Grid (MOBİLDE TEK KOLON: grid-cols-1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {otherPosts?.map((post) => (
            // ÇAKIŞMA ÖNLEME: Burada 'block' yerine sadece 'block' kullanıyoruz, flex yok.
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full block">
              <article className="h-full bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden hover:border-[#fbbf24]/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col">
                
                {/* Resim Alanı */}
                <div className="aspect-video bg-white/5 relative overflow-hidden">
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <BookOpen className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  {/* Kategori Etiketi */}
                  <div className="absolute top-3 left-3 md:top-4 md:left-4">
                      <span className="px-2 py-1 md:px-3 md:py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] md:text-[10px] font-bold uppercase text-[#fbbf24] border border-white/10">
                        Rehber
                      </span>
                  </div>
                </div>

                {/* İçerik */}
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-gray-500 mb-3 md:mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#fbbf24]" /> {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> Rüya Yorumcum AI</span>
                  </div>
                  
                  <h2 className="font-serif text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-[#fbbf24] transition-colors line-clamp-2 leading-tight">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-3 md:pt-4">
                    <span className="text-[10px] md:text-xs font-bold text-[#fbbf24] uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                        Devamını Oku <ChevronRight className="w-3 h-3" />
                    </span>
                    <Tag className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* --- 4. SEO & DÖNÜŞÜM KUTUSU (Alt CTA) --- */}
        <div className="mt-16 md:mt-20 relative rounded-2xl md:rounded-3xl overflow-hidden bg-[#0f172a] border border-white/10 p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-[#fbbf24]/10 to-purple-600/10 opacity-50"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#fbbf24] mx-auto mb-3 md:mb-4" />
                <h3 className="font-serif text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                    Rüyanızın Size Özel Mesajını Merak Ediyor Musunuz?
                </h3>
                <p className="text-gray-400 text-xs md:text-base mb-6 md:mb-8 leading-relaxed">
                    Blog yazıları genel bilgiler içerir. Sizin rüyanız ise parmak iziniz kadar size özeldir. 
                    Yapay zeka kahinimiz, rüyanızın detaylarını analiz ederek kişisel yorumunuzu oluşturur.
                </p>
                <Link href="/dashboard" className="inline-flex w-full md:w-auto items-center justify-center px-6 py-3 md:px-8 md:py-4 rounded-xl bg-[#fbbf24] text-black font-bold hover:scale-105 transition-transform shadow-lg text-sm md:text-base">
                    Rüyamı Şimdi Yorumla
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}