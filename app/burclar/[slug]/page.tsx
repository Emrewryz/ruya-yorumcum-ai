import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Flame, Mountain, Wind, Droplets, 
  Calendar, Sun, ArrowRight, Clock, Star, 
  Heart, Moon, History
} from "lucide-react";
import AdUnit from "@/components/AdUnit"; 

// --- SADECE TEMA VE İKON EŞLEŞTİRMELERİ KODDA KALIYOR ---
// Bunlar UI bileşenleri olduğu için veritabanında tutulmaz.
const ICONS = {
  fire: Flame,
  earth: Mountain,
  air: Wind,
  water: Droplets,
  default: Star
};

const THEME_STYLES = {
  orange: { text: 'text-orange-400', bg: 'bg-orange-500', glow: 'from-orange-500/20', border: 'border-orange-500/30', lightBg: 'bg-orange-500/10' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'from-emerald-500/20', border: 'border-emerald-500/30', lightBg: 'bg-emerald-500/10' },
  sky: { text: 'text-sky-400', bg: 'bg-sky-500', glow: 'from-sky-500/20', border: 'border-sky-500/30', lightBg: 'bg-sky-500/10' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500', glow: 'from-indigo-500/20', border: 'border-indigo-500/30', lightBg: 'bg-indigo-500/10' },
};

const PERIOD_LABELS: Record<string, { label: string, order: number }> = {
  daily: { label: 'Günlük', order: 1 },
  weekly: { label: 'Haftalık', order: 2 },
  monthly: { label: 'Aylık', order: 3 },
  yearly: { label: 'Yıllık', order: 4 },
};

export default async function ZodiacHubPage({ params }: { params: { slug: string } }) {
  const signId = params.slug.toLowerCase();
  const supabase = createClient();

  // 1. BURCUN SABİT BİLGİLERİNİ VERİTABANINDAN ÇEKİYORUZ
  const { data: signData, error: signError } = await supabase
    .from('zodiac_details')
    .select('*')
    .eq('slug', signId)
    .single();

  if (signError || !signData) {
    return notFound();
  }

  // 2. GÜNCEL VE GEÇMİŞ YORUMLARI (horoscope_posts) ÇEKİYORUZ
  const { data: allPosts } = await supabase
    .from('horoscope_posts')
    .select('title, slug, target_date, period')
    .eq('sign', signId)
    .eq('is_published', true)
    .order('target_date', { ascending: false });

  // Listeleri ayırma algoritması
  const currentReadings: any[] = [];
  const archivePosts: any[] = [];
  const foundPeriods = new Set(); 

  if (allPosts) {
    for (const post of allPosts) {
      const formattedDate = new Date(post.target_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      const enrichedPost = { ...post, typeLabel: PERIOD_LABELS[post.period]?.label || 'Yorum', formattedDate };

      if (!foundPeriods.has(post.period)) {
        foundPeriods.add(post.period);
        currentReadings.push(enrichedPost);
      } else {
        archivePosts.push(enrichedPost);
      }
    }
  }

  currentReadings.sort((a, b) => (PERIOD_LABELS[a.period]?.order || 99) - (PERIOD_LABELS[b.period]?.order || 99));

  // Tema ve İkon Atamaları
  const theme = THEME_STYLES[signData.theme as keyof typeof THEME_STYLES] || THEME_STYLES.sky;
  
  // Element ismine göre ikon seçimi (Türkçe veya İngilizce eşleşme ihtimaline karşı)
  const elementStr = signData.element.toLowerCase();
  let iconKey = 'default';
  if(elementStr.includes('ateş') || elementStr.includes('fire')) iconKey = 'fire';
  else if(elementStr.includes('toprak') || elementStr.includes('earth')) iconKey = 'earth';
  else if(elementStr.includes('hava') || elementStr.includes('air')) iconKey = 'air';
  else if(elementStr.includes('su') || elementStr.includes('water')) iconKey = 'water';
  
  const ElementIcon = ICONS[iconKey as keyof typeof ICONS];

  const TOC_LINKS = [
    { id: 'guncel', label: `${signData.name} Burcu Güncel Yorumları` },
    { id: 'ozellikler', label: `${signData.name} Burcu Özellikleri` },
    { id: 'kadin', label: `${signData.name} Burcu Kadını` },
    { id: 'erkek', label: `${signData.name} Burcu Erkeği` },
    { id: 'ask', label: `${signData.name} Burcu Aşk ve Uyum` },
    { id: 'arsiv', label: `Geçmiş ${signData.name} Yorumları Arşivi` },
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-6rem)] z-10 pb-24 font-sans bg-[#0B0F19] selection:bg-amber-500/30 scroll-smooth">
      
      {/* --- DİNAMİK ARKAPLAN IŞIĞI --- */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${theme.glow} via-transparent to-transparent pointer-events-none -z-10 transform-gpu transition-colors duration-1000`}></div>
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay -z-10" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      {/* HEADER (Geri Dön) */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-6 md:pt-8 relative z-20">
         <Link href="/burclar" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" /> Tüm Burçlar
         </Link>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 pt-8 md:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
        
        {/* ================= SOL SÜTUN (ANA İÇERİK - 8 Kolon) ================= */}
        <article className="lg:col-span-8 space-y-16">
            
            {/* 1. HERO ALANI */}
            <header className="flex flex-col-reverse md:flex-row items-center md:items-stretch justify-between gap-6 bg-[#131722] border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="flex-1 flex flex-col justify-center text-center md:text-left z-10">
                    <div className="inline-flex items-center justify-center md:justify-start gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">
                        <span className="text-slate-400 font-mono">{signData.dates}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className={`flex items-center gap-1.5 ${theme.text}`}>
                            <ElementIcon className="w-3.5 h-3.5" /> {signData.element} Elementi
                        </span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                        {signData.name} Burcu
                    </h1>
                    
                    <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed">
                        Zodyak kuşağının {signData.element.toLowerCase()} elementinden olan {signData.name}, {signData.planet} yönetimi altındadır.
                    </p>
                </div>

                <div className={`w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-3xl bg-[#0a0c10] border ${theme.border} flex items-center justify-center relative overflow-hidden shadow-inner`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} to-transparent opacity-40`}></div>
                    <div className={`text-6xl md:text-8xl font-serif leading-none filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] relative z-10 bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent select-none`}>
                       {signData.symbol}
                    </div>
                </div>
            </header>

            {/* 2. GÜNCEL YORUMLAR */}
            <section id="guncel" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <Clock className={`w-6 h-6 ${theme.text}`} />
                    <h2 className="text-2xl font-serif font-bold text-white">Güncel Analizler</h2>
                </div>

                {currentReadings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {currentReadings.map((item, i) => (
                          <Link 
                              key={i} 
                              href={`/burclar/${signId}/${item.slug}`} 
                              className="group block h-full"
                          >
                              <div className={`bg-[#131722] border border-white/5 hover:${theme.border} rounded-2xl p-6 flex flex-col h-full transition-all duration-300 shadow-lg hover:-translate-y-1 relative overflow-hidden`}>
                                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] pointer-events-none transition-colors duration-500 ${theme.lightBg} opacity-0 group-hover:opacity-100`}></div>
                                  
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-3 font-medium uppercase tracking-widest relative z-10">
                                      <Calendar className={`w-3.5 h-3.5 ${theme.text} opacity-70`} /> 
                                      {item.formattedDate}
                                      <span className={`px-2 py-0.5 ml-auto rounded bg-[#0a0c10] border border-white/5 text-[9px] ${theme.text}`}>
                                         {item.typeLabel}
                                      </span>
                                  </div>
                                  
                                  <h3 className="text-white font-serif font-bold text-lg mb-4 group-hover:text-amber-100 transition-colors leading-snug relative z-10">
                                      {item.title}
                                  </h3>
                                  
                                  <div className={`mt-auto pt-4 border-t border-white/5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${theme.text}`}>
                                      <span>Yorumu Oku</span>
                                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                  </div>
                              </div>
                          </Link>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">Henüz güncel bir yorum eklenmedi.</p>
                )}
            </section>

            <div className="w-full">
               <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu İçerik</p>
               <AdUnit slot="4542150009" format="fluid" />
            </div>

            {/* 3. SEO ODAKLI İÇERİK BÖLÜMLERİ (Veritabanından Gelen) */}
            <section id="ozellikler" className="scroll-mt-24 space-y-5">
                <h2 className="text-3xl font-serif font-bold text-white flex items-center gap-3">
                   <Star className={`w-7 h-7 ${theme.text}`} /> {signData.name} Burcu Genel Özellikleri
                </h2>
                <p className="text-slate-300 leading-relaxed font-light text-lg">
                   {signData.desc_text}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                    {/* veritabanında JSON array olarak tutuyoruz: ["Cesur", "Lider"] gibi */}
                    {(signData.traits as string[]).map((t: string, i: number) => (
                        <span key={i} className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-[#131722] border border-white/5 ${theme.text}`}>
                            # {t}
                        </span>
                    ))}
                </div>
            </section>

            <section id="kadin" className="scroll-mt-24 space-y-5">
                <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3 border-b border-white/5 pb-4">
                   <Moon className={`w-6 h-6 ${theme.text}`} /> {signData.name} Burcu Kadını
                </h2>
                <p className="text-slate-300 leading-relaxed font-light text-base md:text-lg">
                   {signData.woman_text}
                </p>
            </section>

            <section id="erkek" className="scroll-mt-24 space-y-5">
                <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3 border-b border-white/5 pb-4">
                   <Sun className={`w-6 h-6 ${theme.text}`} /> {signData.name} Burcu Erkeği
                </h2>
                <p className="text-slate-300 leading-relaxed font-light text-base md:text-lg">
                   {signData.man_text}
                </p>
            </section>

            <div className="w-full">
               <p className="text-center text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu İçerik</p>
               <AdUnit slot="4542150009" format="fluid" />
            </div>

            <section id="ask" className="scroll-mt-24 space-y-5">
                <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-3 border-b border-white/5 pb-4">
                   <Heart className="w-6 h-6 text-rose-400" /> {signData.name} Burcu Aşk ve Uyum
                </h2>
                <p className="text-slate-300 leading-relaxed font-light text-base md:text-lg">
                   {signData.love_text}
                </p>
            </section>

            {/* 4. ESKİ YORUMLAR (ARŞİV) */}
            <section id="arsiv" className="scroll-mt-24 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 mb-8">
                    <History className="w-6 h-6 text-slate-400" />
                    <h2 className="text-2xl font-serif font-bold text-white">Geçmiş {signData.name} Yorumları</h2>
                </div>

                {archivePosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {archivePosts.map((arc, i) => (
                          <Link 
                             key={i} 
                             href={`/burclar/${signId}/${arc.slug}`}
                             className="flex items-center justify-between p-5 bg-[#131722] border border-white/5 hover:border-white/20 rounded-2xl group transition-all"
                          >
                             <div>
                                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> {arc.formattedDate}
                                    <span className="bg-[#0a0c10] px-1.5 py-0.5 rounded text-slate-400">{arc.typeLabel}</span>
                                 </div>
                                 <h4 className="text-sm md:text-base font-medium text-slate-300 group-hover:text-white transition-colors">
                                    {arc.title}
                                 </h4>
                             </div>
                             <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:${theme.bg} text-slate-500 group-hover:text-[#0a0c10] transition-colors shrink-0`}>
                                 <ArrowRight className="w-4 h-4" />
                             </div>
                          </Link>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">Henüz geçmiş bir yorum arşivi bulunmuyor.</p>
                )}
            </section>

        </article>

        {/* ================= SAĞ SÜTUN (SIDEBAR) ================= */}
        <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
                
                <div className="bg-[#131722] border border-white/5 rounded-[2rem] p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 border-b border-white/5 pb-4 flex items-center gap-2">
                       Hızlı Erişim
                    </h3>
                    
                    <ul className="space-y-3">
                        {TOC_LINKS.map((link) => (
                           <li key={link.id}>
                              <a 
                                href={`#${link.id}`} 
                                className={`group flex items-start gap-3 text-sm text-slate-300 hover:${theme.text} transition-colors cursor-pointer leading-snug`}
                              >
                                 <div className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:${theme.bg} shrink-0 transition-colors`}></div>
                                 {link.label}
                              </a>
                           </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#131722] border border-white/5 rounded-[2rem] p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 border-b border-white/5 pb-4 flex items-center gap-2">
                       Profil Kartı
                    </h3>
                    
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center justify-between p-3 bg-[#0a0c10] rounded-xl border border-white/5">
                            <span className="text-slate-500">Yönetici Gezegen</span>
                            <span className="text-white font-medium">{signData.planet}</span>
                        </li>
                        <li className="flex items-center justify-between p-3 bg-[#0a0c10] rounded-xl border border-white/5">
                            <span className="text-slate-500">Uğurlu Taş</span>
                            <span className="text-white font-medium">{signData.stone}</span>
                        </li>
                        <li className="flex items-center justify-between p-3 bg-[#0a0c10] rounded-xl border border-white/5">
                            <span className="text-slate-500">Şanslı Gün</span>
                            <span className="text-white font-medium">{signData.day}</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-[#131722] border border-white/5 rounded-[2rem] p-4 text-center shadow-xl">
                    <p className="text-[9px] text-slate-600 mb-2 uppercase tracking-widest font-bold">Sponsorlu</p>
                    <AdUnit slot="8565155493" format="rectangle" />
                </div>

            </div>
        </aside>

      </main>

      {/* ================= EN ALT ================= */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="mt-16 w-full pt-10 border-t border-white/5">
              <p className="text-center text-[10px] text-slate-600 mb-4 uppercase tracking-widest font-bold">BUNLAR DA İLGİNİZİ ÇEKEBİLİR</p>
              <AdUnit slot="6481917633" format="autorelaxed" />
          </div>
      </div>

    </div>
  );
}