import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { TrendingUp, BookOpen, ArrowUpRight, ChevronRight, Hash } from "lucide-react";

export default async function FooterSEOContent() {
  const supabase = createClient();

  // 1. Sözlük Verilerini Çek (En çok aranan 4 terim - KUTU SAYISINA EŞİT)
  const { data: terms } = await supabase
    .from('dream_dictionary')
    .select('term, slug')
    .order('search_count', { ascending: false })
    .limit(4);

  // 2. Blog Verilerini Çek (En son yayınlanan 4 yazı)
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(4);

  // Eğer veri yoksa boş dön
  if ((!terms || terms.length === 0) && (!posts || posts.length === 0)) return null;

  return (
    <div className="w-full bg-[#020617] border-t border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* --- SOL KISIM: SÖZLÜK KARTLARI (4 Adet) --- */}
        <div>
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-[#fbbf24]">
                 <TrendingUp className="w-4 h-4" />
                 <span className="text-sm font-bold uppercase tracking-widest">Gündemdeki Rüyalar</span>
              </div>
              <Link href="/sozluk" className="text-[10px] font-bold text-gray-500 hover:text-[#fbbf24] transition-colors">
                 TÜM SÖZLÜK
              </Link>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {terms?.map((term, index) => (
                <Link 
                  key={index}
                  href={`/sozluk/${term.slug}`}
                  className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-[#fbbf24]/10 hover:border-[#fbbf24]/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                     <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] group-hover:bg-[#fbbf24] group-hover:text-black transition-colors shrink-0">
                        <Hash className="w-4 h-4" />
                     </div>
                     <span className="text-xs font-bold text-gray-300 group-hover:text-white truncate">
                        {term.term}
                     </span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-[#fbbf24] transition-colors opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
           </div>
        </div>

        {/* --- SAĞ KISIM: BLOG KARTLARI (4 Adet) --- */}
        <div>
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-purple-400">
                 <BookOpen className="w-4 h-4" />
                 <span className="text-sm font-bold uppercase tracking-widest">Son Eklenen Yazılar</span>
              </div>
              <Link href="/blog" className="text-[10px] font-bold text-gray-500 hover:text-purple-400 transition-colors">
                 TÜM BLOG
              </Link>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts?.map((post, index) => (
                 <Link 
                    key={index}
                    href={`/blog/${post.slug}`}
                    className="group p-4 rounded-xl bg-[#0f172a] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 flex items-center gap-3"
                 >
                    <div className="w-1 h-8 rounded-full bg-purple-500/20 group-hover:bg-purple-500 transition-colors shrink-0"></div>
                    <div className="flex-1 overflow-hidden">
                       <h4 className="text-xs font-medium text-gray-400 group-hover:text-white truncate transition-colors">
                          {post.title}
                       </h4>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-purple-400 transition-colors" />
                 </Link>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}