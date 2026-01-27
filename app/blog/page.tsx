import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, ChevronRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rüya Tabirleri Blogu | Bilinçaltı ve Maneviyat Rehberi",
  description: "Rüyaların psikolojik ve İslami anlamları, karabasan, lucid rüya ve bilinçaltı hakkında derinlemesine makaleler.",
};

export default async function BlogListingPage() {
  const supabase = createClient();

  // Yayınlanmış (is_published = true) yazıları çekiyoruz
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, created_at, image_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-[#fbbf24]/30 pb-20">
      
      {/* HEADER */}
      <div className="relative py-20 px-4 text-center border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#fbbf24]/10 blur-[120px] rounded-full pointer-events-none"></div>
        <h1 className="relative z-10 font-serif text-4xl md:text-6xl font-bold text-white mb-4">Rüya Rehberi</h1>
        <p className="relative z-10 text-gray-400 text-lg max-w-2xl mx-auto">Modern psikoloji ve kadim bilgeliğin ışığında rüyaların gizemli dünyasını keşfedin.</p>
      </div>

      {/* BLOG LİSTESİ */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group h-full">
              <article className="h-full bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden hover:border-[#fbbf24]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                
                {/* Resim Alanı */}
                <div className="aspect-video bg-black/50 relative overflow-hidden">
                  {post.image_url ? (
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <BookOpen className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                </div>

                {/* İçerik */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  
                  <h2 className="font-serif text-xl font-bold text-white mb-3 group-hover:text-[#fbbf24] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center text-[#fbbf24] text-sm font-bold mt-auto">
                    Devamını Oku <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}